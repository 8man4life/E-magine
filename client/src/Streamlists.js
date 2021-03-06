import React, { Component } from 'react';
import './DiscApp.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import { Button, Input } from 'antd'
import Streamlistmake from './Streamlistmake'
import './streamchat.css'
const { TextArea } = Input
class Streamlist extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentState: { key: '', text: '', user: '', counter: '' },
            currentText: '',
            messages: this.props.messages || []
        }
    }

    componentDidMount () {
        this.fetchPostsData();
    }

    fetchPostsData() {
        if (this.state.messages.length == 0) {
            this.props.fetchMessageFromChannel(this.props.channelID);
        }
    }

    createPost(text) {
        const msg = {
            timestamp: Date.now(),
            content: text,
            type: 0
        }

        fetch(window.baseURL + `/api/v1/channels/${this.props.channelID}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': window.localStorage.getItem('token')
            },
            body: JSON.stringify(msg)
        });
    }


    deleteItem = (key) => {
        const filteredItems = this.state.messages.filter(item => {
            return item.key !== key 
        }); 
        this.setState({ items: filteredItems }) 
    }
    addItem = (ev) => { 
        ev.preventDefault(); 
        let newState = { 
            key: Date.now() + this.props.user, 
            text: this.state.currentText, 
            user: this.props.user, 
            counter: 0 
        }; 
        if (newState.text !== '') { 
            let item = [...this.state.messages, newState];
            this.createPost(this.state.currentText);
            // this.setState({ currentState: newState, items: item, currentText: '' }) 
        } 
        else { alert('Wrong Input') } 
    }
    handleItem = (ev) => { this.setState({ currentText: ev.target.value }) }
    render() {
        return (
            <div className='todolist' >
                <form onSubmit={this.addItem}>
                    <Streamlistmake
                        entries={this.state.messages}
                        deleteItem={this.deleteItem.bind(this)}
                        user={this.props.user}
                    />
                    <div id='Postbar'>
                        <TextArea id='streamMessaging' placeholder='Type something here' value={this.state.currentText} onChange={this.handleItem}></TextArea>
                        <Button size='large' type='primary' onClick={this.addItem}>Post</Button>
                    </div>
                </form>
            </div>
        )
    }
}


export default Streamlist