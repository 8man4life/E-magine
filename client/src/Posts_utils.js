import React, { Component } from 'react';
import './DiscApp.css';
import './discindex.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import Todo from './to-do-list'
import { Button } from 'antd';
import { Tabs, Icon, Divider, Input } from 'antd';
import { NavLink } from 'react-router-dom'
const { TabPane } = Tabs;
const { TextArea } = Input


class Post extends Component {
  constructor(prop) {
    super(prop)
    this.state = {
      Postnote: '',
      PostTitle: '',
      fileName: '',
      postState: 'Post!',
      post: '',
      counter: 0,
      title: ''


    } //For storing text for post
    this.tabcontainer = { color: "white", backgroundColor: "#001529", boxShadow: "3px 3px 10px #0a0a0a" }
  }

  changeText = (ev) => {
    let val = ev.target.value;
    let nam = ev.target.name;
    this.setState({ [nam]: val })
  }

  postOrEdit = () => {
    this.state.postState === 'Post!' ? //Note ternary operator here
      this.setState({ postState: "Edit!" }) : this.setState({ postState: "Post!" })
  }

  upvoteQuestion = () => {
    this.setState({ counter: this.state.counter + 1 })
  }

  downvoteQuestion = () => {
    this.setState({ counter: this.state.counter - 1 })
  }

  handleInput = (ev) => {
    this.setState({ title: ev.target.value })
  }

  componentDidMount() {
    var self = this;
    this.editor = new window.FroalaEditor('#exampl', {
      events: {
        contentChanged: function () {
          self.setState({ post: this.html.get() });
        },
        initialized: function () {
          this.html.set(self.props.location.state.post)
        }
      },
      attribution: false
    })
    this.setState({ title: self.props.location.state.title })
  }
  componentDidUpdate() {
    // create a variable to check if the thingy is open
    // if it is not and user is poster, create editor
    if (this.props.user === this.props.poster) {
      var self = this;
      this.editor = new window.FroalaEditor('#exampl',
        {
          events: {
            contentChanged: function () {
              self.setState({ post: this.html.get() });
            },
            initialized: function () {
              this.html.set(self.props.location.state.post)
            }
          },
          attribution: false
        })
    }
  }
  render() {
    let ifPosted = ''
    let d = new Date()
    if (this.state.postState === 'Edit!') {
      ifPosted = <p className='whiteright'>Posted by {this.props.poster} on {d.toDateString()}</p>
    }
    else {
      ifPosted = '';
    }
    if (this.props.user === this.props.poster && this.state.postState !== 'Edit!') {
      return (
        <div id='postall'>
          <Tabs defaultActiveKey="1" tabBarStyle={this.tabcontainer}>
            <TabPane tab={
              <span>
                <Icon type="edit" theme="twoTone" />
                Posting
                </span>
            }
              key='1'>
              <Divider orientation="left" style={{ color: "white", fontSize: "2vw" }}>
                <span>Your post</span>
                <Icon type="edit" theme='twoTone'></Icon>
              </Divider>

              <form onSubmit={this.func = (ev) => { ev.preventDefault(); alert('Posted!') }}>
                <TextArea value={this.state.title} onChange={this.handleInput} placeholder='Type title here'></TextArea>
                <div id='exampl'></div>
                <br />
                <Button type='primary' onClick={this.postOrEdit}><NavLink to='/DiscApp'>{this.state.postState}</NavLink></Button>
                {ifPosted}
              </form>

            </TabPane>
            <TabPane tab={
              <span>
                <Icon type="camera" theme="twoTone" />
                Preview
            </span>}
              key='2'>
              <Divider orientation="left" style={{ color: "white", fontSize: "2vw" }}>
                <span>Preview </span>
                <Icon type="camera" theme='twoTone'></Icon>
              </Divider>
              <div dangerouslySetInnerHTML={{ __html: this.state.title }} className='preview'></div>
              <div dangerouslySetInnerHTML={{ __html: this.state.post }} className='preview'></div>
            </TabPane>
          </Tabs>
        </div>

      )
    }
    else {
      return (
        <Todo user={this.props.user} />
      )
    }
  }
}

export default Post


