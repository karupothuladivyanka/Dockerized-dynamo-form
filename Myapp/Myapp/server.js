const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');

const app = express();
const PORT = 3000;

// AWS SDK will automatically use IAM role credentials from EC2
AWS.config.update({
  region: 'eu-north-1' // e.g., "us-east-1"
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Users'; // DynamoDB table name

// --- File Upload Setup ---
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public')); // serve frontend

// --- Handle Form Submission ---
app.post('/submit', upload.single('file'), (req, res) => {
  const { name, email, phone } = req.body;
  const filePath = req.file ? req.file.path : null;

  const params = {
    TableName: TABLE_NAME,
    Item: {
      id: Date.now().toString(), // unique identifier
      name: name,
      email: email,
      phone: phone,
      file_path: filePath
    }
  };

  dynamodb.put(params, (err, data) => {
    if (err) {
      console.error('DynamoDB Error:', err);
      return res.status(500).send('Error saving to DynamoDB');
    }
    res.send('Data saved to DynamoDB successfully!');
  });
});

// --- Fetch all contacts ---
app.get('/contacts', (req, res) => {
  const params = {
    TableName: TABLE_NAME
  };

  dynamodb.scan(params, (err, data) => {
    if (err) {
      console.error('DynamoDB Error:', err);
      return res.status(500).json({ error: 'Error fetching contacts' });
    }
    res.json(data.Items || []);
  });
});

// --- Delete a contact ---
app.delete('/contacts/:id', (req, res) => {
  const { id } = req.params;

  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };

  dynamodb.delete(params, (err) => {
    if (err) {
      console.error('DynamoDB Error:', err);
      return res.status(500).json({ error: 'Error deleting contact' });
    }
    res.json({ message: 'Contact deleted' });
  });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
