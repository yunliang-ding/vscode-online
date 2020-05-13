import * as React from "react"
import { observer, inject } from 'mobx-react'
import './index.less'
@inject('UI', 'Loader')
@observer
class LoaderPanel extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
  }
  render() {
    let theme = this.props.UI.isDark ? '-dark' : ''
    return <div className={`app-loader-panel${theme}`}>
      app-loader-panel
    </div>
  }
}
export { LoaderPanel }