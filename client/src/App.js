import React from 'react';
import './App.css';
import './index.css';
import Feed from './Feed';
import Explore from './Explore';
import Streams from './Streams';
import Profile from './Profile';
import DiscApp from './DiscApp.js';
import streamsTopicPage from './streamsTopicPage';
import StreamDisc from './StreamsDiscussion'
import WrappedNormalLoginForm from './Login';
import DirectMsgs from './DirectMessages'
import CreatePost from './createpost'
import ExploreTopicPage from './ExploreTopicPage'
import Post from './Posts_utils'
import { ReactComponent as Logo } from './logo.svg';
import env from './env.json';


import { Menu, Icon, Layout, Button, Badge, Dropdown, List, Avatar, Divider, message } from 'antd';
import { NavLink, Switch, Route, withRouter, useHistory, useLocation } from 'react-router-dom';
import WrappedNormalRegisterForm from './Register';


const { Header, Content, Sider } = Layout;

window.baseHost = env.prod ? "prod.exegesisapp.tech" : "test.exegesisapp.tech:8080";
window.baseURL = (env.prod ? 'https://' : 'http://') + window.baseHost;

const data = [
  {
    title: 'Hello, this is a very easy question which can be solved within 30 seconds. Do solve it now!!!',
  },
  {
    title: 'Notficiation 2',
  },
  {
    title: 'Notficiation 3',
  },
  {
    title: 'Notficiation 4',
  },
];

const notification = (
  <List
    itemLayout="vertical"
    dataSource={data}
    header={
      <h1 style={{ color: "#cccccc" }}>Notifications</h1>
    }
    style={{ backgroundColor: "#001529", boxShadow: "3px 3px 10px", borderRadius: "10px", paddingRight: "3vw", paddingLeft: "1vw" }}
    renderItem={item => (
      <List.Item style={{ color: "white", borderStyle: "solid", borderWidth: "0px 0px 1px 0px", borderColor: "white" }}>
        <List.Item.Meta
          avatar={
            <Avatar style={{ verticalAlign: 'middle', backgroundColor: "#1890ff" }} size="large">
              Tkai
            </Avatar>
          } //Notification type
          title={
            <h3 style={{ color: "#cccccc" }}>New post from Tkai</h3>
          }
          description={
            <p style={{ color: "#949494" }}>{item.title}</p>
          }
        />
      </List.Item>
    )}
  />

);


var profileOpen = false;
function OpenProfile() { //Special hook function in order to use React Router's history.push 
  const history = useHistory();

  function handleClick() {

    if (profileOpen === false) {
      profileOpen = true;
      history.push("/Profile");
    }
    else if (profileOpen === true) {
      profileOpen = false
      history.push("/")
    }
  }

  return (
    <Button type="primary" onClick={handleClick} shape="circle" style={{ marginLeft: "1.3vw", width: "4vw", height: "4vw", borderStyle: "solid", borderWidth: "3px", borderColor: "#002766" }}>Tkai</Button>
  );
}

function BackButton() { //Special hook function in order to use React Router's history.push
  const history = useHistory();
  const location = useLocation().pathname;

  function ClickHandler() {
    const fullPath = location.split("/");
    const backPath = fullPath.slice(0, fullPath.length - 1);
    const backPathJoined = backPath.join("/")

    history.push(backPathJoined);
  }

  return (
    <Button type="primary" onClick={ClickHandler} icon="left" size="large" style={{ marginRight: "2vw", marginLeft: "-1vw" }} />
  );
}

var previousLocation = "";
var previousFullLocation = "";

class App extends React.Component {
  constructor(props) {
    super(props);

    let tokenStatus = localStorage.getItem('token')

    this.state = {
      current: "Feed",
      collapsed: false,
      msgcollapsed: true,
      back: false,
      msgsrc: '',
      msgtxt: '',
      notifies: 0,
      token: tokenStatus,
      isRegister: false,
      messages: {},
    };
  }

