// ===== DOM Elements =====
const fullText = "My name is Hardy Amuntai. I am an Indonesian student majoring computer science at 淡江大學. With a great interest towards game & web development.";
const typingElement = document.getElementById('typingText');
const introWindow = document.getElementById('introWindow');
const aboutWindow = document.getElementById('aboutWindow');
const projectsWindow = document.getElementById('projectsWindow');
const contactsWindow = document.getElementById('contactsWindow');

const taskbarIntro = document.getElementById('taskbarIntro');
const taskbarAbout = document.getElementById('taskbarAbout');
const taskbarProjects = document.getElementById('taskbarProjects');
const taskbarContacts = document.getElementById('taskbarContacts');

const closeBtn = document.getElementById('closeBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const titleBar = document.getElementById('titleBar');

const aboutCloseBtn = document.getElementById('aboutCloseBtn');
const aboutMinimizeBtn = document.getElementById('aboutMinimizeBtn');
const aboutTitleBar = document.getElementById('aboutTitleBar');

const projectsCloseBtn = document.getElementById('projectsCloseBtn');
const projectsMinimizeBtn = document.getElementById('projectsMinimizeBtn');
const projectsTitleBar = document.getElementById('projectsTitleBar');

const contactsCloseBtn = document.getElementById('contactsCloseBtn');
const contactsMinimizeBtn = document.getElementById('contactsMinimizeBtn');
const contactsTitleBar = document.getElementById('contactsTitleBar');

const bgColorPicker = document.getElementById('bgColorPicker');
const applyBgBtn = document.getElementById('applyBg');

const startButton = document.querySelector('.start-button');
const startMenu = document.getElementById('startMenu');
const desktop = document.querySelector('.desktop');

let i = 0;

// ===== Typing Animation =====
function typeWriter() {
    if (i < fullText.length) {
        typingElement.textContent += fullText.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
    } else {
        typingElement.classList.add('finished');
    }
}
setTimeout(typeWriter, 500);

// ===== Clock =====
function updateClock() {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    document.getElementById('clock').textContent = `${hours}:${minutes} ${ampm}`;
}
updateClock();
setInterval(updateClock, 60000);

// ===== Window Management Helpers =====
function openWindow(windowEl, taskbarBtn) {
    windowEl.classList.add('active');
    if (taskbarBtn) {
        taskbarBtn.style.display = 'flex';
        taskbarBtn.classList.add('active');
    }
}

function minimizeWindow(windowEl, taskbarBtn) {
    windowEl.classList.remove('active');
    if (taskbarBtn) taskbarBtn.classList.remove('active');
}

function closeWindow(windowEl, taskbarBtn) {
    windowEl.classList.remove('active');
    if (taskbarBtn) {
        taskbarBtn.classList.remove('active');
        taskbarBtn.style.display = 'none';
    }
}

// ===== Event Listeners =====

// Intro
closeBtn?.addEventListener('click', () => CloseWindow(introWindow, taskbarIntro));
minimizeBtn?.addEventListener('click', () => minimizeWindow(introWindow, taskbarIntro));
taskbarIntro?.addEventListener('click', () => {
    introWindow.classList.contains('active') ? minimizeWindow(introWindow, taskbarIntro) : openWindow(introWindow, taskbarIntro);
});

// About
aboutCloseBtn?.addEventListener('click', () => closeWindow(aboutWindow, taskbarAbout));
aboutMinimizeBtn?.addEventListener('click', () => minimizeWindow(aboutWindow, taskbarAbout));
taskbarAbout?.addEventListener('click', () => {
    aboutWindow.classList.contains('active') ? minimizeWindow(aboutWindow, taskbarAbout) : openWindow(aboutWindow, taskbarAbout);
});

// Projects
projectsCloseBtn?.addEventListener('click', () => closeWindow(projectsWindow, taskbarProjects));
projectsMinimizeBtn?.addEventListener('click', () => minimizeWindow(projectsWindow, taskbarProjects));
taskbarProjects?.addEventListener('click', () => {
    projectsWindow.classList.contains('active') ? minimizeWindow(projectsWindow, taskbarProjects) : openWindow(projectsWindow, taskbarProjects);
});

// Contacts
contactsCloseBtn?.addEventListener('click', () => closeWindow(contactsWindow, taskbarContacts));
contactsMinimizeBtn?.addEventListener('click', () => minimizeWindow(contactsWindow, taskbarContacts));
taskbarContacts?.addEventListener('click', () => {
    contactsWindow.classList.contains('active') ? minimizeWindow(contactsWindow, taskbarContacts) : openWindow(contactsWindow, taskbarContacts);
});

// Desktop Icons
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const type = icon.dataset.window;
        if (type === 'about') openWindow(aboutWindow, taskbarAbout);
        else if (type === 'projects') openWindow(projectsWindow, taskbarProjects);
        else if (type === 'contact') openWindow(contactsWindow, taskbarContacts);
    });
});

// Start Button
document.getElementById('arcadeStartIcon')?.addEventListener('click', () => {
    window.location.href = 'character-select.html';
});
document.getElementById('ResumeIcon')?.addEventListener('click', () => {
    window.location.href = 'resume.html';
});

// ===== DRAG SYSTEM — FIXED (no jump, ignores buttons) =====
function makeWindowDraggable(windowEl, titleBarEl) {
    if (!windowEl || !titleBarEl) return;

    let isDragging = false;
    let offsetX, offsetY;

    titleBarEl.addEventListener('mousedown', (e) => {
        // Ignore if clicked on a button
        if (e.target.closest('.title-bar-btn')) return;

        isDragging = true;
        const rect = windowEl.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        windowEl.style.position = 'absolute';
        windowEl.style.transform = 'none';
        windowEl.style.left = rect.left + 'px';
        windowEl.style.top = rect.top + 'px';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        windowEl.style.left = (e.clientX - offsetX) + 'px';
        windowEl.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}
applyBgBtn.addEventListener('click', () => {
    desktop.style.backgroundColor = bgColorPicker.value;
    // Optional: save to localStorage
    localStorage.setItem('desktopBg', bgColorPicker.value);
    startMenu.style.display = 'none'; // auto-close after apply
});
window.addEventListener('load', () => {
    const savedBg = localStorage.getItem('desktopBg');
    if (savedBg) {
        desktop.style.backgroundColor = savedBg;
        bgColorPicker.value = savedBg; // sync picker UI
    }
});
startButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (startMenu.style.display === 'block') {
        startMenu.style.display = 'none';
    } else {
        startMenu.style.display = 'block';
    }
});

// Close Start Menu when clicking anywhere else
document.addEventListener('click', () => {
    startMenu.style.display = 'none';
});

// Prevent closing when clicking inside the menu
startMenu?.addEventListener('click', (e) => {
    e.stopPropagation();
});
// Initialize all draggable windows
makeWindowDraggable(introWindow, titleBar);
makeWindowDraggable(aboutWindow, aboutTitleBar);
makeWindowDraggable(projectsWindow, projectsTitleBar);
makeWindowDraggable(contactsWindow, contactsTitleBar);