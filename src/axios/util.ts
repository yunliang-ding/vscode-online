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
export {
  toCode,
  fromCode
}