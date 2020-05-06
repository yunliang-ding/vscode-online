import * as React from "react"
import './index.less'
import { observer, inject } from 'mobx-react'
@inject('Monaco')
@observer
class MonacoDiff extends React.Component<any, any> {
  monacoNode: HTMLElement;
  props: any;
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    this.props.Monaco.createDiffEditor(this.monacoNode, {
      value: this.props.value,
      language: this.props.language,
      theme: this.props.theme,
      readOnly: true
    })
    this.props.Monaco.setModel(
      this.props.Monaco.createModelByContent(this.props.original, this.props.language), // 暂存区文件
      this.props.Monaco.createModelByContent(this.props.value, this.props.language)
    )
  }
  render() {
    return <div className='app-monaco-editor-diff' ref={(node) => { this.monacoNode = node }} />
  }
}
export { MonacoDiff }