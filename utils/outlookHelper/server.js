/**
 * Outlook Helper Server
 * 
 * Kleine lokale server die tussen Outlook en de browser communiceert.
 * Maakt direct drag-and-drop vanuit Outlook mogelijk.
 * 
 * Start: npm start
 * Draait op: http://localhost:8765
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8765;

// Enable CORS for localhost
app.use(cors());
app.use(express.json());

// Store last dragged email data
let lastEmailData = null;

// Status endpoint - Check if helper is running
app.get('/status', (req, res) => {
  res.json({ 
    status: 'active', 
    version: '1.0.0',
    message: 'Outlook Helper is actief en klaar voor gebruik'
  });
});

// Get last dragged email from Outlook
app.get('/outlook-email', (req, res) => {
  if (lastEmailData) {
    res.json(lastEmailData);
    // Clear after reading (optional)
    // lastEmailData = null;
  } else {
    res.status(404).json({ 
      error: 'Geen email data beschikbaar',
      message: 'Sleep eerst een email uit Outlook'
    });
  }
});

// Set email data (called by COM interface or drag handler)
app.post('/set-email', (req, res) => {
  const { from, to, subject, body, date, attachments } = req.body;
  
  lastEmailData = {
    from: from || '',
    to: Array.isArray(to) ? to : [to || ''],
    subject: subject || 'Geen onderwerp',
    body: body || '',
    date: date || new Date().toISOString(),
    attachments: attachments || [],
    receivedAt: new Date().toISOString(),
  };
  
  console.log('📧 Email ontvangen:', lastEmailData.subject);
  
  res.json({ 
    success: true, 
    message: 'Email data opgeslagen',
    email: lastEmailData 
  });
});

// Clear email data
app.post('/clear', (req, res) => {
  lastEmailData = null;
  res.json({ success: true, message: 'Email data gewist' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Outlook Helper Server gestart op http://localhost:${PORT}`);
  console.log(`📧 Wachtend op email data van Outlook...`);
  console.log(`\n💡 Voor gebruik:`);
  console.log(`   1. Zorg dat deze server draait`);
  console.log(`   2. Sleep email uit Outlook naar de browser`);
  console.log(`   3. Email wordt automatisch geïmporteerd\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Outlook Helper Server wordt afgesloten...');
  process.exit(0);
});






