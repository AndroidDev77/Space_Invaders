const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const aliens = [];
const alienRowCount = 5;
const alienColumnCount = 10;
const bullets = [];
const bulletSpeed = 9;
// Load the alien sprites
const alienImage1 = new Image();
alienImage1.src = 'alien_sprite.png';
const alienImage2 = new Image();
alienImage2.src = 'alien_sprite2.png';

let alienDirection = 1;
let alienXSpeed = 1;
let alienYSpeed = 0.1;
let gameOver = false;
let gameWon = false;
let updating = false;

let alienFrameCounter = 0;
const alienFrameSwitchRate = 30;


// Game objects
const player = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    width: 50,
    height: 20,
    dx: 5
};


for (let r = 0; r < alienRowCount; r++) {
    aliens[r] = [];
    for (let c = 0; c < alienColumnCount; c++) {
        aliens[r][c] = {
            x: (c * 80) + 50,
            y: (r * 40) + 30,
            width: 40,
            height: 30,
            alive: true
        };
    }
}

function drawPlayer() {
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawAliens() {
	
    for (const row of aliens) {
        for (const alien of row) {
            if (alien.alive) {
                const currentAlienImage = (Math.floor(alienFrameCounter / alienFrameSwitchRate) % 2 === 0) ? alienImage1 : alienImage2;
                ctx.drawImage(currentAlienImage, alien.x, alien.y, alien.width, alien.height);
            }
        }
    }
}

// Keyboard controls
const keys = {
    left: false,
    right: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        keys.left = true;
    } else if (e.key === 'ArrowRight') {
        keys.right = true;
    }else if (e.key === 'r' ) {
        restartGame();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        keys.left = false;
    } else if (e.key === 'ArrowRight') {
        keys.right = false;
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        shootBullet();
    }
});


function updatePlayerPosition() {
    if (keys.left && player.x > 0) {
        player.x -= player.dx;
    }

    if (keys.right && player.x < canvas.width - player.width) {
        player.x += player.dx;
    }
}

function shootBullet() {
    const bullet = {
        x: player.x + player.width / 2,
        y: player.y,
		width: 3,
		height: 15,
        radius: 5
    };
    bullets.push(bullet);
}

function drawBullets() {
    ctx.fillStyle = 'yellow';
    for (const bullet of bullets) {
        ctx.beginPath();
		ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.width / 2, bullet.width, bullet.height);
        ctx.fill();
    }
}

function updateBulletPositions() {
    for (const bullet of bullets) {
        bullet.y -= bulletSpeed;
    }

    // Remove bullets that are off the canvas
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }
}


function checkBulletAlienCollision(bullet, alien) {
    const bulletLeft = bullet.x;
    const bulletRight = bullet.x + bullet.width;
    const bulletTop = bullet.y;
    const bulletBottom = bullet.y + bullet.height;

    const alienLeft = alien.x;
    const alienRight = alien.x + alien.width;
    const alienTop = alien.y;
    const alienBottom = alien.y + alien.height;

    return (
        bulletRight > alienLeft &&
        bulletLeft < alienRight &&
        bulletBottom > alienTop &&
        bulletTop < alienBottom
    );
}


function updateAlienPositions() {
    let changeDirection = false;

    for (let r = 0; r < alienRowCount; r++) {
        for (let c = 0; c < alienColumnCount; c++) {
            const alien = aliens[r][c];
			//console.log('Alien['+r+']['+c+']: X:'+ alien.x + ' Y:' + alien.y);
            if (alien.alive) {
                alien.x += alienXSpeed * alienDirection;

                if (!changeDirection && (alien.x + alien.width/2 >= canvas.width || alien.x <= 0)) {
                    changeDirection = true;
                }
            }
        }
    }

    if (changeDirection) {
        alienDirection *= -1;
        for (const row of aliens) {
            for (const alien of row) {
                if (alien.alive) {
                    alien.y += alienYSpeed * alien.height / 2;

                    if (alien.y + alien.height >= player.y) {
                        gameOver = true;
                    }
                }
            }
        }
    }
}


function updateBulletsAndAliens() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];

        for (let r = 0; r < alienRowCount; r++) {
            for (let c = 0; c < alienColumnCount; c++) {
                const alien = aliens[r][c];

                if (alien.alive && checkBulletAlienCollision(bullet, alien)) {
                    alien.alive = false;
					alienXSpeed += 0.05;
					alienYSpeed += 0.05;
                    bullets.splice(i, 1);
                    break;
                }
            }
        }
    }
}

function checkWinCondition() {
    let allAliensDead = true;
    
    for (const row of aliens) {
        for (const alien of row) {
            if (alien.alive) {
                allAliensDead = false;
                break;
            }
        }

        if (!allAliensDead) {
            break;
        }
    }

    if (allAliensDead) {
        gameWon = true;
    }
}


