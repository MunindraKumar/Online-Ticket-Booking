const searchForm = document.querySelector("#event-search");
const queryInput = document.querySelector("#query-input");
const citySelect = document.querySelector("#city-select");
const dateSelect = document.querySelector("#date-select");
const categoryButtons = [...document.querySelectorAll(".category-chip")];
const eventCards = [...document.querySelectorAll(".event-card")];
const emptyState = document.querySelector("#empty-state");
const sortButton = document.querySelector("#sort-button");
const browseMoreButton = document.querySelector("#browse-more");

let activeCategory = "all";
let recommendedOrder = true;

function filterEvents() {
  const query = queryInput.value.trim().toLowerCase();
  const city = citySelect.value;
  const date = dateSelect.value;
  let visibleCount = 0;

  eventCards.forEach((card) => {
    const matchesCategory = activeCategory === "all" || card.dataset.category === activeCategory;
    const matchesCity = city === "all" || card.dataset.city === city;
    const matchesDate = date === "all" || card.dataset.date === date;
    const matchesQuery = !query || `${card.dataset.title} ${card.dataset.category} ${card.dataset.city}`.toLowerCase().includes(query);
    const isVisible = matchesCategory && matchesCity && matchesDate && matchesQuery;

    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  filterEvents();
  document.querySelector("#event-list").scrollIntoView({ behavior: "smooth", block: "start" });
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    categoryButtons.forEach((categoryButton) => {
      const selected = categoryButton === button;
      categoryButton.classList.toggle("active", selected);
      categoryButton.setAttribute("aria-pressed", String(selected));
    });
    filterEvents();
  });
  button.setAttribute("aria-pressed", String(button.classList.contains("active")));
});

[queryInput, citySelect, dateSelect].forEach((control) => {
  control.addEventListener("input", filterEvents);
  control.addEventListener("change", filterEvents);
});

document.querySelectorAll(".favorite-button").forEach((button) => {
  button.addEventListener("click", () => {
    const saved = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", `${saved ? "Remove from saved events" : "Save event"}: ${button.closest(".event-card").querySelector("h4").textContent}`);
  });
});

sortButton.addEventListener("click", () => {
  recommendedOrder = !recommendedOrder;
  const grid = document.querySelector("#event-grid");
  const orderedCards = recommendedOrder
    ? eventCards
    : [...eventCards].sort((first, second) =>
        first.querySelector("h4").textContent.localeCompare(second.querySelector("h4").textContent),
      );
  orderedCards.forEach((card) => grid.append(card));
  sortButton.innerHTML = `${recommendedOrder ? "Recommended" : "A to Z"} <span aria-hidden="true">⌄</span>`;
});

browseMoreButton.addEventListener("click", () => {
  browseMoreButton.textContent = "You're all caught up ✳";
  browseMoreButton.disabled = true;
});

document.querySelector(".mobile-search").addEventListener("click", () => {
  queryInput.focus();
  queryInput.scrollIntoView({ behavior: "smooth", block: "center" });
});
