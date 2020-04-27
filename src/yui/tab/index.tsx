import * as React from 'react'
import './index.less'
const Window: any = window
class Tabs extends React.Component<any, any> {
  [x: string]: any
  tabsNode: any
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
    tabs = <div className="yui-tabs-compont" ref={(node) => { this.tabsNode = node }}>
      {
        dataList && dataList.map(tab => {
          return <div title={tab.tip} key={tab.key} className={activeKey === tab.key ? "yui-tabs-item-active" : "yui-tabs-item"} onClick={
            () => {
              this.setState({
                activeKey: tab.key
              }, () => {
                onClick && onClick(tab)
              })
            }
          }>
            <div className='yui-tabs-item-header'>
              <div className='yui-tabs-item-label'>
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
                        e.stopPropagation(); //阻止往上冒泡
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
            </div>
            {
              (tab.content && tab.key === activeKey) && <div className='yui-tabs-item-content' style={{
                width: this.tabsNode ? this.tabsNode.getBoundingClientRect().width : '100%',
                height: this.tabsNode ? this.tabsNode.getBoundingClientRect().height - 36 : '100%'
              }}>
                {tab.content}
              </div>
            }
          </div>
        })
      }
    </div>
    let theme = this.props.dark || Window.yuiIsDark ? '-dark' : ''
    return <div className={"yui-tabs" + theme} style={this.props.style}>
      {tabs}
    </div>
  }
}
export {
  Tabs
}
