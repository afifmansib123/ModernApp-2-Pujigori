const http = require('http');

const PORT = 5000;

const server = http.createServer((req: any, res: any) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: '🚀 PujiGori Backend is running!',
    port: PORT,
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, () => {
  console.log(`🚀 PujiGori Backend running on port ${PORT}`);
  console.log(`🌍 Visit: http://localhost:${PORT}`);
});

export {};