const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');


const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Connect to SQLite database
const db = new sqlite3.Database('./aviation_terms.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Preprocessing function
async function preprocessSentence(sentence) {
  return new Promise((resolve, reject) => {
    // Convert to lowercase and split into words
    let words = sentence.toLowerCase().split(/\s+/);
    
    // Get all terms from database
    db.all('SELECT oov_term, replacement FROM term_mappings', (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      // Create mapping object
      const termMap = new Map(rows.map(row => [row.oov_term, row.replacement]));
      
      // Replace OOV terms
      words = words.map(word => {
        // Remove punctuation for lookup, but keep original for non-mapped words
        const cleanWord = word.replace(/[.,!?]/g, '');
        return termMap.has(cleanWord) ? termMap.get(cleanWord) : word;
      });

      // Join words back and resolve
      resolve(words.join(' '));
    });
  });
}

// POST endpoint for sentence processing
app.post('/preprocess', async (req, res) => {
  try {
    const { sentence } = req.body;
    
    if (!sentence || typeof sentence !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid sentence' });
    }

    const processedSentence = await preprocessSentence(sentence);
    res.json({ 
      original: sentence,
      processed: processedSentence 
    });
  } catch (error) {
    console.error('Error processing sentence:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new term mapping endpoint
app.post('/add-term', (req, res) => {
  const { oov_term, replacement } = req.body;
  
  // Validate input
  if (!oov_term || !replacement || typeof oov_term !== 'string' || typeof replacement !== 'string') {
    return res.status(400).json({ error: 'Please provide valid oov_term and replacement as strings' });
  }

  // Convert to lowercase for consistency
  const cleanOovTerm = oov_term.toLowerCase().trim();
  const cleanReplacement = replacement.toLowerCase().trim();

  if (!cleanOovTerm || !cleanReplacement) {
    return res.status(400).json({ error: 'Terms cannot be empty after trimming' });
  }

  db.run(
    'INSERT OR REPLACE INTO term_mappings (oov_term, replacement) VALUES (?, ?)',
    [cleanOovTerm, cleanReplacement],
    function(err) {
      if (err) {
        console.error('Database error:', err.message);
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(409).json({ error: 'Term already exists with a different mapping' });
        }
        return res.status(500).json({ error: 'Failed to add term: ' + err.message });
      }
      res.json({ 
        message: 'Term added successfully',
        term: cleanOovTerm,
        replacement: cleanReplacement
      });
    }
  );
});

// Start server
app.listen(port, () => {
  console.log(`Preprocessing service running at http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});