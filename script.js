// Konfigurasi Simbol
const symbols = [
  {
    id: "zonk",
    val: 0,
    name: "ZONK",
    icon: '<i class="fa-solid fa-face-sad-tear text-gray-500"></i>',
    color: "text-gray-500",
  },
  {
    id: "5k",
    val: 5000,
    name: "5K",
    icon: '<i class="fa-solid fa-coins text-yellow-600"></i>',
    color: "text-yellow-600",
  },
  {
    id: "10k",
    val: 10000,
    name: "10K",
    icon: '<i class="fa-solid fa-money-bill-wave text-green-500"></i>',
    color: "text-green-500",
  },
  {
    id: "jackpot",
    val: 0,
    name: "JACKPOT",
    icon: '<i class="fa-solid fa-gem text-yellow-400"></i>',
    color: "text-yellow-400",
  },
];

let currentClaimData = { total: 0, id: "" };
const SYMBOL_HEIGHT = 120;
let isSpinning = false;

// --- SISTEM PENGUNCI 1x SPIN ---
// Cek apakah user sudah pernah main saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("hasSpun") === "true") {
    kunciTombolSpin();
  }
  initSlot();
});

function kunciTombolSpin() {
  const btn = document.getElementById("spin-btn");
  const btnText = document.getElementById("spin-text");
  btn.disabled = true;
  btnText.innerHTML = '<i class="fa-solid fa-lock"></i> KUPON HABIS';
}

function getRandomSymbol() {
  const rand = Math.random();
  if (rand < 0.45) return symbols[0];
  if (rand < 0.75) return symbols[1];
  if (rand < 0.9) return symbols[2];
  return symbols[3];
}

function createSymbolHTML(symbol) {
  return `
        <div class="symbol">
            <div class="drop-shadow-lg">${symbol.icon}</div>
            <div class="symbol-text ${symbol.color}">${symbol.name}</div>
        </div>
    `;
}

function initSlot() {
  const strips = [
    document.getElementById("reel-1"),
    document.getElementById("reel-2"),
    document.getElementById("reel-3"),
  ];
  strips.forEach((strip) => {
    const randomSym = symbols[Math.floor(Math.random() * symbols.length)];
    strip.innerHTML = createSymbolHTML(randomSym);
    strip.style.transform = `translateY(0px)`;
  });
}

function startSpin() {
  // Keamanan ganda: Jika di local storage sudah true, jangan jalan
  if (isSpinning || localStorage.getItem("hasSpun") === "true") return;
  isSpinning = true;

  // Langsung kunci agar jika mereka me-refresh halaman saat berputar, tiketnya tetap hangus
  localStorage.setItem("hasSpun", "true");

  const btnText = document.getElementById("spin-text");
  const btn = document.getElementById("spin-btn");
  btn.disabled = true;
  btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> MENGACAK...';

  const strips = [
    document.getElementById("reel-1"),
    document.getElementById("reel-2"),
    document.getElementById("reel-3"),
  ];
  const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
  let completedReels = 0;

  strips.forEach((strip, index) => {
    let html = strip.innerHTML;
    const spins = 30 + index * 10;

    for (let i = 0; i < spins; i++) {
      html += createSymbolHTML(
        symbols[Math.floor(Math.random() * symbols.length)],
      );
    }
    html += createSymbolHTML(results[index]);

    strip.innerHTML = html;
    strip.style.transition = "none";
    strip.style.transform = `translateY(0px)`;

    setTimeout(() => {
      const duration = 2.5 + index * 0.5;
      strip.style.transition = `transform ${duration}s cubic-bezier(0.15, 0.85, 0.3, 1)`;
      const targetY = -((spins + 1) * SYMBOL_HEIGHT);
      strip.style.transform = `translateY(${targetY}px)`;

      setTimeout(() => {
        completedReels++;
        if (completedReels === 3) {
          evaluateResults(results);
          kunciTombolSpin(); // Kunci tombol selamanya
          isSpinning = false;

          strips.forEach((s, i) => {
            s.style.transition = "none";
            s.innerHTML = createSymbolHTML(results[i]);
            s.style.transform = `translateY(0px)`;
          });
        }
      }, duration * 1000);
    }, 50);
  });
}

function evaluateResults(results) {
  let total = 0;
  const isJackpot = results.every((r) => r.id === "jackpot");

  if (isJackpot) {
    total = 100000;
  } else {
    total = results.reduce((sum, r) => sum + r.val, 0);
  }

  showResultModal(total, isJackpot);
}

