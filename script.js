let bestScore = 0;
const backgroundCanvas = document.getElementById('backgroundCanvas');
const bgCtx = backgroundCanvas.getContext('2d');

function resizeBackgroundCanvas() {
    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeBackgroundCanvas);
resizeBackgroundCanvas();

let stars = [];
function initializeStars() {
    stars = [];
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * backgroundCanvas.width,
            y: Math.random() * backgroundCanvas.height,
            radius: Math.random() * 1.5,
            alpha: Math.random(),
        });
    }
}

function drawBackgroundStars() {
    bgCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
    bgCtx.fillStyle = 'black';
    bgCtx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        bgCtx.beginPath();
        bgCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        bgCtx.fill();
        bgCtx.closePath();
    }
}

function animateBackground() {
    drawBackgroundStars();
    requestAnimationFrame(animateBackground);
}

initializeStars();
animateBackground();

const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');

let playerWidth = 50;
let playerHeight = 20;
let playerX = (gameCanvas.width - playerWidth) / 2;
let playerSpeed = 7;
let bullets = [];
const bulletWidth = 5;
const bulletHeight = 10;
const bulletSpeed = 5;
let invaderRowCount = 3;
let invaderColumnCount = 8;
const invaderWidth = 40;
const invaderHeight = 20;
const invaderPadding = 10;
const invaderOffsetTop = 30;
const invaderOffsetLeft = 30;
let invaderSpeed = 2;
let invadersMovingRight = true;
let invaders = [];
let score = 0;
let level = 1;
let bestScores = [];

let rightPressed = false;
let leftPressed = false;
let spacePressed = false;
const glowColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];

document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        spacePressed = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        spacePressed = false;
    }
});

let gameStars = [];

function initializeGameStars() {
    gameStars = [];
    for (let i = 0; i < 100; i++) {
        gameStars.push({
            x: Math.random() * gameCanvas.width,
            y: Math.random() * gameCanvas.height,
            radius: Math.random() * 1.5,
            alpha: Math.random(),
        });
    }
}

function drawGameBackground() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    for (let i = 0; i < gameStars.length; i++) {
        let star = gameStars[i];
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
        ctx.closePath();
    }
}

function initializeGame() {
    playerSpeed = parseInt(document.getElementById('playerSpeed').value);
    invaderSpeed = parseInt(document.getElementById('invaderSpeed').value);

    playerX = (gameCanvas.width - playerWidth) / 2;
    bullets = [];
    invadersMovingRight = true;
    invaders = [];
    score = 0;
    level = 1;
    updateScore();
    updateLevel();
    initializeInvaders();
    initializeGameStars();
    updateCanvasGlow();
}

function initializeInvaders() {
    invaders = [];
    for (let row = 0; row < invaderRowCount; row++) {
        invaders[row] = [];
        for (let col = 0; col < invaderColumnCount; col++) {
            let invaderX = col * (invaderWidth + invaderPadding) + invaderOffsetLeft;
            let invaderY = row * (invaderHeight + invaderPadding) + invaderOffsetTop;
            invaders[row][col] = { x: invaderX, y: invaderY, status: 1 };
        }
    }
}

function drawPlayer() {
    const playerImg = new Image();
    playerImg.src = './img/player.svg';
    ctx.drawImage(playerImg, playerX, gameCanvas.height - playerHeight - 10, playerWidth, playerHeight);
}

function drawInvaders() {
    const enemyImg = new Image();
    enemyImg.src = './img/enemies.svg';
    
    for (let row = 0; row < invaderRowCount; row++) {
        for (let col = 0; col < invaderColumnCount; col++) {
            if (invaders[row][col].status === 1) {
                let invaderX = invaders[row][col].x;
                let invaderY = invaders[row][col].y;
                ctx.drawImage(enemyImg, invaderX, invaderY, invaderWidth, invaderHeight);
            }
        }
    }
}

function movePlayer() {
    if (rightPressed && playerX < gameCanvas.width - playerWidth) {
        playerX += playerSpeed;
    } else if (leftPressed && playerX > 0) {
        playerX -= playerSpeed;
    }
}

function fireBullet() {
    if (spacePressed) {
        bullets.push({ x: playerX + playerWidth / 2 - bulletWidth / 2, y: gameCanvas.height - playerHeight - 10 });
        spacePressed = false;
    }
}

function drawBullets() {
    ctx.fillStyle = 'yellow';
    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i];
        ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
        bullet.y -= bulletSpeed;
        if (bullet.y + bulletHeight < 0) {
            bullets.splice(i, 1);
            i--;
        }
    }
}

