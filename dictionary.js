// --- DATA SOURCE ---
// "isLocked" logic: false = Unlocked (Readable), true = Locked (Grayed out)
const termsDB = [
    // --- UNLOCKED CONTENT (Per Request) ---
    { 
        id: "html-struct", 
        term: "HTML Structure", 
        category: "Concept",
        def: "The foundational skeleton of a webpage. It consists of the <!DOCTYPE>, <html>, <head>, and <body> tags properly nested.",
        syntax: "<!DOCTYPE html>\n<html>\n  <head>...</head>\n  <body>...</body>\n</html>",
        isLocked: false 
    },
    { 
        id: "p-tag", 
        term: "<p> Paragraph", 
        category: "Element",
        def: "The <p> element defines a paragraph. Browsers automatically add a margin (whitespace) before and after a <p> element.",
        syntax: "<p>This is a paragraph of text.</p>",
        isLocked: false 
    },
    { 
        id: "div-tag", 
        term: "<div> Division", 
        category: "Element",
        def: "The <div> tag is a container unit that encapsulates other page elements and divides the HTML document into sections. It is purely structural.",
        syntax: "<div class='container'>\n  <p>Content inside a div</p>\n</div>",
        isLocked: false 
    },
    { 
        id: "btn-tag", 
        term: "Button", 
        category: "Element",
        def: "The <button> tag defines a clickable button. Inside a <button> element you can put text (and tags like <i>, <b>, <strong>, <br>, <img>, etc.).",
        syntax: "<button onclick='alert()'>Click Me</button>",
        isLocked: false 
    },

    // --- LOCKED CONTENT (Future Lessons) ---
    { id: "img", term: "<img> Image", category: "Element", def: "Hidden", syntax: "", isLocked: true },
    { id: "a", term: "<a> Anchor", category: "Element", def: "Hidden", syntax: "", isLocked: true },
    { id: "css", term: "CSS Selectors", category: "Style", def: "Hidden", syntax: "", isLocked: true },
    { id: "flex", term: "Flexbox", category: "Layout", def: "Hidden", syntax: "", isLocked: true },
    { id: "grid", term: "CSS Grid", category: "Layout", def: "Hidden", syntax: "", isLocked: true },
    { id: "js-var", term: "JS Variables", category: "Scripting", def: "Hidden", syntax: "", isLocked: true },
    { id: "js-func", term: "JS Functions", category: "Scripting", def: "Hidden", syntax: "", isLocked: true },
];

// --- ELEMENTS ---
const termListEl = document.getElementById('termList');
const searchInput = document.getElementById('searchInput');

// Viewer Elements
const defTitle = document.getElementById('defTitle');
const defCategory = document.getElementById('defCategory');
const defDescription = document.getElementById('defDescription');
const codeBlock = document.getElementById('codeBlock');
const defSyntax = document.getElementById('defSyntax');

// --- INIT ---
function init() {
    renderList(termsDB);
    
    // Select the first unlocked item by default
    const firstUnlocked = termsDB.find(t => !t.isLocked);
    if(firstUnlocked) loadDefinition(firstUnlocked.id);
}

// --- RENDER LIST ---
function renderList(data) {
    termListEl.innerHTML = ''; // Clear current list

    data.forEach(item => {
        const li = document.createElement('li');
        li.className = `term-item ${item.isLocked ? 'locked' : ''}`;
        li.dataset.id = item.id;
        
        // Icon logic
        const icon = item.isLocked ? '🔒' : '';
        
        li.innerHTML = `
            <span>${item.term}</span>
            <span class="lock-icon">${icon}</span>
        `;

        // Click Handler
        li.addEventListener('click', () => handleTermClick(li, item));

        termListEl.appendChild(li);
    });
}

// --- INTERACTIONS ---
function handleTermClick(element, item) {
    if (item.isLocked) {
        // Shake animation for locked items
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 400);
        return;
    }

    // Highlight active
    document.querySelectorAll('.term-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    loadDefinition(item.id);
}

function loadDefinition(id) {
    const item = termsDB.find(t => t.id === id);
    if (!item) return;

    // Fade effect logic
    const card = document.getElementById('definitionCard');
    card.style.opacity = '0';
    card.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        defTitle.textContent = item.term;
        defCategory.textContent = item.category;
        defDescription.textContent = item.def;
        
        if (item.syntax) {
            codeBlock.style.display = 'block';
            defSyntax.textContent = item.syntax;
        } else {
            codeBlock.style.display = 'none';
        }

        // Fade in
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 200);
}

// --- SEARCH FILTER ---
searchInput.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase();
    
    const filtered = termsDB.filter(item => 
        item.term.toLowerCase().includes(value)
    );
    
    renderList(filtered);
});

// Run
document.addEventListener("DOMContentLoaded", init);