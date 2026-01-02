const PAGE_SIZE = 12;
let allUsecases = [];
let shown = 0;
let q = "";
let activeCategories = new Set();

// DOM
const cardsEl = document.getElementById("cards");
const loadMoreBtn = document.getElementById("loadMore");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const categoryFiltersEl = document.getElementById("categoryFilters");
const resetFilters = document.getElementById("resetFilters");

const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");

// LOAD DATA
fetch("./usecases_101.json")
  .then(res => res.json())
  .then(data => {
    allUsecases = data.slice(1);
    renderCategoryFilters();
    renderCards(true);
  });

// CLEAN TITLE
function cleanTitle(title) {
  return title
    .replace(/^Usecase\s*#\d+:\s*/i, "")
    .replace(/^\d+\.\s*/, "")
    .trim();
}

// FILTERS
function renderCategoryFilters() {
  const cats = [...new Set(allUsecases.map(u => u.category))];
  categoryFiltersEl.innerHTML = "";

  cats.forEach(cat => {
    const b = document.createElement("button");
    b.className = "filter-chip";
    b.textContent = cat;
    b.onclick = () => {
      activeCategories.has(cat)
        ? activeCategories.delete(cat)
        : activeCategories.add(cat);
      renderCards(true);
    };
    categoryFiltersEl.appendChild(b);
  });
}

function matches(u) {
  if (q && !u.title.toLowerCase().includes(q)) return false;
  if (activeCategories.size && !activeCategories.has(u.category)) return false;
  return true;
}

// CARDS
function renderCards(reset = false) {
  const items = allUsecases.filter(matches);

  if (reset) {
    cardsEl.innerHTML = "";
    shown = 0;
  }

  items.slice(shown, shown + PAGE_SIZE).forEach(u => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<h3 class="card-title">${cleanTitle(u.title)}</h3>`;
    card.onclick = () => openModal(u);
    cardsEl.appendChild(card);
  });

  shown += PAGE_SIZE;
  loadMoreBtn.style.display = shown < items.length ? "block" : "none";
}

// MODAL
function openModal(u) {
  modalTitle.textContent = cleanTitle(u.title);
  modalDesc.innerHTML = formatUsecase(u);
  modal.classList.remove("hidden");
}

function formatUsecase(u) {
  let html = '';
  if (u.summary) {
    html += `<p><strong>Summary:</strong> ${u.summary}</p>`;
  }
  if (u.sections) {
    for (const [key, section] of Object.entries(u.sections)) {
      html += `<h4>${section.heading}</h4>`;
      if (section.content) {
        html += `<p>${section.content.replace(/\n/g, '<br>')}</p>`;
      }
      if (section.items && section.items.length) {
        html += '<ul>';
        section.items.forEach(item => {
          html += `<li>${item}</li>`;
        });
        html += '</ul>';
      }
    }
  }
  return html;
}

// EVENTS
searchInput.oninput = e => {
  q = e.target.value.toLowerCase();
  renderCards(true);
};

clearSearch.onclick = () => {
  q = "";
  searchInput.value = "";
  renderCards(true);
};

resetFilters.onclick = () => {
  activeCategories.clear();
  renderCards(true);
};

loadMoreBtn.onclick = () => renderCards();

modalClose.onclick = () => modal.classList.add("hidden");
modal.onclick = e => { if (e.target === modal) modal.classList.add("hidden"); };
