import * as React from 'react'
import './index.less'
import { CheckBox } from '../index'
const Window: any = window
class Tree extends React.Component {
  [x: string]: any
  state: any
  props: {
    style?: any
    dark?: boolean
    checkable?: boolean
    defaultExpandedKeys?: any
    defaultCheckedKeys?: any
    onCheck?: any
    onExpand?: any
    treeData: any
  }
  constructor(props) {
    super(props)
    this.state = {
      treeData: props.treeData,
      checkedKeys: props.defaultCheckedKeys || [],
      expandedKeys: props.defaultExpandedKeys || [],
    }
  }
  componentWillReceiveProps(props) {
    this.state = {
      treeData: props.treeData,
      checkedKeys: props.defaultCheckedKeys || [],
      expandedKeys: props.defaultExpandedKeys || []
    }
  }
  expandedKeysToggle = (key) => { //  设置 节点 Toggle
    let index = this.state.expandedKeys.indexOf(key)
    index > -1
      ? this.state.expandedKeys.splice(index, 1)
      : this.state.expandedKeys.push(key)
    console.log(this.state.expandedKeys)
    this.setState({
      expandedKeys: this.state.expandedKeys
    }, () => {
      this.props.onExpand && this.props.onExpand(this.state.expandedKeys)
    })
  }
  getChecked = (checked, node, checkedKeys) => {
    if (checked) { // push
      (checkedKeys.indexOf(node.key) === -1 && !node.disabled) && checkedKeys.push(node.key) // 避免重复 push
    } else { // splice
      checkedKeys.indexOf(node.key) > -1 && checkedKeys.splice(checkedKeys.indexOf(node.key), 1) // 避免多删除
    }
    if (node.children) { // 递归操作子节点
      node.children.map(_node => {
        return this.getChecked(checked, _node, checkedKeys)
      })
    }
    return checkedKeys
  }
  setChecked = (checked, node) => { //  设置 叶子 checked Toggle
    const checkedKeys = this.getChecked(checked, node, this.state.checkedKeys)
    this.setState({
      checkedKeys
    }, () => {
      if (this.props.onCheck) {
        this.props.onCheck(this.state.checkedKeys)
      }
    })
  }
  callBack = (children, paddingLeft) => {
    let { expandedKeys, checkedKeys } = this.state
    return children && children.map(node => {
      let className = checkedKeys.includes(node.key) ? "yui-tree-node yui-tree-leaf-active" : "yui-tree-node yui-tree-leaf"
      return [<div
        key={node.key}
        className={className}
        style={{
          paddingLeft
        }}
        onClick={
          () => {
            this.expandedKeysToggle(node.key)
            if (node.disabled) {
              return
            }
            this.setState({
              checkedKeys: [node.key]
            }, () => {
              if (this.props.onCheck) {
                this.props.onCheck(this.state.checkedKeys)
              }
            })
          }
        }
      >
        {
          node.children && <div className='yui-tree-icon'>
            <i className={expandedKeys.includes(node.key) ? 'iconfont icon-jiantou32' : 'iconfont icon-jiantou34'} />
          </div>
        }
        {
          this.props.checkable ? <CheckBox
            value={checkedKeys.includes(node.key) ? [node.key] : []}
            dataList={[{ label: node.label, value: node.key, disabled: node.disabled }]}
            onChange={
              (e) => {
                this.setChecked(e.length > 0, node)
              }
            }
          /> : <span
            className='yui-tree-label'
            style={{
              cursor: node.disabled ? 'not-allowed' : 'pointer',
              opacity: node.disabled ? 0.5 : 1
            }}>{node.label}</span>
        }
      </div >,
      expandedKeys.includes(node.key) ? this.callBack(node.children, paddingLeft + 8) : null]
    })
  }
  render() {
    let treeDom = this.callBack(this.state.treeData, 8)
    const theme = this.props.dark || Window.yuiIsDark ? '-dark' : ''
    return <div className={"yui-tree" + theme} style={this.props.style}>
      {treeDom}
    </div>
  }
}
export {
  Tree
}