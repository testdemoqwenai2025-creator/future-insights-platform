const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    let filePath = path.join(__dirname, req.url === '/' ? 'AETH-1-FULL-APPLICATION.html' : req.url);
    
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'text/html';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }
        
        res.writeHead(200, { 
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
        });
        res.end(data);
    });
});

server.listen(PORT, HOST, () => {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║     ⚡ AETH-1 APPLICATION SERVER - ACTIVE      ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  Local:   http://localhost:${PORT}                  ║`);
    console.log(`║  Network: http://${require('os').networkInterfaces().eth0?.[0]?.address || '0.0.0.0'}:${PORT}  ║`);
    console.log(`║  File:    AETH-1-FULL-APPLICATION.html          ║`);
    console.log('╚══════════════════════════════════════════════════╝');
});

// Prevent process from dying
setInterval(() => {
    // Keep alive heartbeat
}, 5000);

// Handle shutdown gracefully
process.on('SIGTERM', () => {
    console.log('\n⚠️ Server shutting down...');
    server.close(() => console.log('✅ Server stopped'));
});
