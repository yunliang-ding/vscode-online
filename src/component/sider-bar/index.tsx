import * as React from "react"
import { observer, inject } from 'mobx-react'
import './index.less'
const Window: any = window
@inject('UI')
@observer
class SiderBar extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
  }
  render() {
    let theme = Window.config.dark ? '-dark' : ''
    return <div className={`app-sider-bar${theme}`}>
      app-sider-bar
    </div>
  }
}
export { SiderBar }