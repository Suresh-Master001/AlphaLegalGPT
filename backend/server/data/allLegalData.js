import bnsData from './data.js';
import ipcDataRaw from './ipc_dataset.json';

export const allLegalData = [
  ...ipcDataRaw.map(item => ({
    section: item.section,
    title: item.title,
    content: item.content || item.description,
    source: 'IPC'
  })),
  ...bnsData.map(item => ({
    section: item.section,
    title: item.title,
    content: item.content,
    source: 'BNS'
  }))
];

