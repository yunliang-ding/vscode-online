const fs = require('fs')
const express = require('express')
const proxy = require('http-proxy-middleware')
const app = express()
const prefix = ''
const proxyUrl = 'http://localhost:8090'
const port = 80
// 开启静态资源访问
app.use(express.static('./frontend/public')) 
// 接口的代理1
app.use('/api/*', proxy({
    target: proxyUrl,
    changeOrigin: true,
    pathRewrite: { '^/api': '' }
  })
)
// 项目 prefix
app.get(prefix, (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
  res.end(fs.readFileSync('./frontend/views/index.html').toString())
})
// 启动服务
app.listen(port, () => {
  console.log('server on http://127.0.0.1:9000')
})