const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(express.json());
// Serve static frontend files directly from project root
app.use(express.static(path.join(__dirname, 'public')));

// Read database helper
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const defaultData = {
        maggotStock: 12.0,
        biocngStock: 8,
        carbonSaved: 58.5,
        revenue: 450000,
        organicWasteOlah: 125.5
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file:', err);
    return {};
  }
}

// Write database helper
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// API Routes
app.get('/api/stats', (req, res) => {
  const db = readDB();
  res.json(db);
});

app.post('/api/stats', (req, res) => {
  const db = readDB();
  const { maggotStock, biocngStock, carbonSaved, revenue, organicWasteOlah } = req.body;
  
  if (maggotStock !== undefined) db.maggotStock = parseFloat(maggotStock);
  if (biocngStock !== undefined) db.biocngStock = parseInt(biocngStock);
  if (carbonSaved !== undefined) db.carbonSaved = parseFloat(carbonSaved);
  if (revenue !== undefined) db.revenue = parseFloat(revenue);
  if (organicWasteOlah !== undefined) db.organicWasteOlah = parseFloat(organicWasteOlah);
  
  writeDB(db);
  res.json(db);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