function collisionDetection() {
    for (let row = 0; row < invaderRowCount; row++) {
        for (let col = 0; col < invaderColumnCount; col++) {
            let invader = invaders[row][col];
            if (invader.status === 1) {
                for (let i = 0; i < bullets.length; i++) {
                    let bullet = bullets[i];
                    if (
                        bullet.x > invader.x &&
                        bullet.x < invader.x + invaderWidth &&
                        bullet.y > invader.y &&
                        bullet.y < invader.y + invaderHeight
                    ) {
                        invader.status = 0;
                        bullets.splice(i, 1);
                        i--;
                        score += 10;
                        updateScore();
                    }
                }
            }
        }
    }
}

function moveInvaders() {
    let hitEdge = false;
    for (let row = 0; row < invaderRowCount; row++) {
        for (let col = 0; col < invaderColumnCount; col++) {
            let invader = invaders[row][col];
            if (invader.status === 1) {
                invader.x += invadersMovingRight ? invaderSpeed : -invaderSpeed;
                if (invader.x + invaderWidth > gameCanvas.width || invader.x < 0) {
                    hitEdge = true;
                }
            }
        }
    }

    if (hitEdge) {
        invadersMovingRight = !invadersMovingRight;
        for (let row = 0; row < invaderRowCount; row++) {
            for (let col = 0; col < invaderColumnCount; col++) {
                invaders[row][col].y += invaderHeight;
            }
        }
    }
}

function updateScore() {
    document.getElementById('score').innerText = score;
}

function updateLevel() {
    document.getElementById('level').innerText = level;
    updateCanvasGlow();
}

function updateCanvasGlow() {
    const colorIndex = (level - 1) % glowColors.length;
    const glowColor = glowColors[colorIndex];

    const keyframes = `
        @keyframes glow {
            0% {
                box-shadow: 0 0 10px 2px ${glowColor};
            }
            50% {
                box-shadow: 0 0 20px 5px ${glowColor};
            }
            100% {
                box-shadow: 0 0 10px 2px ${glowColor};
            }
        }
    `;

    const existingGlowStyle = document.getElementById('glow-style');
    if (existingGlowStyle) {
        existingGlowStyle.parentNode.removeChild(existingGlowStyle);
    }

    const style = document.createElement('style');
    style.id = 'glow-style';
    style.innerHTML = keyframes;
    document.head.appendChild(style);
}

function checkGameOver() {
    for (let row = 0; row < invaderRowCount; row++) {
        for (let col = 0; col < invaderColumnCount; col++) {
            let invader = invaders[row][col];
            if (invader.status === 1 && invader.y + invaderHeight >= gameCanvas.height - playerHeight - 10) {
                alert('Game Over');
                bestScores.push(score);
                updateBestScores();
                return true;
            }
        }
    }
    return false;
}

function checkLevelComplete() {
    let allInvadersDestroyed = true;
    for (let row = 0; row < invaderRowCount; row++) {
        for (let col = 0; col < invaderColumnCount; col++) {
            if (invaders[row][col].status === 1) {
                allInvadersDestroyed = false;
                break;
            }
        }
    }

    if (allInvadersDestroyed) {
        level++;
        updateLevel();
        invaderSpeed += 0.5;
        invaderRowCount++;
        initializeInvaders();
    }
}

function updateBestScores() {
    let bestScoresList = document.getElementById('bestScores');
    bestScoresList.innerHTML = '';
    bestScores.sort((a, b) => b - a);
    bestScores.slice(0, 5).forEach((s) => {
        let li = document.createElement('li');
        li.innerText = s;
        bestScoresList.appendChild(li);
    });
}

function draw() {
    drawGameBackground();
    drawPlayer();
    drawInvaders();
    drawBullets();
    movePlayer();
    fireBullet();
    collisionDetection();
    moveInvaders();

    if (!checkGameOver()) {
        checkLevelComplete();
        requestAnimationFrame(draw);
    }
}

document.getElementById('startGame').addEventListener('click', () => {
    initializeGame();
    draw();
});

function checkGameOver() {
    for (let row = 0; row < invaderRowCount; row++) {
        for (let col = 0; col < invaderColumnCount; col++) {
            let invader = invaders[row][col];
            if (invader.status === 1 && invader.y + invaderHeight >= gameCanvas.height - playerHeight - 10) {
                if (score > bestScore) {
                    bestScore = score;
                }

                showGameOverModal(score, bestScore);

                return true;
            }
        }
    }
    return false;
}

