// ============================
// Masked photo slider (dots + swipe)
// ============================

// SVG <image> href 안전 교체
function setSvgImageHref(svgImageEl, src) {
  svgImageEl.setAttribute("href", src);
  svgImageEl.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "xlink:href",
    src
  );
}

function initMaskedSlider(dotsWrap) {
  const targetId = dotsWrap.dataset.target;
  if (!targetId) return;

  const photoEl = document.getElementById(targetId);
  if (!photoEl) return;

  const dots = Array.from(dotsWrap.querySelectorAll(".dot"));
  if (!dots.length) return;

  let index = Math.max(0, dots.findIndex(d => d.classList.contains("active")));
  if (index === -1) index = 0;

  // ⭐️ 핵심: 사진 교체 + 사진만 이동
  function goTo(i) {
    index = (i + dots.length) % dots.length;

    dots.forEach(d => d.classList.remove("active"));
    dots[index].classList.add("active");

   const dot = dots[index];
const src = dot.dataset.src;

const dx = Number(dot.dataset.x || 0);
const dy = Number(dot.dataset.y || 0);

if (src) setSvgImageHref(photoEl, src);

const baseX = Number(photoEl.dataset.baseX || photoEl.getAttribute("x") || 0);
const baseY = Number(photoEl.dataset.baseY || photoEl.getAttribute("y") || 0);

// ✅ 사진만 이동 (프레임/마스크/버튼 고정)
requestAnimationFrame(() => {
  photoEl.setAttribute("x", baseX + dx);
  photoEl.setAttribute("y", baseY + dy);
});
  }
  

  // dot 클릭
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goTo(i));
  });

  // ===== 스와이프 (프레임 기준) =====
  const frame = dotsWrap.previousElementSibling; // .mask-wrap
  if (frame) {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    frame.addEventListener("touchstart", (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      tracking = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    frame.addEventListener("touchend", (e) => {
      if (!tracking) return;
      tracking = false;

      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;

      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      if (Math.abs(dy) > Math.abs(dx)) return;
      if (Math.abs(dx) < 35) return;

      if (dx < 0) goTo(index + 1);
      else goTo(index - 1);
    }, { passive: true });
  }

  // 초기 1회 적용
  goTo(index);
}

// ============================
// Message image stack
// ============================

function initMessageStack(stack) {
  const cards = Array.from(stack.querySelectorAll(".msg-card1"));
  if (!cards.length) return;

  let idx = 0;

  function render() {
    cards.forEach(c =>
      c.classList.remove("is-active", "is-next", "is-next2")
    );

    if (cards[idx]) cards[idx].classList.add("is-active");
    if (cards[idx + 1]) cards[idx + 1].classList.add("is-next");
    if (cards[idx + 2]) cards[idx + 2].classList.add("is-next2");
  }

  let startX = 0;
  let startY = 0;

  stack.addEventListener("touchstart", (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  stack.addEventListener("touchend", (e) => {
    const t = e.changedTouches && e.changedTouches[0];
    if (!t) return;

    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) < 30) return;

    if (dx < 0) idx = Math.min(idx + 1, cards.length - 1);
    else idx = Math.max(idx - 1, 0);

    render();
  }, { passive: true });

  render();
}

// ============================
// Collage slider
// ============================

function initCollageSlider(slider) {
  const slides = Array.from(slider.querySelectorAll(".collage-slide"));
  const dots = Array.from(slider.querySelectorAll(".collage-dots .dot"));
  if (!slides.length) return;

  let idx = 0;

  function render() {
  slides.forEach(s => s.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active"));

  const active = slides[idx];          // ✅ 이 줄이 핵심
  active.classList.add("active");
  if (dots[idx]) dots[idx].classList.add("active");

  // ✅ 이미지(슬라이드)만 위치 조정
  const pos = active.dataset.pos;
  active.style.objectPosition = pos ? pos : "50% 50%";
}

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      idx = i;
      render();
    });
  });

  let startX = 0;

  slider.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) < 40) return;

    if (dx < 0) idx = (idx + 1) % slides.length;
    else idx = (idx - 1 + slides.length) % slides.length;

    render();
  }, { passive: true });

  render();
}

// ============================
// Init all
// ============================

window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".frame-dots[data-target]")
    .forEach(initMaskedSlider);

  document
    .querySelectorAll(".strip-stack")
    .forEach(initMessageStack);

  document
    .querySelectorAll("[data-slider]")
    .forEach(initCollageSlider);
});
