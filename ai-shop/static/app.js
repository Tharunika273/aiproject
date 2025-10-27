const messagesEl = document.getElementById('messages');
const formEl = document.getElementById('chat-form');
const inputEl = document.getElementById('chat-input');
const productGridEl = document.getElementById('product-grid');
const cartItemsEl = document.getElementById('cart-items');
const cartSubtotalEl = document.getElementById('cart-subtotal');

function uuid() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

const sessionId = (() => {
  const k = 'ai-shop-session-id';
  let id = localStorage.getItem(k);
  if (!id) { id = uuid(); localStorage.setItem(k, id); }
  return id;
})();

let history = [];

function appendMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderProducts(products) {
  productGridEl.innerHTML = '';
  for (const p of products) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${p.name}</h3>
      <div class="price">$${p.price.toFixed(2)}</div>
      <div class="rating">${p.rating.toFixed(1)}★ • ${p.brand} • ${p.category}</div>
      <p>${p.description}</p>
      <button data-action="add" data-id="${p.id}">Add to cart</button>
    `;
    card.querySelector('button').addEventListener('click', () => addToCart(p.id));
    productGridEl.appendChild(card);
  }
}

function renderCart(cart) {
  cartItemsEl.innerHTML = '';
  for (const item of cart.items) {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div>${item.product.name} × ${item.quantity}</div>
      <button data-action="remove" data-id="${item.product.id}">Remove</button>
    `;
    row.querySelector('button').addEventListener('click', () => removeFromCart(item.product.id));
    cartItemsEl.appendChild(row);
  }
  cartSubtotalEl.textContent = `Subtotal: $${cart.subtotal.toFixed(2)}`;
}

async function addToCart(productId) {
  const res = await fetch('/api/cart/add', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, product_id: productId, quantity: 1 })
  });
  const data = await res.json();
  renderCart(data);
}

async function removeFromCart(productId) {
  const res = await fetch('/api/cart/remove', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, product_id: productId })
  });
  const data = await res.json();
  renderCart(data);
}

async function sendChat(text) {
  appendMessage('user', text);
  history.push({ role: 'user', content: text });
  inputEl.value = '';

  const res = await fetch('/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message: text, history })
  });
  const data = await res.json();
  appendMessage('assistant', data.reply);
  if (data.products) renderProducts(data.products);
  if (data.cart) renderCart(data.cart);
  history.push({ role: 'assistant', content: data.reply });
}

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (text) sendChat(text);
});

async function bootstrap() {
  // initial recommendations and cart load
  const res = await fetch('/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message: '', history })
  });
  const data = await res.json();
  appendMessage('assistant', data.reply);
  if (data.products) renderProducts(data.products);
  if (data.cart) renderCart(data.cart);
  history.push({ role: 'assistant', content: data.reply });
}

bootstrap();