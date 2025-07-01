# Simple HTML Server with JSON Database

A Node.js/Express server that serves your HTML files and provides a REST API for managing data in a JSON flat file database.

## 🚀 Getting Started

### Method 1: Docker (Recommended)

**Prerequisites:**
- Docker and Docker Compose installed

**Startup Commands:**
```bash
# Navigate to your project directory
cd /opt/stacks/q3tmt

# Build and start the server
docker compose up --build -d

# Check if container is running
docker compose ps

# View server logs
docker compose logs

# Your server is now running at: http://localhost:3000
```

**Management Commands:**
```bash
# Stop the server
docker compose down

# Restart the server
docker compose restart

# Rebuild and restart
docker compose up --build -d

# View real-time logs
docker compose logs -f
```

### Method 2: Node.js Direct Installation

**Prerequisites:**
- Node.js 16+ and npm installed

**Installation & Startup:**
```bash
# Navigate to your project directory
cd /opt/stacks/q3tmt

# Install dependencies
npm install

# Start the server
npm start

# For development with auto-restart
npm run dev

# Your server is now running at: http://localhost:3000
```

## 🧪 Testing Your Server

**Test if server is running:**
```bash
# Check if port 3000 is accessible
curl http://localhost:3000

# Test the API
curl http://localhost:3000/api/data

# Add test data
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "message": "Hello from API!"}'
```

## 📝 Complete API Reference

**Base URL:** `http://localhost:3000/api/data`

### GET `/api/data` - Get All Data
```bash
curl http://localhost:3000/api/data
```

### POST `/api/data` - Add New Data
```bash
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "message": "Hello World"}'
```

### GET `/api/data/:id` - Get Specific Item
```bash
curl http://localhost:3000/api/data/1
```

### PUT `/api/data/:id` - Update Item
```bash
curl -X PUT http://localhost:3000/api/data/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com", "message": "Updated message"}'
```

### DELETE `/api/data/:id` - Delete Item
```bash
curl -X DELETE http://localhost:3000/api/data/1
```

## 🎯 Frontend Integration

Use these JavaScript examples in your `script.js`:

```javascript
// Get all data
async function getAllData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  console.log(data);
  return data;
}

// Add new data
async function addData(newItem) {
  const response = await fetch('/api/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newItem)
  });
  const data = await response.json();
  console.log('Added:', data);
  return data;
}

// Update existing data
async function updateData(id, updatedItem) {
  const response = await fetch(`/api/data/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedItem)
  });
  const data = await response.json();
  console.log('Updated:', data);
  return data;
}

// Delete data
async function deleteData(id) {
  const response = await fetch(`/api/data/${id}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  console.log('Deleted:', data);
  return data;
}
```

## 🔧 Troubleshooting

**If Docker isn't working:**
```bash
# Check Docker status
sudo systemctl status docker

# Start Docker if needed
sudo systemctl start docker

# Check if port 3000 is in use
sudo lsof -i :3000
```

**If Node.js direct install fails:**
```bash
# Install Node.js on Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

## 📁 Project Structure

```
/opt/stacks/q3tmt/
├── index.html          # Your main HTML file
├── styles.css          # Your CSS styles  
├── script.js           # Your JavaScript code
├── data.json           # JSON database file
├── server.js           # Express server
├── package.json        # Node.js dependencies
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose setup
└── README.md           # This file
```

## 🎉 Quick Start Summary

**For immediate startup:**
```bash
cd /opt/stacks/q3tmt
docker compose up --build -d
```

Then open: **http://localhost:3000**

Your server is now serving your `index.html` and providing a full REST API for your JSON database! 🚀
