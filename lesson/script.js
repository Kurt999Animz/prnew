// ==========================================
// 1. DOM ELEMENTS & INITIALIZATION
// ==========================================

// Interfaces
const lessonInterface = document.getElementById('lessonInterface');
const battleInterface = document.getElementById('battleInterface');
const quizInterface = document.getElementById('quizInterface'); // Make sure this ID exists in HTML

// Tabs / Navigation
const lessonTab = document.getElementById('lessonTab');
const battleTab = document.getElementById('battleTab');
const lessonTitle = document.getElementById('lessonTitle');
const lessonContent = document.getElementById('lessonContent');
const prevLesson = document.getElementById('prevLesson');
const nextLesson = document.getElementById('nextLesson');

// Battle Frame
const battleFrame = document.getElementById('battleFrame');

// Modal
const modal = document.getElementById('modal');
const modalText = document.getElementById('modalText');
const modalClose = document.getElementById('modalClose');

// Quiz Elements
const doorA = document.getElementById('doorA');
const doorB = document.getElementById('doorB');
const doorC = document.getElementById('doorC');
const quizChar = document.getElementById('quizChar');
const quizQText = document.getElementById('quizQuestion');
const textA = document.getElementById('textA');
const textB = document.getElementById('textB');
const textC = document.getElementById('textC')

// Game State
let currentLesson = 0;
let currentChallengeIndex = 0;
let battleWon = false;
let quizIndex = 0;
let quizActive = false;
let canAnswer = true;

// Damage Constants
const BASE_BUG_DAMAGE = 25;
const REDUCED_BUG_DAMAGE = 6.25;

// ==========================================
// 2. DATA (LESSONS & QUIZ)
// ==========================================

const lessonPages = [
    {
        title: "Lesson 1: HTML Structure",
        description: `
            <p>Every HTML page needs a basic structure. This tells the browser what kind of document it is and where the main content lives.</p>
            <ul>
                <li><code>&lt;!DOCTYPE html&gt;</code>: Declares it's an HTML5 document.</li>
                <li><code>&lt;html&gt;</code>: The root element.</li>
                <li><code>&lt;head&gt;</code>: Meta-information (not visible).</li>
                <li><code>&lt;body&gt;</code>: Visible content.</li>
            </ul>
            <p><b>Example:</b></p>
            <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;&lt;title&gt;Title&lt;/title&gt;&lt;/head&gt;
&lt;body&gt;&lt;p&gt;Hi!&lt;/p&gt;&lt;/body&gt;
&lt;/html&gt;</code></pre>
        `,
        challenges: [
            {
                text: "Add a <!DOCTYPE html> tag.",
                condition: (html) => /<!doctype\s+html\s*>/i.test(html)
            },
            {
                text: "Add an <html> tag with a <head> tag inside it.",
                condition: (html) => /<html\b[^>]*>.*?<head\b[^>]*>.*?<\/head>.*?<\/html>/is.test(html)
            },
            {
                text: "Add a <body> tag inside the <html> tag (after the </head>).",
                condition: (html) => /<html\b[^>]*>.*?<head\b[^>]*>.*?<\/head>.*?<body\b[^>]*>.*?<\/body>.*?<\/html>/is.test(html)
            }
        ]
    },
    {
        title: "Lesson 2: Paragraphs",
        description: `
            <p>The <code>&lt;p&gt;</code> tag defines a paragraph. It is a block-level element.</p>
            <pre><code>&lt;p&gt;Paragraph 1&lt;/p&gt;
&lt;p&gt;Paragraph 2&lt;/p&gt;</code></pre>
        `,
        challenges: [
            {
                text: "Create an empty <p> tag.",
                condition: (html) => /<p\b[^>]*>\s*<\/p>/i.test(html)
            },
            {
                text: "Add the text 'Hello World' inside your <p> tag.",
                condition: (html) => /<p\b[^>]*>.*?Hello\s+World.*?<\/p>/is.test(html)
            },
            {
                text: "Create a *second* <p> tag anywhere on the page.",
                condition: (html) => {
                    const matches = html.match(/<p\b[^>]*>.*?<\/p>/gis);
                    return matches && matches.length >= 2;
                }
            }
        ]
    },
    {
        title: "Lesson 3: Divs & Styling",
        description: `
            <p>The <code>&lt;div&gt;</code> tag is a generic container used for grouping and styling.</p>
            <pre><code>&lt;div style="background: red;"&gt;Content&lt;/div&gt;</code></pre>
            <p><b>Defeat this bug to unlock the Final Knowledge Check!</b></p>
        `,
        challenges: [
            {
                text: "Create an empty <div> element.",
                condition: (html) => /<div\b[^>]*>\s*<\/div>/is.test(html)
            },
            {
                text: "Add a style attribute to your <div> to give it a 'green' background.",
                condition: (html) => /<div\b[^>]*style\s*=\s*("|').*?background\s*:\s*green.*?\1.*?>/is.test(html)
            },
            {
                text: "Add a <p> tag *inside* your <div>.",
                condition: (html) => /<div\b[^>]*>.*?<p\b[^>]*>.*?<\/p>.*?<\/div>/is.test(html)
            }
        ]
    }
];

const quizQuestions = [
    {
        q: "Which tag is the largest heading?",
        a: "<h6>", b: "<h1>", c: "<head>",
        correct: "b"
    },
    {
        q: "Which tag links a CSS file?",
        a: "<link>", b: "<script>", c: "<style>",
        correct: "a"
    },
    {
        q: "Which tag creates a bulleted list?",
        a: "<ul>", b: "<ol>", c: "<li>",
        correct: "a"
    }
];

// ==========================================
// 3. MODAL LOGIC
// ==========================================

modalClose.onclick = () => { modal.style.display = 'none'; };
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};
function showModal(text) {
    modalText.textContent = text;
    modal.style.display = 'block';
}

