const cookies = {}
const toCode = (code) => {  //加密字符串
  let newCCode = ''
  for (let i = 0; i < code.length; i++) {
    newCCode += String.fromCharCode(code[i].charCodeAt() - 1)
  }
  return newCCode
}
const fromCode = (code) => { //解密字符串
  let newCCode = ''
  for (let i = 0; i < code.length; i++) {
    newCCode += String.fromCharCode(code[i].charCodeAt() + 1)
  }
  return newCCode
}
const getCookie = (key: string) => {
  document.cookie.split(';').forEach(item => {
    cookies[item.substr(0, item.indexOf('='))] = item.substr(item.indexOf('=') + 1)
  })
  return cookies[key]
}
export {
  toCode,
  fromCode,
  getCookie
}