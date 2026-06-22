const products = [
  { id: 'dao', name: 'DAO', price: 2890, tags: ['пищевой комфорт', 'ежедневная рутина'], text: 'Формула для осознанного сопровождения рациона, особенно когда хочется мягкой поддержки после сложных блюд.' },
  { id: 'zoo', name: 'Зоостерин', price: 1690, tags: ['баланс', 'пищеварение'], text: 'Справочный wellness-продукт для бережной поддержки пищеварительного баланса в рамках разнообразного питания.' },
  { id: 'magnesium', name: 'Магний', price: 1490, tags: ['спокойный ритм', 'вечер'], text: 'Минеральная поддержка для вечернего ритуала, расслабленного темпа и заботы о регулярности нутриентов.' },
  { id: 'vitd', name: 'Витамин D', price: 1290, tags: ['база', 'мало солнца'], text: 'Базовый нутриент для людей с офисным графиком, сезонным дефицитом солнечного света и вниманием к рациону.' },
  { id: 'omega', name: 'Омега-3', price: 2190, tags: ['жирные кислоты', 'красота'], text: 'Источник полиненасыщенных жирных кислот для дополнения рациона и ежедневного premium wellness-ритуала.' }
];

const cart = new Map();
const productGrid = document.querySelector('#productGrid');
const cartCount = document.querySelector('#cartCount');
const cartItems = document.querySelector('#cartItems');
const cartTotal = document.querySelector('#cartTotal');

const formatPrice = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';

function productById(id) {
  return products.find(product => product.id === id);
}

function renderCatalog() {
  productGrid.innerHTML = products.map(product => `
    <article class="product-card reveal">
      <div class="product-top">
        <div>
          <p class="eyebrow">age:off</p>
          <h3>${product.name}</h3>
        </div>
        <span class="price">${formatPrice(product.price)}</span>
      </div>
      <p>${product.text}</p>
      <div class="tags">${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
      <div class="product-actions">
        <span class="mini-note">БАД. Не является лекарственным средством.</span>
        <button class="btn secondary" type="button" data-add="${product.id}">Добавить</button>
      </div>
    </article>
  `).join('');
}

function addToCart(id) {
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
}

function changeQty(id, diff) {
  const next = (cart.get(id) || 0) + diff;
  if (next <= 0) cart.delete(id);
  else cart.set(id, next);
  renderCart();
}

function renderCart() {
  const entries = [...cart.entries()];
  const count = entries.reduce((sum, [, qty]) => sum + qty, 0);
  const total = entries.reduce((sum, [id, qty]) => sum + productById(id).price * qty, 0);
  cartCount.textContent = count;
  cartTotal.textContent = formatPrice(total);

  if (!entries.length) {
    cartItems.className = 'cart-items empty';
    cartItems.textContent = 'Корзина пока пуста. Добавьте продукты из каталога или результата подбора.';
    return;
  }

  cartItems.className = 'cart-items';
  cartItems.innerHTML = entries.map(([id, qty]) => {
    const product = productById(id);
    return `
      <div class="cart-line">
        <div><strong>${product.name}</strong><br><span class="mini-note">${formatPrice(product.price)} · БАД</span></div>
        <div class="qty">
          <button class="icon-btn" type="button" data-qty="${id}" data-diff="-1">−</button>
          <strong>${qty}</strong>
          <button class="icon-btn" type="button" data-qty="${id}" data-diff="1">+</button>
        </div>
      </div>
    `;
  }).join('');
}

function getRecommendation(formData) {
  const needs = formData.getAll('needs');
  const goal = formData.get('goal');
  const format = formData.get('format');
  const ids = new Set();

  if (goal === 'comfort' || needs.includes('histamine')) ids.add('dao');
  if (needs.includes('gut')) ids.add('zoo');
  if (goal === 'calm' || needs.includes('sleep')) ids.add('magnesium');
  if (goal === 'basic' || needs.includes('sun')) ids.add('vitd');
  if (goal === 'beauty' || goal === 'energy' || needs.includes('heart')) ids.add('omega');

  if (!ids.size) ['vitd', 'omega'].forEach(id => ids.add(id));
  const limit = format === 'minimal' ? 2 : format === 'balanced' ? 3 : 5;
  return [...ids].slice(0, limit).map(productById);
}

function renderResult(recommended) {
  const resultCard = document.querySelector('#resultCard');
  resultCard.innerHTML = `
    <p class="eyebrow">результат подбора</p>
    <h2>Мягкая схема на каждый день</h2>
    <p>Подбор составлен по вашим ответам и не заменяет консультацию специалиста. Начинайте с комфортного режима и учитывайте индивидуальные особенности.</p>
    <div class="result-list">
      ${recommended.map(product => `
        <div class="result-item">
          <div><strong>${product.name}</strong><br><span class="mini-note">${product.tags.join(' · ')}</span></div>
          <button class="btn secondary" type="button" data-add="${product.id}">В корзину</button>
        </div>
      `).join('')}
    </div>
  `;
  document.querySelector('#result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('click', event => {
  const addButton = event.target.closest('[data-add]');
  const qtyButton = event.target.closest('[data-qty]');
  if (addButton) addToCart(addButton.dataset.add);
  if (qtyButton) changeQty(qtyButton.dataset.qty, Number(qtyButton.dataset.diff));
  if (event.target.closest('[data-open-cart]')) document.querySelector('#cart').scrollIntoView({ behavior: 'smooth' });
});

document.querySelector('#quizForm').addEventListener('submit', event => {
  event.preventDefault();
  renderResult(getRecommendation(new FormData(event.currentTarget)));
});

document.querySelector('#checkoutBtn').addEventListener('click', () => {
  const message = cart.size
    ? 'Заявка подготовлена. В демо-версии оформление заказа не отправляет данные.'
    : 'Добавьте продукты в корзину перед оформлением заявки.';
  alert(message);
});

renderCatalog();
renderCart();
