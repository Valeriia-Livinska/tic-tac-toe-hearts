const hamburgerMenu = document.querySelector(".hamburger-menu");
const settings = document.querySelector(".settings-wrapper");
const backdrop = document.querySelector(".backdrop");

hamburgerMenu.addEventListener("click", () => {
  hamburgerMenu.classList.toggle("active");
  settings.classList.toggle("active");
  backdrop.classList.toggle("active");
  document.body.classList.toggle("scroll-hidden");
});
