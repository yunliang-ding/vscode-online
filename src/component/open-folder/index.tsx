import * as React from "react"
import { observer, inject } from 'mobx-react'
import { Button, Cascader } from 'react-ryui'
import './index.less'
@inject('UI', 'Loader', 'FileSystem')
@observer
class OpenFolder extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
    this.state = {
      dirs: [],
      dirsList: [],
      projectPath: ''
    }
  }
  init = async (dir) => {
    const data = await this.props.FileSystem.queryDirs(dir)
    this.setState({
      dirsList: data.map(item => {
        return {
          path: item.path,
          label: item.name,
          value: item.name,
          children: []
        }
      })
    })
  }
  componentWillMount() {
    this.init('/')
  }
  render() {
    const {
      openProjectVisabled,
      setOpenProjectVisabled,
      openProject
    } = this.props.UI
    const { dirsList, dirs, projectPath } = this.state
    return openProjectVisabled && <div className='workbench-open-project' onClick={
      () => {
        setOpenProjectVisabled(false)
      }
    }>
      <div className='workbench-open-project-box' onClick={
        (e) => {
          e.stopPropagation()
        }
      }>
        <Cascader
          placeholder='选择打开目录'
          value={dirs}
          dark={this.props.UI.isDark}
          onClick={
            async (e) => {
              let data = await this.props.FileSystem.queryDirs(e.path)
              data = data.map(item => {
                return {
                  path: item.path,
                  label: item.name,
                  value: item.name,
                  children: item.type === 'directory' ? [] : null
                }
              })
              let current = null
              let deepLoop = (children) => {
                children.forEach(item => {
                  if(item.path === e.path){
                    current = item
                  } else if (item.children) {
                    deepLoop(item.children)
                  }
                })
              }
              deepLoop(this.state.dirsList)
              current.children = data
              this.setState({
                dirsList: this.state.dirsList,
                dirs: e.path.split('/').filter(item => item !== ''),
                projectPath: e.path
              })
            }
          }
          dataList={dirsList}
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
}
export { OpenFolder }