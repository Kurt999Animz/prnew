const lessonInterface = document.getElementById('lessonInterface');
const battleInterface = document.getElementById('battleInterface');
const lessonTab = document.getElementById('lessonTab');
const battleTab = document.getElementById('battleTab');
const battleFrame = document.getElementById('battleFrame');

// --- Modal ---
const modal = document.getElementById('modal');
const modalText = document.getElementById('modalText');
const modalClose = document.getElementById('modalClose');
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

// --- Tab Switching ---
lessonTab.onclick = () => {
    lessonInterface.classList.add('active');
    battleInterface.classList.remove('active');
};
battleTab.onclick = () => {
    lessonInterface.classList.remove('active');
    battleInterface.classList.add('active');
    // Send current lesson challenge to iframe
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

// --- Lessons ---
const lessonPages = [
    {
        title: "Lesson 1: HTML Structure",
        description: `
            <p>Every HTML page needs a basic structure. This tells the browser what kind of document it is and where the main content lives. This includes the <code>&lt;!DOCTYPE html&gt;</code>, <code>&lt;html&gt;</code>, <code>&lt;head&gt;</code>, and <code>&lt;body&gt;</code> tags.</p>
            <ul>
                <li><code>&lt;!DOCTYPE html&gt;</code>: Declares it's an HTML5 document.</li>
                <li><code>&lt;html&gt;</code>: The root element that wraps everything.</li>
                <li><code>&lt;head&gt;</code>: Contains meta-information (like the title). Not visible on the page.</li>
                <li><code>&lt;body&gt;</code>: Contains the visible page content (text, images, etc.).</li>
            </ul>
            <p><b>Example Usage:</b></p>
            <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;title&gt;My Page Title&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;p&gt;Hello World!&lt;/p&gt;
&lt;/body&gt;
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
            <p>The <code>&lt;p&gt;</code> tag is used to define a paragraph of text. Any text between <code>&lt;p&gt;</code> and <code>&lt;/p&gt;</code> will be treated as a paragraph, with browsers typically adding some space before and after.</p>
            <p>It's a "block-level" element, meaning it takes up the full width available and starts on a new line.</p>
            <p><b>Example Usage:</b></p>
            <pre><code>&lt;p&gt;This is the first paragraph.&lt;/p&gt;
&lt;p&gt;This is the second paragraph.&lt;/p&gt;</code></pre>
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
                    const matches = html.match(/<p\b[^>]*>.*?<\/p>/gis); // 'g' = global, 'i' = case-insensitive, 's' = dotall
                    return matches && matches.length >= 2;
                }
            }
        ]
    },
    {
        title: "Lesson 3: Divs & Styling",
        description: `
            <p>The <code>&lt;div&gt;</code> tag is a generic container. It's used to group other elements together. It doesn't do anything by itself, but it's a fundamental building block for layout and styling.</p>
            <p>You can apply styles to it using the <code>style</code> attribute, which takes CSS (Cascading Style Sheets) rules. For example, <code>style="background: green;"</code>.</p>
            <p><b>Example Usage:</b></p>
            <pre><code>&lt;!-- A div with a red background, containing a paragraph --&gt;
&lt;div style="background: red; padding: 10px;"&gt;
  &lt;p&gt;This text is inside a styled div.&lt;/p&gt;
&lt;/div&gt;</code></pre>
        `,
        challenges: [
            {
                text: "Create an empty <div> element.",
                condition: (html) => /<div\b[^>]*>\s*<\/div>/is.test(html)
            },
            {
                text: "Add a style attribute to your <div> to give it a 'green' background.",
                // This regex handles single or double quotes around the style attribute value
                condition: (html) => /<div\b[^>]*style\s*=\s*("|').*?background\s*:\s*green.*?\1.*?>/is.test(html)
            },
            {
                text: "Add a <p> tag *inside* your <div>.",
                condition: (html) => /<div\b[^>]*>.*?<p\b[^>]*>.*?<\/p>.*?<\/div>/is.test(html)
            }
        ]
    }
];
let currentLesson = 0;
let currentChallengeIndex = 0;
let battleWon = false;

const lessonTitle = document.getElementById('lessonTitle');
const lessonContent = document.getElementById('lessonContent');
const prevLesson = document.getElementById('prevLesson');
const nextLesson = document.getElementById('nextLesson');

function loadLesson(index) {
    currentLesson = index;
    currentChallengeIndex = 0; // Reset challenge progress for the lesson
    battleWon = false; // Reset battle win status

    const lesson = lessonPages[index];
    lessonTitle.innerHTML = lesson.title;
    lessonContent.innerHTML = lesson.description;
    
    // Send new lesson challenge to battle frame
    sendChallengeToBattle();
    
    // Also reset the battle frame's health etc.
    battleFrame.contentWindow.postMessage({ type: 'resetBattle' }, '*');
}
loadLesson(currentLesson); // Load initial lesson

prevLesson.onclick = () => {
    if (currentLesson > 0) {
        loadLesson(currentLesson - 1);
    }
};
nextLesson.onclick = () => {
    if (currentLesson >= lessonPages.length - 1) {
        showModal("You have completed all lessons!");
        return;
    }

    if (battleWon) {
        loadLesson(currentLesson + 1);
        showModal("Challenge complete! Proceeding to next lesson. The bug has respawned.");
    } else {
        showModal("You must complete the challenge and defeat the bug to proceed!");
    }
};

// Damage constants
const BASE_BUG_DAMAGE = 25;
const REDUCED_BUG_DAMAGE = 6.25; // 25 * 0.25

// --- Listen for messages from battle iframe ---
window.addEventListener("message", (e) => {
    // Ensure message is from the iframe
    if (e.source !== battleFrame.contentWindow) return;

    if (e.data.type === "iframeLoaded") {
        // When iframe is ready, send the first lesson challenge
        sendChallengeToBattle();
    } 
    else if (e.data.type === "checkRequest") {
        // Iframe is asking us to check the code
        const html = e.data.html;
        const condition = lessonPages[currentLesson].challenges[currentChallengeIndex].condition;

        if (condition(html)) {
            // 1. Reduce bug damage by 75% for the counter-attack
            battleFrame.contentWindow.postMessage({ type: "setBugDamage", damage: REDUCED_BUG_DAMAGE }, "*");
            
            // 2. Tell battle frame it was a success and to attack
            battleFrame.contentWindow.postMessage({ type: "checkSuccess" }, "*");
        } else {
            // 1. Ensure bug does full damage on failure
            battleFrame.contentWindow.postMessage({ type: "setBugDamage", damage: BASE_BUG_DAMAGE }, "*");
            
            // 2. Tell battle frame it failed and to counter-attack
            battleFrame.contentWindow.postMessage({ type: "checkFailure" }, "*");
        }
    } 
    else if (e.data.type === "attackComplete") {
        // Player's attack animation finished, bug is still alive
        
        // --- FIX: That line that reset the damage to BASE_BUG_DAMAGE was removed. ---
        // The bug's damage will now STAY reduced (6.25) until the user gets an answer wrong.
        
        // Move to the next challenge step
        if (currentChallengeIndex < lessonPages[currentLesson].challenges.length - 1) {
            currentChallengeIndex++;
            sendChallengeToBattle();
        }
    }
    else if (e.data.type === "playerDied") {
        // Player was defeated, reset to the first challenge of this lesson
        
        // Reset bug damage to full power
        battleFrame.contentWindow.postMessage({ type: "setBugDamage", damage: BASE_BUG_DAMAGE }, "*");

        currentChallengeIndex = 0;
        sendChallengeToBattle();
    }
    else if (e.data.type === "battleWon") {
        battleWon = true;
        showModal("Challenge complete! You can now go to the next lesson.");
    }
});