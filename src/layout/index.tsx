import * as React from "react"
import SplitPane from 'react-split-pane'
import { ActivityBar, SiderBar, Code, Footer, LoaderPanel, Login } from 'component/index'
import { observer, inject } from 'mobx-react'
import { Input, Button } from 'react-ryui'
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
    window.addEventListener("keydown", function (e) {
      //可以判断是不是mac，如果是mac,ctrl变为花键
      if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
      }
    }, false);
  }
  render() {
    const theme = this.props.UI.isDark ? '-dark' : ''
    const { loading } = this.props.Loader
    const {
      login,
      openProjectVisabled,
      setOpenProjectVisabled,
      projectPath,
      setProjectPath,
      openProject
    } = this.props.UI
    return login ? <div className={`app-layout${theme}`} onContextMenu={
      (e) => {
        e.preventDefault()
      }
    }>
      {
        loading && <LoaderPanel />
      }
      {
        openProjectVisabled && <div className='workbench-open-project' onClick={
          () => {
            setOpenProjectVisabled(false)
          }
        }>
          <div className='workbench-open-project-box' onClick={
            (e) => {
              e.stopPropagation()
            }
          }>
            <Input
              dark={this.props.UI.isDark}
              value={projectPath}
              placeholder='输入项目路径'
              onChange={
                (e) => {
                  setProjectPath(e.target.value)
                }
              }
            />
            <Button
              label='打开'
              dark={this.props.UI.isDark}
              onClick={
                () => {
                  openProject(projectPath)
                }
              }
            />
          </div>
        </div>
      }
      <div className='app-layout-body' style={{
        visibility: loading ? 'hidden' : 'visible'
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
    </div > : <div className='app-layout' onContextMenu={
      (e) => {
        e.preventDefault()
      }
    }>
        <Login />
      </div>
  }
}
export { Layout }