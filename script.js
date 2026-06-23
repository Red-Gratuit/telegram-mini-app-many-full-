const counters = document.querySelectorAll('[data-count]');
const year = document.getElementById('year');
const categoryButtons = document.querySelectorAll('[data-category]');
const featureCards = document.querySelectorAll('.feature-card');
const mainSections = document.querySelectorAll('main > section');
const navBrandName = document.getElementById('navBrandName');
const phoneBrandName = document.getElementById('phoneBrandName');
const footerBrandName = document.getElementById('footerBrandName');

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
const openReviewFormBtn = document.getElementById('openReviewForm');
const reviewForm = document.getElementById('reviewForm');
const reviewNameInput = document.getElementById('reviewName');
const reviewTextInput = document.getElementById('reviewText');
const reviewsGrid = document.getElementById('reviewsGrid');
const adminReviewSection = document.getElementById('adminReviewSection');
const adminReviewsList = document.getElementById('adminReviewsList');

const adminProductsSection = document.getElementById('adminProductsSection');
const adminProductsList = document.getElementById('adminProductsList');

if (year) {
  year.textContent = new Date().getFullYear();
}

function getTelegramDisplayName() {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  if (tgUser?.username) {
    return `@${tgUser.username}`;
  }

  if (tgUser?.first_name && tgUser?.last_name) {
    return `${tgUser.first_name} ${tgUser.last_name}`;
  }

  if (tgUser?.first_name) {
    return tgUser.first_name;
  }

  return 'Invité';
}

function updateTelegramBranding() {
  const displayName = getTelegramDisplayName();

  if (navBrandName) navBrandName.textContent = displayName;
  if (phoneBrandName) phoneBrandName.textContent = displayName;
  if (footerBrandName) footerBrandName.textContent = displayName;

  document.title = `${displayName} • PulseCart`;
}

window.updateTelegramBranding = updateTelegramBranding;
updateTelegramBranding();
window.addEventListener('load', updateTelegramBranding);
setTimeout(updateTelegramBranding, 300);

function updateViewFromHash() {
  const hash = window.location.hash.replace('#', '') || 'home';

  const visibleSections = {
    home: ['home', 'features', 'cta-section'],
    features: ['home', 'features', 'cta-section'],
    'page-boutique': ['page-boutique'],
    'page-avis': ['page-avis']
  };

  const allowed = visibleSections[hash] ? hash : 'home';

  mainSections.forEach((section) => {
    const shouldShow = visibleSections[allowed].includes(section.id);
    section.classList.toggle('hidden-page', !shouldShow);
  });
}

window.addEventListener('hashchange', updateViewFromHash);
updateViewFromHash();

async function loadProducts() {
  if (!productsGrid) return;

  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to load products');
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
      card.dataset.productId = String(product.id);
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

    // Détails produit (modal)
    const modal = document.getElementById('productModal');
    const closeBtn = document.getElementById('closeProductModal');
    const titleEl = document.getElementById('productModalTitle');
    const descEl = document.getElementById('productModalDescription');
    const priceEl = document.getElementById('productModalPrice');
    const catEl = document.getElementById('productModalCategory');
    const mediaEl = document.getElementById('productModalMedia');

    if (modal && closeBtn && titleEl && descEl && priceEl && catEl && mediaEl) {
      const openModalWithProduct = (product) => {
        titleEl.textContent = product.name || '';
        descEl.textContent = product.description || '';
        priceEl.textContent = `${Number(product.price).toFixed(2)}€`;
        catEl.textContent = product.category === 'dur' ? 'Dur' : 'Doux';

        const isVideo = product.media && /\.(mp4|webm|ogg)$/i.test(product.media);
        if (isVideo) {
          mediaEl.innerHTML = `<video class="product-modal-media-el" src="${product.media}" controls playsinline></video>`;
        } else if (product.media) {
          mediaEl.innerHTML = `<img class="product-modal-media-el" src="${product.media}" alt="${product.name}" />`;
        } else {
          mediaEl.innerHTML = `<div class="product-modal-media-placeholder">${product.emoji || '🛍️'}</div>`;
        }

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
      };

      // Events: fermeture
      const closeModal = () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      };

      closeBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
      });

      // click sur toute la carte (sauf bouton Ajouter)
      productsGrid.querySelectorAll('.shop-card').forEach((card) => {
        card.addEventListener('click', (e) => {
          const addBtn = e.target.closest('.shop-footer button');
          if (addBtn) return;

          const id = Number(card.dataset.productId);
          const product = products.find((p) => Number(p.id) === id);
          if (product) openModalWithProduct(product);
        });
      });

      // si tu veux: bouton Ajouter dans la modal
      const addModalBtn = document.getElementById('productModalAddBtn');
      if (addModalBtn) {
        addModalBtn.addEventListener('click', () => {
          // placeholder: on ferme la modal pour l’instant
          closeModal();
        });
      }
    }
  } catch (error) {
    if (productsGrid) {
      productsGrid.innerHTML = '<p>Impossible de charger les produits.</p>';
    }
  }
}

