import React, { Component } from 'react';
// import logo from './logo.svg';
import SplitPane from 'react-split-pane';
import Pane from 'react-split-pane';

import Editor from './editor.js';
import ReactMarkdown from 'react-markdown';

import './App.css';

import cx from 'classnames';


import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";


var Tree = require('react-ui-tree');
var tree = require('./tree-data.js');
require('react-ui-tree/dist/react-ui-tree.css');
require('./tree-theme.css');
require('./react-contextmenu.css');

const electron = window.require('electron');
const {ipcRenderer,remote } = electron;
const electronFs = remote.require('fs');


const MENU_TYPE = 'SIMPLE';

class App extends Component {


    constructor(props) {
        super(props);

        this.state = {
            markdownSrc: "",
            active: null,
            tree: null,
            opendir:null
        }

        this.onMarkdownChange = this.onMarkdownChange.bind(this);


        ipcRenderer.on('open-project-messages', function(event, message){

            // console.log("open-project-messages opendir " + message.opendir);
            // console.log("open-project-messages projectname " + message.projectname);
            // console.log("open-project-messages fileslist" + message.fileslist);
            //

               var filedirlist =   []
              message.fileslist.forEach(function(item,index){

                  filedirlist.push({module:item.filename,leaf:item.leaf});
                 // console.log(item.filename+'---'+index);

             });
             
            var tt ={module: message.projectname,children: filedirlist}
            this.setState({
                 opendir:  message.opendir,
                 tree: tt
            });


        }.bind(this));



        ipcRenderer.on('open-file-messages', function(event, message){

            this.setState({
                markdownSrc: message
            });

        }.bind(this));


        ipcRenderer.on('save-file-messages', function(event, filepath){

            if(filepath){
                electronFs.writeFile(filepath,this.state.markdownSrc,(err)=>{
                    if (err) throw err
                })
            }


        }.bind(this));


    }


    renderNode = node => {
        return (
            <span
                className={cx('node', {
                    'is-active': node === this.state.active
                })}
                onClick={this.onClickNode.bind(null, node)}
            >
        {node.module}
      </span>
        );
    };

    onClickNode = node => {


        electronFs.readFile(this.state.opendir+'/'+ node.module, 'utf-8', (err, data) => {

            if(err){
                // alert("An error ocurred reading the file :" + err.message);
                return;
            }

             this.setState({
                 active: node,
                 markdownSrc: data
             });

         });


    };



    handleChange = tree => {
        this.setState({
            tree: tree
        });
    };



    onMarkdownChange(md) {
        this.setState({
            markdownSrc: md
        });
    }


     handleClick(e, data) {
       alert('ssss');
    }

    onContextMenu(e){
        e.preventDefault();
        alert("右单击");

    }


    render() {
        return (
            <div className="App">
                <SplitPane split="vertical" defaultSize="20%" >



                            <div className="app">
                            <ContextMenuTrigger   id={MENU_TYPE} holdToDisplay={1000}>
                                <div className="tree">
                                    <Tree
                                        paddingLeft={20}
                                        tree={this.state.tree}
                                        onChange={this.handleChange}
                                        isNodeCollapsed={this.isNodeCollapsed}
                                        renderNode={this.renderNode}
                                    />
                                </div>
                            </ContextMenuTrigger>
                                <ContextMenu id={MENU_TYPE}>
                                    <MenuItem onClick={this.handleClick} data={{ item: 'item 1' }}>Menu Item 1</MenuItem>
                                    <MenuItem onClick={this.handleClick} data={{ item: 'item 2' }}>Menu Item 2</MenuItem>
                                    <MenuItem divider />
                                    <MenuItem onClick={this.handleClick} data={{ item: 'item 3' }}>Menu Item 3</MenuItem>
                                </ContextMenu>
                            </div>











                    <SplitPane split="horizontal"  defaultSize="50%"  >

                        <div className="editor-pane"  >
                            <Editor  id="my-editor" className="editor" value={this.state.markdownSrc} onChange={this.onMarkdownChange}/>
                        </div>

                        <div className="view-pane">
                            <ReactMarkdown className="result" source={this.state.markdownSrc} />
                        </div>
                    </SplitPane>

                </SplitPane>
            </div>



        );
    }
}

export default App;