  passInfo = (sender, text) => {
    this.setState({ msgsrc: sender, msgtxt: text, notifies: this.state.notifies + 1 })
  }

  handleLogin(receivedtoken) {
    this.setState({ token: receivedtoken })
    localStorage.setItem('token', receivedtoken);
  }

  toRegister = () => {
    this.setState({ isRegister: !this.state.isRegister })
  }

  componentDidUpdate() {
    //Ensures correct menu.item is selected when page changes without clicking on menu.items
    const path = this.props.location.pathname;
    const fullPath = path.split("/");
    const page = path.split("/")[1];

    if (page !== previousLocation) { //Only checks 1st path
      previousLocation = page;

      if (page === "") {
        this.setState({
          current: "Feed",
        })
        profileOpen = false;
      }
      else if (page === "Profile") {
        this.setState({
          current: "Feed",
        })
        profileOpen = true;
      }
      else {
        this.setState({
          current: page,
        })
        profileOpen = false;
      }
    }

    //Check if back button should be displayed

    if (previousFullLocation !== path) { //Check if path actually changed to avoid calling repeatedly
      previousFullLocation = path;
      if (fullPath.length > 2) {
        this.setState({
          back: true,
        })
      }
      else {
        this.setState({
          back: false,
        })
      }
    }

  }


  componentDidMount() {
    /*[TODO:] Work on sessions so that the login status will be kept when page is reloaded */
    //Ensures correct menu.item is selected when page changes without clicking on menu.items
    const path = this.props.location.pathname;
    previousFullLocation = path;

    const fullPath = path.split("/");
    const page = path.split("/")[1];

    previousLocation = page;
    if (page === "") {
      profileOpen = false;
      this.setState({
        current: "Feed",
      })
    }
    else if (page === "Profile") { //Special handler for profile, since it should be "be at the feed page"
      this.setState({
        current: "Feed",
      })
      profileOpen = true
    }
    else {
      profileOpen = false;
      this.setState({
        current: page,
      })
    }

    //Check if back button should be displayed
    if (fullPath.length > 2) {
      this.setState({
        back: true,
      })
    }
    else {
      this.setState({
        back: false,
      })
    }
  }