async function loadAdminProducts() {
  if (!adminProductsList) return;

  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to load admin products');
    const products = await response.json();

    if (!products.length) {
      adminProductsList.innerHTML = '<p>Aucun produit à supprimer.</p>';
      return;
    }

    adminProductsList.innerHTML = '';
    products.forEach((product) => {
      const item = document.createElement('div');
      item.className = 'admin-product-item';
      item.innerHTML = `
        <div class="admin-product-main">
          <div class="admin-product-emoji">${product.emoji || '🛍️'}</div>
          <div class="admin-product-text">
            <strong>${product.name}</strong>
            <span>${Number(product.price).toFixed(2)}€</span>
          </div>
        </div>
        <button class="btn secondary delete-product-btn" data-id="${product.id}">Supprimer</button>
      `;
      adminProductsList.appendChild(item);
    });
  } catch (error) {
    adminProductsList.innerHTML = '<p>Impossible de charger les produits.</p>';
  }
}

async function loadReviews() {
  if (!reviewsGrid && !adminReviewsList) return;

  try {
    const response = await fetch('/api/reviews');
    if (!response.ok) throw new Error('Failed to load reviews');
    const reviews = await response.json();

    if (reviewsGrid) {
      if (!reviews.length) {
        reviewsGrid.innerHTML = '<p class="empty-review">Aucun avis pour le moment.</p>';
      } else {
        reviewsGrid.innerHTML = '';
        reviews.forEach((review) => {
          const card = document.createElement('article');
          card.className = 'review-card glass-panel';
          card.innerHTML = `
            <p>“${review.text}”</p>
            <div>
              <strong>${review.name}</strong>
              <span>${review.role || 'Client'}</span>
            </div>
          `;
          reviewsGrid.appendChild(card);
        });
      }
    }

    if (adminReviewsList) {
      if (!reviews.length) {
        adminReviewsList.innerHTML = '<p class="empty-review">Aucun avis à gérer.</p>';
      } else {
        adminReviewsList.innerHTML = '';
        reviews.forEach((review) => {
          const item = document.createElement('div');
          item.className = 'admin-review-item';
          item.innerHTML = `
            <div>
              <strong>${review.name}</strong>
              <p>${review.text}</p>
            </div>
            <button class="btn secondary delete-review-btn" data-id="${review.id}">Supprimer</button>
          `;
          adminReviewsList.appendChild(item);
        });
      }
    }
  } catch (error) {
    if (reviewsGrid) {
      reviewsGrid.innerHTML = '<p>Impossible de charger les avis.</p>';
    }
  }
}

loadProducts();
loadReviews();

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

      if (adminProductsSection) {
        adminProductsSection.classList.remove('hidden');
      }
      if (adminReviewSection) {
        adminReviewSection.classList.remove('hidden');
      }

      loadAdminProducts();
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
        const successMessage = document.createElement('div');
        successMessage.className = 'success-toast';
        successMessage.textContent = 'Produit ajouté avec succès';
        document.body.appendChild(successMessage);

        setTimeout(() => {
          successMessage.remove();
        }, 2500);

        adminProductForm.reset();
        mediaPreview.style.display = 'none';
        mediaPreview.innerHTML = '';
        adminModal.classList.remove('open');
        await loadProducts();
      } else {
        alert('Erreur lors de l’ajout');
      }
    } catch (error) {
      alert('Erreur réseau');
    }
  });

  adminProductsList?.addEventListener('click', async (e) => {
    const button = e.target.closest('.delete-product-btn');
    if (!button) return;

    const productId = button.dataset.id;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        await loadProducts();
        await loadAdminProducts();
      } else {
        alert(result.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  });

  adminReviewsList?.addEventListener('click', async (e) => {
    const button = e.target.closest('.delete-review-btn');
    if (!button) return;

    const reviewId = button.dataset.id;
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        await loadReviews();
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  });
}

