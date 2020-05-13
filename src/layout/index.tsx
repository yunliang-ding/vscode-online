import * as React from "react"
import SplitPane from 'react-split-pane'
import { ActivityBar, SiderBar, Code, Footer, LoaderPanel } from 'component'
import { observer, inject } from 'mobx-react'
import './index.less'
const Window: any = window
@inject('UI', 'Loader')
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
    let path = location.hash.substr(1)
    if (path.endsWith('/')) {
      path = path.substr(0, path.length - 1)
    }
    this.props.Loader.start(path) // 加载项目
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
      {
        this.props.Loader.loading && <LoaderPanel />
      }
      <div className='app-layout-body' style={{
        visibility: this.props.Loader.loading ? 'hidden' : 'visible'
      }}>
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
    </div >
  }
}
export { Layout }