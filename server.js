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
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const productsFile = path.join(__dirname, 'products.json');
const reviewsFile = path.join(__dirname, 'reviews.json');

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
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf8');
}

function loadReviews() {
  if (!fs.existsSync(reviewsFile)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(reviewsFile, 'utf8'));
  } catch {
    return [];
  }
}

function saveReviews(reviews) {
  fs.writeFileSync(reviewsFile, JSON.stringify(reviews, null, 2), 'utf8');
}

app.get('/api/products', (req, res) => {
  res.json(loadProducts());
});

app.post('/api/products', upload.single('media'), (req, res) => {
  const { name, price, emoji, category, description } = req.body;

  if (!name || price === undefined || !category) {
    return res.status(400).json({ success: false, message: 'Champs requis manquants' });
  }

  const products = loadProducts();

  const newProduct = {
    id: Date.now(),
    name,
    price: Number(price),
    emoji: emoji || '🛍️',
    category,
    description: description || '',
    media: req.file ? `/uploads/${req.file.filename}` : ''
  };

  products.push(newProduct);
  saveProducts(products);
  res.json({ success: true, product: newProduct });
});

app.get('/api/reviews', (req, res) => {
  res.json(loadReviews());
});

app.post('/api/reviews', (req, res) => {
  const { name, text } = req.body;

  if (!name || !text) {
    return res.status(400).json({ success: false, message: 'Champs requis manquants' });
  }

  const reviews = loadReviews();
  const newReview = {
    id: Date.now(),
    name,
    text,
    role: 'Client'
  };

  reviews.push(newReview);
  saveReviews(reviews);
  res.json({ success: true, review: newReview });
});

app.delete('/api/reviews/:id', (req, res) => {
  const reviewId = Number(req.params.id);
  const reviews = loadReviews();
  const filtered = reviews.filter((review) => review.id !== reviewId);

  if (filtered.length === reviews.length) {
    return res.status(404).json({ success: false, message: 'Avis introuvable' });
  }

  saveReviews(filtered);
  res.json({ success: true });
});

app.delete('/api/products/:id', (req, res) => {
  const productId = Number(req.params.id);
  const products = loadProducts();
  const filtered = products.filter((product) => product.id !== productId);

  if (filtered.length === products.length) {
    return res.status(404).json({ success: false, message: 'Produit introuvable' });
  }

  saveProducts(filtered);
  res.json({ success: true });
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
