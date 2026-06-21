const counters = document.querySelectorAll('[data-count]');
const year = document.getElementById('year');
const categoryButtons = document.querySelectorAll('[data-category]');
const featureCards = document.querySelectorAll('.feature-card');

const openAdmin = document.getElementById('openAdmin');
const closeAdmin = document.getElementById('closeAdmin');
const adminModal = document.getElementById('adminModal');
const adminCodeForm = document.getElementById('adminCodeForm');
const adminProductForm = document.getElementById('adminProductForm');
const adminCodeInput = document.getElementById('adminCode');
const adminError = document.getElementById('adminError');
const productMediaInput = document.getElementById('productMedia');
const mediaPreview = document.getElementById('mediaPreview');
const productsGrid = document.getElementById('productsGrid');

if (year) {
  year.textContent = new Date().getFullYear();
}

async function loadProducts() {
  if (!productsGrid) return;

  try {
    const response = await fetch('/api/products');
    const products = await response.json();

    if (!products.length) {
      productsGrid.innerHTML = `
        <div class="empty-shop-state large">
          <div class="empty-shop-icon">🛍️</div>
          <p>Aucun produit pour le moment</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = '';
    products.forEach((product) => {
      const card = document.createElement('article');
      card.className = 'shop-card';
      const isVideo = product.media && /\.(mp4|webm|ogg)$/i.test(product.media);
      card.innerHTML = `
        <div class="shop-badge">${product.category === 'dur' ? 'Dur' : 'Doux'}</div>
        ${isVideo
          ? `<video class="product-media" src="${product.media}" controls playsinline></video>`
          : product.media
            ? `<img class="product-media" src="${product.media}" alt="${product.name}" />`
            : `<div class="product-media placeholder">${product.emoji || '🛍️'}</div>`}
        <h4>${product.name}</h4>
        <p>${product.description || ''}</p>
        <div class="shop-footer">
          <strong>${Number(product.price).toFixed(2)}€</strong>
          <button>Ajouter</button>
        </div>
      `;
      productsGrid.appendChild(card);
    });
  } catch (error) {
    if (productsGrid) {
      productsGrid.innerHTML = '<p>Impossible de charger les produits.</p>';
    }
  }
}

loadProducts();

counters.forEach((counter) => {
  const target = Number(counter.getAttribute('data-count'));
  const duration = 1500;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(target * eased);
    counter.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counter.textContent = target;
    }
  };

  requestAnimationFrame(tick);
});

categoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selected = button.getAttribute('data-category');

    categoryButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    featureCards.forEach((card) => {
      const cardCategory = card.getAttribute('data-category');
      card.classList.toggle('is-hidden', cardCategory !== selected);
    });
  });
});

if (openAdmin && adminModal && closeAdmin && adminCodeForm && adminProductForm) {
  openAdmin.addEventListener('click', () => {
    adminModal.classList.add('open');
  });

  closeAdmin.addEventListener('click', () => {
    adminModal.classList.remove('open');
  });

  adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) {
      adminModal.classList.remove('open');
    }
  });

  adminCodeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = adminCodeInput.value.trim();

    if (code === '2026') {
      adminError.textContent = '';
      adminCodeForm.classList.add('hidden');
      adminProductForm.classList.remove('hidden');
    } else {
      adminError.textContent = 'Code incorrect';
    }
  });

  productMediaInput.addEventListener('change', () => {
    const file = productMediaInput.files[0];

    if (!file) {
      mediaPreview.style.display = 'none';
      mediaPreview.innerHTML = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    mediaPreview.innerHTML = '';
    mediaPreview.style.display = 'block';

    if (file.type.startsWith('video')) {
      const video = document.createElement('video');
      video.src = objectUrl;
      video.controls = true;
      video.autoplay = false;
      mediaPreview.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = objectUrl;
      img.alt = 'Aperçu du média';
      mediaPreview.appendChild(img);
    }
  });

  adminProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('productName').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('emoji', document.getElementById('productEmoji').value);
    formData.append('category', document.getElementById('productCategory').value);
    formData.append('description', document.getElementById('productDescription').value);

    if (productMediaInput.files[0]) {
      formData.append('media', productMediaInput.files[0]);
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        alert('Produit ajouté avec succès');
        adminProductForm.reset();
        mediaPreview.style.display = 'none';
        mediaPreview.innerHTML = '';
        loadProducts();
      } else {
        alert('Erreur lors de l’ajout');
      }
    } catch (error) {
      alert('Erreur réseau');
    }
  });
}

const buttons = document.querySelectorAll('button, .btn, .nav-btn');
buttons.forEach((button) => {
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
  });
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
  });
});
