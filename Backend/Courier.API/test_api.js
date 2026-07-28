const http = require('http');

const data = JSON.stringify({ email: "admin@gmail.com", password: "password123" });

const req = http.request({
  hostname: '127.0.0.1',
  port: 5144,
  path: '/api/Auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const token = JSON.parse(body).token;
    
    http.request({
      hostname: '127.0.0.1',
      port: 5144,
      path: '/api/Orders',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, res2 => {
      let body2 = '';
      res2.on('data', d => body2 += d);
      res2.on('end', () => {
        console.log("Status:", res2.statusCode);
        console.log("Body:", body2.substring(0, 1500));
      });
    }).end();
  });
});

req.write(data);
req.end();