  fetchChannelPosts() {
    fetch(window.baseURL + '/api/v1/channels/' + this.state.channel_id , {
      method: 'get',
      headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('token') },
    }).then((results) => {
      return results.json(); //return data in JSON (since its JSON data)
    }).then((data) => {

      if (data.success === true) {
        this.setState({ data: data })
        message.success({ content: "Loaded." });
        console.log(this.state.data)
      }
      else {
        message.error({ content: "Oops... unable to find post" });
      }

    }).catch((error) => {
      message.error({ content: "Oops, connection error" });
      message.error({ content: error });
    })
  }

  fetchMessageFromChannel (channelID) {
    fetch(window.baseURL + `/api/v1/channels/${channelID}/posts`, {
      headers: {'Authorization': localStorage.getItem('token')}
    }).then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.posts.length == 0) return;
      if(this.state.messages.hasOwnProperty(channelID) === true) {
        const merge = [...this.state.messages[channelID]];
        const ids = data.posts.map(post => post.id);
        merge.forEach(prev => {
          if (ids.indexOf(prev) > -1) data.posts.push(prev);
        });
        this.state.messages[channelID] = data.posts;
      }
      else {
        this.state.messages[channelID] = data.posts;
      }
      this.setState(this.state);
    });
  }


  checkWS() {
    if (this.GatewayClient == null && window.localStorage.getItem('token') != null) {
      this.GatewayClient = new WebSocket((env.prod ? 'wss://' : 'ws://') + window.baseHost + (env.prod ? '/gateway' : ''));
      this.GatewayClient.onopen = (e) => {
        console.log('[GATEWAY] Connected to gateway server!');
      };

      this.GatewayClient.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.op === 0) {
          // Hello
          console.log('[GATEWAY] Hello from server, heartbeat_interval: ' + data.heartbeat_interval);
          const login = { op: 1, token: localStorage.getItem('token') };
          this.GatewayClient.send(JSON.stringify(login));
        }
        else if (data.op === 2) {
          // Ready
          console.log('[GATEWAY] Ready!');
        }
        else if (data.op === 3) {
          // Message
          console.log('[GATEWAY] Received message:', JSON.stringify(data.message));
          if(this.state.messages.hasOwnProperty(data.message.channel_id) === true) {
            this.state.messages[data.message.channel_id].push(data.message);
          }
          else {
            this.state.messages[data.message.channel_id] = [data.message];
          }
          this.setState(this.state);
        }
        else if (data.op === 10) {
          // Heartbeat
          const hb = { time: data.time, op: 11 };
          this.GatewayClient.send(JSON.stringify(hb));
        }
        else if (data.op === 11) {
          // Heartbeat ACK
          console.log('[GATEWAY] Latency: ' + (Date.now() - data.time) + 'ms.');
        }
      }

      this.GatewayClient.onclose = e => {
        console.log('[GATEWAY] Closed: ', e.code, e.reason);
      }
    }

  }
  onCollapse = (collapsed) => {
    this.setState({ collapsed });
  }; //Collapse function for menu sider

  toggle = () => {
    // Collapse navbar when opening message bar
    if (this.state.msgcollapsed === true) {
      this.setState({
        msgcollapsed: !this.state.msgcollapsed,
        collapsed: true
      });
    }

    // Uncollapse navbar when closing message bar
    else if (this.state.msgcollapsed === false) {
      this.setState({
        msgcollapsed: !this.state.msgcollapsed,
        collapsed: false
      });
    }

  }

  render() {
    this.checkWS();
    return (
      <div>
        {this.state.token && (
          <Layout style={{ maxHeight: '100vh' }}>

            <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse} width="15vw" style={{ boxShadow: "3px 0px 10px" }}>
              <Menu
                onClick={this.handleClick}
                selectedKeys={[this.state.current]}
                //defaultOpenKeys={['']}
                mode="inline"
                theme="dark"

              > {/*
        defaultSelectedKeys - default selected menu items
        defaultOpenKeys - default opened sub menus
        inline - Sidebar Menu
        */}

                <Menu.Item key="Feed" style={{ fontSize: "1.4vw", height: "10vh", display: "flex", alignItems: "center" }}>
                  <NavLink to="/">
                    <Icon type="home" theme="twoTone" twoToneColor="#0050b3" />
                    <span>Home</span>
                  </NavLink>
                </Menu.Item>

                <Menu.Item key="Explore" style={{ fontSize: "1.4vw", height: "10vh", display: "flex", alignItems: "center" }}>
                  <NavLink to="/Explore">
                    <Icon type="appstore" theme="twoTone" twoToneColor="#0050b3" />
                    <span>Explore</span>
                  </NavLink>
                </Menu.Item>

                <Menu.Item key="Streams" style={{ fontSize: "1.4vw", height: "10vh", display: "flex", alignItems: "center" }}>
                  <NavLink to="/Streams">
                    <Icon type="play-square" theme="twoTone" twoToneColor="#0050b3" />
                    <span>Streams</span>
                  </NavLink>
                </Menu.Item>

                <Menu.Item key="CreatePost" style={{ fontSize: "1.4vw", height: "10vh", display: "flex", alignItems: "center" }}>
                  <NavLink to="/CreatePost">
                    <Icon type="plus-square" theme="twoTone" twoToneColor="#0050b3" />
                    <span>Create Post</span>
                  </NavLink>
                </Menu.Item>

              </Menu>

            </Sider>

            <Layout style={{ background: "#002140" }}>
              <Header style={{ background: '#001529', fontSize: "3vw", color: "#e6f7ff", boxShadow: "0px 3px 10px #0a0a0a" }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>

                  {this.state.back && (
                    <BackButton></BackButton>
                  )}
                  <div style={{ align: "center" }}>
                    <Icon component={Logo} />
                    <span style={{ fontWeight: "500" }}> Exegesis</span>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                    <Badge count={this.state.notifies} offset={[-1, 1]}>
                      <Dropdown overlay={notification} trigger={['click']} placement="bottomLeft">
                        <Button type="primary" shape="circle" icon="bell" size="large" />
                      </Dropdown>
                    </Badge>
                    <Badge count={5} offset={[-1, 1]}>
                      <Button type="primary" onClick={this.toggle} shape="circle" icon="message" size="large" style={{ marginLeft: "0.8vw" }} />
                    </Badge>
                    <OpenProfile />
                  </div>
                </div>
              </Header>

              <br></br>

              <Content style={{ margin: '0px 16px' }}>
                <Switch>
                  <Route exact path='/' component={Feed} />
                  <Route exact path='/Explore' component={Explore} />
                  <Route exact path='/Streams' component={Streams} />
                  <Route exact path='/Streams/' component={Profile} />
                  <Route exact path='/Streams/:topic' component={streamsTopicPage} />
                  <Route exact path='/Explore/:topic' component={ExploreTopicPage} />

                  <Route exact path='/Profile' render={(props) => <Profile {...props} token={this.state.token} />} />
                  <Route exact path='/DiscApp/:channel_id' component={(props) => <DiscApp {...props} messages={this.state.messages} fetchMessageFromChannel={this.fetchMessageFromChannel.bind(this)} />} />

                  <Route exact path='/StreamsDiscussion/:channel_id' component={(props) => <StreamDisc {...props} messages={this.state.messages} fetchMessageFromChannel={this.fetchMessageFromChannel.bind(this)} />} />
                  <Route exact path='/CreatePost' render={(props) => <CreatePost {...props} token={this.state.token} />} />
                  <Route exact path='/DirectMessages' render={() =>
                    <DirectMsgs func={this.passInfo.bind(this)} />
                  }
                  />
                  <Route exact path='/Posts_utils' component={Post} />

                </Switch>
              </Content>

            </Layout>

            <Sider collapsible trigger={null} collapsedWidth={0} collapsed={this.state.msgcollapsed} onCollapse={this.onCollapse} width={400} style={{ boxShadow: "-3px 0px 10px" }}>
              <Messages sender={this.state.msgsrc} text={this.state.msgtxt} />
            </Sider>

          </Layout>
        )}
        {!this.state.token && (
          <div>
            {this.state.isRegister && (
              <WrappedNormalRegisterForm loginHandler={this.handleLogin.bind(this)} register={this.toRegister.bind(this)}></WrappedNormalRegisterForm>
            )}
            <WrappedNormalLoginForm loginHandler={this.handleLogin.bind(this)} register={this.toRegister.bind(this)}></WrappedNormalLoginForm>
          </div>
        )}
      </div>

    );

  }


}
















