"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ExecutionService_1 = require("../services/ExecutionService");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const router = (0, express_1.Router)();
const SAMPLES_DIR = path.resolve(__dirname, '../../../../samples');
router.post('/run', async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: "No code provided" });
    }
    try {
        const result = await ExecutionService_1.ExecutionService.executeCode(code);
        res.json(result);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
router.get('/samples', (req, res) => {
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
router.get('/samples/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(SAMPLES_DIR, filename);
    // Path traversal protection
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
exports.default = router;
