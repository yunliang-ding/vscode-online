import * as React from 'react'
import * as ReactDOM from "react-dom"
const $: any = document.querySelector.bind(document)
const $$: any = document.querySelectorAll.bind(document)
const Window:any = window
const typeMapping = {
  1: 'icon-message_SendSuccessfully',
  2: 'icon-cuo',
  3: 'icon-info_warning',
  4: 'icon-warning'
}
const colorMapping = {
  1: '#1ac7aa',
  2: '#d81e06',
  3: '#f4ea2a',
  4: '#39a9f4'
}
import './index.less'
class Message {
  duration: any
  dark: any
  position:string
  constructor(props) {
    this.duration = props.duration || 3
    this.dark = props.dark || Window.yuiIsDark
    this.position = props.position || 'center'
  }
  open = (type, content) => {
    const theme = this.dark ? '-dark' : ''
    let messageContainer = document.createElement("div");
    let length = $$('.yui-message'+theme).length
    messageContainer.className = 'yui-message'+theme
    if(this.position === 'br'){
      messageContainer.style.left = 'auto'
      messageContainer.style.top = 'auto'
      messageContainer.style.bottom = 50 + length * 60 + 'px'
      messageContainer.style.right = '20px'
    } else {
      messageContainer.style.top = 50 + length * 60 + 'px'
      messageContainer.style.top = 50 + length * 60 + 'px'
    }
    $('body').appendChild(messageContainer)
    setTimeout(() => {
      messageContainer.remove()
    }, this.duration * 1000)
    ReactDOM.render(this.renderMessage(type, content), messageContainer)
  }
  colse = (node) => {
    node.target.parentNode.parentNode.parentNode.remove()
  }
  success = (content) => {
    this.open(1, content)
  }
  error = (content) => {
    this.open(2, content)
  }
  warning = (content) => {
    this.open(3, content)
  }
  normal = (content) => {
    this.open(4, content)
  }
  renderMessage = (type, content) => {
    let icon = typeMapping[type]
    return <div className='yui-message-content'>
      <div className='yui-message-content-icon'>
        <i className={'iconfont ' + icon} style={{color: colorMapping[type]}}></i>
      </div>
      <div className='yui-message-content-message'>{content}</div>
      <div className='yui-message-content-close'>
        <i className='iconfont icon-guanbi' onClick={
          (e) => {
            this.colse(e)
          }
        }></i>
      </div>
    </div>
  }
}
export {
  Message
}