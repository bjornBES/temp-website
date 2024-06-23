const net = require('net');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Create HTTP server to serve the public folder
const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(PUBLIC_DIR, filePath);

    // Check if the requested file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        // Read and serve the file
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
                return;
            }

            // Determine content type based on file extension
            let contentType = 'text/html';
            if (filePath.endsWith('.css')) {
                contentType = 'text/css';
            } else if (filePath.endsWith('.js')) {
                contentType = 'text/javascript';
            }

            // Serve the file with appropriate content type
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
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
