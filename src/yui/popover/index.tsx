import * as React from 'react'
import './index.less'
const Window: any = window
class Popover extends React.Component {
  [x: string]: any
  props: {
    placement?: string,
    showAllow?: boolean,
    dark?: boolean,
    onChange?: Function,
    trigger?: string,
    content?: any,
    children?: any,
    style?: any,
    onContext?:any
  }
  state: any
  node: any
  innerNode: any
  allowNode: any
  mouseEnter: boolean
  constructor(props) {
    super(props)
    this.state = {
      visable: false
    }
  }
  componentDidMount() {
    let placement = this.props.placement || 'right' // 默认显示在右侧
    let parentHeight = parseFloat(window.getComputedStyle(this.node).height)
    let parentWidth = parseFloat(window.getComputedStyle(this.node).width)
    let innerHeight = parseFloat(window.getComputedStyle(this.innerNode).height)
    let innerWidth = parseFloat(window.getComputedStyle(this.innerNode).width)
    if (placement === 'right') {
      this.innerNode.style.left = parentWidth + 10
      this.innerNode.style.top = (parentHeight - innerHeight) / 2
      this.props.showAllow && (this.allowNode.style.left = -2)
    } else if (placement === 'left') {
      this.innerNode.style.right = parentWidth + 10
      this.innerNode.style.top = (parentHeight - innerHeight) / 2
      this.props.showAllow && (this.allowNode.style.right = -2)
    } else if (placement === 'top') {
      this.innerNode.style.left = (parentWidth - innerWidth) / 2
      this.innerNode.style.top = - (innerHeight + 6)
      this.props.showAllow && (this.allowNode.style.bottom = -2)
    } else if (placement === 'bottom') {
      this.innerNode.style.left = (parentWidth - innerWidth) / 2
      this.innerNode.style.top = parentHeight + 6
      this.props.showAllow && (this.allowNode.style.top = -2)
    }
  }
  setVisable = (visable) => {
    this.setState({
      visable
    }, () => {
      if (this.props.onChange) {
        this.props.onChange()
      }
    })
  }
  render() {
    const { visable } = this.state
    const { showAllow, trigger, style } = this.props
    let theme = this.props.dark || Window.yuiIsDark ? '-dark' : ''
    return <div
      style={style}
      className={'yui-popover' + theme}
      ref={(node) => { this.node = node }}
      onMouseLeave={
        () => {
          if (trigger === 'hover') {
            this.mouseEnter = false
            setTimeout(() => {
              if (!this.mouseEnter) {
                this.setVisable(false)
              }
            }, 200)
          }
        }
      }
      onMouseEnter={
        () => {
          if (trigger === 'hover') {
            this.mouseEnter = true
            this.setVisable(true)
          }
        }
      }
      onContextMenu={
        (e) => {
          this.props.onContext && this.props.onContext(e)
          this.setVisable(true)
          e.preventDefault()
        }
      }
      onClick={
        () => {
          if ([undefined, 'click'].indexOf(trigger) > -1) {
            this.setVisable(!visable)
          } else if (trigger === 'contextMenu' && visable) {
            this.setVisable(false)
          }
        }
      }
    >
      {this.props.children}
      {(visable && trigger !== 'hover') && <div className='yui-popover-layer' />}
      <div
        className='yui-popover-inner'
        ref={(innerNode) => { this.innerNode = innerNode }}
        onClick={
          (e) => {
            e.stopPropagation()
          }
        }
        onMouseEnter={
          () => {
            this.mouseEnter = true
          }
        }
        onMouseLeave={
          () => {
            if (trigger === 'hover') {
              this.mouseEnter = false
              setTimeout(() => {
                if (!this.mouseEnter) {
                  this.setVisable(false)
                }
              }, 200)
            }
          }
        }
        style={{
          visibility: visable ? 'visible' : 'hidden'
        }}
      >
        <div className='yui-popover-inner-layer' />
        {showAllow && <div className='yui-popover-inner-allow' ref={(allowNode) => { this.allowNode = allowNode }} />}
        <div className='yui-popover-inner-content' onClick={
          () => {
            this.setVisable(false)
          }
        }>
          {this.props.content}
        </div>
      </div>
    </div>
  }
}
export {
  Popover
}
