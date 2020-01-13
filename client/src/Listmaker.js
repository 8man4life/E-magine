// Makes a list for js
import React, {Component} from 'react';
import logo from './logo.svg';
import './DiscApp.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import Post from './Posts_utils.js'
import {Button} from 'antd'


class Listmaker extends Component{
    constructor(prop){
        super(prop)
    }
    
    postTime = (items) => {
        let d =  new Date()
        return items.user+' posted this at '+d.toDateString()
       
    }
createItem = (items) => {
    return (
        <li>
            <div className= 'listpart'>
                <p class = 'timetext'>{this.postTime(items)}</p>
                <p class = 'replytext'>{items.text}</p>
            </div>
            <Button type = 'danger' onClick = {() => alert('hello')}>Delete
            </Button><br/>
        </li>
        );
    }
    render(){
        const toDoEntries = this.props.entries;
       const listItems = toDoEntries.map(this.createItem);
        return(
            <div id = 'listdesign'>
             <ul id =  'thelist'>{listItems}</ul>
             </div>
        )
    }
}
export default Listmaker