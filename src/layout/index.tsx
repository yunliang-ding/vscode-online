import * as React from "react"
import SplitPane from 'react-split-pane'
import { ActivityBar, SiderBar, Code, Footer } from 'component'
import { observer, inject } from 'mobx-react'
import './index.less'
const Window: any = window
@inject('UI', 'FileSystem', 'Git')
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
    if(localStorage.getItem("token") !== 'vscode-online'){
      document.querySelector('#app').remove()
    }
  }
  init = async () => {
    let hash = location.hash.substr(1)
    if (hash.endsWith('/')) {
      hash = hash.substr(0, hash.length - 1)
    }
    await this.props.FileSystem.setBaseUrl(hash) // 设置项目path
    await this.props.FileSystem.queryFiles() // 加载项目
    await this.props.Git.queryStatus() // 加载项目
    await this.props.Git.queryBranch() // 加载分支
    await this.props.Git.waitCommited() // 等待push
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
            minSize={0}
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