class Messages extends React.Component {
  constructor(props) {
    super(props);
    //this.props.newpost for newer post
    this.state = {
      recents: [
        { sender: 'Hi', text: "hello" },
        { sender: 'Jimmy', text: "hello i am great" },
        { sender: 'Twig', text: "Twig" },
        { sender: 'Pew', text: "I am an object within an object across an object between an objec" },
        { sender: 'DInk', text: "hello" },
        { sender: 'ahahahahahahahhahahahahahahahahahahaha', text: "hello" },
        { sender: 'Jabba', text: "hello" },
        { sender: 'Palpatine', text: "hello" },
        { sender: 'Vader', text: "hello" },
        { sender: 'Chairman Mao', text: "hello" },

      ],
      user: 'Hi',
      notified: 0,
      newItem: { sender: 'a', text: 'a' }

    };
  }
  limitWords = (recents) => {
    let changedItem = this.state.recents
    for (let i = 0; i < 10; i++) {
      if (this.state.recents[i].sender.length > 25) {
        changedItem[i].sender = this.state.recents[i].sender.slice(0, 25) + '...'
      }
      if (this.state.recents[i].text.length > 30) {
        changedItem[i].text = this.state.recents[i].text.slice(0, 25) + '...'
      }

    }
    if (changedItem !== this.state.recents) {
      this.setState({ recents: changedItem })
    }
  }

