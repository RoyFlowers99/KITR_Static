const FooterSpan = document.getElementById("footer-span");

const hamburger = document.getElementById("hamburger").addEventListener("click", function() {
  console.log("all hail the greezy hamburger."); // We need actual logic here. 
});

FooterSpan.innerText = `${new Date().getFullYear()}`;

document.addEventListener("DOMContentLoaded", () => {
  const template = document.getElementById("main-content-template");
  const mount = document.getElementById("mount");

  if (!template || !mount) return;

  const clone = template.content.cloneNode(true);
  mount.appendChild(clone);
})