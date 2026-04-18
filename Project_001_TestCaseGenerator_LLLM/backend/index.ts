import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateTestCase } from './services/llmService';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const configPath = path.join(__dirname, 'config.json');

// Get saved config
app.get('/api/config', (req, res) => {
    try {
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf-8');
            res.json(JSON.parse(data));
        } else {
            res.json({
                ollamaUrl: 'http://127.0.0.1:11434',
                groqKey: '',
                openaiKey: '',
                geminiKey: '',
                claudeKey: '',
                provider: 'ollama'
            });
        }
    } catch (e) {
        res.status(500).json({ error: 'Failed to read config' });
    }
});

// Save config
app.post('/api/config', (req, res) => {
    try {
        fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to save config' });
    }
});

// Fetch available Ollama models
app.get('/api/ollama-models', async (req, res) => {
    try {
        let ollamaUrl = 'http://127.0.0.1:11434';
        if (fs.existsSync(configPath)) {
            const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            if (cfg.ollamaUrl) ollamaUrl = cfg.ollamaUrl;
        }
        const response = await fetch(`${ollamaUrl}/api/tags`);
        const data = await response.json();
        const models = (data.models || []).map((m: any) => m.name);
        res.json({ models });
    } catch (e) {
        res.json({ models: [] });
    }
});

app.post('/api/generate', async (req, res) => {
    try {
        const { requirement } = req.body;
        
        if (!requirement) {
            return res.status(400).json({ error: 'Requirement is required' });
        }

        let config: any = { provider: 'ollama', ollamaUrl: 'http://127.0.0.1:11434' };
        if (fs.existsSync(configPath)) {
            try {
                const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                if (parsed.provider) {
                    config = parsed;
                }
            } catch (e) {
                console.error("Failed to parse config.json, using defaults.");
            }
        }

        const testCases = await generateTestCase(requirement, config);
        res.json({ result: testCases });
    } catch (error: any) {
        console.error('Error generating test case:', error);
        res.status(500).json({ error: error.message || 'Failed to generate test case' });
    }
});

app.listen(Number(port), '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${port}`);
});