  checkItemInList = (newItem) => {
    for (let i = 0; i < this.state.recents.length; i++) {
      if (this.state.recents[i].sender === newItem.sender) {
        return true
      }
    }
    return false
  }
  findItemInList = (item) => {
    for (let i = 0; i < this.state.recents.length; i++) {
      if (this.state.recents[i].sender === item.sender) {
        return i
      }
      else {
        alert("Item not found")
      }
    }
  }
  addItem = (newItem) => {
    if (newItem.sender !== '' && newItem.text !== '') {
      if (this.state.recents.length === 10) {
        if (this.checkItemInList(newItem)) {
          let changedItem = this.state.recents
          let changedIndex = -200
          changedIndex = this.findItemInList(newItem) // Index of new item
          changedItem.splice(changedIndex, 1)
          changedItem.unshift(newItem)
          this.setState({ recents: changedItem, newItem: newItem })

        }
        else {
          let changedItem = this.state.recents
          changedItem.pop()
          changedItem.unshift(newItem)
          this.setState({ recents: changedItem, newItem: newItem })
        }
      }
      else {
        let changedItem = this.state.recents
        changedItem.unshift(newItem)
        this.setState({ recents: changedItem, newItem: newItem })
      }
    }
  }
  componentDidMount() {
    this.limitWords(this.state.recents)
  }
  render() {
    let item = { sender: this.props.sender, text: this.props.text }
    if (item.sender.length > 25) {
      item.sender = item.sender.slice(0, 25) + '...'
    }
    if (item.text.length > 25) {
      item.text = item.text.slice(0, 35) + '...'
    }
    if (this.state.newItem.sender !== item.sender || this.state.newItem.text !== item.text) {
      this.addItem(item)
    }
    return (
      <Layout>
        <Header style={{ fontSize: "2.5vw", color: "#cccccc" }}>
          <Divider style={{ fontSize: "2.5vw", color: "#cccccc" }}>Messages</Divider>
        </Header>
        <Menu onClick={this.handleClick}
          selectedKeys={[this.state.current]}
          //defaultOpenKeys={['']}
          mode="inline"
          theme="dark"
        >
          <Menu.Item key="Sender_1" style={{ fontSize: "130%", height: "20vh", alignItems: "center" }}>
            <NavLink to="/DirectMessages">
              <div>
                <hr style={{ color: '#cccccc' }} />
                <h1 style={{ color: 'white', fontSize: "130%" }}><strong>{this.state.recents[0].sender}</strong></h1>
                <p><Icon type="double-right" />{this.state.recents[0].text}</p>
                <hr style={{ color: '#cccccc' }} />
              </div>
            </NavLink>
          </Menu.Item>

          <Menu.Item key="Sender_2" style={{ fontSize: "130%", height: "18vh", alignItems: "center" }}>
            <NavLink to="/DirectMessages">
              <div>
                <h1 style={{ color: 'white', fontSize: "130%" }}><strong>{this.state.recents[1].sender}</strong></h1>
                <p><Icon type="double-right" />{this.state.recents[1].text}</p>
                <hr style={{ color: '#cccccc' }} />
              </div>
            </NavLink>
          </Menu.Item>


          <Menu.Item key="Sender_3" style={{ fontSize: "130%", height: "18vh", alignItems: "center" }}>
            <NavLink to="/DirectMessages">
              <div>
                <h1 style={{ color: 'white', fontSize: "130%" }}><strong>{this.state.recents[2].sender}</strong></h1>
                <p><Icon type="double-right" />{this.state.recents[2].text}</p>
                <hr style={{ color: '#cccccc' }} />
              </div>
            </NavLink>
          </Menu.Item>


          <Menu.Item key="Sender_4" style={{ fontSize: "130%", height: "18vh", alignItems: "center" }}>
            <NavLink to="/DirectMessages">
              <div>
                <h1 style={{ color: 'white', fontSize: "130%" }}><strong>{this.state.recents[3].sender}</strong></h1>
                <p><Icon type="double-right" />{this.state.recents[3].text}</p>
                <hr style={{ color: '#cccccc' }} />
              </div>
            </NavLink>
          </Menu.Item>

          <Menu.Item key="Sender_5" style={{ fontSize: "130%", height: "18vh", alignItems: "center" }}>
            <NavLink to="/DirectMessages">
              <div>
                <h1 style={{ color: 'white', fontSize: "130%" }}><strong>{this.state.recents[4].sender}</strong></h1>
                <p><Icon type="double-right" />{this.state.recents[4].text}</p>
                <hr style={{ color: '#cccccc' }} />
              </div>
            </NavLink>
          </Menu.Item>

          <Menu.Item key="Sender_6" style={{ fontSize: "130%", height: "18vh", alignItems: "center" }}>
            <NavLink to="/DirectMessages">
              <div>
                <h1 style={{ color: 'white', fontSize: "130%" }}><strong>{this.state.recents[5].sender}</strong></h1>
                <p><Icon type="double-right" />{this.state.recents[5].text}</p>
                <hr style={{ color: '#cccccc' }} />
              </div>
            </NavLink>
          </Menu.Item>

          <Menu.Item key="Sender_7" style={{ fontSize: "130%", height: "18vh", alignItems: "center" }}>
            <NavLink to="/DirectMessages">
              <div>
                <h1 style={{ color: 'white', fontSize: "130%" }}><strong>{this.state.recents[6].sender}</strong></h1>
                <p><Icon type="double-right" />{this.state.recents[6].text}</p>
                <hr style={{ color: '#cccccc' }} />
              </div>
            </NavLink>
          </Menu.Item>

          <Menu.Item key="Sender_8" style={{ fontSize: "130%", height: "18vh", alignItems: "center" }}>
            <NavLink to="/DirectMessages">
              <div>
                <h1 style={{ color: 'white', fontSize: "130%" }}><strong>{this.state.recents[7].sender}</strong></h1>
                <p><Icon type="double-right" />{this.state.recents[7].text}</p>
                <hr style={{ color: '#cccccc' }} />
              </div>
            </NavLink>
          </Menu.Item>

          <Menu.Item key="Sender_9" style={{ fontSize: "130%", height: "18vh", alignItems: "center" }}>
            <NavLink to="/DirectMessages">
              <div>
                <h1 style={{ color: 'white', fontSize: "130%" }}><strong>{this.state.recents[8].sender}</strong></h1>
                <p><Icon type="double-right" />{this.state.recents[8].text}</p>
                <hr style={{ color: '#cccccc' }} />
              </div>
            </NavLink>
          </Menu.Item>

          <Menu.Item key="Sender_10" style={{ fontSize: "130%", height: "18vh", alignItems: "center" }}>
            <NavLink to="/DirectMessages">
              <div>
                <h1 style={{ color: 'white', fontSize: "130%" }}><strong>{this.state.recents[9].sender}</strong></h1>
                <p><Icon type="double-right" />{this.state.recents[9].text}</p>
                <hr style={{ color: '#cccccc' }} />
              </div>
            </NavLink>
          </Menu.Item>

        </Menu>
      </Layout >
    );
  }
}

export default withRouter(App);
