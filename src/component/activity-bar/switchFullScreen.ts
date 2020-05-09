const switchFullScreen = () => {
  let prefixArr = ['', 'webkit', 'moz', 'ms'] // 浏览器前缀
  let document: any = window.document
  // 是否找到适配的方法,全屏方法,退出全屏方法
  let isRightRequest, isRightExit, requestMethod, exitMethod
  let lowerFirst = str => {
    return str.slice(0, 1).toLowerCase() + str.slice(1)
  }
  let requestSuffixArr = ['RequestFullscreen', 'RequestFullScreen'] // 后缀
  let exitSuffixArr = ['ExitFullscreen', 'CancelFullScreen']
  let searchRightMethod = (prefix, suffixArr, documentParent) => {
    let methodArr = suffixArr.map((suffix) => {
      return prefix + suffix
    })
    let method, isRight
    methodArr.forEach((wholePrefix) => {
      if (isRight) return
      if (prefix.length === 0) {
        wholePrefix = lowerFirst(wholePrefix)
      }
      if (wholePrefix in documentParent) {
        method = wholePrefix
        isRight = true
      }
    })
    return method
  }
  prefixArr.forEach((prefix) => {
    if (isRightRequest && isRightExit) return
    // 查找请求
    requestMethod = searchRightMethod(prefix, requestSuffixArr, document.documentElement)
    isRightRequest = Boolean(requestMethod)
    // 查找退出
    exitMethod = searchRightMethod(prefix, exitSuffixArr, document)
    isRightExit = Boolean(exitMethod)
  })
  return {
    request: () => {
      let domEle = document.documentElement
      domEle[requestMethod]()
    },
    exit: () => {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
        document[exitMethod]()
      }
    }
  }
}
export {
  switchFullScreen
}