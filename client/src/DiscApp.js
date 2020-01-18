import React, { Component } from 'react';
import './DiscApp.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import Todo from './to-do-list.js'
import { Button} from 'antd'



//This will be the discussion page mainframe
class DiscApp extends Component {
  constructor(props) {
    super(props)

    this.state = {
      user: 'YEET6',
      category: 'Math', // For storing category
      notifications: 9999, //Stores number of notifications  
      poster: 'YEET6',
      items: {},
    }

  }
  render() {
    return (
      <div id='All'>
        <div id='header'>
          <h1 id='Category'>{this.state.category}
            <span id='Status'>
              <Button type='primary' size='small' id='pfp' onClick={this.changeUser = () => {
                this.state.user === 'user' ? this.setState({ user: 'YEET6' }) : this.setState({ user: 'user' })
                  ; alert('User Changed')
              }}></Button>
            </span>
          </h1>
          <br />
        </div>{/*Div for id 'Header */}



        {/*Posting utilities here*/}
        <Todo user={this.state.user} poster={this.state.poster} title={this.props.location.state.title} post= {this.props.location.state.post} />
        <br />
        {/*div for 'all*/}
      </div>
    )
  }
}


export default DiscApp