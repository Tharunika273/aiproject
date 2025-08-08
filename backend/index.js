const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock product data
const products = [
  { id: 1, name: 'Smartphone', price: 699, description: 'Latest model smartphone.' },
  { id: 2, name: 'Laptop', price: 1299, description: 'High performance laptop.' },
  { id: 3, name: 'Headphones', price: 199, description: 'Noise-cancelling headphones.' },
];

// Product list endpoint
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});