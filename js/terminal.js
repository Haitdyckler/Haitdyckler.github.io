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
        print('  corridor  - Open encrypted private chat session');
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
    corridor: () => {
        corridorInit();
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
        function printInfo(label, value) {
        const div = document.createElement('div');
        div.className = 'output-line';
        div.style.whiteSpace = 'pre';
        div.innerHTML = `<span style="color:#00ccff;font-weight:bold;">${label}:</span><span style="color:#ffffff;"> ${value}</span>`;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
        }
        const header = document.createElement('div');
        header.className = 'output-line';
        header.innerHTML = `<span style="color:#00ccff;font-weight:bold;">${getDevice()}</span><span style="color:#ffffff;">@</span><span style="color:#00ccff;font-weight:bold;">Haitdyckler.github.io</span>`;
        output.appendChild(header);
        print('----------');
        printInfo('OS      ', 'Oddyseus v1.0 64');
        printInfo('Host    ', 'Haitdyckler.github.io');
        printInfo('Device  ', getDevice());
        printInfo('System  ', getOS());
        printInfo('Browser ', getBrowser());
        printInfo('CPU     ', `${navigator.hardwareConcurrency} logical cores`);
        printInfo('RAM     ', navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'N/A');
        printInfo('Screen  ', `${screen.width}x${screen.height} (${window.devicePixelRatio}x DPR)`);
        printInfo('Language', navigator.language);
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

// ── CORRIDOR — Encrypted P2P Chat ─────────────────────────────────────────
// SETUP: Create a free Firebase Realtime Database at https://console.firebase.google.com
// Set database rules to: { "rules": { "corridor": { ".read": true, ".write": true } } }
// Then replace the FB_URL below with your database URL.

const CORRIDOR = (() => {
    // ── Firebase Realtime Database REST endpoint ──
    const FB_URL = 'https://corridor-chat-room-default-rtdb.asia-southeast1.firebasedatabase.app/';

    // ── State ──
    let corridorActive  = false;
    let corridorUser    = '';
    let corridorRoom    = '';
    let corridorKey     = null;   // CryptoKey (AES-GCM)
    let corridorSub     = null;   // EventSource for SSE messages
    let presenceWatchEs = null;   // EventSource for SSE presence
    let lastMsgTS       = 0;
    let setupStep       = 0;      // 0=idle,1=awaiting username,2=awaiting room
    let presenceId      = null;

    // ── Crypto helpers ──────────────────────────────────────────
    async function deriveKey(roomCode) {
        const enc   = new TextEncoder();
        const raw   = enc.encode(roomCode.padEnd(32, '\0').slice(0, 32));
        return await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt','decrypt']);
    }

    async function encrypt(text) {
        const enc  = new TextEncoder();
        const iv   = crypto.getRandomValues(new Uint8Array(12));
        const ct   = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, corridorKey, enc.encode(text));
        const buf  = new Uint8Array(iv.byteLength + ct.byteLength);
        buf.set(iv, 0);
        buf.set(new Uint8Array(ct), iv.byteLength);
        return btoa(String.fromCharCode(...buf));
    }

    async function decrypt(b64) {
        try {
            const buf  = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const iv   = buf.slice(0, 12);
            const ct   = buf.slice(12);
            const pt   = await crypto.subtle.decrypt({ name:'AES-GCM', iv }, corridorKey, ct);
            return new TextDecoder().decode(pt);
        } catch {
            return null;
        }
    }

    // ── Firebase REST helpers ───────────────────────────────────
    function roomPath() {
        return corridorRoom.replace(/[.#$/[\]]/g, '_');
    }

    async function fbWrite(payload) {
        const ts  = Date.now();
        const url = `${FB_URL}/corridor/${roomPath()}/msgs/${ts}.json`;
        await fetch(url, {
            method : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body   : JSON.stringify(payload)
        });
    }

    async function fbWipeRoom() {
        const roomUrl = `${FB_URL}/corridor/${roomPath()}.json`;
        try {
            await fetch(roomUrl, { method: 'DELETE' });
        } catch (e) { /* ignore */ }
    }

    async function fbRemovePresenceSync() {
        if (presenceId) {
            const url = `${FB_URL}/corridor/${roomPath()}/presence/${presenceId}.json?_method=DELETE`;
            navigator.sendBeacon(url, new Blob(['null'], { type: 'application/json' }));
        }
    }

    async function fbRemovePresenceAsync() {
        if (presenceId) {
            const url = `${FB_URL}/corridor/${roomPath()}/presence/${presenceId}.json`;
            try { await fetch(url, { method: 'DELETE' }); } catch(e){}
            presenceId = null;
        }
    }

    // Register presence and listen for partner disconnecting
    async function fbRegisterAndWatchPresence() {
        presenceId = `${corridorUser}_${Date.now()}`;
        const presUrl = `${FB_URL}/corridor/${roomPath()}/presence/${presenceId}.json`;
        
        await fetch(presUrl, {
            method : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body   : JSON.stringify({ user: corridorUser, joined: Date.now() })
        });

        // Watch presence adjustments
        presenceWatchEs = new EventSource(`${FB_URL}/corridor/${roomPath()}/presence.json`);
        
        const handlePresenceChange = async (evt) => {
            if (!corridorActive) return;
            try {
                const parsed = JSON.parse(evt.data);
                if (!parsed) return;

                // Evaluate the current state of presence keys remaining
                let currentPresence = {};
                if (parsed.path === '/' && parsed.data) {
                    currentPresence = parsed.data;
                } else if (parsed.path === '/' && parsed.data === null) {
                    currentPresence = {};
                }

                const remainingKeys = Object.keys(currentPresence);

                // If someone was here, but now your key is either alone or presence is empty
                if (remainingKeys.length > 0 && !remainingKeys.includes(presenceId)) {
                    // This means WE were removed or room was cleared externally
                    handlePartnerLeft();
                } else if (remainingKeys.length === 1 && remainingKeys[0] === presenceId) {
                    // Check if a partner used to be here by inspecting if there are any messages 
                    // or if we simply detect we are now completely alone.
                    const res = await fetch(`${FB_URL}/corridor/${roomPath()}/msgs.json`);
                    const msgs = await res.json();
                    if (msgs && Object.keys(msgs).length > 0) {
                        // There is chat history, but only 1 person left in presence. Partner dropped!
                        handlePartnerLeft();
                    }
                }
            } catch (err) { /* ignore parsing drops */ }
        };

        presenceWatchEs.addEventListener('put', handlePresenceChange);
        presenceWatchEs.addEventListener('patch', handlePresenceChange);
    }

    async function handlePartnerLeft() {
        if (!corridorActive) return;
        
        // 1. Wipe database history instantly
        await fbWipeRoom();

        // 2. Clear terminal output completely
        clear();

        // 3. Notify the user
        printCorridor('━━ The other user has left the room. ━━', 'warning');
        printCorridor('━━ Chat history has been completely wiped from Firebase and Terminal. ━━', 'warning');
        
        // Clean up engineering states
        exitCorridorCleanly(false); 
    }

    function exitCorridorCleanly(shouldWipeDatabase = true) {
        corridorActive = false;
        
        if (corridorSub) { corridorSub.close(); corridorSub = null; }
        if (presenceWatchEs) { presenceWatchEs.close(); presenceWatchEs = null; }
        
        if (shouldWipeDatabase) {
            fbRemovePresenceAsync().then(() => {
                fbWipeRoom();
            });
        } else {
            presenceId = null;
        }

        // Restore score box UI
        const scoreBox = document.querySelector('.score-box');
        if (scoreBox) scoreBox.style.display = '';
        
        updatePrompt();
        
        print('');
        print('Type "help" for available commands');
        print('');
        
        corridorUser = ''; corridorRoom = ''; corridorKey = null; lastMsgTS = 0;
    }

    // ── SSE message listener ──────────────────
    async function processMessage(ts, m) {
        const numTs = Number(ts);
        if (numTs <= lastMsgTS) return;
        lastMsgTS = numTs;
        if (!m || !m.ciphertext) return;
        const plain = await decrypt(m.ciphertext);
        if (plain === null) return; 
        const isMe = m.sender === corridorUser;
        const time = new Date(numTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        renderMessage(m.sender, plain, time, isMe);
    }

    function startListening() {
        const url = `${FB_URL}/corridor/${roomPath()}/msgs.json`;
        corridorSub = new EventSource(url);

        corridorSub.addEventListener('put', async (evt) => {
            try {
                const data = JSON.parse(evt.data);
                if (!data || data.data === null || data.data === undefined) {
                    // If data becomes null, room was wiped! Clear screen.
                    if (data && data.path === '/') {
                        clear();
                    }
                    return;
                }
                if (data.path === '/') {
                    const msgs = data.data;
                    for (const ts of Object.keys(msgs).sort()) {
                        await processMessage(ts, msgs[ts]);
                    }
                } else {
                    const ts = data.path.replace(/^\//, '');
                    await processMessage(ts, data.data);
                }
            } catch (err) { }
        });

        corridorSub.onerror = () => {
            if (corridorActive) {
                corridorSub.close();
                setTimeout(startListening, 2000);
            }
        };
    }

    // ── UI helpers ──────────────────────────────────────────────
    function printCorridor(text, cls = '') {
        const div = document.createElement('div');
        div.className = 'output-line corridor-system ' + cls;
        div.style.color = cls === 'warning' ? '#ffaa00'
                        : cls === 'error'   ? '#ff4444'
                        : cls === 'success' ? '#00ff00'
                        : '#00aaff';
        div.style.fontStyle = 'italic';
        div.textContent = text;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    }

    function renderMessage(sender, text, time, isMe) {
        const row = document.createElement('div');
        row.className = 'output-line corridor-msg';
        row.style.display        = 'flex';
        row.style.gap            = '8px';
        row.style.margin         = '4px 0';
        row.style.alignItems     = 'flex-start';
        row.style.flexDirection  = isMe ? 'row-reverse' : 'row';

        const bubble = document.createElement('div');
        bubble.style.maxWidth       = '70%';
        bubble.style.padding        = '6px 10px';
        bubble.style.borderRadius   = '6px';
        bubble.style.fontSize       = '13px';
        bubble.style.lineHeight     = '1.5';
        bubble.style.wordBreak      = 'break-word';
        bubble.style.background     = isMe ? '#003300' : '#001a2e';
        bubble.style.border         = isMe ? '1px solid #00ff00' : '1px solid #0077cc';
        bubble.style.color          = '#ffffff';

        const meta = document.createElement('div');
        meta.style.fontSize  = '10px';
        meta.style.opacity   = '0.6';
        meta.style.marginBottom = '3px';
        meta.style.color     = isMe ? '#00ff00' : '#00aaff';
        meta.textContent     = isMe ? `you  ${time}` : `${sender}  ${time}`;

        const msg = document.createElement('div');
        msg.textContent = text;

        bubble.appendChild(meta);
        bubble.appendChild(msg);
        row.appendChild(bubble);
        output.appendChild(row);
        output.scrollTop = output.scrollHeight;
    }

    function updatePrompt() {
        const promptEl = document.querySelector('.prompt');
        if (promptEl) {
            promptEl.textContent = corridorActive
                ? `[${corridorUser}@corridor:${corridorRoom}]$`
                : '$';
        }
    }

    // ── Public init ─────────────────────────────────────────────
    async function corridorInit() {
        if (corridorActive) {
            printCorridor('Already in corridor. Type /exit to leave.', 'warning');
            return;
        }
        setupStep = 1;
        print('');
        printCorridor('▓▓ CORRIDOR — End-to-end encrypted private chat ▓▓', 'success');
        printCorridor('Messages are AES-256-GCM encrypted in-browser.', '');
        printCorridor('Chat history is session-only and cannot be recovered.', '');
        print('');
        printCorridor('Enter your username:', 'success');
    }

    // ── Handle input while corridor setup or active ─────────────
    async function handleInput(val) {
        if (setupStep === 1) {
            const name = val.trim();
            if (!name || name.length < 1 || name.length > 20) {
                printCorridor('Username must be 1–20 characters. Try again:', 'warning');
                return true;
            }
            corridorUser = name;
            setupStep    = 2;
            printCorridor(`Username set: ${corridorUser}`, 'success');
            printCorridor('Enter room code (share this with the other person):', 'success');
            return true;
        }

        if (setupStep === 2) {
            const code = val.trim();
            if (!code || code.length < 3 || code.length > 32) {
                printCorridor('Room code must be 3–32 characters. Try again:', 'warning');
                return true;
            }
            corridorRoom = code;
            setupStep    = 0;

            try {
                corridorKey = await deriveKey(corridorRoom);
            } catch(e) {
                printCorridor('Crypto init failed: ' + e.message, 'error');
                corridorUser = ''; corridorRoom = '';
                return true;
            }

            corridorActive = true;

            const scoreBox = document.querySelector('.score-box');
            if (scoreBox) scoreBox.style.display = 'none';

            updatePrompt();

            print('');
            printCorridor(`━━ Connected to room "${corridorRoom}" ━━`, 'success');
            printCorridor('Waiting for the other person… (messages appear here)', '');
            printCorridor('Type /exit to leave the corridor.', '');
            print('');

            await fbRegisterAndWatchPresence();

            // Synchronous unload fallback
            window.addEventListener('beforeunload', fbRemovePresenceSync);

            startListening();
            return true;
        }

        if (corridorActive) {
            if (val.trim() === '/exit') {
                clear();
                printCorridor('━━ Left corridor. Chat history cleared. ━━', 'warning');
                exitCorridorCleanly(true);
                return true;
            }

            const text = val.trim();
            if (!text) return true;

            try {
                const ct = await encrypt(text);
                await fbWrite({ sender: corridorUser, ciphertext: ct });
            } catch(e) {
                printCorridor('Send failed: ' + e.message, 'error');
            }
            return true;
        }

        return false;
    }

    return { corridorInit, handleInput, isSetupActive: () => setupStep > 0, isActive: () => corridorActive };
})();

// Override input handler to intercept corridor input
const _origInput = input.cloneNode();
input.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter') return;
    if (CORRIDOR.isSetupActive() || CORRIDOR.isActive()) {
        e.stopImmediatePropagation();
        const val = input.value;
        input.value = '';
        if (CORRIDOR.isActive() && val.trim() !== '/exit') {
            // echo in terminal as sent message — handled by listener rendering
        } else {
            // show what user typed for setup steps
            if (CORRIDOR.isSetupActive()) {
                print('$ ' + val, 'success');
            }
        }
        await CORRIDOR.handleInput(val);
    }
}, true); // capture phase — fires before existing keydown handler

function corridorInit() {
    CORRIDOR.corridorInit();
}