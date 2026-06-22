const products = [
  {
    id: "dao",
    name: "DAO",
    category: "пищевой комфорт",
    description: "Поддержка расщепления пищевого гистамина.",
    detail: "DAO может быть частью нутриционной поддержки пищевого комфорта в рационе, где важна переносимость продуктов с гистамином."
  },
  {
    id: "zoosterin",
    name: "Зоостерин",
    category: "сорбент",
    description: "Поддержка связывания части веществ в кишечнике. Принимать отдельно от лекарств и добавок.",
    detail: "Зоостерин используют как сорбентную поддержку. Важно разносить прием по времени с лекарствами и другими добавками."
  },
  {
    id: "magnesium",
    name: "Магний",
    category: "нервная система и мышцы",
    description: "Поддерживает нормальную работу нервной системы и мышц.",
    detail: "Магний относится к базовым нутриентам и может поддерживать нормальную работу нервной системы, мышц и вечерний ритуал восстановления."
  },
  {
    id: "vitamin-d",
    name: "Витамин D",
    category: "базовая поддержка",
    description: "Поддерживает кости, мышцы и иммунную систему.",
    detail: "Витамин D — базовая нутриционная поддержка костей, мышц и нормальной функции иммунной системы."
  },
  {
    id: "omega-3",
    name: "Омега-3",
    category: "кожа и обмен веществ",
    description: "Поддержка рациона, кожи и нормального липидного обмена.",
    detail: "Омега-3 дополняет рацион жирными кислотами и может поддерживать кожу и нормальный липидный обмен."
  }
];

const supportOptions = ["кожа", "пищевой комфорт", "ЖКТ", "сон", "стресс", "энергия", "волосы", "базовые нутриенты"];
const recommendationMap = {
  "пищевой комфорт": ["dao", "zoosterin"],
  "сон": ["magnesium"],
  "стресс": ["magnesium"],
  "кожа": ["omega-3", "vitamin-d"],
  "волосы": ["omega-3", "vitamin-d"],
  "базовые нутриенты": ["vitamin-d", "magnesium", "omega-3"]
};

const state = {
  selectedSupport: "",
  routine: new Set(),
  cart: new Set(),
  modalProductId: null
};

const productGrid = document.querySelector("#productGrid");
const supportOptionsContainer = document.querySelector("#supportOptions");
const recommendationResult = document.querySelector("#recommendationResult");
const routineList = document.querySelector("#routineList");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const modal = document.querySelector("#detailsModal");
const modalTitle = document.querySelector("#modalTitle");
const modalCategory = document.querySelector("#modalCategory");
const modalDescription = document.querySelector("#modalDescription");
const modalAdd = document.querySelector("#modalAdd");
const formNote = document.querySelector("#formNote");

function getProduct(id) {
  return products.find((product) => product.id === id);
}

function productCard(product) {
  return `
    <article class="product-card">
      <h3>${product.name}</h3>
      <span class="category-pill">${product.category}</span>
      <p>${product.description}</p>
      <div class="card-actions">
        <button class="button button-primary" type="button" data-add="${product.id}">Добавить</button>
        <button class="button button-ghost" type="button" data-details="${product.id}">Подробнее</button>
      </div>
    </article>
  `;
}

function lineItem(product, action = "cart") {
  const buttonText = action === "remove" ? "Убрать" : "В корзину";
  const dataAttr = action === "remove" ? "data-remove" : "data-cart";
  return `
    <article class="line-item">
      <header>
        <strong>${product.name}</strong>
        <span class="category-pill">${product.category}</span>
      </header>
      <p>${product.description}</p>
      <button class="button ${action === "remove" ? "button-ghost" : "button-primary"}" type="button" ${dataAttr}="${product.id}">${buttonText}</button>
    </article>
  `;
}

function renderCatalog() {
  productGrid.innerHTML = products.map(productCard).join("");
}

function renderOptions() {
  supportOptionsContainer.innerHTML = supportOptions.map((option) => `
    <button class="option-chip ${state.selectedSupport === option ? "active" : ""}" type="button" data-support="${option}">${option}</button>
  `).join("");
}

function renderRecommendations() {
  const ids = recommendationMap[state.selectedSupport] || [];
  if (!state.selectedSupport) {
    recommendationResult.className = "empty-state";
    recommendationResult.textContent = "Выберите интересующее направление в анкете, чтобы увидеть варианты нутриционной поддержки.";
    return;
  }

  if (ids.length === 0) {
    recommendationResult.className = "empty-state";
    recommendationResult.textContent = "Для выбранного направления подойдет индивидуальная консультация по нутриционной поддержке и базовым привычкам.";
    return;
  }

  recommendationResult.className = "recommendation-list";
  recommendationResult.innerHTML = ids.map((id) => lineItem(getProduct(id))).join("");
}

function renderRoutine() {
  const ids = [...state.routine];
  if (ids.length === 0) {
    routineList.className = "empty-state";
    routineList.textContent = "Пока схема пуста. Добавьте продукты из каталога или результата подбора.";
    return;
  }
  routineList.className = "routine-list";
  routineList.innerHTML = ids.map((id) => lineItem(getProduct(id))).join("");
}

function renderCart() {
  const ids = [...state.cart];
  cartCount.textContent = ids.length;
  if (ids.length === 0) {
    cartItems.className = "empty-state";
    cartItems.textContent = "Корзина пока пуста.";
    return;
  }
  cartItems.className = "cart-list";
  cartItems.innerHTML = ids.map((id) => lineItem(getProduct(id), "remove")).join("");
}

function addProduct(id) {
  state.routine.add(id);
  state.cart.add(id);
  renderRoutine();
  renderCart();
}

function openDetails(id) {
  const product = getProduct(id);
  state.modalProductId = id;
  modalTitle.textContent = product.name;
  modalCategory.textContent = product.category;
  modalDescription.textContent = product.detail;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeDetails() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const detailsButton = event.target.closest("[data-details]");
  const supportButton = event.target.closest("[data-support]");
  const cartButton = event.target.closest("[data-cart]");
  const removeButton = event.target.closest("[data-remove]");

  if (addButton) addProduct(addButton.dataset.add);
  if (detailsButton) openDetails(detailsButton.dataset.details);
  if (cartButton) addProduct(cartButton.dataset.cart);
  if (removeButton) {
    state.cart.delete(removeButton.dataset.remove);
    renderCart();
  }
  if (supportButton) {
    state.selectedSupport = supportButton.dataset.support;
    renderOptions();
    renderRecommendations();
    document.querySelector("#result").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (event.target.matches(".modal-close") || event.target === modal) closeDetails();
});

modalAdd.addEventListener("click", () => {
  if (state.modalProductId) addProduct(state.modalProductId);
  closeDetails();
});

document.querySelector("#orderForm").addEventListener("submit", (event) => {
  event.preventDefault();
  formNote.textContent = "Заявка подготовлена. Мы свяжемся с вами для уточнения деталей и бережного сопровождения.";
  event.currentTarget.reset();
});

renderCatalog();
renderOptions();
renderRecommendations();
renderRoutine();
renderCart();
