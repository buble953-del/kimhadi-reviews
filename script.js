const reviews = [
  {
    review_id: "RV-20260329-2",
    product_name: "발렌시아가",
    product_option_or_size: "XL",
    usual_size: "XL",
    height_cm: 168,
    weight_kg: 68,
    fit_feedback: "오버핏",
    rating: 5,
    display_name: "테*터",
    review_text: "너무 맘에드는 거래였습니다. 최고의 물건이에요 항상",
    photo_url_public: "",
    has_photo: false,
    featured_flag: false,
    sort_priority: 100,
    published_at: "2026-03-29"
  },
  {
    review_id: "RV-20260329-3",
    product_name: "아디다스 트랙자켓",
    product_option_or_size: "L",
    usual_size: "M",
    height_cm: 175,
    weight_kg: 70,
    fit_feedback: "정사이즈",
    rating: 5,
    display_name: "김**로",
    review_text: "핏이 깔끔하고 데일리로 입기 좋아요. 생각보다 활용도가 높았습니다.",
    photo_url_public: "",
    has_photo: false,
    featured_flag: true,
    sort_priority: 90,
    published_at: "2026-03-28"
  }
];

const reviewsGrid = document.getElementById("reviewsGrid");
const emptyState = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");
const searchInput = document.getElementById("searchInput");
const sizeFilter = document.getElementById("sizeFilter");
const fitFilter = document.getElementById("fitFilter");
const photoOnlyFilter = document.getElementById("photoOnlyFilter");

function init() {
  populateSizeOptions();
  bindEvents();
  renderReviews();
}

function populateSizeOptions() {
  const sizes = [...new Set(reviews.map((review) => review.product_option_or_size).filter(Boolean))];
  sizes.sort();

  sizes.forEach((size) => {
    const option = document.createElement("option");
    option.value = size;
    option.textContent = size;
    sizeFilter.appendChild(option);
  });
}

function bindEvents() {
  searchInput.addEventListener("input", renderReviews);
  sizeFilter.addEventListener("change", renderReviews);
  fitFilter.addEventListener("change", renderReviews);
  photoOnlyFilter.addEventListener("change", renderReviews);
}

function getFilteredReviews() {
  const searchKeyword = searchInput.value.trim().toLowerCase();
  const selectedSize = sizeFilter.value;
  const selectedFit = fitFilter.value;
  const photoOnly = photoOnlyFilter.checked;

  return reviews
    .filter((review) => {
      const matchesSearch =
        !searchKeyword ||
        review.product_name.toLowerCase().includes(searchKeyword);

      const matchesSize =
        !selectedSize ||
        review.product_option_or_size === selectedSize;

      const matchesFit =
        !selectedFit ||
        review.fit_feedback === selectedFit;

      const matchesPhoto =
        !photoOnly ||
        review.has_photo === true;

      return matchesSearch && matchesSize && matchesFit && matchesPhoto;
    })
    .sort((a, b) => {
      if (a.featured_flag !== b.featured_flag) {
        return b.featured_flag - a.featured_flag;
      }
      return a.sort_priority - b.sort_priority;
    });
}

function renderReviews() {
  const filteredReviews = getFilteredReviews();

  reviewsGrid.innerHTML = "";
  resultCount.textContent = `총 ${filteredReviews.length}개의 후기가 있습니다.`;

  if (filteredReviews.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  filteredReviews.forEach((review) => {
    const card = document.createElement("article");
    card.className = "review-card";

    const imageSection =
      review.has_photo && review.photo_url_public
        ? `
          <div class="review-image-wrap">
            <img class="review-image" src="${review.photo_url_public}" alt="${review.product_name}" />
          </div>
        `
        : "";

    const featuredBadge = review.featured_flag
      ? `<span class="featured-badge">베스트 후기</span>`
      : "";

    card.innerHTML = `
      ${imageSection}
      <div class="review-body">
        <div class="review-top">
          <h2 class="product-name">${review.product_name}</h2>
          <div class="rating">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
        </div>

        <div class="meta-list">
          <span class="meta-chip">구매 ${review.product_option_or_size}</span>
          <span class="meta-chip">평소 ${review.usual_size}</span>
          <span class="meta-chip">${review.height_cm}cm / ${review.weight_kg}kg</span>
          <span class="meta-chip">${review.fit_feedback}</span>
        </div>

        <p class="review-text">${review.review_text}</p>

        <div class="review-footer">
          <span>${review.display_name}</span>
          ${featuredBadge}
        </div>
      </div>
    `;

    reviewsGrid.appendChild(card);
  });
}

init();
