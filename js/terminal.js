// ── BOOT SEQUENCE ──────────────────────────────────────────
(function () {
    const bootScreen = document.getElementById('boot-screen');
    const bootLog    = document.getElementById('boot-log');
    const barFill    = document.getElementById('boot-bar-fill');
    const barPercent = document.getElementById('boot-bar-percent');
    const bootReady  = document.getElementById('boot-ready');

    const logs = [
        { text: '[  OK  ] Initializing kernel...........v5.15.0-oddyseus',  cls: 'log-ok',   delay: 300  },
        { text: '[  OK  ] Loading hardware drivers',                         cls: 'log-ok',   delay: 600  },
        { text: '[ INFO ] CPU: detected logical cores',                    cls: 'log-info', delay: 900  },
        { text: '[  OK  ] Mounting filesystem /dev/sda1',                    cls: 'log-ok',   delay: 1200 },
        { text: '[ WARN ] Legacy BIOS detected — switching to UEFI shim',   cls: 'log-warn', delay: 1600 },
        { text: '[  OK  ] Network interface eth0 UP',                        cls: 'log-ok',   delay: 2000 },
        { text: '[ INFO ] Resolving host: Haitdyckler.github.io',            cls: 'log-info', delay: 2400 },
        { text: '[  OK  ] Terminal Hub service started',                     cls: 'log-ok',   delay: 2900 },
        { text: '[  OK  ] Globe renderer initialised',                       cls: 'log-ok',   delay: 3300 },
        { text: '[  OK  ] All systems nominal — launching shell',            cls: 'log-ok',   delay: 3800 },
    ];

    // Print log lines
    logs.forEach(({ text, cls, delay }) => {
        setTimeout(() => {
            const span = document.createElement('span');
            span.className = 'log-line ' + cls;
            span.textContent = text;
            bootLog.appendChild(span);
        }, delay);
    });

    // Animate progress bar over ~4.5 s
    const totalDuration = 4500;
    const startTime = performance.now();

    function animateBar(now) {
        const elapsed = now - startTime;
        const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
        barFill.style.width = pct + '%';
        barPercent.textContent = pct + '%';
        if (pct < 100) {
            requestAnimationFrame(animateBar);
        } else {
            // Show "press any key"
            setTimeout(() => {
                bootReady.style.display = 'block';
                document.addEventListener('keydown', dismissBoot, { once: true });
                document.addEventListener('click',   dismissBoot, { once: true });
                // Auto-dismiss after 5 s of inactivity
                setTimeout(dismissBoot, 3000);
            }, 300);
        }
    }
    requestAnimationFrame(animateBar);

    function dismissBoot() {
        bootScreen.classList.add('fade-out');
        setTimeout(() => bootScreen.remove(), 800);
    }
})();
// ── END BOOT SEQUENCE ──────────────────────────────────────
// Terminal State
let commandHistory = [];
let historyIndex = -1;
let gameActive = false;
let gameStartTime = null;
let gameText = '';
let currentInput = '';
let correctChars = 0;
let totalChars = 0;
let gameInterval = null;

const sampleTexts = [
    "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump! The five boxing wizards jump quickly.",
    "Sphinx of black quartz, judge my vow. The quick brown fox jumps over a lazy dog.",
    "Amazingly few discotheques provide jukeboxes. Quick zephyrs blow, vexing daft Jim.",
    "Waltz, bad nymph, for quick jigs vex. Glib jocks quiz nymph to vex dwarf."
];