// ==========================================
// 4. TAB SWITCHING LOGIC
// ==========================================

lessonTab.onclick = () => {
    lessonInterface.classList.add('active');
    battleInterface.classList.remove('active');
    if(quizInterface) quizInterface.style.display = "none"; 
};

battleTab.onclick = () => {
    lessonInterface.classList.remove('active');
    battleInterface.classList.add('active');
    if(quizInterface) quizInterface.style.display = "none";
    sendChallengeToBattle();
};

function sendChallengeToBattle() {
    if (battleFrame.contentWindow) {
        battleFrame.contentWindow.postMessage({
            type: 'loadLesson',
            challenge: lessonPages[currentLesson].challenges[currentChallengeIndex].text
        }, '*');
    }
}

// ==========================================
// 5. LESSON NAVIGATION
// ==========================================

function loadLesson(index) {
    currentLesson = index;
    currentChallengeIndex = 0;
    battleWon = false;

    const lesson = lessonPages[index];
    lessonTitle.innerHTML = lesson.title;
    lessonContent.innerHTML = lesson.description;
    
    // Notify Battle Frame
    sendChallengeToBattle();
    battleFrame.contentWindow.postMessage({ type: 'resetBattle' }, '*');
}

prevLesson.onclick = () => {
    if (currentLesson > 0) {
        loadLesson(currentLesson - 1);
    }
};
nextLesson.onclick = () => {
    if (!battleWon) {
        showModal("You must complete the challenge and defeat the bug to proceed!");
        return;
    }

    // If battleWon is TRUE, check if it was the last lesson
    if (currentLesson >= lessonPages.length - 1) {
        startQuiz(); // TRIGGER THE POP-UP QUIZ
        return;
    }

    // Normal progression: load the next lesson and reset battleWon state
    loadLesson(currentLesson + 1);
    showModal("Challenge complete! Proceeding to next lesson.");
};
// Initial Load
loadLesson(currentLesson);

// ==========================================
// 6. BATTLE COMMUNICATION
// ==========================================

window.addEventListener("message", (e) => {
    if (e.source !== battleFrame.contentWindow) return;

    if (e.data.type === "iframeLoaded") {
        sendChallengeToBattle();
    } 
    else if (e.data.type === "checkRequest") {
        const html = e.data.html;
        const condition = lessonPages[currentLesson].challenges[currentChallengeIndex].condition;

        if (condition(html)) {
            // Success: Reduce bug damage, trigger attack
            battleFrame.contentWindow.postMessage({ type: "setBugDamage", damage: REDUCED_BUG_DAMAGE }, "*");
            battleFrame.contentWindow.postMessage({ type: "checkSuccess" }, "*");
        } else {
            // Failure: Reset bug damage, trigger counter
            battleFrame.contentWindow.postMessage({ type: "setBugDamage", damage: BASE_BUG_DAMAGE }, "*");
            battleFrame.contentWindow.postMessage({ type: "checkFailure" }, "*");
        }
    } 
    else if (e.data.type === "attackComplete") {
        // Increment challenge step if available
        if (currentChallengeIndex < lessonPages[currentLesson].challenges.length - 1) {
            currentChallengeIndex++;
            sendChallengeToBattle();
        }
    }
    else if (e.data.type === "playerDied") {
        // Reset challenge on death
        battleFrame.contentWindow.postMessage({ type: "setBugDamage", damage: BASE_BUG_DAMAGE }, "*");
        currentChallengeIndex = 0;
        sendChallengeToBattle();
    }
    else if (e.data.type === "battleWon") {
        battleWon = true;
        if (currentLesson >= lessonPages.length - 1) {
            showModal("Challenge Complete! Click 'Next Lesson' to enter the Final Knowledge Check.");
        } else {
            showModal("Challenge complete! You can now go to the next lesson.");
        }
    }
});

// ==========================================
// 7. QUIZ LOGIC
// ==========================================

// ==========================================
// 7. QUIZ LOGIC
// ==========================================

// Track if the user has already guessed wrong on the current question
let currentQuestionFailed = false; 

