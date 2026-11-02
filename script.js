// Nomor WhatsApp pemesanan (format internasional tanpa +, spasi, atau 0 di depan).
// 085870917760 -> 6285870917760
const WA_NUMBER = "6285870917760";

const menu = [
  {id:1, name:"Cilok", cat:"jajanan", price:5000, icon:"🍡", desc:"Menu terlaris pelanggan", hot:true},
  {id:2, name:"Wonton & Dimsum", cat:"jajanan", price:5000, icon:"🥟", desc:"Camilan gurih"},
  {id:3, name:"Kentang Goreng", cat:"jajanan", price:5000, icon:"🍟", desc:"Favorit untuk ngemil"},
  {id:4, name:"Mi Jebew", cat:"jajanan", price:5000, icon:"🍜", desc:"Mi dengan cita rasa pedas"},
  {id:5, name:"Basreng", cat:"jajanan", price:5000, icon:"🥠", desc:"Camilan renyah"},
  {id:6, name:"Cilok Kuah Seblak", cat:"jajanan", price:5000, icon:"🥣", desc:"Cilok dengan kuah berbumbu"},
  {id:7, name:"Frozen Goreng", cat:"jajanan", price:5000, icon:"🍤", desc:"Gorengan hangat"},
  {id:8, name:"Seblak", cat:"jajanan", price:5000, icon:"🍲", desc:"Jajanan bercita rasa pedas"},
  {id:9, name:"Baso Aci", cat:"jajanan", price:5000, icon:"🥣", desc:"Kuah hangat dan gurih"},
  {id:10, name:"Bakaran", cat:"jajanan", price:5000, icon:"🍢", desc:"Jajanan bakar"},
  {id:11, name:"Tahu Kocek", cat:"jajanan", price:5000, icon:"🧆", desc:"Olahan tahu berbumbu"},
  {id:12, name:"Tempura Mix", cat:"jajanan", price:5000, icon:"🍥", desc:"Aneka tempura"},
  {id:13, name:"Jajanan lainnya", cat:"jajanan", price:5000, icon:"🍘", desc:"Tanyakan varian yang tersedia"},
  {id:14, name:"Es Degan / Kelapa", cat:"minuman", price:5000, icon:"🥥", desc:"Minuman segar", hot:true},
  {id:15, name:"Es Teh Jumbo", cat:"minuman", price:5000, icon:"🧋", desc:"Segar untuk menemani camilan"},
  {id:16, name:"Es Teh Hijau", cat:"minuman", price:5000, icon:"🍵", desc:"Minuman teh segar"}
];

let cart = {};
let currentFilter = "all";
const $ = id => document.getElementById(id);
const rupiah = n => "Rp" + n.toLocaleString("id-ID");
const esc = s => s.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function stepper(id, q){
  return `<div class="stepper"><button onclick="changeQty(${id},-1)" aria-label="Kurangi">−</button><span>${q}</span><button onclick="changeQty(${id},1)" aria-label="Tambah">+</button></div>`;
}

function render(){
  $("products").innerHTML = menu
    .filter(p => currentFilter === "all" || p.cat === currentFilter)
    .map(p => {
      const q = cart[p.id] || 0;
      return `<article class="product ${q ? "in-cart" : ""}">
        ${p.hot ? '<span class="badge">Laris</span>' : ""}
        <div class="food-icon">${p.icon}</div>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.desc)}</p>
        <div class="product-bottom">
          <span class="price">${rupiah(p.price)}</span>
          ${q ? stepper(p.id, q) : `<button class="add" onclick="changeQty(${p.id},1)">+ Tambah</button>`}
        </div>
      </article>`;
    }).join("");
}

function cartTotal(){
  return Object.entries(cart).reduce((s,[id,q]) => s + menu.find(p => p.id == id).price * q, 0);
}
function cartCount(){
  return Object.values(cart).reduce((a,b) => a + b, 0);
}

function updateBar(){
  const n = cartCount();
  $("count").textContent = n;
  $("barTotal").textContent = rupiah(cartTotal());
  $("cartbar").classList.toggle("empty", n === 0);
}

function changeQty(id, n){
  cart[id] = (cart[id] || 0) + n;
  if(cart[id] <= 0) delete cart[id];
  if(n > 0){
    const bar = $("cartbar");
    bar.classList.remove("bump"); void bar.offsetWidth; bar.classList.add("bump");
    toast(menu.find(p => p.id === id).name + " ditambahkan");
  }
  render(); updateBar();
  if($("cartModal").classList.contains("show")) drawCart();
}

let toastTimer;
function toast(msg){
  const t = $("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1400);
}

function openCart(){ $("cartModal").classList.add("show"); drawCart(); }
function closeCart(){ $("cartModal").classList.remove("show"); }

function drawCart(){
  const entries = Object.entries(cart);
  $("cartItems").innerHTML = entries.length
    ? entries.map(([id,q]) => {
        const p = menu.find(x => x.id == id);
        return `<div class="cart-row"><div><b>${p.icon} ${esc(p.name)}</b><br><small>${rupiah(p.price)} / item</small></div>${stepper(p.id, q)}</div>`;
      }).join("")
    : '<p class="empty-cart">Keranjang masih kosong. Yuk pilih menu favoritmu!</p>';
  $("total").textContent = rupiah(cartTotal());
}

function checkout(){
  const entries = Object.entries(cart);
  if(!entries.length){ toast("Keranjang masih kosong"); return; }

  const name = $("customer").value.trim() || "Pelanggan";
  const note = $("note").value.trim();
  const lines = entries.map(([id,q]) => {
    const p = menu.find(x => x.id == id);
    return `• ${p.name} x${q} = ${rupiah(p.price * q)}`;
  });

  let msg = `Halo Mbak Yanti, saya mau pesan:\n\n${lines.join("\n")}\n\nTotal: ${rupiah(cartTotal())}\nNama: ${name}`;
  if(note) msg += `\nCatatan: ${note}`;
  msg += `\n\nApakah pesanannya tersedia?`;

  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
}

document.querySelectorAll(".filter").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  currentFilter = b.dataset.filter;
  render();
}));
document.addEventListener("keydown", e => { if(e.key === "Escape") closeCart(); });

render();
updateBar();
