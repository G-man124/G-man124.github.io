// Playful Tropical Xylophone/Marimba Synthesizer Audio Engine
let safariAudioCtx = null;

function playJungleChimes() {
    // Fire festive leaf explosion instantly
    launchLeafConfetti();

    if (!safariAudioCtx) {
        safariAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Classic Melody mapped to clean wood-chime note frequencies
    const marimbaNotes = [
        { freq: 261.63, len: 0.3 }, // C4
        { freq: 261.63, len: 0.1 }, // C4
        { freq: 293.66, len: 0.4 }, // D4
        { freq: 261.63, len: 0.4 }, // C4
        { freq: 349.23, len: 0.4 }, // F4
        { freq: 329.63, len: 0.8 }, // E4
        
        { freq: 261.63, len: 0.3 }, // C4
        { freq: 261.63, len: 0.1 }, // C4
        { freq: 293.66, len: 0.4 }, // D4
        { freq: 261.63, len: 0.4 }, // C4
        { freq: 392.00, len: 0.4 }, // G4
        { freq: 349.23, len: 0.8 }, // F4
        
        { freq: 261.63, len: 0.3 }, // C4
        { freq: 261.63, len: 0.1 }, // C4
        { freq: 523.25, len: 0.4 }, // C5
        { freq: 440.00, len: 0.4 }, // A4
        { freq: 349.23, len: 0.4 }, // F4
        { freq: 329.63, len: 0.4 }, // E4
        { freq: 293.66, len: 0.4 }, // D4
        
        { freq: 466.16, len: 0.3 }, // A#4
        { freq: 466.16, len: 0.1 }, // A#4
        { freq: 440.00, len: 0.4 }, // A4
        { freq: 349.23, len: 0.4 }, // F4
        { freq: 392.00, len: 0.4 }, // G4
        { freq: 349.23, len: 0.8 }  // F4
    ];

    let currentTimeline = safariAudioCtx.currentTime;

    marimbaNotes.forEach(note => {
        const osc = safariAudioCtx.createOscillator();
        const decayGain = safariAudioCtx.createGain();

        // 'triangle' gives a round, acoustic percussion chime perfect for a jungle safari feel
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, currentTimeline);

        // Fast decay settings to make it pluck cleanly like wooden instruments
        decayGain.gain.setValueAtTime(0.25, currentTimeline);
        decayGain.gain.exponentialRampToValueAtTime(0.0001, currentTimeline + note.len - 0.05);

        osc.connect(decayGain);
        decayGain.connect(safariAudioCtx.destination);

        osc.start(currentTimeline);
        osc.stop(currentTimeline + note.len);

        currentTimeline += note.len;
    });
}

// Widget 1 Modules: Catch the Rare Dinosaur Reflex Tracker Engine
const gameArea = document.getElementById('gameArea');
const cakeTarget = document.getElementById('cakeTarget');
const scoreDisplay = document.getElementById('score');
let dinoScore = 0;

function repositionDino() {
    const horizontalLimit = gameArea.clientWidth - cakeTarget.clientWidth;
    const verticalLimit = gameArea.clientHeight - cakeTarget.clientHeight;
    
    cakeTarget.style.left = Math.floor(Math.random() * horizontalLimit) + 'px';
    cakeTarget.style.top = Math.floor(Math.random() * verticalLimit) + 'px';
}

cakeTarget.addEventListener('mousedown', () => {
    dinoScore += 1;
    scoreDisplay.textContent = dinoScore;
    repositionDino();
});
repositionDino();

// Widget 3 Modules: Interactive Tropical Balloon Popper Sandbox
const balloonZone = document.getElementById('balloonZone');
const safariEmojis = ['🎈'];

function launchSafariBalloon() {
    const item = document.createElement('div');
    item.classList.add('safari-balloon');
    item.textContent = safariEmojis[Math.floor(Math.random() * safariEmojis.length)];
    
    const randomLeft = Math.random() * (balloonZone.clientWidth - 35);
    const speed = 2.5 + Math.random() * 2.0;
    
    item.style.left = randomLeft + 'px';
    item.style.animation = `safariFloatUp ${speed}s linear infinite`;
    
    item.addEventListener('mouseover', () => {
        item.remove();
        dinoScore += 5;
        scoreDisplay.textContent = dinoScore;
    });

    item.addEventListener('animationend', () => {
        item.remove();
    });

    balloonZone.appendChild(item);
}
setInterval(launchSafariBalloon, 750);

// Widget 4 Modules: Expedition Time Log Matrix
function populateTimelineLogs() {
    const ageDaysCounter = document.getElementById('ageDaysCounter');
    const exactDays = 7 // Precise 7 years alive timeline
    ageDaysCounter.textContent = exactDays.toLocaleString();
}
populateTimelineLogs();

// Widget 5 Modules: Volcano Fruit Drop Sandbox Physics Logic
const gravitySandbox = document.getElementById('gravitySandbox');
let gravityObjects = [];

gravitySandbox.addEventListener('mousedown', (e) => {
    const boundaryRect = gravitySandbox.getBoundingClientRect();
    const targetX = e.clientX - boundaryRect.left;
    const targetY = e.clientY - boundaryRect.top;
    
    const fruit = document.createElement('div');
    fruit.classList.add('fruit-particle');
    const messages = [
        'Happy Birthday!',
        'Hi Theo.',
        'Hello.',
        'Have a great day!',
        'How are you?',
        'Have fun!'
    ];
    fruit.textContent = messages[Math.floor(Math.random() * messages.length)];
    fruit.style.left = (targetX - 10) + 'px';
    fruit.style.top = (targetY - 10) + 'px';
    
    gravitySandbox.appendChild(fruit);
    
    gravityObjects.push({
        element: fruit,
        x: targetX - 10,
        y: targetY - 10,
        vy: -3 - Math.random() * 2, // Launch upwards slightly on spawn
        vx: (Math.random() - 0.5) * 5
    });
});

function runGravitySimulation() {
    for (let i = gravityObjects.length - 1; i >= 0; i--) {
        let obj = gravityObjects[i];
        obj.vy += 0.22; // Simulated gravitational downforce
        obj.x += obj.vx;
        obj.y += obj.vy;
        
        obj.element.style.left = obj.x + 'px';
        obj.element.style.top = obj.y + 'px';
        
        // Clean up out of bounds objects automatically
        if (obj.y > gravitySandbox.clientHeight) {
            obj.element.remove();
            gravityObjects.splice(i, 1);
        }
    }
    requestAnimationFrame(runGravitySimulation);
}
requestAnimationFrame(runGravitySimulation);

// Festive Leaf & Carnival Confetti Particle Rain Matrix
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const safariPalette = ['#2ed573', '#ffa502', '#ff4757', '#1e3f20', '#2ecc71'];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function launchLeafConfetti() {
    particles = [];
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            radius: Math.random() * 5 + 2,
            color: safariPalette[Math.floor(Math.random() * safariPalette.length)],
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.5) * 16 - 2,
            gravity: 0.2,
            life: 1.0
        });
    }
    animateJungleConfetti();
}

function animateJungleConfetti() {
    if (particles.length === 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life -= 0.01;

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
    ctx.globalAlpha = 1.0;
    requestAnimationFrame(animateJungleConfetti);
}