// Add the restartGame function
function restartGame() {
    // Reset player position
    player.x = canvas.width / 2;
	alienDirection = 1;
	alienXSpeed = 1;
	alienYSpeed = 0.1;
	alienFrameCounter = 0;
    // Reset aliens
    for (let r = 0; r < alienRowCount; r++) {
        for (let c = 0; c < alienColumnCount; c++) {
            aliens[r][c] = {
                x: (c * 80) + 50,
                y: (r * 40) + 30,
                width: 40,
                height: 30,
                alive: true
            };
        }
    }

    // Reset bullets
    bullets.length = 0;
	
	// Reset base
	initBase();

    // Reset game over status
    gameOver = false;
	gameWon = false;
	updating = false;
}

// Add an array to store alien bullets
const alienBullets = [];

// Define alien bullet properties
const alienBulletWidth = 5;
const alienBulletHeight = 15;
const alienBulletSpeed = 3;

// Function to choose a random shooting alien
function randomShootingAlien() {
    const aliveAliens = [];
    for (const row of aliens) {
        for (const alien of row) {
            if (alien.alive) {
                aliveAliens.push(alien);
            }
        }
    }

    if (aliveAliens.length === 0) {
        return null;
    }

    return aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
}

// Function to update alien bullet positions
function updateAlienBulletPositions() {
    for (const bullet of alienBullets) {
        bullet.y += alienBulletSpeed;
    }

    // Remove off-screen bullets
    for (let i = 0; i < alienBullets.length; i++) {
        if (alienBullets[i].y > canvas.height) {
            alienBullets.splice(i, 1);
            i--;
        }
    }
}

// Function to draw alien bullets
function drawAlienBullets() {
    ctx.fillStyle = 'red';
    for (const bullet of alienBullets) {
        ctx.fillRect(bullet.x, bullet.y, alienBulletWidth, alienBulletHeight);
    }
}

// Function to check for collisions between alien bullets and the player
function checkAlienBulletPlayerCollision() {
    for (const bullet of alienBullets) {
        if (bullet.x < player.x + player.width &&
            bullet.x + alienBulletWidth > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + alienBulletHeight > player.y) {
            gameOver = true;
        }
    }
}

const base = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 50,
    width: 100,
    height: 20,
    parts: [],
    partWidth: 20,
    partHeight: 20
};

function initBase(){
	// Initialize base parts
	for (let i = 0; i < base.width / base.partWidth; i++) {
		base.parts.push({ x: base.x + i * base.partWidth, y: base.y, destroyed: false });
	}
}
// Function to draw the base
function drawBase() {
    ctx.fillStyle = 'gray';
    for (const part of base.parts) {
        if (!part.destroyed) {
            ctx.fillRect(part.x, part.y, base.partWidth, base.partHeight);
        }
    }
}

// Function to check for collisions between bullets and the base
function checkBulletBaseCollision() {
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];

        for (const part of base.parts) {
            if (!part.destroyed &&
                bullet.x + bullet.width > part.x &&
                bullet.x < part.x + base.partWidth &&
                bullet.y + bullet.height > part.y &&
                bullet.y < part.y + base.partHeight) {
                part.destroyed = true;
                bullets.splice(i, 1);
                i--;
                break;
            }
        }
    }
	
    for (let i = 0; i < alienBullets.length; i++) {
	const bullet = alienBullets[i];

		for (const part of base.parts) {
			if (!part.destroyed &&
				bullet.x + alienBulletWidth > part.x &&
				bullet.x < part.x + base.partWidth &&
				bullet.y + alienBulletHeight > part.y &&
				bullet.y < part.y + base.partHeight) {
				part.destroyed = true;
				alienBullets.splice(i, 1);
				i--;
				break;
			}
		}
    }
}

function update() {
	
	// If the game is already updating, do not start another update loop
    if (updating) {
        return;
    }

    // Set the updating status to true
    updating = true;
    // Update game objects here
    updatePlayerPosition();
    updateBulletPositions();
    updateBulletsAndAliens();
    updateAlienPositions();
    updateAlienBulletPositions();
	
	checkBulletBaseCollision();
    checkAlienBulletPlayerCollision();
	checkWinCondition();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw game objects
    drawPlayer();
    drawAliens();
    drawBullets();
	drawAlienBullets();
	drawBase();
	
	alienFrameCounter++;

    if (!gameOver && !gameWon) {
        // Request the next animation frame
        requestAnimationFrame(update);
    } else {
        ctx.font = '48px sans-serif';
        ctx.fillStyle = 'red';

        if (gameOver) {
            ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
	
        } else if (gameWon) {
            ctx.fillStyle = 'green';
            ctx.fillText('You Win!', canvas.width / 2 - 100, canvas.height / 2);
        }
        // Wait for 5 seconds before restarting the game
        setTimeout(() => {
            restartGame();
        }, 5000);
		requestAnimationFrame(update);
    }
	updating = false;
}

// Add a setInterval to occasionally make aliens shoot
setInterval(() => {
    const shootingAlien = randomShootingAlien();
    if (shootingAlien) {
        alienBullets.push({
            x: shootingAlien.x + shootingAlien.width / 2 - alienBulletWidth / 2,
            y: shootingAlien.y + shootingAlien.height
        });
    }
}, 2000);

initBase();
update();
