const fs = require('fs')
const url = require('url')
const path = require('path')
const http = require('http')
const httpProxy = require('http-proxy')

// 需要代理的请求标识
// proxy identifier
const identifier = 'api'

// 本地服务器监听端口
// Local server port
const localPort = 88

// 需要转发的接口服务器地址
// Interface server address
const proxyServer = {
  host: 'http://your-interface.com',
  port: 80
}

// 文件扩展名对应的MIME
// MIME for the file extension
const MIME = {
  "css": "text/css",
  "gif": "image/gif",
  "html": "text/html",
  "ico": "image/x-icon",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "js": "application/javascript",
  "json": "application/json",
  "pdf": "application/pdf",
  "png": "image/png",
  "svg": "image/svg+xml",
  "swf": "application/x-shockwave-flash",
  "tiff": "image/tiff",
  "txt": "text/plain",
  "wav": "audio/x-wav",
  "wma": "audio/x-ms-wma",
  "wmv": "video/x-ms-wmv",
  "xml": "text/xml"
};

// 创建代理服务器
// Create a proxy server
const proxy = httpProxy.createProxyServer({target: proxyServer})

// 创建本地服务器
// Create a local server
const server = http.createServer((req, res) => {
  // 当前请求资源的url
  // Current request url
  const reqUrl = url.parse(req.url)
  // 获取当前请求资源的路径
  // Current request path
  const pathname = path.join(__dirname, reqUrl.pathname)
  // 获取当前请求资源的扩展名
  // Current request extension
  const ext = path.extname(pathname).substring(1)

  // 判断是否需要代理
  // Whether a proxy is required
  if (req.url.includes(identifier)) {
    // 代理以`identifier`开头的request请求
    // Proxy url starts with `identifier`
    proxy.web(req, res)
  } else {
    fs.exists(pathname, (exists) => {
      // 判断请求的文件路径是否存在
      // Whether requested file path exists
      if (exists) {
        fs.readFile(pathname, (err, data) => {
          if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'})
            res.write(`Server Error!`);
            res.end()
          } else {
            res.writeHead(200, {'Content-Type': MIME[ext] || 'text/plain'})
            res.write(data)
            res.end()
          }
        })
      } else {
        res.writeHead(404, {'Content-Type': 'text/plain'})
        res.write(`Requested file ${pathname} does not exist!`);
        res.end()
      }
    })
  }
})
server.listen(localPort)

console.log(`Local server running at: http://localhost:${localPort}`)
console.log(`Proxy ajax request to: http://${proxyServer.host}:${proxyServer.port}`)

