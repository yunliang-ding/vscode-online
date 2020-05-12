import * as React from "react"
import SplitPane from 'react-split-pane'
import { ActivityBar, SiderBar, Code, Footer } from 'component'
import { observer, inject } from 'mobx-react'
import './index.less'
const Window: any = window
@inject('UI', 'FileSystem', 'Git', 'Monaco', 'WorkerStore')
@observer
class Layout extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    if (Window.config.model === 'production') {
      window.onbeforeunload = () => {
        return false
      }
    }
    if (localStorage.getItem("token") !== 'vscode-online') {
      document.querySelector('#app').remove()
    }
    window.addEventListener("keydown", function (e) {
      //可以判断是不是mac，如果是mac,ctrl变为花键
      if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
      }
    }, false);
  }
  init = async () => {
    let hash = location.hash.substr(1)
    if (hash.endsWith('/')) {
      hash = hash.substr(0, hash.length - 1)
    }
    await this.props.FileSystem.setBaseUrl(hash) // 设置项目path
    await this.props.FileSystem.queryFiles() // 加载项目
    await this.props.Git.queryBranch() // 加载分支
    await this.props.Git.waitCommited() // 等待push
    await this.props.Monaco.settingMonaco() // 配置monaco
    await this.props.WorkerStore.init() // worker
  }
  componentWillMount() {
    this.init()
  }
  render() {
    return <div className='app-layout' onContextMenu={
      (e) => {
        e.preventDefault()
      }
    }>
      <div className='app-layout-body'>
        <ActivityBar />
        <SplitPane
          split="vertical"
          defaultSize={300}
          minSize={200}
          maxSize={600}
          onDragStarted={() => (document.body.style.cursor = 'col-resize')}
          onDragFinished={
            () => {
              document.body.style.cursor = 'auto'
            }
          }
        >
          <SiderBar />
          <Code />
        </SplitPane>
      </div>
      <div className='app-layout-footer'>
        <Footer />
      </div>
    </div>
  }
}
export { Layout }