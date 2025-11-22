const fullText = "My name is Hardy Amuntai. I am an Indonesian student majoring computer science at 淡江大學. With a great interest towards game & web development.";
const typingElement = document.getElementById('typingText');
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

// Start typing animation after a brief delay
setTimeout(typeWriter, 500);

// Button click to go to another page
document.getElementById('startButton').addEventListener('click', function() {
    window.location.href = 'nextpage.html';
});