const earthTextureRaw = [
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#++--..:-=*#**#+=..     :=%%##@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@%##:#%+*#=+-+:.  =#:                   -@@@@@@@@@@@#- =-+@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%*+=-#@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@#---*%%-#*:= :--==.%@@@@@@@            :=@@@@@@@@@@@@@@@@@@@@@@@@@@%.#@@@@#@%@#+==--=--=++=**#%+#@@@@%#@@@@@@@@@@@@@@@@",
    "#%@@@%*==++++++******+=+*+++*+**+++*#=#*+=-.#@@@@#          *@@@@@@@@@@@@@@@#*+**#*#%%@%%#%##*+**+#*+++*+*+++++++++++***++*+=++******++++==+",
    "@@#%@#*****+++*****++*###***++***++#**#%##+==@@@@@    #@@@@@@#+=%@@@@@@@@%#*#%%#####%########**#*####**#******************+++++++++++++++++*",
    "@@@@@@%**+##@@%#.:**####*#*#*****%@@@@@%*++%*#@@@@@@@@@@@@@@@@@@@@@@%@@@*#%##@@######*##****###################*##***********%%%%#@@*%@@@@@@",
    "@@@@@@%@@@@@@@@@@@@*#%##****##########@#*##*#*#%@@@@@@@@@@@@@@@@@@%*#*@@@*#%%#+**+**++*+++++*++++++=+++***##**#*#*********#%@@@@@@#*#@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@%####*:.:==+*#####**###%%%%%%@@@@@@@@@@@@@@@@@@@##+=++**+*++++++++==-----:.::---:-++=:.==+++*+--=*++****%%@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@*==+=-:--=++**###****##%@@@@@@@@@@@@@@@@@@@@@@@#++**+#++++=#%##+=:+*          :-:            .=:=**+#@@%@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@*.. -:+:-=+++++++**%@@@@@@@@@@@@@@@@@@@@@@@@%=:-%@@*@%+#+#++-:====-*+     .:-.             .:++***@@@@#@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@%-  . :::-=++++**+%@@@@@@@@@@@@@@@@@@@@@@@@@@#*+.   #@@@@%@%%%      .      -=.        .-::==+=*@@*%%%##@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@%-.:   -=**#**#@@@@@@@@@@@@@@@@@@@@@@@@@@@.          :   ..               .==. ..--=+*++*+=+++@@%@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@%+*+  .#@@@@@*#@@@@@@@@@@@@@@@@@@@@@@@@                   +      %+.       .:.:-+=+++++*+**#@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@+-=%@@#@%%*%%%@@@@@@@@@@@@@@@@@@@@                     +        %@@@-.:::.-+#=-===++#@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#****%@@@@@@@@@@@@@@@@@@@@@@@@@@+                     #-    *@@@@@@*. =%@@@#===-*@@@@%#@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@**@@@#*%@@@@@@@@@@@@@@@@@@@*===-:.:.   ..-:  ::==-:%%*@@@@@@@@@+:%@@@@@@+%+=#@@@@%#@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%+++=++*%@@@@@@@@@@@@@@@@@*+===----+++****+++==   *@@@@@@@@@@@*@@@@@@%%@@@@@%@%*@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#++**#*+***#@@@@@@@@@@@@@@@@@@@@@@%++#**##*+-..:-%@@@@@@@@@@@@@@@@@@@**%@@###@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#+**######*****#%@@@@@@@@@@@@@@@@@@%*+*####+*=--@@@@@@@@@@@@@@@@@@@@@@@#*#%**%%%@@%%%#%@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%+#########*++++=-#@@@@@@@@@@@@@@@@@@+*+*++#+=+%@@@@@@@@@@@@@@@@@@@@@@@@@##*@@@@@@@@%%*+*%@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@=###******+=+==#@@@@@@@@@@@@@@@@@@@*+*****+*+*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*#@@#@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@+:-***++====++@@@@@@@@@@@@@@@@@@@+---===+=+*#@*=%@@@@@@@@@@@@@@@@@@@@@@@@@@@%=:--=+*=*@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@* :++++==+=+%@@@@@@@@@@@@@@@@@@@@::...--=*@@@=*@@@@@@@@@@@@@@@@@@@@@@@@@%=:...:::...-=%@@@@@%@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*.=+*+++*@@@@@@@@@@@@@@@@@@@@@@@@*   :--+@@@@%@@@@@@@@@@@@@@@@@@@@@@@@@@-.------.   -==#@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@=:====++%@@@@@@@@@@@@@@@@@@@@@@@@@%:.:-+@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@-==--=-.  .--+%@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@:-==++%@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%@@@@@@#==-+%@@@@@@@@%@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#=-=+@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@+--#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@**@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@% :+@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#-=%@@@@@@@@@@#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%**%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%++  :@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@#*+@#           =#%-                            -+#@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@#**#%%@@@%       *+.      :@@@@@@@@@@@@@@%                                :+=                                      -@@@@",
    "==+***=-                                  ....::---+===++.                                                                          .--   .-",
    "          ........                    ..... ..:::   .:-:..                                                                          ....    ",
    "                                                                                                                                            "
];

