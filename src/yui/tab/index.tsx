import * as React from 'react'
import './index.less'
const Window: any = window
class Tabs extends React.Component<any, any> {
  [x: string]: any
  props: {
    style?: any,
    close?: boolean,
    dataList: any,
    activeKey?: any,
    onClick?: any,
    onRemove?: any,
    dark?: boolean
  }
  constructor(props) {
    super(props)
    this.state = {
      activeKey: props.activeKey,
      dataList: props.dataList
    }
  }
  componentWillReceiveProps(props) {
    this.setState({
      activeKey: props.activeKey,
      dataList: props.dataList
    })
  }
  render() {
    let tabs = null;
    let { close, onClick, onRemove } = this.props
    let { activeKey, dataList } = this.state
    tabs = [<div className="yui-tabs-header" key='yui-tabs-header'>
      {
        dataList && dataList.map(tab => {
          return <div title={tab.tip} key={tab.key} className={activeKey === tab.key ? "yui-tabs-header-item-active" : "yui-tabs-header-item"} onClick={
            () => {
              this.setState({
                activeKey: tab.key
              }, () => {
                onClick && onClick(tab)
              })
            }
          }>
            {tab.label}
            {
              close ? <i
                className="iconfont icon-guanbi"
                style={{
                  visibility: activeKey === tab.key ? 'visible' : 'hidden',
                  marginLeft: 8,
                  fontSize: 15
                }}
                onClick={
                  (e) => {
                    e.stopPropagation(); // 阻止往上冒泡
                    let data = dataList.filter(m => {
                      return m.key != tab.key
                    })
                    this.setState({
                      dataList: data,
                      activeKey: data[0] && data[0].key
                    }, () => {
                      onRemove && onRemove(tab)
                    })

                  }
                }
              /> : <i className="iconfont" style={{
                visibility: 'hidden'
              }} />
            }
          </div>
        })
      }
    </div>,
    <div className="yui-tabs-content" key='yui-tabs-content'>
      {
        dataList && dataList.map(tab => {
          return <div className={activeKey === tab.key ? "yui-tabs-content-item-active" : "yui-tabs-content-item"}>
            {tab.content}
          </div>
        })
      }
    </div>]
    let theme = this.props.dark || Window.yuiIsDark ? '-dark' : ''
    return <div className={"yui-tabs" + theme} style={this.props.style}>
      {tabs}
    </div>
  }
}
export {
  Tabs
}
