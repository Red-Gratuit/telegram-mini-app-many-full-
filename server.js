const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.static(__dirname));

const productsFile = path.join(__dirname, 'products.json');

function loadProducts() {
  if (!fs.existsSync(productsFile)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  } catch {
    return [];
  }
}

function saveProducts(products) {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

app.get('/api/products', (req, res) => {
  res.json(loadProducts());
});

app.post('/api/products', upload.single('media'), (req, res) => {
  const { name, price, emoji, category, description } = req.body;
  const products = loadProducts();

  const newProduct = {
    id: Date.now(),
    name,
    price: Number(price),
    emoji,
    category,
    description,
    media: req.file ? `/uploads/${req.file.filename}` : ''
  };

  products.push(newProduct);
  saveProducts(products);
  res.json({ success: true, product: newProduct });
});

app.get('/uploads/:file', (req, res) => {
  const filePath = path.join(uploadDir, req.params.file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Not found');
  }
  res.sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