function initializeGame() {
    playerSpeed = parseInt(document.getElementById('playerSpeed').value);
    invaderSpeed = parseInt(document.getElementById('invaderSpeed').value);
    playerX = (gameCanvas.width - playerWidth) / 2;
    bullets = [];
    invadersMovingRight = true;
    invaders = [];
    score = 0;
    level = 1;
    invaderRowCount = 3;
    invaderColumnCount = 8;
    invaderSpeed = 2;
    updateScore();
    updateLevel();
    updateBestScores();
    initializeInvaders();
    initializeGameStars();
}

function showGameOverModal(score, bestScore) {
    document.getElementById('finalScore').innerText = score;
    document.getElementById('bestScore').innerText = bestScore;

    const modal = document.getElementById('gameOverModal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.display = 'none';
        initializeGame();
        draw();
    }, 10000);
}

function initializeInvaders() {
    invaders = [];
    for (let row = 0; row < invaderRowCount; row++) {
        invaders[row] = [];
        for (let col = 0; col < invaderColumnCount; col++) {
            let invaderX = col * (invaderWidth + invaderPadding) + invaderOffsetLeft;
            let invaderY = row * (invaderHeight + invaderPadding) + invaderOffsetTop;
            invaders[row][col] = { x: invaderX, y: invaderY, status: 1 };
        }
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function detectCollision(svg1, svg2) {
    const rect1 = svg1.getBoundingClientRect();
    const rect2 = svg2.getBoundingClientRect();

    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

function randomizeSVG(svgElement) {
    const directions = ['top', 'bottom', 'left', 'right'];
    const entrySide = directions[getRandomInt(0, directions.length - 1)];
    
    let startX, startY, endX, endY;

    switch (entrySide) {
        case 'top':
            startX = getRandomInt(0, window.innerWidth);
            startY = -50;
            endX = getRandomInt(0, window.innerWidth);
            endY = window.innerHeight + 50;
            break;
        case 'bottom':
            startX = getRandomInt(0, window.innerWidth);
            startY = window.innerHeight + 50;
            endX = getRandomInt(0, window.innerWidth);
            endY = -50;
            break;
        case 'left':
            startX = -50;
            startY = getRandomInt(0, window.innerHeight);
            endX = window.innerWidth + 50;
            endY = getRandomInt(0, window.innerHeight);
            break;
        case 'right':
            startX = window.innerWidth + 50;
            startY = getRandomInt(0, window.innerHeight);
            endX = -50;
            endY = getRandomInt(0, window.innerHeight);
            break;
    }

    svgElement.style.top = startY + 'px';
    svgElement.style.left = startX + 'px';
    const randomDuration = getRandomInt(30, 40);
    svgElement.style.transition = `transform ${randomDuration}s linear`;
    svgElement.style.transform = `translate(${endX - startX}px, ${endY - startY}px) rotate(${getRandomInt(0, 360)}deg)`;
}

function handleCollisions(svgElements) {
    for (let i = 0; i < svgElements.length; i++) {
        for (let j = i + 1; j < svgElements.length; j++) {
            if (detectCollision(svgElements[i], svgElements[j])) {
                svgElements[i].style.transform = `translate(-100vw, -100vh) rotate(${getRandomInt(0, 360)}deg)`;
                svgElements[j].style.transform = `translate(100vw, 100vh) rotate(${getRandomInt(0, 360)}deg)`;
                svgElements[i].style.transition = 'transform 1s linear';
                svgElements[j].style.transition = 'transform 1s linear';
            }
        }
    }
}

function reintroduceSVG(svgElement) {
    const rect = svgElement.getBoundingClientRect();
    if (
        rect.top > window.innerHeight ||
        rect.bottom < 0 ||
        rect.left > window.innerWidth ||
        rect.right < 0
    ) {
        randomizeSVG(svgElement);
    }
}

const svgElements = document.querySelectorAll('.random-svg');
svgElements.forEach(svg => {
    randomizeSVG(svg);
    svg.addEventListener('transitionend', () => {
        reintroduceSVG(svg);
        randomizeSVG(svg);
    });
});

setInterval(() => {
    handleCollisions(svgElements);
}, 100);

function drawText() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.font = "24px 'Press Start 2P'";
    ctx.fillStyle = "white";

    const text = "Démarre une partie..";

    const textWidth = ctx.measureText(text).width;
    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;
    ctx.fillText(text, canvasCenterX - textWidth / 2, canvasCenterY);
}

window.onload = drawText;
