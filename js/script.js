const fullText = "My name is Hardy Amuntai. I am an Indonesian student majoring computer science at 淡江大學. With a great interest towards game & web development.";
const typingElement = document.getElementById('typingText');
const introWindow = document.getElementById('introWindow');
const taskbarWindow = document.getElementById('taskbarWindow');
const closeBtn = document.getElementById('closeBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const titleBar = document.getElementById('titleBar');
let i = 0;

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

// Close window
closeBtn.addEventListener('click', () => {
    introWindow.classList.remove('active');
    taskbarWindow.classList.remove('active');
});

// Minimize window
minimizeBtn.addEventListener('click', () => {
    introWindow.classList.remove('active');
    taskbarWindow.classList.remove('active');
});

// Restore window from taskbar
taskbarWindow.addEventListener('click', () => {
    if (introWindow.classList.contains('active')) {
        introWindow.classList.remove('active');
        taskbarWindow.classList.remove('active');
    } else {
        introWindow.classList.add('active');
        taskbarWindow.classList.add('active');
    }
});

// Draggable window
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;

titleBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    initialX = e.clientX - introWindow.offsetLeft;
    initialY = e.clientY - introWindow.offsetTop;
    introWindow.style.transform = 'none'; // Prevent transform conflict
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        introWindow.style.left = currentX + 'px';
        introWindow.style.top = currentY + 'px';
        introWindow.style.position = 'absolute'; // Ensure absolute positioning
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// Start button (image-based container)
document.getElementById('startButton').addEventListener('click', () => {
    window.location.href = 'character-select.html';
});

// Desktop Icons Navigation
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', function() {
        const href = this.getAttribute('data-href');
        if (href) {
            window.location.href = href;
        }
    });
});