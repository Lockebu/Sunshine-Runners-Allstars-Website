const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 8001;
const root = process.cwd();
const types = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.mp4':'video/mp4','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.webp':'image/webp'};

http.createServer((req,res)=>{
  const reqUrl = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(root, reqUrl === '/' ? 'index.html' : reqUrl);
  if (filePath.endsWith(path.sep)) filePath = path.join(filePath, 'index.html');
  if (!filePath.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) { res.writeHead(404); return res.end('Not Found'); }
    const ext = path.extname(filePath).toLowerCase();
    const type = types[ext] || 'application/octet-stream';
    const range = req.headers.range;
    res.setHeader('Accept-Ranges', 'bytes');
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= stats.size) {
        res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
        return res.end();
      }
      res.writeHead(206, {
        'Content-Type': type,
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Content-Length': end - start + 1
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': type, 'Content-Length': stats.size });
      fs.createReadStream(filePath).pipe(res);
    }
  });
}).listen(port, () => console.log('Server mit Range-Unterstützung: http://localhost:' + port));
