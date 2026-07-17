const express = require('express');
const cors = require('cors');
const { execFile, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const formatOutput = (str) => {
    let clean = str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    clean = clean.replace(/Input \[\d+\]:\s*/g, '');
    clean = clean.replace(/\s*(Output\[\d+\]:)\s*/g, '\n$1 ');
    return clean.trim();
};

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const MPL_BIN = path.resolve(__dirname, '../../build/mpl');
const SAMPLES_DIR = path.resolve(__dirname, '../../samples');

app.post('/api/run', (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: "No code provided" });
    }

    const tempFile = path.join(__dirname, 'temp.mpl');
    fs.writeFileSync(tempFile, code);

    execFile(MPL_BIN, [tempFile], (error, stdout, stderr) => {
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
        res.json({
            stdout: stdout || "",
            stderr: stderr || "",
            error: error ? error.message : null
        });
    });
});

app.get('/api/samples', (req, res) => {
    fs.readdir(SAMPLES_DIR, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read samples directory" });
        }
        const mplFiles = files
            .filter(f => f.endsWith('.mpl'))
            .sort((a, b) => {
                const numA = parseInt(a.split('-')[0]) || 0;
                const numB = parseInt(b.split('-')[0]) || 0;
                return numA - numB;
            });
        res.json({ samples: mplFiles });
    });
});

app.get('/api/samples/:filename', (req, res) => {
    const filePath = path.join(SAMPLES_DIR, req.params.filename);
    if (!filePath.startsWith(SAMPLES_DIR)) {
        return res.status(403).json({ error: "Forbidden" });
    }
    
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(404).json({ error: "File not found" });
        }
        res.json({ content: data });
    });
});

// WebSockets for Live REPL
io.on('connection', (socket) => {
    let mplProcess = spawn(MPL_BIN);

    mplProcess.stdout.on('data', (data) => {
        socket.emit('output', formatOutput(data.toString()));
    });

    mplProcess.stderr.on('data', (data) => {
        socket.emit('error_output', formatOutput(data.toString()));
    });

    mplProcess.on('close', (code) => {
        socket.emit('closed', `Process exited with code ${code}`);
    });

    socket.on('input', (data) => {
        if (mplProcess && !mplProcess.killed) {
            mplProcess.stdin.write(data + '\n');
        }
    });

    socket.on('disconnect', () => {
        if (mplProcess && !mplProcess.killed) {
            mplProcess.kill();
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`MPL Backend API running on port ${PORT}`);
});
