const slides = Array.from(document.querySelectorAll(".slide"));
const progressBar = document.getElementById("progressBar");
const slideCounter = document.getElementById("slideCounter");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const notesBtn = document.getElementById("notesBtn");
const closeNotesBtn = document.getElementById("closeNotesBtn");
const speakerNotes = document.getElementById("speakerNotes");
const notesTitle = document.getElementById("notesTitle");
const notesText = document.getElementById("notesText");
const termButtons = Array.from(document.querySelectorAll("[data-term]"));
const replayBowButtons = Array.from(document.querySelectorAll("[data-replay-bow]"));

let current = getInitialSlide();

function getInitialSlide() {
  const fromHash = Number.parseInt(window.location.hash.replace("#slide-", ""), 10);
  if (Number.isFinite(fromHash) && fromHash >= 1 && fromHash <= slides.length) {
    return fromHash - 1;
  }
  return 0;
}

function showSlide(index, updateHash = true) {
  current = Math.max(0, Math.min(index, slides.length - 1));

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === current);
  });

  const slideNumber = current + 1;
  slideCounter.textContent = `${slideNumber} / ${slides.length}`;
  progressBar.style.width = `${(slideNumber / slides.length) * 100}%`;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === slides.length - 1;
  updateNotes();
  restartBowAnimation(slides[current]);

  if (updateHash) {
    history.replaceState(null, "", `#slide-${slideNumber}`);
  }
}

function updateNotes() {
  const active = slides[current];
  const note = active.querySelector(".notes");
  notesTitle.textContent = active.dataset.title || "Speaker Notes";
  notesText.textContent = note ? note.textContent.trim() : "No notes for this slide.";
}

function move(delta) {
  showSlide(current + delta);
}

function toggleNotes(force) {
  const shouldOpen = typeof force === "boolean" ? force : speakerNotes.hidden;
  speakerNotes.hidden = !shouldOpen;
  notesBtn.setAttribute("aria-pressed", String(shouldOpen));
  if (shouldOpen) updateNotes();
}

function selectTfidfTerm(button) {
  const termLabel = document.getElementById("termLabel");
  const weightLabel = document.getElementById("weightLabel");
  const weightNeedle = document.getElementById("weightNeedle");
  const tfLabel = document.getElementById("tfLabel");
  const idfLabel = document.getElementById("idfLabel");

  termButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
  termLabel.textContent = button.dataset.term;
  weightLabel.textContent = button.dataset.label;
  tfLabel.textContent = button.dataset.tf;
  idfLabel.textContent = button.dataset.idf;
  weightNeedle.style.left = `${button.dataset.weight}%`;
}

function restartBowAnimation(scope = document) {
  const visual = scope.querySelector?.(".bow-visual");
  if (!visual) return;

  const words = Array.from(visual.querySelectorAll(".flying-words span"));
  words.forEach((word) => {
    word.style.animation = "none";
  });
  visual.offsetHeight;
  words.forEach((word) => {
    word.style.animation = "";
  });
}

prevBtn.addEventListener("click", () => move(-1));
nextBtn.addEventListener("click", () => move(1));
notesBtn.addEventListener("click", () => toggleNotes());
closeNotesBtn.addEventListener("click", () => toggleNotes(false));
termButtons.forEach((button) => button.addEventListener("click", () => selectTfidfTerm(button)));
replayBowButtons.forEach((button) => button.addEventListener("click", () => restartBowAnimation(button.closest(".slide"))));

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (["arrowright", "pagedown", " "].includes(key)) {
    event.preventDefault();
    move(1);
  }

  if (["arrowleft", "pageup", "backspace"].includes(key)) {
    event.preventDefault();
    move(-1);
  }

  if (key === "home") {
    event.preventDefault();
    showSlide(0);
  }

  if (key === "end") {
    event.preventDefault();
    showSlide(slides.length - 1);
  }

  if (key === "n") {
    event.preventDefault();
    toggleNotes();
  }

  if (key === "escape") {
    toggleNotes(false);
  }
});

window.addEventListener("hashchange", () => {
  const next = getInitialSlide();
  if (next !== current) showSlide(next, false);
});

showSlide(current, false);
