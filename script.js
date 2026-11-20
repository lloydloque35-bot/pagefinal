/* =============================================================
   PORTFOLIO SCRIPT
   1. Mobile menu
   2. Pink "misprint" layer on the big name
   3. Work filters
   4. Lightbox (click a work to see it bigger)
   5. Contact form (sends messages to your email)
   6. Footer year
   ============================================================= */

/* ---------- 1. Mobile menu ---------- */
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

function setMenu(open) {
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.textContent = open ? "Close" : "Menu";
  siteNav.classList.toggle("is-open", open);
}

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  setMenu(!isOpen);
});

siteNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

/* ---------- 2. Misprint layer on the hero name ---------- */
const heroName = document.querySelector(".hero-name");
const heroText = document.querySelector(".hero-name-text");

if (heroName && heroText) {
  const overprint = document.createElement("span");
  overprint.className = "overprint";
  overprint.setAttribute("aria-hidden", "true");
  overprint.innerHTML = heroText.innerHTML;
  heroName.appendChild(overprint);
}

/* ---------- 3. Work filters ---------- */
const filterButtons = document.querySelectorAll(".filter");
const pieces = document.querySelectorAll(".piece");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    pieces.forEach((piece) => {
      const show = filter === "all" || piece.dataset.category === filter;
      piece.hidden = !show;
    });
  });
});

/* ---------- 4. Lightbox ---------- */
const lightbox = document.querySelector(".lightbox");
const lbImg = lightbox.querySelector(".lb-img");
const lbTitle = lightbox.querySelector(".lb-title");
const lbMeta = lightbox.querySelector(".lb-meta");
const lbDesc = lightbox.querySelector(".lb-desc");
const lbLink = lightbox.querySelector(".lb-link");
const lbCount = lightbox.querySelector(".lb-count");
let currentIndex = 0;

function visiblePieces() {
  return Array.from(pieces).filter((piece) => !piece.hidden);
}

function showPiece(index) {
  const list = visiblePieces();
  currentIndex = (index + list.length) % list.length;
  const piece = list[currentIndex];
  const img = piece.querySelector("img");

  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbTitle.textContent = piece.querySelector(".piece-title").textContent;
  lbMeta.textContent = piece.querySelector(".piece-meta").textContent;
  lbDesc.textContent = piece.dataset.desc || "";
  lbCount.textContent = `${currentIndex + 1} of ${list.length}`;

  if (piece.dataset.link) {
    lbLink.href = piece.dataset.link;
    lbLink.hidden = false;
  } else {
    lbLink.hidden = true;
  }
}

pieces.forEach((piece) => {
  piece.querySelector(".piece-open").addEventListener("click", () => {
    showPiece(visiblePieces().indexOf(piece));
    lightbox.showModal();
  });
});

lightbox.querySelector(".lb-close").addEventListener("click", () => lightbox.close());
lightbox.querySelector(".lb-prev").addEventListener("click", () => showPiece(currentIndex - 1));
lightbox.querySelector(".lb-next").addEventListener("click", () => showPiece(currentIndex + 1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showPiece(currentIndex - 1);
  if (event.key === "ArrowRight") showPiece(currentIndex + 1);
});

/* ---------- 5. Contact form ---------- */
const form = document.querySelector(".contact-form");
const formNote = document.querySelector(".form-note");
const formStatus = document.querySelector(".form-status");
const sendButton = form.querySelector('button[type="submit"]');
const accessKeyInput = form.elements["access_key"];
const accessKey = accessKeyInput ? accessKeyInput.value.trim() : "";
const hasKey = accessKey !== "" && accessKey !== "YOUR_ACCESS_KEY_HERE";

if (hasKey && formNote) formNote.hidden = true;

function fieldValue(...names) {
  for (const n of names) {
    if (form.elements[n]) return form.elements[n].value.trim();
  }
  return "";
}

function showStatus(text, isError) {
  formStatus.textContent = text;
  formStatus.classList.toggle("is-error", isError);
}

function openEmailApp() {
  const name = fieldValue("name", "from-name");
  const email = fieldValue("email", "from-email");
  const message = fieldValue("message");
  const subject = `Portfolio message from ${name}`;
  const body = `${message}\n\n${name}\n${email}`;
  window.location.href =
    `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  showStatus("Your email app should open now. Press send there to deliver the message.", false);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!hasKey) {
    openEmailApp();
    return;
  }

  sendButton.disabled = true;
  sendButton.textContent = "Sending...";
  showStatus("", false);

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    });
    const result = await response.json();

    if (result.success) {
      showStatus("Message sent. I'll reply to your email soon.", false);
      form.reset();
    } else {
      showStatus(`Message not sent: ${result.message}. You can email me directly instead.`, true);
    }
  } catch (error) {
    showStatus("Message not sent. Check your internet connection and try again, or email me directly.", true);
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "Send message";
  }
});

/* ---------- 6. Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();