if (openReviewFormBtn && reviewForm && reviewNameInput && reviewTextInput) {
  openReviewFormBtn.addEventListener('click', () => {
    reviewForm.classList.toggle('hidden');
  });

  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      name: reviewNameInput.value.trim(),
      text: reviewTextInput.value.trim()
    };

    if (!payload.name || !payload.text) return;

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        reviewForm.reset();
        reviewForm.classList.add('hidden');
        await loadReviews();
      }
    } catch (error) {
      alert('Erreur lors de l’envoi de l’avis');
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

/* =========================
   Musique de fond (audio loop)
========================= */
const bgMusic = document.getElementById('bgMusic');
const bgAudioWidget = document.getElementById('bgAudioWidget');
const bgAudioToggle = document.getElementById('bgAudioToggle');
const bgAudioPause = document.getElementById('bgAudioPause');
const bgAudioStop = document.getElementById('bgAudioStop');
const bgAudioStatus = document.getElementById('bgAudioStatus');
const bgVolume = document.getElementById('bgVolume');

function setWidgetState({ playing }) {
  if (!bgAudioToggle || !bgAudioPause || !bgAudioStop || !bgAudioStatus) return;

  if (playing) {
    bgAudioToggle.textContent = '🔇 Couper';
    bgAudioToggle.classList.add('is-playing');
    bgAudioPause.disabled = false;
    bgAudioStop.disabled = false;
    bgAudioStatus.textContent = 'Musique en lecture';
  } else {
    bgAudioToggle.textContent = '🔊 Activer';
    bgAudioToggle.classList.remove('is-playing');
    bgAudioPause.disabled = true;
    bgAudioStop.disabled = true;
    bgAudioStatus.textContent = 'Musique inactive';
  }
}

function getSavedVolume() {
  const v = localStorage.getItem('bgVolume');
  const num = Number(v);
  if (Number.isFinite(num)) return Math.min(100, Math.max(0, num));
  return 30;
}

function applyVolumeFromUI() {
  if (!bgMusic || !bgVolume) return;
  const v = Number(bgVolume.value) / 100;
  bgMusic.volume = Number.isFinite(v) ? v : 0.3;
}

function tryPlay() {
  if (!bgMusic) return;

  applyVolumeFromUI();
  setWidgetState({ playing: false });

  const playPromise = bgMusic.play();
  if (playPromise && typeof playPromise.then === 'function') {
    playPromise
      .then(() => {
        // Certains navigateurs "play" mais mettent pause immédiate si autoplay bloqué.
        setWidgetState({ playing: !bgMusic.paused });
      })
      .catch(() => {
        // Bloqué par politique d'autoplay
        setWidgetState({ playing: false });
        if (bgAudioStatus) bgAudioStatus.textContent = 'Clique sur "Activer" pour démarrer';
      });
  }
}

function stopMusic() {
  if (!bgMusic) return;
  try {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  } catch {
    // ignore
  }
  setWidgetState({ playing: false });
}

function pauseMusic() {
  if (!bgMusic) return;
  try {
    bgMusic.pause();
  } catch {
    // ignore
  }
  setWidgetState({ playing: false });
}

if (bgMusic && bgAudioWidget) {
  // Volume initial depuis stockage
  if (bgVolume) bgVolume.value = String(getSavedVolume());
  applyVolumeFromUI();

  // Si audio se lance / pause via évènements
  bgMusic.addEventListener('play', () => setWidgetState({ playing: true }));
  bgMusic.addEventListener('pause', () => setWidgetState({ playing: false }));
  bgMusic.addEventListener('ended', () => setWidgetState({ playing: false }));

  // Débloquer au premier clic/tap (autoplay policy) pour lancer la musique au 1er "clique"
  let audioUnlocked = false;

  window.addEventListener(
    'pointerdown',
    () => {
      if (audioUnlocked) return;
      // Si l'audio est déjà en lecture (ou prêt à être en lecture), ne rien faire.
      if (!bgMusic || !bgMusic.paused) return;

      audioUnlocked = true;
      tryPlay();
    },
    { once: true }
  );

  if (bgAudioToggle) {
    bgAudioToggle.addEventListener('click', () => {
      const shouldBePlaying = bgMusic.paused || bgMusic.ended;

      if (!shouldBePlaying) {
        stopMusic();
        return;
      }

      tryPlay();
    });
  }

  if (bgAudioPause) {
    bgAudioPause.addEventListener('click', () => pauseMusic());
  }

  if (bgAudioStop) {
    bgAudioStop.addEventListener('click', () => {
      // Stop/reprendre
      if (!bgMusic.paused && bgMusic.currentTime > 0) {
        stopMusic();
      } else {
        tryPlay();
      }
    });
  }

  if (bgVolume) {
    bgVolume.addEventListener('input', () => {
      applyVolumeFromUI();
      localStorage.setItem('bgVolume', String(bgVolume.value));
    });
  }

  // Etat initial
  setWidgetState({ playing: false });
}
