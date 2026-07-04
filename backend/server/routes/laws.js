import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env is loaded
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const router = express.Router();

// Initialize Gemini with a function to ensure it always uses the latest key from process.env
const getApiKey = () => {
    dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
    return process.env.GEMINI_API_KEY?.trim();
};

const getGenAI = () => {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error('❌ Laws API: GEMINI_API_KEY is missing in .env!');
    } else {
        // console.log(`🔑 Laws API: Using key starting with: ${apiKey?.slice(0, 10)}... (Reloaded)`);
    }
    return new GoogleGenerativeAI(apiKey || 'missing-key');
};

/**
 * Path to the IPC dataset
 */
const ipcDataPath = path.join(__dirname, '..', 'data', 'ipc_dataset.json');

/**
 * Pre-load the dataset
 */
let ipcData = [];
try {
    if (fs.existsSync(ipcDataPath)) {
        const raw = fs.readFileSync(ipcDataPath, 'utf8');
        ipcData = JSON.parse(raw);
        console.log(`⚖️ Laws API: Loaded ${ipcData.length} sections.`);
    }
} catch (error) {
    console.error('❌ Laws API: Dataset load error:', error);
}

/**
 * Robust AI Translation with Timeout
 */
const translateLaw = async (law) => {
    const timeoutMsg = 'AI_TIMEOUT';
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(timeoutMsg), 10000));

    try {
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `
            Translate this Indian legal section to professional Tamil.
            Keep section ID (e.g. IPC 420) in English.
            Response ONLY in JSON format: {"title": "...", "content": "...", "punishment": "..."}

            TITLE: ${law.title}
            CONTENT: ${law.content}
            PUNISHMENT: ${law.punishment}
        `;

        const aiTask = model.generateContent(prompt).then(res => res.response.text());
        const resultText = await Promise.race([aiTask, timeoutPromise]);

        if (resultText === timeoutMsg) {
            console.warn(`⏳ Timeout for ${law.section}`);
            return law;
        }

        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            return {
                ...law,
                title: data.title || law.title,
                content: data.content || law.content,
                punishment: data.punishment || law.punishment,
                isTranslated: true
            };
        }
        return law;
    } catch (err) {
        console.error(`❌ Translation error for ${law.section}:`, err.message);
        return law;
    }
};

// GET /api/laws/search?q=...&lang=...
router.get('/search', async (req, res) => {
    const { q, lang } = req.query;
    if (q && q.toUpperCase() === 'TEST') {
        return res.json([{
            section: 'DIAGNOSTIC 101',
            title: 'API Connectivity Test',
            content: 'The Laws API is reachable and responding correctly. If statutory searches are failing, please verify the dataset path and AI key.',
            punishment: 'None'
        }]);
    }
    const isTamil = lang && lang.toLowerCase().startsWith('ta');
    
    console.log(`🔍 Laws Search: q="${q}", lang="${lang}" (isTamil: ${isTamil})`);

    if (!q) return res.json([]);

    const terms = q.split(',').map(t => t.trim().toLowerCase());
    let results = ipcData.filter(item => {
        const sec = (item.section || '').toLowerCase();
        return terms.some(t => sec.includes(t));
    });

    if (results.length === 0) {
        const nums = q.match(/\d+/g) || [];
        if (nums.length > 0) {
            results = ipcData.filter(item => {
                const numMatch = (item.section || '').match(/\d+/);
                return numMatch && nums.includes(numMatch[0]);
            });
        }
    }

    // Deduplicate and limit
    const unique = [];
    const seen = new Set();
    for (const item of results) {
        if (!seen.has(item.section)) {
            seen.add(item.section);
            unique.push(item);
        }
        if (unique.length >= 3) break;
    }

    // Perform translation if needed
    if (isTamil && unique.length > 0) {
        console.log(`🇮🇳 Translating ${unique.length} units to Tamil...`);
        try {
            const translated = await Promise.all(unique.map(law => translateLaw(law)));
            return res.json(translated);
        } catch (err) {
            console.error('Translation pipeline error:', err);
        }
    }

    res.json(unique);
});

export default router;
