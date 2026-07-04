import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Path is now ../global_history.json because this file is in data/models/
const GLOBAL_HISTORY_PATH = join(__dirname, '../global_history.json');

// Normalize a question to prevent duplicates (e.g., lowercase, trim, remove punctuation)
const normalizeQuestion = (q) => {
  return q.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
};

const ensureGlobalHistoryFile = async () => {
    try {
        await fs.access(GLOBAL_HISTORY_PATH);
    } catch {
        // Create the file with an empty array if it doesn't exist
        await fs.writeFile(GLOBAL_HISTORY_PATH, JSON.stringify([], null, 2));
    }
};

const readGlobalHistory = async () => {
    await ensureGlobalHistoryFile();
    try {
        const data = await fs.readFile(GLOBAL_HISTORY_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading global_history.json:', error);
        return [];
    }
};

const writeGlobalHistory = async (history) => {
    await fs.writeFile(GLOBAL_HISTORY_PATH, JSON.stringify(history, null, 2));
};

export class GlobalHistory {
    /**
     * Save a unique Question-Answer pair to global history
     */
    static async save(question, answer) {
        const history = await readGlobalHistory();
        const normalizedQ = normalizeQuestion(question);

        // Check if a similar question already exists
        const exists = history.some(item => normalizeQuestion(item.question) === normalizedQ);
        
        if (!exists) {
            history.push({
                question,
                answer,
                timestamp: new Date().toISOString()
            });
            await writeGlobalHistory(history);
            return true;
        }
        return false;
    }

    /**
     * Return all global history items
     */
    static async getAll() {
        return await readGlobalHistory();
    }
}
