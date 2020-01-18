const express = require('express');
const router = express.Router();

const RD = require('reallydangerous');
const signer = new RD.TimestampSigner('my-secret');

const MongoClient = require('mongodb').MongoClient;
const Long = require('mongodb').Long;

const crypto = require('crypto');
const { simpleflake } = require('simpleflakes');

const env = require('../env.json');

const mongo_url = env.mongo_url;

let db, conn;
MongoClient.connect(mongo_url, { useUnifiedTopology: true }).then(c => {
  conn = c;
  db = c.db(env.mongo_db);

  console.log('[LOG] Connected to database');
});

/* API token authentication verification function */
const apiAuth = (req, res) => {
  if(!req.header('Authorization')) {
    res.status(401).json({success: false, error: 'Missing api token!'});
    return;
  }

  const token = req.header('Authorization').split(' ').pop();
  
  try {
    const user = signer.unsign(token);
    req.user = Buffer.from(user, 'base64').toString();
    return true;
  }
  catch (e) {
    res.status(401).json({success: false, error: 'Invalid api token provided!'});
    return false;
  }
}

router.get('/version', (req, res) => {
  res.json({version: 1});
});

/* Login to API using user/pass to obtain token for api */
router.post('/auth/login', async (req, res) => {
  if (!req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('password')) {
    res.status(400).json({success: false, error: 'Username and password is required!'});
    return;
  }

  const username = req.body.username;
  const password = req.body.password;

  // Hash user password (in hex)
  const hashed = crypto.createHash('sha256').update(password).digest('hex');

  // Check login
  const user = await db.collection('users').findOne({username, password: hashed}, {_id: 0, id: 1});
  if (!user) {
    res.status(403).json({success: false, error: 'Invalid username or password!'});
    return;
  }

  // Generate API token for user from user ID
  const token = signer.sign(Buffer.from(user.id.toString()).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''));
  res.json({success: true, token});
});

/* Gets user profile of current logged in user */
router.get('/users/me', async (req, res) => {
  if (!apiAuth(req, res)) return;

  const profile = await db.collection('users').findOne({id: Long.fromString(req.user)}, {_id: 0, password: 0});

  // Some error trapping
  if (!profile) {
    res.status(500).json({success: false, error: 'Internal server error, please contact administrator.'});
    return;
  }

  delete profile._id;
  res.json({success: true, profile});
});

/* Gets user profile from user ID */
router.get('/users/:id', async (req, res) => {
  if (!apiAuth(req, res)) return;

  const id = req.params.id;
  const profile = await db.collection('users').findOne({id}, {_id: 0, password: 0});
  
  // Some error trapping
  if (!profile) {
    res.status(404).json({success: false, error: 'Requested user profile not found!'});
    return;
  }

  delete profile._id;
  res.json({success: true, profile});
});

/* Fetch posts by user using author ID */
router.get('/posts/me', async(req, res) => {
  if (!apiAuth(req, res)) return;
  
  let limit = 10;
  let before = "";
  let after = "";

  if (req.query.hasOwnProperty('limit')) {
    limit = parseInt(req.query.limit);

    // Integer checks
    if (isNaN(limit)) {
      res.status(400).json({success: false, error: 'Limit of posts must be an integer!'});
      return;
    }
    limit = Math.abs(limit);
    if (limit > 50) limit = 50;
  }

  const results = await db.collection('posts').find({author: Long.fromString(req.user)}, {_id: 0}).limit(limit).toArray();
  // clean results by removing Long data formats
  results.forEach(res => {
    res.id = res.id.toString();
    res.author = res.id.toString();
    res.channel_id = res.channel_id.toString();
    delete res._id;
  });

  res.json({success: true, posts: results});
});

/* Fetch channel data from channel ID */
router.get('/channels/:channelID', async (req, res) => {
  if (!apiAuth(req, res)) return;

  const channelID = req.params.channelID;

  const info = await db.collection('channels').findOne({id: Long.fromString(channelID)});
  
  if (!info) {
    res.status(404).json({success: false, error: 'Channel not found!'});
    return;
  }
  res.json({success: true, channel: info});
});

/* Fetch posts from channel using channel ID */
router.get('/channels/:channelID/posts', async (req, res) => {
  if (!apiAuth(req, res)) return;

  const channelID = req.params.channelID;

  let limit = 10;
  let before = "";
  let after = "";

  if (req.query.hasOwnProperty('limit')) {
    limit = parseInt(req.query.limit);

    // Integer checks
    if (isNaN(limit)) {
      res.status(400).json({success: false, error: 'Limit of posts must be an integer!'});
      return;
    }
    limit = Math.abs(limit);
    if (limit > 50) limit = 50;
  }

  const results = await db.collection('posts').find({channel_id: Long.fromString(channelID)}, {_id: 0}).limit(limit).toArray();
  // clean results by removing Long data formats
  results.forEach(res => {
    res.id = res.id.toString();
    res.author = res.id.toString();
    res.channel_id = res.channel_id.toString();
    delete res._id;
  });

  res.json({success: true, posts: results});
});

router.post('/channels/:channelID/posts', async (req, res) => {
  if (!apiAuth(req, res)) return;

  const channelID = req.params.channelID;
  const data = req.body;

  if (!data.hasOwnProperty('type')) {
    res.status(400).json({success: false, error: 'Missing message type!'});
    return;
  }
  
  if (!data.hasOwnProperty('content')) {
    res.status(400).json({success: false, error: 'Missing message content!'});
    return;
  }

  const channel = await db.collection('channels').findOne({id: Long.fromString(channelID)});
  if (!channel) {
    res.status(404).json({success: false, error: 'Channel not found!'});
    return;
  }

  if (channel.type != 0 && data.type == 1) {
    res.status(400).json({success: false, error: 'Invalid post type'});
    return;
  }

  const id = simpleflake().toString();
  data.id = id;

  // TODO: Gateway message event

  // TODO: Error trapping
  await db.collection('posts').insertOne(data);
  res.json({success: true, id});
});

module.exports = router;