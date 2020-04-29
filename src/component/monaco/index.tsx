import * as React from "react"
import './index.less'
import { observer, inject } from 'mobx-react'
@inject('Monaco', 'FileSystem')
@observer
class Monaco extends React.Component<any, any> {
  editor: any
  monacoNode: HTMLElement;
  props: any;
  constructor(props) {
    super(props)
  }
  componentWillUnmount() {
    this.props.Monaco.dispose(this.editor)
  }
  componentDidMount() {
    this.editor = this.props.Monaco.init(this.monacoNode, {
      language: this.props.language,
      theme: this.props.theme,
      value: this.props.value,
      path: this.props.path,
      readOnly: false
    }, this.props.onChange)
  }
  render() {
    return <div
      className={`app-monaco-editor`}
      key={this.props.path}
      ref={(node) => { this.monacoNode = node }}
      style={{
        display: this.props.visabled ? 'block' : 'none'
      }} />
  }
}
export { Monaco }