// Convert ASCII art to binary texture (@ and # are land)
const earthTexture = earthTextureRaw.map(row => {
    return row.split('').map(char => {
        return (char === '@' || char === '#') ? '1' : '0';
    }).join('');
});

const globeWidth = 120;
const globeHeight = 60;
const globeRadius = 30;
const aspectRatio = 2;

let rotation = 0;
let rotationSpeed = 0.02;
let autoRotate = true;
let verticalRotation = 0;
let zoom = 1;

const chars = ['.', ':', '-', '=', '+', '*', '#', '%', '@'];

function getTextureValue(u, v) {
    const textureHeight = earthTexture.length;
    const textureWidth = earthTexture[0].length;
    
    u = ((u % 1) + 1) % 1;
    v = Math.max(0, Math.min(0.999, v));
    
    const x = Math.floor(u * textureWidth);
    const y = Math.floor(v * textureHeight);
    
    return earthTexture[y]?.[x] === '1';
}

function renderGlobe() {
    let output = '';
    
    for (let j = 0; j < globeHeight; j++) {
        for (let i = 0; i < globeWidth; i++) {
            const x = (i - globeWidth / 2) / (globeRadius * zoom);
            const y = -(j - globeHeight / 2) / (globeRadius * zoom) * aspectRatio;
            
            const distSquared = x * x + y * y;
            
            if (distSquared <= 1) {
                const z = Math.sqrt(1 - distSquared);
                
                const rotY = Math.cos(verticalRotation) * y - Math.sin(verticalRotation) * z;
                const rotZ = Math.sin(verticalRotation) * y + Math.cos(verticalRotation) * z;
                
                const theta = Math.atan2(x, rotZ) + rotation;
                const phi = Math.acos(Math.max(-1, Math.min(1, rotY)));
                
                const u = (theta / (2 * Math.PI) + 0.5) % 1;
                const v = phi / Math.PI;
                
                const isLand = getTextureValue(u, v);
                const luminance = Math.max(0, rotZ);
                
                const edgeFactor = 1 - Math.sqrt(distSquared);
                const adjustedLuminance = luminance * (0.3 + 0.7 * edgeFactor);
                
                let charIndex;
                if (isLand) {
                    charIndex = Math.floor(adjustedLuminance * (chars.length - 1));
                    charIndex = Math.max(3, Math.min(chars.length - 1, charIndex));
                } else {
                    charIndex = Math.floor(adjustedLuminance * (chars.length - 1));
                    charIndex = Math.max(0, Math.min(4, charIndex));
                }
                
                output += chars[charIndex];
            } else if (distSquared <= 1.05) {
                output += '.';
            } else {
                output += ' ';
            }
        }
        output += '\n';
    }
    
    document.getElementById('globe-container').textContent = output;
    
    if (autoRotate) {
        rotation += rotationSpeed;
    }
}

setInterval(renderGlobe, 50);

function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('time-display').textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateTime, 1000);
updateTime();

// Terminal functions
const output = document.getElementById('output');
const input = document.getElementById('terminal-input');

function print(text, className = '') {
    const line = document.createElement('div');
    line.className = 'output-line ' + className;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function printHTML(html) {
    const line = document.createElement('div');
    line.className = 'output-line';
    line.innerHTML = html;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function clear() {
    output.innerHTML = '';
}

function startTypingTest() {
    gameActive = true;
    gameText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    currentInput = '';
    correctChars = 0;
    totalChars = 0;
    gameStartTime = Date.now();

    clear();
    print('=== TYPING SPEED TEST ===', 'success');
    print('');
    print('Type the following text as fast and accurately as possible:');
    print('');
    
    const textContainer = document.createElement('div');
    textContainer.className = 'typing-text';
    textContainer.id = 'typing-display';
    textContainer.textContent = gameText;
    output.appendChild(textContainer);

    const inputContainer = document.createElement('div');
    inputContainer.innerHTML = '<input type="text" id="typing-input" class="typing-input" autofocus placeholder="Start typing...">';
    output.appendChild(inputContainer);

    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats';
    statsContainer.innerHTML = `
        <div class="stat-item">
            <div class="stat-label">WPM</div>
            <div class="stat-value" id="live-wpm">0</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Accuracy</div>
            <div class="stat-value" id="live-accuracy">100%</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Time</div>
            <div class="stat-value" id="live-time">0s</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Characters</div>
            <div class="stat-value" id="live-chars">0/${gameText.length}</div>
        </div>
    `;
    output.appendChild(statsContainer);

    const typingInput = document.getElementById('typing-input');
    typingInput.focus();

    gameInterval = setInterval(updateGameStats, 100);

    typingInput.addEventListener('input', handleTypingInput);
    typingInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            endGame();
        }
    });

    output.scrollTop = output.scrollHeight;
}

