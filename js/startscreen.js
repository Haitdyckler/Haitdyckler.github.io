const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const doorPrompt = document.getElementById('doorPrompt');
const loading = document.getElementById('loading');

let spriteSheet = null;
let groundImage = null;
let gameStarted = false;
let assetsLoaded = 0;
const totalAssets = 2;

// Game state
const player = {
    x: 100,
    y: 450,
    width: 32,
    height: 32,
    speed: 3,
    velX: 0,
    velY: 0,
    jumping: false,
    grounded: false,
    facing: 1, // 1 = right, -1 = left
    currentFrame: 0,
    animationTimer: 0,
    animationSpeed: 8,
    state: 'idle' // idle, walk
};

const gravity = 0.6;
const jumpPower = -12;
const groundY = 480;

// Keys
const keys = {};

// Doors - CUSTOMIZE THESE URLS FOR YOUR PAGES
const doors = [
    { 
        x: 150, 
        y: groundY - 80, 
        width: 60, 
        height: 80, 
        label: 'PROJECTS',
        url: './projects.html', // Change to your projects page
        color: '#e94560'
    },
    { 
        x: 370, 
        y: groundY - 80, 
        width: 60, 
        height: 80, 
        label: 'ABOUT',
        url: './about.html', // Change to your about page
        color: '#0f3460'
    },
    { 
        x: 590, 
        y: groundY - 80, 
        width: 60, 
        height: 80, 
        label: 'CONTACT',
        url: './contact.html', // Change to your contact page
        color: '#16213e'
    }
];

let nearDoor = null;

// Load assets automatically
function loadAssets() {
    // Load sprite sheet
    const sprite = new Image();
    sprite.onload = () => {
        spriteSheet = sprite;
        assetsLoaded++;
        checkAssetsLoaded();
    };
    sprite.onerror = () => {
        loading.innerHTML = '<h2>⚠️ Error</h2><p>Could not load sprite sheet.<br>Make sure character.png is in assets/sprites/</p>';
    };
    sprite.src = './assets/sprites/character_sheet.png';
    
    // Load ground image
    const ground = new Image();
    ground.onload = () => {
        groundImage = ground;
        assetsLoaded++;
        checkAssetsLoaded();
    };
    ground.onerror = () => {
        loading.innerHTML = '<h2>⚠️ Error</h2><p>Could not load ground image.<br>Make sure ground.png is in assets/sprites/</p>';
    };
    ground.src = './assets/sprites/ground.png';
}

function checkAssetsLoaded() {
    if (assetsLoaded === totalAssets) {
        loading.style.display = 'none';
        gameStarted = true;
        gameLoop();
    }
}

// Keyboard input
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Enter door
    if (e.key.toLowerCase() === 'e' && nearDoor) {
        window.location.href = nearDoor.url;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function updatePlayer() {
    // Horizontal movement
    player.velX = 0;
    
    if (keys['arrowright'] || keys['d']) {
        player.velX = player.speed;
        player.facing = 1;
        player.state = 'walk';
    } else if (keys['arrowleft'] || keys['a']) {
        player.velX = -player.speed;
        player.facing = -1;
        player.state = 'walk';
    } else {
        player.state = 'idle';
    }
    
    // Jumping
    if ((keys['arrowup'] || keys['w'] || keys[' ']) && player.grounded) {
        player.velY = jumpPower;
        player.jumping = true;
        player.grounded = false;
    }
    
    // Apply gravity
    player.velY += gravity;
    
    // Update position
    player.x += player.velX;
    player.y += player.velY;
    
    // Ground collision
    if (player.y + player.height >= groundY) {
        player.y = groundY - player.height;
        player.velY = 0;
        player.jumping = false;
        player.grounded = true;
    }
    
    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // Update animation
    player.animationTimer++;
    if (player.animationTimer >= 60 / player.animationSpeed) {
        player.animationTimer = 0;
        
        if (player.state === 'idle') {
            player.currentFrame = (player.currentFrame % 4);
            player.currentFrame++;
            if (player.currentFrame > 3) player.currentFrame = 0;
        } else if (player.state === 'walk') {
            if (player.currentFrame < 4 || player.currentFrame > 9) {
                player.currentFrame = 4;
            }
            player.currentFrame++;
            if (player.currentFrame > 9) player.currentFrame = 4;
        }
    }
    
    // Check door proximity
    nearDoor = null;
    for (let door of doors) {
        const doorCenterX = door.x + door.width / 2;
        const playerCenterX = player.x + player.width / 2;
        const distance = Math.abs(doorCenterX - playerCenterX);
        
        if (distance < 50 && player.grounded) {
            nearDoor = door;
            break;
        }
    }
    
    if (nearDoor) {
        doorPrompt.style.display = 'block';
    } else {
        doorPrompt.style.display = 'none';
    }
}

function drawPlayer() {
    const sx = player.currentFrame * 32;
    const sy = 0;
    
    ctx.save();
    
    if (player.facing === -1) {
        ctx.translate(player.x + player.width, player.y);
        ctx.scale(-1, 1);
        ctx.drawImage(spriteSheet, sx, sy, 32, 32, 0, 0, player.width, player.height);
    } else {
        ctx.drawImage(spriteSheet, sx, sy, 32, 32, player.x, player.y, player.width, player.height);
    }
    
    ctx.restore();
}

function drawGround() {
    ctx.drawImage(groundImage, 0, groundY, canvas.width, canvas.height - groundY);
}

function drawDoors() {
    for (let door of doors) {
        // Door body
        ctx.fillStyle = door.color;
        ctx.fillRect(door.x, door.y, door.width, door.height);
        
        // Door frame
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 3;
        ctx.strokeRect(door.x, door.y, door.width, door.height);
        
        // Door handle
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(door.x + door.width - 12, door.y + door.height / 2, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(door.label, door.x + door.width / 2, door.y - 10);
        
        // Glow effect if near
        if (nearDoor === door) {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.strokeRect(door.x - 5, door.y - 5, door.width + 10, door.height + 10);
        }
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 73) % canvas.width;
        const y = (i * 41) % (groundY - 100);
        const size = (i % 3) + 1;
        ctx.fillRect(x, y, size, size);
    }
}

function gameLoop() {
    if (!gameStarted) return;
    
    drawBackground();
    drawGround();
    drawDoors();
    
    updatePlayer();
    drawPlayer();
    
    requestAnimationFrame(gameLoop);
}

window.addEventListener('load', loadAssets);
