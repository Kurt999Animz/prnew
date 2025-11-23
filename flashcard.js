// --- CONFIGURATION & DATA ---
const lessonsData = [
  {
    title: "HTML Basics",
    cards: [
      { q: "What does HTML stand for?", a: "Hypertext Markup Language" },
      { q: "Which tag is used for paragraphs?", a: "<p> tag" },
      { q: "What is the largest heading tag?", a: "<h1>" },
      { q: "Which tag creates a line break?", a: "<br>" },
      { q: "What attribute defines a link address?", a: "href" },
    ]
  },
  {
    title: "CSS Styling",
    cards: [
      { q: "What does CSS stand for?", a: "Cascading Style Sheets" },
      { q: "Which property changes text color?", a: "color" },
      { q: "How do you select an ID in CSS?", a: "#idName" },
      { q: "How do you select a class in CSS?", a: ".className" },
      { q: "What defines the space outside the border?", a: "margin" },
    ]
  }
];

// --- STATE MANAGEMENT ---
let currentLessonIndex = 0;
let currentCardIndex = 0;
let correctCount = 0;
let reviewedCount = 0;

// --- DOM ELEMENTS ---
const cardElement = document.getElementById('flashcard');
const frontText = document.getElementById('cardFrontText');
const backText = document.getElementById('cardBackText');
const lessonTitle = document.getElementById('currentLessonDisplay');
const progressBar = document.getElementById('progressBar');
const scoreDisplay = document.getElementById('scoreDisplay');
const progressDisplay = document.getElementById('progressDisplay');
const modal = document.getElementById('completionModal');

// --- INITIALIZATION ---
function init() {
  loadLesson(0);
  attachEventListeners();
}

function loadLesson(index) {
  currentLessonIndex = index;
  currentCardIndex = 0;
  correctCount = 0;
  reviewedCount = 0;
  
  // Reset UI
  cardElement.classList.remove('is-flipped');
  modal.style.display = 'none';
  updateStats();
  renderCard();
  
  lessonTitle.textContent = `${lessonsData[currentLessonIndex].title}`;
}

function renderCard() {
  const lesson = lessonsData[currentLessonIndex];
  const card = lesson.cards[currentCardIndex];
  
  // Remove animation classes to reset
  cardElement.classList.remove('swipe-left', 'swipe-right', 'fade-in');
  void cardElement.offsetWidth; // Trigger reflow to restart animation capability
  cardElement.classList.add('fade-in');

  // Update text
  frontText.textContent = card.q;
  backText.textContent = card.a;
}

function handleAnswer(isCorrect) {
  reviewedCount++;
  if (isCorrect) correctCount++;
  
  // Animate
  const animationClass = isCorrect ? 'swipe-right' : 'swipe-left';
  cardElement.classList.add(animationClass);

  updateStats();

  // Wait for animation, then load next
  setTimeout(() => {
    cardElement.classList.remove('is-flipped'); // Reset flip
    nextCard();
  }, 300);
}

function nextCard() {
  const totalCards = lessonsData[currentLessonIndex].cards.length;
  currentCardIndex++;

  if (currentCardIndex >= totalCards) {
    showCompletionModal();
  } else {
    renderCard();
  }
}

function updateStats() {
  const totalCards = lessonsData[currentLessonIndex].cards.length;
  const percentage = reviewedCount === 0 ? 0 : Math.round((correctCount / reviewedCount) * 100);
  
  scoreDisplay.textContent = `${percentage}%`;
  progressDisplay.textContent = `${currentCardIndex} / ${totalCards}`;
  progressBar.style.width = `${(currentCardIndex / totalCards) * 100}%`;
}

function showCompletionModal() {
  const percentage = Math.round((correctCount / reviewedCount) * 100);
  document.getElementById('finalScore').textContent = `${percentage}%`;
  modal.style.display = 'flex';
}

function flipCard() {
  cardElement.classList.toggle('is-flipped');
}

// --- EVENT LISTENERS ---
function attachEventListeners() {
  // Click to Flip
  cardElement.addEventListener('click', flipCard);

  // Buttons
  document.getElementById('btn-fail').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent flip when clicking button
    handleAnswer(false);
  });
  document.getElementById('btn-pass').addEventListener('click', (e) => {
    e.stopPropagation();
    handleAnswer(true);
  });

  // Lesson Navigation
  document.getElementById('nextLesson').addEventListener('click', () => {
    let next = currentLessonIndex + 1;
    if (next >= lessonsData.length) next = 0; // Loop back to start
    loadLesson(next);
  });

  document.getElementById('prevLesson').addEventListener('click', () => {
    let prev = currentLessonIndex - 1;
    if (prev < 0) prev = lessonsData.length - 1;
    loadLesson(prev);
  });

  // Modal Buttons
  document.getElementById('restartBtn').addEventListener('click', () => loadLesson(currentLessonIndex));
  document.getElementById('nextLessonModalBtn').addEventListener('click', () => {
    let next = currentLessonIndex + 1;
    if (next >= lessonsData.length) next = 0;
    loadLesson(next);
  });

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'flex') return; // Disable keys if modal is open

    if (e.code === 'Space') {
      e.preventDefault(); // Stop page scroll
      flipCard();
    } else if (e.code === 'ArrowLeft') {
      handleAnswer(false);
    } else if (e.code === 'ArrowRight') {
      handleAnswer(true);
    }
  });
}

// Run
document.addEventListener('DOMContentLoaded', init);