const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = 'data.json';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Initialize data.json if it doesn't exist
async function initializeDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // File doesn't exist, create it with empty array
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
    console.log('Created data.json file');
  }
}

// Helper function to read data from JSON file
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return [];
  }
}

// Helper function to write data to JSON file
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

// Routes

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes for JSON database

// GET all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// POST new data (append to array)
app.post('/api/data', async (req, res) => {
  try {
    const currentData = await readData();
    const newItem = {
      id: Date.now(),
      ...req.body,
      timestamp: new Date().toISOString()
    };
    currentData.push(newItem);
    
    const success = await writeData(currentData);
    if (success) {
      res.status(201).json(newItem);
    } else {
      res.status(500).json({ error: 'Failed to save data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// PUT update data by ID
app.put('/api/data/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const currentData = await readData();
    const index = currentData.findIndex(item => item.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    currentData[index] = {
      ...currentData[index],
      ...req.body,
      id: id, // Preserve the original ID
      updatedAt: new Date().toISOString()
    };
    
    const success = await writeData(currentData);
    if (success) {
      res.json(currentData[index]);
    } else {
      res.status(500).json({ error: 'Failed to update data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// DELETE data by ID
app.delete('/api/data/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const currentData = await readData();
    const index = currentData.findIndex(item => item.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const deletedItem = currentData.splice(index, 1)[0];
    const success = await writeData(currentData);
    
    if (success) {
      res.json(deletedItem);
    } else {
      res.status(500).json({ error: 'Failed to delete data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// GET data by ID
app.get('/api/data/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const currentData = await readData();
    const item = currentData.find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Start server
async function startServer() {
  await initializeDataFile();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/data`);
  });
}

startServer(); 