import * as React from "react"
import './index.less'
const Window: any = window
class CheckBox extends React.Component {
  props: {
    value?:any, 
    dataList?:any,
    dark?:boolean,
    addonBefore?:any,
    addonAfter?:any,
    onChange?:Function,
    readonly?:boolean,
    style?:any
  }
  render() {
    let { value, dataList } = this.props
    value = value || []
    dataList = dataList || []
    let addonBefore = null
    let addonAfter = null
    let checkbox = null;
    const theme = this.props.dark || Window.yuiIsDark ? '-dark' : ''
    if (this.props.addonBefore) { // 前置按钮
      addonBefore = <span className={"yui-checkbox-addonBefore" + theme}>
        {this.props.addonBefore}
      </span>
    }
    if (this.props.addonAfter) { // 后置按钮
      addonAfter = <span className={"yui-checkbox-addonAfter" + theme}>
        {this.props.addonAfter}
      </span>
    }
    checkbox = <div className={"yui-checkbox-compont" + theme}>
      {
        dataList.map(item => {
          let className = item.disabled ? `yui-checkbox-compont-item-disabled${theme}` : `yui-checkbox-compont-item${theme}`
          return <span className={className} key={item.key} onClick={
            () => {
              if(item.disabled){
                return
              }
              if (value.includes(item.value)) {
                value.splice(value.indexOf(item.value), 1)
              } else {
                value.push(item.value)
              }
              this.props.onChange(value)
            }
          }>
            <span className={value.includes(item.value) ? "value-active" : "value"}>
              {
                value.includes(item.value)
                  ?
                  <span className="value-active-center">
                    <i className="iconfont icon-duihao" style={{ fontSize: 12 }} />
                  </span>
                  :
                  null
              }
            </span>
            <span className="label">
              {item.label}
            </span>
          </span>
        })
      }
    </div>
    if (this.props.readonly) {
      checkbox = <div className={"yui-checkbox-compont-disabled" + theme} style={{ display: 'flex' }}>
        {
          dataList && dataList.map(item => {
            return (
              <span className={"yui-checkbox-compont-item" + theme} key={item.key}>
                <span className={value.includes(item.value) ? "value-active" : "value"}>
                  {
                    value.includes(item.value)
                      ?
                      <span className="value-active-center">
                        <i className="iconfont icon-duihao" style={{ fontSize: 12 }} />
                      </span>
                      :
                      null
                  }
                </span>
                <span className="label">
                  {item.label}
                </span>
              </span>
            )
          })
        }
      </div>
    }
    let style = this.props.style || {}
    Object.assign(style, {
      border: (this.props.addonBefore || this.props.addonAfter) ? (theme ? '1px solid #333' : '1px solid #f2f2f2') : 0
    })
    return (
      <div className={"yui-checkbox" + theme} style={style}>
        {addonBefore}
        {checkbox}
        {addonAfter}
      </div>
    )
  }
}
export {
  CheckBox
}