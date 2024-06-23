const net = require('net');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Create HTTP server to serve the public folder
const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;

    if (filePath === './') {
        filePath = './src/index.html'; // Default file to serve
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        // Add more cases as needed for other file types
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    // Handle messages from clients if needed
    ws.on('message', (message) => {
        console.log(`Received message from client: ${message}`);
        // Handle messages from clients if needed
    });

    // Close WebSocket connection
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});


// TCP socket setup
const IPAddress = "192.168.0.85"; // Replace with your server's IP address
const TCPPort = 80;

let Temp1 = 0;
let Temp2 = 0;
const socket = new net.Socket();
socket.connect(TCPPort, IPAddress, () => {
    console.log('Connected to the TCP server');
});
socket.on("data", (data) => {
    console.log("Received TCP data:" + data[0] + " " + data[1] + 
                " Relays: " + data[2] + " " + data[3] + " " + data.byteLength);

    // Assuming data is in a format like "Temp1,Temp2"
    const temp1 = parseInt(data[0]);
    const temp2 = parseInt(data[1]);

    // Update values
    Temp1 = temp1;
    Temp2 = temp2;

    // Broadcast updated data to all connected WebSocket clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ Temp1, Temp2 }));
        }
    });
});
