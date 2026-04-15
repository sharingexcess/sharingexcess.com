(function () {
  var header = document.querySelector(".site-header");
  if (!header) return;

  var lastY = window.scrollY;
  var threshold = 140;
  var ticking = false;

  function navMenuOpen() {
    return !!document.querySelector(
      ".site-header-navigation-menu .w-nav-button.w--open",
    );
  }

  function update() {
    ticking = false;
    var y = window.scrollY;

    if (navMenuOpen()) {
      header.classList.remove("site-header--scroll-hidden");
      lastY = y;
      return;
    }

    if (y < threshold) {
      header.classList.remove("site-header--scroll-hidden");
    } else if (y > lastY) {
      header.classList.add("site-header--scroll-hidden");
    } else {
      header.classList.remove("site-header--scroll-hidden");
    }
    lastY = y;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    lastY = window.scrollY;
    update();
  });

  function init() {
    lastY = window.scrollY;
    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
