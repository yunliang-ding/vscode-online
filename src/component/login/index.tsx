import * as React from "react"
import { observer, inject } from 'mobx-react'
import { Input, Message, Button } from 'react-ryui'
import './index.less'
@inject('UI')
@observer
class Login extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
    this.state = {
      token: localStorage.getItem('token')
    }
  }
  render() {
    let theme = this.props.UI.isDark ? '-dark' : ''
    const message = new Message({
      duration: 3,
      dark: this.props.UI.isDark
    })
    return <div className={`app-login${theme}`}>
      <div className='app-login-box'>
        <Input
          dark={this.props.UI.isDark}
          placeholder='请输入验证码'
          value={this.state.token}
          onChange={
            (e) => {
              this.setState({token: e.target.value})
            }
          }
        />
        <Button
          label='提交'
          type='primary'
          dark={this.props.UI.isDark}
          style={{
            width:60,
            marginLeft: 8
          }}
          onClick={
            () => {
              if(this.state.token !== '930226'){
                message.error('验证码错误')
              } else {
                localStorage.setItem('token', '930226')
                this.props.UI.setLogin(true)
              }
            }
          }
        />
      </div>
    </div>
  }
}
export { Login }