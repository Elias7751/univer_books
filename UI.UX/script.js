const toast = document.getElementById("toast");

function showToast(message){
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(()=>toast.classList.remove("show"), 2400);
}

function quickSearch(term){
  document.getElementById("searchInput").value = term;
  searchBooks();
}

function searchBooks(){
  const term = document.getElementById("searchInput").value.trim().toLowerCase();
  const cards = [...document.querySelectorAll(".book-card")];
  let count = 0;
  cards.forEach(card=>{
    const text = (card.dataset.search || "") + " " + card.innerText;
    const visible = !term || text.toLowerCase().includes(term);
    card.style.display = visible ? "" : "none";
    if(visible) count++;
  });
  document.getElementById("emptyState").classList.toggle("hidden", count !== 0);
  document.getElementById("latest").scrollIntoView({behavior:"smooth",block:"start"});
}

document.getElementById("searchInput").addEventListener("keydown", e=>{
  if(e.key === "Enter") searchBooks();
});

function filterBooks(type, button){
  document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
  button.classList.add("active");
  let count = 0;
  document.querySelectorAll(".book-card").forEach(card=>{
    const visible = type === "all" || card.dataset.type === type;
    card.style.display = visible ? "" : "none";
    if(visible) count++;
  });
  document.getElementById("emptyState").classList.toggle("hidden", count !== 0);
}

function openBook(title){
  showToast("فتح تفاصيل: " + title);
}
