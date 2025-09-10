const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const OPPORTUNITIES_FILE = path.join(DATA_DIR, 'opportunities.json');

// Initialize data directory and files
const initializeDataFiles = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize users with default admin and demo users
    const defaultUsers = [
      {
        id: 'u1',
        name: 'Admin User',
        email: 'admin@crm.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      },
      {
        id: 'u2',
        name: 'John Manager',
        email: 'manager@crm.com',
        password: await bcrypt.hash('manager123', 10),
        role: 'manager'
      },
      {
        id: 'u3',
        name: 'Alice Rep',
        email: 'rep@crm.com',
        password: await bcrypt.hash('rep123', 10),
        role: 'rep'
      }
    ];

    // Check if files exist, if not create them
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
    }

    try {
      await fs.access(LEADS_FILE);
    } catch {
      await fs.writeFile(LEADS_FILE, JSON.stringify([], null, 2));
    }

    try {
      await fs.access(OPPORTUNITIES_FILE);
    } catch {
      await fs.writeFile(OPPORTUNITIES_FILE, JSON.stringify([], null, 2));
    }

  } catch (error) {
    console.error('Error initializing data files:', error);
  }
};

// Helper functions to read/write JSON files
const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

const writeJsonFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const users = await readJsonFile(USERS_FILE);
    const user = users.find(u => u.email === email);
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'rep' } = req.body;
  
  try {
    const users = await readJsonFile(USERS_FILE);
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `u${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      role
    };

    users.push(newUser);
    await writeJsonFile(USERS_FILE, users);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User routes
app.get('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await readJsonFile(USERS_FILE);
    const safeUsers = users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  
  try {
    const users = await readJsonFile(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex] = { ...users[userIndex], name, email, role };
    await writeJsonFile(USERS_FILE, users);
    
    const safeUser = { id: users[userIndex].id, name, email, role };
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  
  try {
    const users = await readJsonFile(USERS_FILE);
    const filteredUsers = users.filter(u => u.id !== id);
    
    if (filteredUsers.length === users.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    await writeJsonFile(USERS_FILE, filteredUsers);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Lead routes
app.get('/api/leads', authenticateToken, async (req, res) => {
  try {
    const leads = await readJsonFile(LEADS_FILE);
    
    if (req.user.role === 'rep') {
      const userLeads = leads.filter(lead => lead.ownerId === req.user.id);
      return res.json(userLeads);
    }
    
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/leads', authenticateToken, async (req, res) => {
  const { name, email, phone, status = 'New' } = req.body;
  
  // Validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  if (!['New', 'Contacted', 'Qualified'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  try {
    const leads = await readJsonFile(LEADS_FILE);
    
    // Check for duplicate email
    if (leads.find(lead => lead.email === email && lead.ownerId === req.user.id)) {
      return res.status(400).json({ error: 'Lead with this email already exists' });
    }
    
    const newLead = {
      id: `l${Date.now()}`,
      name,
      email,
      phone,
      status,
      ownerId: req.user.id,
      createdAt: new Date().toISOString()
    };

    leads.push(newLead);
    await writeJsonFile(LEADS_FILE, leads);
    res.status(201).json(newLead);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/leads/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, status } = req.body;
  
  try {
    const leads = await readJsonFile(LEADS_FILE);
    const leadIndex = leads.findIndex(l => l.id === id);
    
    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leads[leadIndex];
    
    if (req.user.role === 'rep' && lead.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    leads[leadIndex] = { ...lead, name, email, phone, status };
    await writeJsonFile(LEADS_FILE, leads);
    res.json(leads[leadIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/leads/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const leads = await readJsonFile(LEADS_FILE);
    const leadIndex = leads.findIndex(l => l.id === id);
    
    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leads[leadIndex];
    
    if (req.user.role === 'rep' && lead.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filteredLeads = leads.filter(l => l.id !== id);
    await writeJsonFile(LEADS_FILE, filteredLeads);
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Convert lead to opportunity
app.post('/api/leads/:id/convert', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, value } = req.body;
  
  // Validation
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  if (typeof value !== 'number' || value < 0) {
    return res.status(400).json({ error: 'Value must be a positive number' });
  }
  
  try {
    const leads = await readJsonFile(LEADS_FILE);
    const opportunities = await readJsonFile(OPPORTUNITIES_FILE);
    
    const leadIndex = leads.findIndex(l => l.id === id);
    
    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leads[leadIndex];
    
    if (req.user.role === 'rep' && lead.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update lead status to Qualified
    leads[leadIndex].status = 'Qualified';
    
    // Create opportunity
    const newOpportunity = {
      id: `o${Date.now()}`,
      title,
      value,
      stage: 'Discovery',
      ownerId: lead.ownerId,
      leadId: lead.id,
      createdAt: new Date().toISOString()
    };

    opportunities.push(newOpportunity);
    
    await writeJsonFile(LEADS_FILE, leads);
    await writeJsonFile(OPPORTUNITIES_FILE, opportunities);
    
    res.status(201).json(newOpportunity);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Opportunity routes
app.get('/api/opportunities', authenticateToken, async (req, res) => {
  try {
    const opportunities = await readJsonFile(OPPORTUNITIES_FILE);
    
    if (req.user.role === 'rep') {
      const userOpportunities = opportunities.filter(opp => opp.ownerId === req.user.id);
      return res.json(userOpportunities);
    }
    
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/opportunities', authenticateToken, async (req, res) => {
  const { title, value, stage = 'Discovery' } = req.body;
  
  // Validation
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  if (typeof value !== 'number' || value < 0) {
    return res.status(400).json({ error: 'Value must be a positive number' });
  }
  
  if (!['Discovery', 'Proposal', 'Won', 'Lost'].includes(stage)) {
    return res.status(400).json({ error: 'Invalid stage' });
  }
  
  try {
    const opportunities = await readJsonFile(OPPORTUNITIES_FILE);
    const newOpportunity = {
      id: `o${Date.now()}`,
      title,
      value,
      stage,
      ownerId: req.user.id,
      createdAt: new Date().toISOString()
    };

    opportunities.push(newOpportunity);
    await writeJsonFile(OPPORTUNITIES_FILE, opportunities);
    res.status(201).json(newOpportunity);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/opportunities/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, value, stage } = req.body;
  
  try {
    const opportunities = await readJsonFile(OPPORTUNITIES_FILE);
    const oppIndex = opportunities.findIndex(o => o.id === id);
    
    if (oppIndex === -1) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const opportunity = opportunities[oppIndex];
    
    if (req.user.role === 'rep' && opportunity.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    opportunities[oppIndex] = { ...opportunity, title, value, stage };
    await writeJsonFile(OPPORTUNITIES_FILE, opportunities);
    res.json(opportunities[oppIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/opportunities/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const opportunities = await readJsonFile(OPPORTUNITIES_FILE);
    const oppIndex = opportunities.findIndex(o => o.id === id);
    
    if (oppIndex === -1) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const opportunity = opportunities[oppIndex];
    
    if (req.user.role === 'rep' && opportunity.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filteredOpportunities = opportunities.filter(o => o.id !== id);
    await writeJsonFile(OPPORTUNITIES_FILE, filteredOpportunities);
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const leads = await readJsonFile(LEADS_FILE);
    const opportunities = await readJsonFile(OPPORTUNITIES_FILE);
    
    let userLeads = leads;
    let userOpportunities = opportunities;
    
    if (req.user.role === 'rep') {
      userLeads = leads.filter(l => l.ownerId === req.user.id);
      userOpportunities = opportunities.filter(o => o.ownerId === req.user.id);
    }

    const leadsByStatus = userLeads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    const opportunitiesByStage = userOpportunities.reduce((acc, opp) => {
      acc[opp.stage] = (acc[opp.stage] || 0) + 1;
      return acc;
    }, {});

    const totalValue = userOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);

    res.json({
      totalLeads: userLeads.length,
      totalOpportunities: userOpportunities.length,
      totalValue,
      leadsByStatus,
      opportunitiesByStage
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Initialize data files on startup
initializeDataFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});