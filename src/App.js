import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SortableTree, { addNodeUnderParent, removeNodeAtPath, changeNodeAtPath, getDescendantCount, getTreeFromFlatData, insertNode} from '@nosferatu500/react-sortable-tree';
import '@nosferatu500/react-sortable-tree/style.css'; // This only needs to be imported once in your app
import {DebounceInput} from 'react-debounce-input';

export default class Tree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // treeData: getTreeFromFlatData({flatData:props.d}),
      treeData:props.d,
      addAsFirstChild: false,
    };
    this.getNodeKey = ({ treeIndex }) => treeIndex;
  }

  componentDidUpdate(prevProps, prevState, snapshot){
    console.log("Comp Update");
    console.log(this.state.treeData);
    document.dispatchEvent(new CustomEvent(`all-data-changed`,{'detail':this.state.treeData}));
  }


  handleNodeFieldChange(fieldName,node,path,event){
      const getNodeKey = this.getNodeKey;
      console.log(event.target.value);
      const nowVal = event.target.value;
      const newNode = {...node};
      newNode[fieldName] = nowVal;
      this.setState(state => ({
          treeData: changeNodeAtPath({
              treeData: state.treeData,
              path,
              getNodeKey,
              newNode: newNode,
          }),
      }));
      // document.dispatchEvent(new CustomEvent(`node-${fieldName}-changed`,{'detail':{
      //  'nodeid':node.id,'field':fieldName,'lastVal':node[fieldName],'nextVal':nowVal
      // }}));
  }

  render() {
    const getNodeKey = this.getNodeKey;
    // const getNodeKey = ({ treeIndex,node }) => node.id;
    return (
      <div style={
        {
          height: "95vh",
          backgroundColor:"#c0c0a0"
        }}>
        <SortableTree
          treeData={this.state.treeData}
          onChange={(treeData) =>{
            this.setState({ treeData });
            console.log("Sortable Tree Changed");
            // console.log(treeData);
          }}
          rowHeight={({treeIndex,node,path})=>100}
          onMoveNode={({ treeData, node, nextParentNode, prevPath, prevTreeIndex, nextPath, nextTreeIndex})=>{
            // document.dispatchEvent(new CustomEvent('node-moved',{'detail':{
              // 'nodeid':node.id,'nextParent':nextParentNode===null?0:nextParentNode
            // }}));
          }}
          generateNodeProps={({ node, path }) => ({
            style: {
              backgroundColor: node.status=="W"?"#cadcad":"#fafafa"
            },
            title: (
                <div>
                    <DebounceInput
                      debounceTimeout={500}
                      node-id={node.id}
                      style={{ fontSize: '1.1rem' }}
                      value={node.title}
                      onChange = {event=>this.handleNodeFieldChange('title',node,path,event)}
                    />
                    {<div
                        style={{backgroundColor: node.status=="W"?"#cadcad":"#fafafa"}}
                      >
                        {/* TODO: REFACTOR */}
                        <label htmlFor={`status${node.id}`}>Status: </label>
                        <select 
                          name={`status${node.id}`}
                          node-id={node.id}
                          value={node.status}
                          onChange={event=>this.handleNodeFieldChange('status',node,path,event)}
                        >
                          <option value="">Not worked on</option>
                          <option value="Wd">Worked on</option>
                          <option value="W">Working on</option>
                          <option value="B">Blocked</option>
                          <option value="C">Closed (Done)</option>
                          <option value="Cy">Closed (Cyclical)</option>
                          <option value="Cy">Open (Cyclical)</option>
                        </select>
                      </div>
                    }
                </div>
              ),
            buttons: [
              <div><div>
              <label htmlFor={`startdate${node.id}`}>Start date:</label>
              <input type="date"
                id={`startdate${node.id}`}
                value={node.startDate}
                onChange = {event=>this.handleNodeFieldChange('startDate',node,path,event)}
              ></input>
              </div><div>
              <label htmlFor={`enddate${node.id}`}>Due date:</label>
              <input type="date"
                id={`enddate${node.id}`}
                value={node.endDate}
                onChange = {event=>this.handleNodeFieldChange('endDate',node,path,event)}
              ></input></div>
              </div>,
              <button
                onClick={() =>{
                  const newObj = {title: "",name:"",id:uuidv4(),parentId:node.id};
                  console.log(path);
                  this.setState(state => ({
                    treeData: addNodeUnderParent({
                      treeData: state.treeData,
                      parentKey: path[path.length - 1],
                      expandParent: true,
                      getNodeKey,
                      newNode: newObj,
                      addAsFirstChild: typeof node.children !== "undefined" && node.children.length>=3?true:false,
                    }).treeData,
                  }));
                // document.dispatchEvent(new CustomEvent('node-added',{detail:
                  // newObj
                  // }));
              }
                }
              >Add Child</button>,
              <div><div>
                <button
                  onClick={() =>{
                    const newObj = {
                      title: "",
                      name:"",
                      id:uuidv4(),
                      parentId:path.length==1?"":path
                    };
                    console.log(path);
                    this.setState(state => ({
                      treeData: insertNode({
                        treeData: state.treeData,
                        depth: path.length-1,
                        minimumTreeIndex: path[path.length - 1],
                        ignoreCollapsed:true,
                        expandParent: true,
                        getNodeKey,
                        newNode: newObj
                      }).treeData,
                    }))
                  }}
                  >Add Above
                </button></div><div>
                <button
                  onClick={() =>{
                    const newObj = {
                      title: "",
                      name:"",
                      id:uuidv4(),
                      parentId:path.length==1?"":path
                    };
                    console.log(path);
                    this.setState(state => ({
                      treeData: insertNode({
                        treeData: state.treeData,
                        depth: path.length-1,
                        minimumTreeIndex: path[path.length - 1]+1,
                        ignoreCollapsed:true,
                        expandParent: true,
                        getNodeKey,
                        newNode: newObj
                      }).treeData,
                    }))
                  }}
                >Add Below</button>
                </div></div>,
              <button
                onClick={() =>{
                  this.setState(state => ({
                    treeData: removeNodeAtPath({
                      treeData: state.treeData,
                      path,
                      getNodeKey,
                    }),
                  }))
                // document.dispatchEvent(new CustomEvent('node-removed',{detail:
                //   node.id
                // }));
                }
                }
              >
              Remove
              </button>,
            ],
          })}
        />
      </div>
    );
  }
}