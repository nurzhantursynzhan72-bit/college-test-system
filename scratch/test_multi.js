const http = require('http');

const test = (path) => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`PATH: ${path} | STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk.substring(0, 100)}${chunk.length > 100 ? '...' : ''}`);
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.end();
};

test('/api/invalid-route');
test('/login');