function handleTypingInput(e) {
    const typingInput = e.target;
    currentInput = typingInput.value;
    totalChars = currentInput.length;

    let displayHTML = '';
    correctChars = 0;

    for (let i = 0; i < gameText.length; i++) {
        if (i < currentInput.length) {
            if (currentInput[i] === gameText[i]) {
                displayHTML += `<span class="correct">${gameText[i]}</span>`;
                correctChars++;
            } else {
                displayHTML += `<span class="incorrect">${gameText[i]}</span>`;
            }
        } else if (i === currentInput.length) {
            displayHTML += `<span class="cursor">${gameText[i]}</span>`;
        } else {
            displayHTML += gameText[i];
        }
    }

    document.getElementById('typing-display').innerHTML = displayHTML;

    if (currentInput === gameText) {
        endGame();
    }
}

function updateGameStats() {
    if (!gameActive) return;

    const elapsed = (Date.now() - gameStartTime) / 1000;
    const minutes = elapsed / 60;
    const wpm = Math.round((correctChars / 5) / minutes) || 0;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    document.getElementById('live-wpm').textContent = wpm;
    document.getElementById('live-accuracy').textContent = accuracy + '%';
    document.getElementById('live-time').textContent = Math.round(elapsed) + 's';
    document.getElementById('live-chars').textContent = `${currentInput.length}/${gameText.length}`;

    document.getElementById('wpm-display').textContent = wpm + ' WPM';
    document.getElementById('accuracy-display').textContent = accuracy + '% accuracy';
}

function endGame() {
    if (!gameActive) return;
    
    gameActive = false;
    clearInterval(gameInterval);

    const elapsed = (Date.now() - gameStartTime) / 1000;
    const minutes = elapsed / 60;
    const wpm = Math.round((correctChars / 5) / minutes) || 0;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    const typingInput = document.getElementById('typing-input');
    if (typingInput) {
        typingInput.disabled = true;
        typingInput.removeEventListener('input', handleTypingInput);
    }

    print('');
    print('=== RESULTS ===', 'success');
    print(`WPM: ${wpm}`, 'success');
    print(`Accuracy: ${accuracy}%`, accuracy >= 90 ? 'success' : 'warning');
    print(`Time: ${elapsed.toFixed(2)}s`);
    print(`Correct characters: ${correctChars}/${totalChars}`);
    print('');
    print('Type "typetest" to play again!');
    
    input.focus();
}
const commands = {
    help: () => {
        print('Available commands:');
        print('  typetest  - Start typing speed test game');
        print('  help      - Show this help message');
        print('  clear     - Clear the terminal');
        print('  echo      - Print text to terminal');
        print('  date      - Show current date and time');
        print('  whoami    - Display current user');
        print('  version   - Shows the current Version and Device information');
    },
    typetest: () => {
        startTypingTest();
    },
    clear: () => {
        clear();
    },
    echo: (args) => {
        print(args.join(' '));
    },
    date: () => {
        print(new Date().toString());
    },
    whoami: () => {
        print('<user>');
    },
    version: () => {
        const ua = navigator.userAgent;
        function getOS() {
            if (/Windows NT 10.0/.test(ua)) return 'Windows 10/11';
            if (/Windows NT 6.3/.test(ua)) return 'Windows 8.1';
            if (/Windows NT 6.1/.test(ua)) return 'Windows 7';
            if (/Mac OS X ([\d_]+)/.test(ua)) return 'macOS ' + ua.match(/Mac OS X ([\d_]+)/)[1].replace(/_/g, '.');
            if (/Android ([\d.]+)/.test(ua)) return 'Android ' + ua.match(/Android ([\d.]+)/)[1];
            if (/iPhone OS ([\d_]+)/.test(ua)) return 'iOS ' + ua.match(/iPhone OS ([\d_]+)/)[1].replace(/_/g, '.');
            if (/Linux/.test(ua)) return 'Linux';
            return 'Unknown OS';
        }
        function getDevice() {
            if (/iPhone/.test(ua)) return 'iPhone';
            if (/iPad/.test(ua)) return 'iPad';
            if (/Android/.test(ua)) {
                const match = ua.match(/;\s([^;)]+)\sBuild/);
                return match ? match[1].trim() : 'Android Device';
            }
            if (/Macintosh/.test(ua)) return 'Mac';
            if (/Windows/.test(ua)) return 'Windows PC';
            return 'Unknown Device';
        }
        function getBrowser() {
        if (/Edg\//.test(ua)) return 'Edge ' + ua.match(/Edg\/([\d.]+)/)[1];
        if (/Chrome\/([\d.]+)/.test(ua)) return 'Chrome ' + ua.match(/Chrome\/([\d.]+)/)[1];
        if (/Firefox\/([\d.]+)/.test(ua)) return 'Firefox ' + ua.match(/Firefox\/([\d.]+)/)[1];
        if (/Safari\/([\d.]+)/.test(ua) && !/Chrome/.test(ua)) return 'Safari';
        return 'Unknown Browser';
        }
        print('OS:       Oddyseus v1.0 64', 'success');
        print('Host:     Haitdyckler.github.io', 'success');
        print('');
        print('--- Device Info ---');
        print(`Device:   ${getDevice()}`);
        print(`System:   ${getOS()}`);
        print(`Browser:  ${getBrowser()}`);
        print(`CPU:      ${navigator.hardwareConcurrency} logical cores`);
        print(`RAM:      ${navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'N/A'}`);
        print(`Screen:   ${screen.width}x${screen.height} (${window.devicePixelRatio}x DPR)`);
        print(`Language: ${navigator.language}`);
        print('');
    }
};

