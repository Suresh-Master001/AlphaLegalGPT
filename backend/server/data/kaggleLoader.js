/**
 * Kaggle/HuggingFace Dataset Loader for Indian Penal Code
 * Loads the complete IPC dataset from HuggingFace
 * Falls back to local JSON if HuggingFace fails
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Store the hfHub reference
let hfHub = null;

/**
 * Initialize HuggingFace hub - must be called before loading
 */
async function initHuggingFace() {
  if (hfHub) return hfHub;
  
  try {
    const hub = await import('@huggingface/hub');
    hfHub = hub;
    console.log('Loaded @huggingface/hub for dataset loading');
    return hfHub;
  } catch (e) {
    console.log('@huggingface/hub not available, will use fallback');
    return null;
  }
}

/**
 * Load dataset from HuggingFace
 * Attempts to load from multiple possible dataset names
 */
async function loadFromHuggingFace() {
  const hub = await initHuggingFace();
  if (!hub) {
    throw new Error('HuggingFace hub not available');
  }

  // Try different dataset names that might contain Indian Penal Code
  const datasetNames = [
    'omdabral/indian-penal-code-complete-dataset',
    'MahirPadanon/indian-penal-code',
    'lavanyas/indian-penal-code-ipc',
    'nisarg/indian-legal-code'
  ];

  for (const datasetName of datasetNames) {
    try {
      console.log(`Attempting to load dataset: ${datasetName}`);
      
      const hubClient = new hub.HfApi({ token: process.env.HF_TOKEN });
      
      // List dataset files
      const files = await hubClient.listRepoFiles({ repoType: 'dataset', repoId: datasetName });
      console.log(`Dataset ${datasetName} files:`, files);
      
      // Try to download the JSON file
      const jsonFile = files.find(f => f.endsWith('.json'));
      if (jsonFile) {
        const fileUrl = `https://huggingface.co/datasets/${datasetName}/resolve/main/${jsonFile}`;
        const response = await fetch(fileUrl);
        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully loaded dataset: ${datasetName}`);
          return transformDataset(data);
        }
      }
    } catch (error) {
      console.log(`Failed to load ${datasetName}: ${error.message}`);
    }
  }

  throw new Error('Could not load from any HuggingFace dataset');
}

/**
 * Transform dataset to standard format
 * Handles various input formats
 */
function transformDataset(data) {
  if (!Array.isArray(data)) {
    // Try to extract array from object
    const possibleKeys = ['data', 'sections', 'ipc', 'laws', 'results'];
    for (const key of possibleKeys) {
      if (Array.isArray(data[key])) {
        data = data[key];
        break;
      }
    }
  }

  if (!Array.isArray(data)) {
    throw new Error('Dataset is not an array');
  }

  // Transform to standard format
  return data.map(item => ({
    section: item.section || item.Section || item.section_number || item.number || '',
    title: item.title || item.Title || item.name || item.description || '',
    content: item.content || item.Content || item.text || item.description || item.detail || ''
  })).filter(item => item.section && item.content);
}

/**
 * Load data from local JSON file
 */
function loadLocalData() {
  try {
    const localPath = join(__dirname, 'ipc_dataset.json');
    const rawData = readFileSync(localPath, 'utf-8');
    const data = JSON.parse(rawData);
    console.log('Loaded local IPC data successfully');
    return data;
  } catch (error) {
    console.error('Error loading local data:', error.message);
    return [];
  }
}

/**
 * Main function to load IPC data
 * Tries HuggingFace first, falls back to local
 */
export async function loadIPCDataset() {
  // Try HuggingFace first
  try {
    console.log('Attempting to load IPC dataset from HuggingFace...');
    const hfData = await loadFromHuggingFace();
    if (hfData && hfData.length > 0) {
      console.log(`Loaded ${hfData.length} IPC sections from HuggingFace`);
      return hfData;
    }
  } catch (error) {
    console.log('HuggingFace loading failed:', error.message);
  }

  // Fallback to local data
  console.log('Falling back to local IPC dataset...');
  const localData = loadLocalData();
  
  if (localData.length > 0) {
    console.log(`Loaded ${localData.length} IPC sections from local file`);
    return localData;
  }

  // Last resort: return sample data
  console.warn('Using embedded sample IPC data');
  return getSampleIPCData();
}

/**
 * Sample IPC data as last resort
 */
function getSampleIPCData() {
  return [
    { section: "Section 1", title: "Punishment for murder", content: "Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine." },
    { section: "Section 302", title: "Punishment for murder", content: "Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine." },
    { section: "Section 304", title: "Punishment for culpable homicide not amounting to murder", content: "Whoever commits culpable homicide not amounting to murder shall be punished with imprisonment for life, or imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine." },
    { section: "Section 306", title: "Abetment of suicide", content: "If any person commits suicide, whoever abets the commission of such suicide, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine." },
    { section: "Section 375", title: "Rape", content: "A man is said to commit 'rape' who has sexual intercourse with a woman under circumstances falling under any of the six descriptions: against her will, without her consent, with her consent obtained by putting her in fear of death or hurt, or false representation, or with her consent when she is in a state of unsoundness of mind." },
    { section: "Section 376", title: "Punishment for rape", content: "Whoever commits rape shall be punished with rigorous imprisonment for a term which shall not be less than ten years, but which may extend to imprisonment for life, and shall also be liable to fine." },
    { section: "Section 379", title: "Theft", content: "Whoever, intending to take dishonestly any movable property out of the possession of any person without that person's consent, moves that property in order to such taking, is said to commit theft." },
    { section: "Section 405", title: "Criminal breach of trust", content: "Whoever, being in any manner entrusted with property, or with any dominion over property either solely or jointly with any other person, dishonestly misappropriates or converts to his own use that property, commits criminal breach of trust." },
    { section: "Section 420", title: "Cheating and dishonestly inducing delivery of property", content: "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, commits cheating." },
    { section: "Section 498A", title: "Husband or relative of husband of a woman subjecting her to cruelty", content: "Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment for a term which may extend to three years and shall also be liable to fine." }
  ];
}

export default { loadIPCDataset };

