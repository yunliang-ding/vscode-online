import * as React from "react"
import { observer, inject } from 'mobx-react'
import './index.less'
@inject('UI', 'Git')
@observer
class Footer extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
  }
  render() {
    const { git: { waitCommitCount, branch, isGitProject } } = this.props.Git
    let theme = this.props.UI.isDark ? '-dark' : ''
    return <div className={`app-workbench-footer${theme}`}>
      {
        isGitProject && <div>
          {branch}    {waitCommitCount}    <i className='iconfont icon-jiantou'></i>
        </div>
      }
    </div>
  }
}
export { Footer }