import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SortableTree, { addNodeUnderParent, removeNodeAtPath, changeNodeAtPath, getDescendantCount, getTreeFromFlatData } from '@nosferatu500/react-sortable-tree';
import '@nosferatu500/react-sortable-tree/style.css'; // This only needs to be imported once in your app

export default class Tree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: getTreeFromFlatData({flatData:props.d}),
      addAsFirstChild: false,
    };
  }

  render() {
    const getNodeKey = ({ treeIndex }) => treeIndex;
    // const getNodeKey = ({ treeIndex,node }) => node.id;
    return (
      <div style={{ height: "95vh" }}>
        <SortableTree
          treeData={this.state.treeData}
          onChange={(treeData) =>{
            this.setState({ treeData });
            console.log("Sortable Tree Changed");
            // console.log(treeData);
          }}
          rowHeight={({treeIndex,node,path})=>getDescendantCount({'node':node,'ignoreCollapsed':false}) == 0 ? 100:60}
          onMoveNode={({ treeData, node, nextParentNode, prevPath, prevTreeIndex, nextPath, nextTreeIndex})=>{
            document.dispatchEvent(new CustomEvent('node-moved',{'detail':{'nodeid':node.id,'nextParent':nextParentNode===null?0:nextParentNode}}));
          }}
          generateNodeProps={({ node, path }) => ({
            title: (
                <div>
                    <input 
                      data-action="synced-input"
                      node-id={node.id}
                      last-ref={node.titleLastRef}
                      curr-ref={node.titleCurrRef}
                      style={{ fontSize: '1.1rem' }}
                      value={node.title}
                      onChange={event => {
                        const nowTitle = event.target.value;
                        const nowRef = uuidv4();
                        this.setState(state => ({
                          treeData: changeNodeAtPath({
                            treeData: state.treeData,
                            path,
                            getNodeKey,
                            newNode: { ...node, titleLastRef:node.titleCurrRef, titleCurrRef: nowRef, title:nowTitle },
                          }),
                        }));
                      }}
                    />
                    {getDescendantCount({'node':node,'ignoreCollapsed':false}) == 0 ? 
                      <div>
                        <label htmlFor={`status${node.id}`}>Status:</label>
                        <select 
                          name={`status${node.id}`}
                          data-action="synced-input"
                          node-id={node.id}
                          last-ref={node.statusLastRef}
                          curr-ref={node.statusCurrRef}
                          value={node.status}
                          onChange={event => {
                            console.log(event.target.value);
                            const nowVal = event.target.value;
                            this.setState(state => ({
                                treeData: changeNodeAtPath({
                                    treeData: state.treeData,
                                    path,
                                    getNodeKey,
                                    newNode: { ...node, statusLastRef : node.statusCurrRef, statusCurrRef:uuidv4(), status:nowVal },
                                }),
                            }));
                        }}
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
                      :
                      ""
                    }
                </div>
              ),
            buttons: [
              <button
                onClick={() =>{
                  const newObj = {title: "",name:"",id:uuidv4(),parent:node.id};
                  console.log(path);
                  this.setState(state => ({
                    treeData: addNodeUnderParent({
                      treeData: state.treeData,
                      parentKey: path[path.length - 1],
                      expandParent: true,
                      getNodeKey,
                      newNode: newObj,
                      addAsFirstChild: state.addAsFirstChild,
                    }).treeData,
                  }));
                document.dispatchEvent(new CustomEvent('node-added',{detail: newObj}));
              }
                }
              >
              Add Child
              </button>,
              <button
              onClick={() =>{
                const newObj = {title: "",name:"",id:uuidv4(),parent:path.length==1?"":path};
                this.setState(state => ({
                  treeData: addNodeUnderParent({
                    treeData: state.treeData,
                    parentKey: path[path.length - 2],
                    expandParent: true,
                    getNodeKey,
                    newNode: newObj,
                    addAsFirstChild: state.addAsFirstChild,
                  }).treeData,
                }))
                document.dispatchEvent(new CustomEvent('node-added',{detail: newObj}));
              }
              }
              >
              Add Sibling
              </button>,
              <button
                onClick={() =>{
                  this.setState(state => ({
                    treeData: removeNodeAtPath({
                      treeData: state.treeData,
                      path,
                      getNodeKey,
                    }),
                  }))
                document.dispatchEvent(new CustomEvent('node-removed',{detail: node.id}));
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