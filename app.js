const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    const isHidden = mobileMenu.hasAttribute("hidden");
    if (isHidden) mobileMenu.removeAttribute("hidden");
    else mobileMenu.setAttribute("hidden", "");
  });

  mobileMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => mobileMenu.setAttribute("hidden", ""));
  });
}

document.getElementById("year").textContent = new Date().getFullYear();
