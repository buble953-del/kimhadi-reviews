const API_URL = "https://script.google.com/macros/s/AKfycbzQYaZA8ixAf5fTivCH2B-jm9Xp7KiaQ_kRbQ1k2RSi2KeULU_5RZ_zWE5MrhDZWg4s/exec";

let reviews = [];

const reviewsColumnLeft = document.getElementById("reviewsColumnLeft");
const reviewsColumnRight = document.getElementById("reviewsColumnRight");
const emptyState = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");
const searchInput = document.getElementById("searchInput");
const sizeFilter = document.getElementById("sizeFilter");
const fitFilter = document.getElementById("fitFilter");
const photoOnlyFilter = document.getElementById("photoOnlyFilter");

const imageModal = document.getElementById("imageModal");
const imageModalImg = document.getElementById("imageModalImg");
const imageModalBackdrop = document.getElementById("imageModalBackdrop");
const imageModalClose = document.getElementById("imageModalClose");

async function init() {
  bindEvents();
  await loadReviews();
  populateSizeOptions();
  renderReviews();
}

async function loadReviews() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    reviews = data.map((item) => ({
      review_id: item.review_id || "",
      product_name: item.product_name || "",
      product_option_or_size: item.product_option_or_size || "",
      usual_size: item.usual_size || "",
      height_cm: Number(item.height_cm || 0),
      weight_kg: Number(item.weight_kg || 0),
      fit_feedback: item.fit_feedback || "",
      rating: Number(item.rating || 0),
      display_name: item.display_name || "익명",
      review_text: item.review_text || "",
      photo_url_public: item.photo_url_public || "",
      has_photo:
        String(item.has_photo).toLowerCase() === "true" ||
        item.has_photo === true,
      featured_flag:
        String(item.featured_flag).toLowerCase() === "true" ||
        item.featured_flag === true,
      sort_priority: Number(item.sort_priority || 999),
      published_at: item.published_at || ""
    }));
  } catch (error) {
    console.error("후기 데이터를 불러오지 못했습니다.", error);
    reviews = [];
  }
}

function populateSizeOptions() {
  sizeFilter.innerHTML = `<option value="">전체 사이즈</option>`;

  const sizes = [
    ...new Set(
      reviews
        .map((review) => review.product_option_or_size)
        .filter(Boolean)
    )
  ];

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

  imageModalBackdrop.addEventListener("click", closeImageModal);
  imageModalClose.addEventListener("click", closeImageModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeImageModal();
    }
  });
}

function openImageModal(src, alt = "") {
  imageModalImg.src = src;
  imageModalImg.alt = alt;
  imageModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeImageModal() {
  imageModal.classList.add("hidden");
  imageModalImg.src = "";
  imageModalImg.alt = "";
  document.body.style.overflow = "";
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
        return Number(b.featured_flag) - Number(a.featured_flag);
      }
      return Number(a.sort_priority) - Number(b.sort_priority);
    });
}

function renderReviews() {
  const filteredReviews = getFilteredReviews();

  reviewsColumnLeft.innerHTML = "";
  reviewsColumnRight.innerHTML = "";
  resultCount.textContent = `총 ${filteredReviews.length}개의 후기가 있습니다.`;

  if (filteredReviews.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  filteredReviews.forEach((review, index) => {
    const card = document.createElement("article");
    card.className = "review-card";

    const featuredBadge = review.featured_flag
      ? `<span class="featured-badge">베스트 후기</span>`
      : "";

    const stars =
      "★".repeat(review.rating) +
      "☆".repeat(Math.max(0, 5 - review.rating));

    const thumbSection =
      review.has_photo && review.photo_url_public
        ? `
          <div class="review-thumb-row">
            <button class="review-thumb-button" type="button" data-image="${review.photo_url_public}" data-product="${review.product_name}">
              <img class="review-thumb" src="${review.photo_url_public}" alt="${review.product_name}" />
            </button>
          </div>
        `
        : "";

    card.innerHTML = `
      <div class="review-body">
        <div class="review-top">
          <h2 class="product-name">${review.product_name}</h2>
          <div class="rating">${stars}</div>
        </div>

        <div class="meta-list">
          <span class="meta-chip">구매 ${review.product_option_or_size}</span>
          <span class="meta-chip">평소 ${review.usual_size}</span>
          <span class="meta-chip">${review.height_cm}cm / ${review.weight_kg}kg</span>
          <span class="meta-chip">${review.fit_feedback}</span>
        </div>

        ${thumbSection}

        <p class="review-text">${review.review_text}</p>

        <div class="review-footer">
          <span class="review-author">${review.display_name}</span>
          ${featuredBadge}
        </div>
      </div>
    `;

    const thumbButton = card.querySelector(".review-thumb-button");
    if (thumbButton) {
      thumbButton.addEventListener("click", () => {
        openImageModal(
          thumbButton.dataset.image,
          thumbButton.dataset.product || "후기 이미지"
        );
      });
    }

    if (index % 2 === 0) {
      reviewsColumnLeft.appendChild(card);
    } else {
      reviewsColumnRight.appendChild(card);
    }
  });
}

init();
