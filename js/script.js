const fullText = "My name is Hardy Amuntai. I am an Indonesian student majoring computer science at 淡江大學. With a great interest towards game & web development.";
const typingElement = document.getElementById('typingText');
const introWindow = document.getElementById('introWindow');
const aboutWindow = document.getElementById('aboutWindow');
const taskbarIntro = document.getElementById('taskbarIntro');
const taskbarAbout = document.getElementById('taskbarAbout');
const closeBtn = document.getElementById('closeBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const titleBar = document.getElementById('titleBar');
let i = 0;

// Typing animation
function typeWriter() {
    if (i < fullText.length) {
        typingElement.textContent += fullText.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
    } else {
        typingElement.classList.add('finished');
    }
}

// Start typing animation
setTimeout(typeWriter, 500);

// Clock
function updateClock() {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    document.getElementById('clock').textContent = `${hours}:${minutes} ${ampm}`;
}
updateClock();
setInterval(updateClock, 60000);

// Close intro window
closeBtn.addEventListener('click', () => {
    introWindow.classList.remove('active');
    taskbarIntro.classList.remove('visible', 'active');
});

// Minimize intro window
minimizeBtn.addEventListener('click', () => {
    introWindow.classList.remove('active');
    taskbarIntro.classList.remove('active');
});

// Restore intro window from taskbar
taskbarIntro.addEventListener('click', () => {
    if (introWindow.classList.contains('active')) {
        introWindow.classList.remove('active');
        taskbarIntro.classList.remove('active');
    } else {
        introWindow.classList.add('active');
        taskbarIntro.classList.add('active');
    }
});

// Draggable intro window
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;

titleBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    initialX = e.clientX - introWindow.offsetLeft;
    initialY = e.clientY - introWindow.offsetTop;
    introWindow.style.transform = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        introWindow.style.left = currentX + 'px';
        introWindow.style.top = currentY + 'px';
        introWindow.style.position = 'absolute';
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// Desktop Icons - Open windows
const icons = document.querySelectorAll('.desktop-icon');

icons.forEach(icon => {
    icon.addEventListener('click', function() {
        const windowType = this.dataset.window;
        
        if (windowType === 'about') {
            aboutWindow.classList.add('active');
            taskbarAbout.style.display = 'flex';
            taskbarAbout.classList.add('active');
        }
        // Add handlers for other windows (projects, contact, resume) here
    });
});

// About window controls
document.getElementById('aboutCloseBtn').addEventListener('click', function() {
    aboutWindow.classList.remove('active');
    taskbarAbout.style.display = 'none';
    taskbarAbout.classList.remove('active');
});

document.getElementById('aboutMinimizeBtn').addEventListener('click', function() {
    aboutWindow.classList.remove('active');
    taskbarAbout.classList.remove('active');
});

// Taskbar about button - toggle window
taskbarAbout.addEventListener('click', function() {
    if (aboutWindow.classList.contains('active')) {
        aboutWindow.classList.remove('active');
        taskbarAbout.classList.remove('active');
    } else {
        aboutWindow.classList.add('active');
        taskbarAbout.classList.add('active');
    }
});

// Start button (image-based container)
document.getElementById('startButton').addEventListener('click', () => {
    window.location.href = 'character-select.html';
});