function showResultModal(total, isJackpot) {
  const modal = document.getElementById("result-modal");
  const content = document.getElementById("modal-content");
  const actionBtn = document.getElementById("modal-action-btn");

  if (total > 0) {
    const formattedTotal = total.toLocaleString("id-ID");
    const title = isJackpot ? "🎰 JACKPOT! 🎰" : "SELAMAT!";
    const titleColor = isJackpot
      ? "text-yellow-400 animate-bounce"
      : "text-green-400";

    const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase();
    currentClaimData = { total: total, id: uniqueId };

    content.innerHTML = `
            <h2 class="text-3xl font-bold ${titleColor} mb-2">${title}</h2>
            <p class="text-gray-300 mb-6">Anda memenangkan saldo sebesar:</p>
            <div class="text-5xl font-black gold-text mb-2">Rp ${formattedTotal}</div>
            <p class="text-xs text-gray-500 mb-2">ID: ${uniqueId}</p>
        `;

    // Tombol Klaim Hadiah (Teks Tutup Dihapus)
    actionBtn.innerHTML = `
            <button onclick="openClaimSheet()" class="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 text-white font-bold py-3.5 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] transition-all flex items-center justify-center gap-2">
                <i class="fa-solid fa-hand-holding-dollar"></i> KLAIM HADIAH
            </button>
        `;

    triggerConfetti(isJackpot);
  } else {
    content.innerHTML = `
            <div class="text-6xl mb-4 text-gray-600"><i class="fa-solid fa-face-frown-open"></i></div>
            <h2 class="text-2xl font-bold text-gray-400 mb-2">YAH, ZONK!</h2>
            <p class="text-gray-500">Sayang sekali Anda belum beruntung. Kesempatan Anda telah habis.</p>
        `;

    // Tombol Main Lagi diganti jadi Tutup saja
    actionBtn.innerHTML = `
            <button onclick="closeModal()" class="w-full bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-600 transition-all">
                TUTUP
            </button>
        `;
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModal() {
  document.getElementById("result-modal").classList.add("hidden");
  document.getElementById("result-modal").classList.remove("flex");
}

function openClaimSheet() {
  closeModal();
  document.getElementById("claim-nominal").value =
    currentClaimData.total.toLocaleString("id-ID");

  const overlay = document.getElementById("claim-sheet-overlay");
  const sheet = document.getElementById("claim-sheet");

  overlay.classList.remove("hidden");
  setTimeout(() => {
    overlay.classList.remove("opacity-0");
    sheet.classList.remove("translate-y-full");
  }, 10);
}

function closeClaimSheet() {
  const overlay = document.getElementById("claim-sheet-overlay");
  const sheet = document.getElementById("claim-sheet");

  overlay.classList.add("opacity-0");
  sheet.classList.add("translate-y-full");

  setTimeout(() => {
    overlay.classList.add("hidden");
  }, 300);
}

function processClaim() {
  const nama = document.getElementById("claim-nama").value.trim();
  const ewallet = document.getElementById("claim-ewallet").value;
  const nomor = document.getElementById("claim-nomor").value.trim();

  if (!nama || !ewallet || !nomor) {
    alert("Mohon lengkapi semua data formulir pencairan!");
    return;
  }

  const waNumber = "6285775281805"; // Nomor WhatsApp Anda
  const formattedTotal = currentClaimData.total.toLocaleString("id-ID");

  const waText = `Halo Admin! 🎉\n\nSaya pemenang *Gacha THR* dan ingin melakukan klaim pencairan hadiah.\n\n*DATA PEMENANG:*\n👤 Nama: ${nama}\n💳 E-Wallet: ${ewallet}\n📱 Nomor: ${nomor}\n\n🏆 *Total Hadiah:* Rp ${formattedTotal}\n🔑 *ID Klaim:* ${currentClaimData.id}\n\nMohon bantuannya untuk diproses ya min, terima kasih!`;

  window.open(
    `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`,
    "_blank",
  );
  closeClaimSheet();
}

function triggerConfetti(isJackpot) {
  const count = isJackpot ? 300 : 100;
  const defaults = { origin: { y: 0.7 } };
  function fire(particleRatio, opts) {
    confetti(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
      }),
    );
  }
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}
