const FooterSpan = document.getElementById("footer-span");

const hamburger = document.getElementById("hamburger").addEventListener("click", function() {
  console.log("all hail the greezy hamburger."); // We need actual logic here. 
});

FooterSpan.innerText = `${new Date().getFullYear()}`;