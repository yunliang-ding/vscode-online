import * as React from 'react'
import './index.less'
const Window: any = window
class Badge extends React.Component {
  props: {
    count?: number,
    dark?: boolean,
    style?: any
  };
  render() {
    const theme = this.props.dark || Window.yuiIsDark ? '-dark' : ''
    return this.props.count > 0 && <div className={'yui-badge' + theme} style={this.props.style}>
      <div className='yui-badge-count'>
        {this.props.count}
      </div>
    </div>
  }
}
export {
  Badge
}