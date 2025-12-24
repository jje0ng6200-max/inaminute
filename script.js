// ============================
// Masked photo slider (dots + swipe)
// ============================

function setSvgImageHref(svgImageEl, src) {
  // SVG <image>는 브라우저별로 href / xlink:href 둘 다 챙기면 안정적
  svgImageEl.setAttribute("href", src);
  svgImageEl.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", src);
}

function initMaskedSlider(dotsWrap) {
  const targetId = dotsWrap.dataset.target;
  if (!targetId) return;

  const photoEl = document.getElementById(targetId);
  if (!photoEl) return;

  const dots = Array.from(dotsWrap.querySelectorAll(".dot"));
  if (dots.length === 0) return;

  let index = Math.max(0, dots.findIndex(d => d.classList.contains("active")));
  if (index === -1) index = 0;

  function goTo(i) {
    index = (i + dots.length) % dots.length;

    dots.forEach(d => d.classList.remove("active"));
    dots[index].classList.add("active");

    const src = dots[index].dataset.src;
    if (src) setSvgImageHref(photoEl, src);
  }

  

  // dot 클릭
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goTo(i));
  });

  // 스와이프 영역: dotsWrap 바로 위의 frame(= mask-wrap)을 잡는다
  // (HTML 구조상 dotsWrap 바로 전에 해당 frame이 있음)
  const frame = dotsWrap.previousElementSibling; // .mask-wrap
  if (!frame) return;

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

    // 세로 스크롤이 주가 되면 슬라이드로 안 침
    if (Math.abs(dy) > Math.abs(dx)) return;

    // 너무 짧은 스와이프는 무시
    if (Math.abs(dx) < 35) return;

    if (dx < 0) goTo(index + 1); // 왼쪽으로 밀면 다음
    else goTo(index - 1);        // 오른쪽으로 밀면 이전
  }, { passive: true });

  // 초기 1회 적용(혹시 active 표시만 있고 이미지가 다른 경우 맞춰줌)
  goTo(index);
}

// 페이지 로드 후 모든 frame-dots 초기화
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".frame-dots[data-target]").forEach(initMaskedSlider);
});

function initMessageStack(stack){
  // ✅ 현 구조 유지: msg-card1,2,3 전부 카드로 인식
  const cards = Array.from(
    stack.querySelectorAll(".msg-card1, .msg-card2, .msg-card3")
  );
  if (!cards.length) return;

  let idx = 0;

  function render(){
    cards.forEach(c =>
      c.classList.remove("is-active","is-next","is-next2")
    );

    if (cards[idx])     cards[idx].classList.add("is-active");
    if (cards[idx + 1]) cards[idx + 1].classList.add("is-next");
    if (cards[idx + 2]) cards[idx + 2].classList.add("is-next2");
  }

  /* ========= 모바일 스와이프 ========= */
  let startX = 0;
  let startY = 0;

  stack.addEventListener("touchstart", (e)=>{
    if(!e.touches || e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive:true });

  stack.addEventListener("touchend", (e)=>{
    const t = e.changedTouches && e.changedTouches[0];
    if(!t) return;

    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    if(Math.abs(dy) > Math.abs(dx)) return;
    if(Math.abs(dx) < 30) return;

    if(dx < 0) idx = Math.min(idx + 1, cards.length - 1);
    else       idx = Math.max(idx - 1, 0);

    render();
  }, { passive:true });

  /* ========= PC 마우스 드래그 ========= */
  let mouseDown = false;
  let mouseStartX = 0;

  stack.addEventListener("mousedown", (e)=>{
    mouseDown = true;
    mouseStartX = e.clientX;
  });

  window.addEventListener("mouseup", (e)=>{
    if(!mouseDown) return;
    mouseDown = false;

    const dx = e.clientX - mouseStartX;
    if(Math.abs(dx) < 40) return;

    if(dx < 0) idx = Math.min(idx + 1, cards.length - 1);
    else       idx = Math.max(idx - 1, 0);

    render();
  });

  /* ========= 트랙패드 좌우 스크롤 ========= */
  stack.addEventListener("wheel", (e)=>{
    if(Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    e.preventDefault();

    if(e.deltaX > 0) idx = Math.min(idx + 1, cards.length - 1);
    else             idx = Math.max(idx - 1, 0);

    render();
  }, { passive:false });

  render();
}

/* ✅ 여러 스택 대응 */
window.addEventListener("DOMContentLoaded", ()=>{
  document.querySelectorAll(".strip-stack").forEach(initMessageStack);
});

function initCollageSlider(slider){
  const slides = Array.from(slider.querySelectorAll(".collage-slide"));
  const dots   = Array.from(slider.querySelectorAll(".collage-dots .dot"));

  let idx = 0;

  function render(){
    slides.forEach(s => s.classList.remove("active"));
    dots.forEach(d => d.classList.remove("active"));

    slides[idx].classList.add("active");
    dots[idx].classList.add("active");
  }

  /* 도트 클릭 */
  dots.forEach((dot, i)=>{
    dot.addEventListener("click", ()=>{
      idx = i;
      render();
    });
  });

  /* 스와이프 */
  let startX = 0;

  slider.addEventListener("touchstart", e=>{
    startX = e.touches[0].clientX;
  }, { passive:true });

  slider.addEventListener("touchend", e=>{
    const dx = e.changedTouches[0].clientX - startX;
    if(Math.abs(dx) < 40) return;

    if(dx < 0) idx = (idx + 1) % slides.length;
    else idx = (idx - 1 + slides.length) % slides.length;

    render();
  }, { passive:true });

  render();
}

window.addEventListener("DOMContentLoaded", ()=>{
  document.querySelectorAll("[data-slider]").forEach(initCollageSlider);
});