// ==========================================
// 7. QUIZ LOGIC (FIXED)
// ==========================================



function startQuiz() {
    console.log("Starting Quiz...");

    // 1. Check if Data Exists
    if (typeof quizQuestions === 'undefined' || quizQuestions.length === 0) {
        alert("Error: quizQuestions data is missing! Check Section 2 of your code.");
        return;
    }

    quizActive = true;
    score = 0; 
    quizIndex = 0;

    // 2. Hide other interfaces
    if (lessonInterface) lessonInterface.classList.remove('active');
    if (battleInterface) battleInterface.classList.remove('active');

    // 3. Hide Footer Tabs
    if (lessonTab) lessonTab.style.display = 'none';
    if (battleTab) battleTab.style.display = 'none';
    const lessonNav = document.getElementById('lessonNav');
    if (lessonNav) lessonNav.style.display = 'none';

    // 4. Show Quiz Interface
    const quizInt = document.getElementById('quizInterface');
    if (quizInt) {
        quizInt.style.display = "flex";
        quizInt.style.flexDirection = "column";
        quizInt.style.alignItems = "center";
        
        // Ensure sub-elements are visible
        document.getElementById('quizResults').style.display = "none";
        document.getElementById('quizQuestionContainer').style.display = 'block';
        document.getElementById('doorContainer').style.display = 'flex';
        document.getElementById('quizChar').style.display = 'block';
        document.getElementById('choicesContainer').style.display = 'flex';
    } else {
        console.error("Critical Error: element #quizInterface not found in HTML.");
    }
    
    // 5. Load First Question
    loadQuestion();
}

function loadQuestion() {
    // Safety check: Stop if index is out of bounds
    if (quizIndex >= quizQuestions.length) {
        endQuiz();
        return;
    }
    
    canAnswer = true;
    currentQuestionFailed = false; 
    const currentQ = quizQuestions[quizIndex];
    
    // --- REDEFINE ELEMENTS HERE TO BE SAFE ---
    const qText = document.getElementById('quizQuestion');
    const txtA = document.getElementById('textA');
    const txtB = document.getElementById('textB');
    const txtC = document.getElementById('textC');
    const imgA = document.getElementById('doorA');
    const imgB = document.getElementById('doorB');
    const imgC = document.getElementById('doorC');
    const char = document.getElementById('quizChar');
    const counter = document.getElementById('quizCounter');

    // Update Text Content
    if (qText) qText.textContent = currentQ.q;
    if (txtA) txtA.textContent = "A: " + currentQ.a;
    if (txtB) txtB.textContent = "B: " + currentQ.b;
    if (txtC) txtC.textContent = "C: " + currentQ.c;
    if (counter) counter.textContent = `Question ${quizIndex + 1} of ${quizQuestions.length}`;

    // Reset Visuals
    if (imgA) imgA.src = "door.png";
    if (imgB) imgB.src = "door.png";
    if (imgC) imgC.src = "door.png";
    if (char) char.style.opacity = "1";
}

window.handleQuizChoice = function(choice) {
    if (!quizActive || !canAnswer) return;

    const currentQ = quizQuestions[quizIndex];
    let selectedDoorImg = document.getElementById('door' + choice.toUpperCase());
    const char = document.getElementById('quizChar');
    
    if (!selectedDoorImg) return;

    // Lock input
    canAnswer = false;
    if (char) char.style.opacity = "0"; 

    if (choice === currentQ.correct) {
        // CORRECT
        if (!currentQuestionFailed) score++;
        selectedDoorImg.src = "doorright.gif";
        setTimeout(() => {
            quizIndex++;
            loadQuestion();
        }, 2000);
    } else {
        // WRONG
        currentQuestionFailed = true;
        selectedDoorImg.src = "doorwrong.gif";
        setTimeout(() => {
            selectedDoorImg.src = "door.png";
            if (char) char.style.opacity = "1";
            canAnswer = true;
        }, 1500);
    }
};

function endQuiz() {
    quizActive = false;
    
    // Hide game elements
    document.getElementById('quizQuestionContainer').style.display = 'none';
    document.getElementById('doorContainer').style.display = 'none';
    document.getElementById('quizChar').style.display = 'none';
    document.getElementById('choicesContainer').style.display = 'none';
    document.getElementById('quizCounter').style.display = 'none';

    // Show Results
    const quizResults = document.getElementById('quizResults');
    if (quizResults) {
        quizResults.style.display = "flex";
        quizResults.innerHTML = `
            <h2>Knowledge Check Complete!</h2>
            <p>You scored <b>${score}</b> out of ${quizQuestions.length}.</p>
            <div style="display: flex; gap: 15px; margin-top: 20px;">
                <button onclick="window.restartQuiz()" style="padding: 10px;">Restart Quiz</button>
                <button onclick="window.location.href='../index.html'" style="padding: 10px;">Return Home</button>
            </div>
        `;
    }
}

window.restartQuiz = function() {
    startQuiz();
}