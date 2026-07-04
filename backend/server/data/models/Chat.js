import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Path is now ../chats.json because this file is in data/models/
const DATA_PATH = join(__dirname, '../chats.json');

// Ensure data directory exists
const ensureDataDir = async () => {
  const dataDir = join(__dirname, '..');
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, JSON.stringify([], null, 2));
  }
};

const readChats = async () => {
  await ensureDataDir();
  try {
    const data = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading chats.json:', error);
    return [];
  }
};

const writeChats = async (chats) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(chats, null, 2));
};

export class Chat {
  /**
   * Find all chats for a specific user
   */
  static async findByUser(userId) {
    const chats = await readChats();
    return chats.filter(c => c.userId === userId);
  }

  /**
   * Find a specific chat session for a user
   */
  static async findSession(userId, sessionId) {
    const chats = await readChats();
    return chats.find(c => c.userId === userId && c.id === sessionId);
  }

  /**
   * Create or update a chat session
   */
  static async save(userId, chatData) {
    const chats = await readChats();
    const index = chats.findIndex(c => c.userId === userId && c.id === chatData.id);
    
    if (index !== -1) {
      // Update existing
      chats[index] = { 
        ...chats[index], 
        ...chatData, 
        userId, 
        updatedAt: new Date().toISOString() 
      };
    } else {
      // Create new
      chats.push({
        ...chatData,
        userId,
        createdAt: chatData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    await writeChats(chats);
    return index !== -1 ? chats[index] : chats[chats.length - 1];
  }

  /**
   * Delete a specific chat session
   */
  static async delete(userId, sessionId) {
    let chats = await readChats();
    const initialLength = chats.length;
    chats = chats.filter(c => !(c.userId === userId && c.id === sessionId));
    
    if (chats.length !== initialLength) {
      await writeChats(chats);
      return true;
    }
    return false;
  }

  /**
   * Clear all chats for a user
   */
  static async clear(userId) {
    let chats = await readChats();
    const initialLength = chats.length;
    chats = chats.filter(c => c.userId !== userId);
    
    if (chats.length !== initialLength) {
      await writeChats(chats);
      return true;
    }
    return false;
  }
}
