import React, { Component } from 'react';
import './DiscApp.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import { Button, Input } from 'antd'
import DirectMessagesMessages from './DirectMessagesMessages'
const { TextArea } = Input

export default class DirectMessagesPostbar extends Component {
    constructor(prop) {
        super(prop)
        this.state = {

            items: [],
            currentState: { key: '', text: '' },
            currentText: '',
        }

    }
    deleteItem = (key) => { const filteredItems = this.state.items.filter(item => { return item.key !== key }); this.setState({ items: filteredItems }) }
    addItem = (ev) => {
        ev.preventDefault();
        let newState = { key: Date.now() + this.props.sender, text: this.state.currentText };
        if (newState.text !== '') {
            this.props.func(this.props.sender,newState.text);
            let item = [...this.state.items, newState];
            this.setState({ currentState: newState, items: item, currentText: '' })
        }
        else { alert('Wrong Input') }
    }
    handleItem = (ev) => { this.setState({ currentText: ev.target.value }) }
    render() {
        return (
            <div className='todolist' >
                <form onSubmit={this.addItem}>
                    <DirectMessagesMessages
                        entries={this.state.items}
                        deleteItem={this.deleteItem.bind(this)}
                        receiver={this.props.receiver}
                        sender={this.props.sender} />

                    <div id='dmpostbar'>
                        <TextArea id='DirectMessaging' placeholder='Type something here' value={this.state.currentText} onChange={this.handleItem}></TextArea>
                        <Button id='Directposttwo' size='large' type='primary' onClick={this.addItem}>Post</Button>
                    </div>
                </form>
            </div>
        )
    }
}