function executeCommand(cmdLine) {
    const parts = cmdLine.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    print('$ ' + cmdLine, 'success');

    if (cmd === '') {
        return;
    }

    if (commands[cmd]) {
        commands[cmd](args);
    } else {
        print(`bash: ${cmd}: command not found`, 'error');
    }
}

// Input handling
input.addEventListener('keydown', (e) => {
    if (gameActive) {
        e.preventDefault();
        return;
    }

    if (e.key === 'Enter') {
        const cmd = input.value;
        if (cmd.trim()) {
            commandHistory.unshift(cmd);
            historyIndex = -1;
            executeCommand(cmd);
        }
        input.value = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[historyIndex];
        } else {
            historyIndex = -1;
            input.value = '';
        }
    }
});

// Welcome message
print('(base)', 'success');
print('');

const ascii_header = [
    String.raw`$$$$$$$\                                      $$\   $$\           $$\       $$\           `,
    String.raw`$$  __$$\                                     $$$\  $$ |          $$ |      \__|          `,
    String.raw`$$ |  $$ | $$$$$$\  $$\   $$\  $$$$$$$\       $$$$\ $$ | $$$$$$\  $$$$$$$\  $$\  $$$$$$$\ `,
    String.raw`$$ |  $$ |$$  __$$\ $$ |  $$ |$$  _____|      $$ $$\$$ |$$  __$$\ $$  __$$\ $$ |$$  _____|`,
    String.raw`$$ |  $$ |$$$$$$$$ |$$ |  $$ |\$$$$$$\        $$ \$$$$ |$$ /  $$ |$$ |  $$ |$$ |\$$$$$$\  `,
    String.raw`$$ |  $$ |$$   ____|$$ |  $$ | \____$$\       $$ |\$$$ |$$ |  $$ |$$ |  $$ |$$ | \____$$\ `,
    String.raw`$$$$$$$  |\$$$$$$$\ \$$$$$$  |$$$$$$$  |      $$ | \$$ |\$$$$$$  |$$$$$$$  |$$ |$$$$$$$  |`,
    String.raw`\_______/  \_______| \______/ \_______/       \__|  \__| \______/ \_______/ \__|\_______/ `
];
ascii_header.forEach(line =>{
    const div = document.createElement('div');
    div.className = 'output-line ascii-art';
    div.style.whiteSpace = 'pre';
    div.textContent = line;
    output.appendChild(div)
});                                                                                     
print('Type "help" for available commands');
print('');