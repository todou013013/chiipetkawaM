const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GRID_SIZE = 5;
const TILE_SIZE = canvas.width / GRID_SIZE;
const IMAGES = ['aaa2.png', 'bb2.png', 'cc2.png', 'dd2.png', 'explosion1.jpg']; 

const playerImages = ['me1.png', 'me2.png', 'me3.png', 'me4.png', 'me5.png', 'me6.png']; 
const enemyImages = ['en1.png', 'en2.png', 'en3.png', 'en4.png', 'en5.png'];


let grid = Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => randomImage()));
let selectedTile = null;
let matchesToRemove = [];
let explosionTiles = [];
let isAnimating = false;


let playerHealth = 100;
let enemyHealth = 100;
let rounds = 8;
let levels = 1;
let steps = 5;
let enemyScore = 60;
let score = 0; 
let showenemyscore = enemyScore ;
let levelsteps = 5 ;
let totalEnemyHealth = 100;
let currentEnemyHealth = 100;

let currentPlayerImage = getRandomImage(playerImages); 
let currentEnemyImage = getRandomImage(enemyImages);
function getRandomImage(images) {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}


window.onload = function() {
    
    const playerImage = getRandomImage(playerImages);
    document.getElementById("playerImage").src = playerImage;

    const enemyImage = getRandomImage(enemyImages);
    document.getElementById("enemyImage").src = enemyImage;
};


function saveGameData() {
    const gameData = {
        playerHealth,
        enemyHealth,
        rounds,
        levels,
        steps,
        enemyScore,
        score,
        levelsteps,
        totalEnemyHealth,
        grid ,
        playerImage,
        enemyImage
    };
    localStorage.setItem('gameData', JSON.stringify(gameData));
}

function loadGameData() {
    const savedData = JSON.parse(localStorage.getItem('gameData'));
    if (savedData) {
        playerHealth = savedData.playerHealth;
        enemyHealth = savedData.enemyHealth;
        rounds = savedData.rounds;
        levels = savedData.levels;
        steps = savedData.steps;
        enemyScore = savedData.enemyScore;
        score = savedData.score;
        levelsteps = savedData.levelsteps;
        totalEnemyHealth = savedData.totalEnemyHealth;
        grid = savedData.grid;
        playerImage=savedData.playerImage;
        enemyImage=savedData.enemyImage;
        updatePlayerImage();
        updateEnemyImage();

        updateStatus();
        drawGrid(); 
    }
}


function resetGame() {
    
    localStorage.removeItem('gameData');
    playerHealth = 100;
    enemyHealth = 100;
    rounds = 8;
    levels = 1;
    steps = 5;
    enemyScore = 60;
    score = 0;
    showenemyscore = enemyScore;
    levelsteps = steps;
    totalEnemyHealth = 100;

    initializeGrid(); 
    updateStatus(); 
    drawGrid(); 
    saveGameData();
}


function resetdata() {
    steps++;
    levelsteps = steps; 
    levels++; 
    rounds = 8;
    enemyScore = 60 + 10 * (levels-1); 
    enemyHealth = 100 + 20 * (levels-1); 

    totalEnemyHealth =100 + 20 * (levels-1);
    currentEnemyImage = getRandomImage(enemyImages);
    saveGameData();

    updateStatus(); 
    
}
function updateEnemyImage() {
    document.getElementById('en1').src = currentEnemyImage;
}


function updatePlayerImage() {
    document.getElementById('me1').src = currentPlayerImage;
}

function updateStatus() {
    document.getElementById('level').innerText = levels;
    document.getElementById('round').innerText = rounds;
    document.getElementById('currentsteps').innerText = steps;
    document.getElementById('steps').innerText = levelsteps;
    
    document.getElementById('playerHealth').innerText = playerHealth;
    document.getElementById('currentenemyHealth').innerText = enemyHealth;
    document.getElementById('totalEnemyHealth').innerText = 100 + 20 * (levels-1);
    document.getElementById('score').innerText = score; 
    document.getElementById('showenemyscore').innerText = enemyScore;

    const playerHealthPercent = (playerHealth / 100) * 100;
    const enemyHealthPercent = (enemyHealth / totalEnemyHealth) * 100;

    document.getElementById('playerHealthFill').style.width = playerHealthPercent + '%';
    
    document.getElementById('enemyHealthFill').style.width = enemyHealthPercent + '%';
    saveGameData();

}


function calculateDamage(explosionCount) {
    

    
    score += explosionCount * 2; 

    if(steps==0){

        
    
        
        
    }
    if (enemyHealth <= 0) {
        enemyHealth = 0;
        alert('敵人被打敗，進入下一關！');
        updateStatus()
        resetdata();
    }
    saveGameData();

    updateStatus();
}

function resetGrid() {
  
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            let newTile;
            let retryCount = 0;

           
            do {
                newTile = randomImage(); 
                retryCount++;
                
            } while (checkForAdjacentMatches(x, y, newTile)); 

            grid[y][x] = newTile;
        }
    }

    
    drawGrid();
    saveGameData();

}



document.getElementById('resetButton').addEventListener('click', resetGrid);



function resetRound() {
    steps = 5;
    enemyHealth = 100; 
    updateStatus();
}


function endTurn() {
    steps = levelsteps; 
    rounds--; 
    
    if (rounds <= 0 ) {
        
        alert('遊戲結束！'); 
        resetGame();
        return;

    }

    
    
    const matches = checkMatches();
    if (matches.length > 0) {
        
        removeTiles(matches);
        animateRemoval();
    } else {
        
        if (score > enemyScore) {
            const damage = score - enemyScore;
            enemyHealth -= damage;
        }else if (score < enemyScore){
            const damage = enemyScore - score;
            playerHealth -= damage;
        }
        score = 0 ;

        if (enemyHealth <= 0) {
        
            alert('敵人被打敗，進入下一關！');
            enemyHealth = 0;
            updateStatus()
            
            resetdata();
        }

         
    if (rounds <= 0 ) {
        
        alert('遊戲結束！'); 
        resetGame();
        return;

    }

    if( playerHealth <= 0){
        playerHealth = 0;
        alert('遊戲結束！'); 
        resetGame();
        return;

    }
        saveGameData();
        updateStatus();
    }
    saveGameData();
    updateStatus();
}



function weightedRandomImage(x, y) {
    const neighboringTiles = [];

   
    for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
            if (dx === 0 && dy === 0) continue; 
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                neighboringTiles.push(grid[ny][nx]);
            }
        }
    }

    
    const count = {};
    neighboringTiles.forEach(tile => {
        if (tile !== undefined) {
            count[tile] = (count[tile] || 0) + 1;
        }
    });

   
    
  const mostCommonTile = neighboringTiles.sort((a, b) => count[b] - count[a])[0];
    
    
    const threshold = count[mostCommonTile] / neighboringTiles.length; 
    return Math.random() < threshold ? mostCommonTile : IMAGES[Math.floor(Math.random() * (IMAGES.length - 1))];

}


function randomImage() {
    return IMAGES[Math.floor(Math.random() * (IMAGES.length - 1))]; 
}


function initializeGrid() {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            let newTile;
            let retryCount = 0; 

            
            do {
                newTile = randomImage(); 
                retryCount++;
                if (retryCount > 10) {
                    console.log("重試達到最大次數，退出重試"); 
                    break;
                }
            } while (checkForAdjacentMatches(x, y, newTile)); 

            grid[y][x] = newTile;
        }
    }
}


function checkForAdjacentMatches(x, y, tile) {
    
    if (
        (x > 1 && grid[y][x - 1] === tile && grid[y][x - 2] === tile) ||
        (x > 0 && x < GRID_SIZE - 1 && grid[y][x - 1] === tile && grid[y][x + 1] === tile) ||
        (x < GRID_SIZE - 2 && grid[y][x + 1] === tile && grid[y][x + 2] === tile)
    ) {
        return true;
    }

    
    if (
        (y > 1 && grid[y - 1][x] === tile && grid[y - 2][x] === tile) ||
        (y > 0 && y < GRID_SIZE - 1 && grid[y - 1][x] === tile && grid[y + 1][x] === tile) ||
        (y < GRID_SIZE - 2 && grid[y + 1][x] === tile && grid[y + 2][x] === tile)
    ) {
        return true;
    }

    return false; 
}





let highlightedTile = null; 

const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;
const offscreenCtx = offscreenCanvas.getContext('2d');

function drawGrid() {
    
    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    
    grid.forEach((row, y) => {
        row.forEach((img, x) => {
            const image = new Image();
            image.src = img;
            offscreenCtx.drawImage(image, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

           
            if (highlightedTile && highlightedTile.x === x && highlightedTile.y === y) {
                offscreenCtx.strokeStyle = 'gray'; 
                offscreenCtx.lineWidth = 6; 
                offscreenCtx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        });
    });

    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvas, 0, 0);
}



canvas.addEventListener('click', (event) => {
    const { tileX, tileY } = getTileAtMouse(event.offsetX, event.offsetY);

    
    if (tileX >= 0 && tileX < GRID_SIZE && tileY >= 0 && tileY < GRID_SIZE) {
        if (!highlightedTile) {
            
            highlightedTile = { x: tileX, y: tileY };
        } else {
            
            if (
                (Math.abs(tileX - highlightedTile.x) === 1 && tileY === highlightedTile.y) || 
                (Math.abs(tileY - highlightedTile.y) === 1 && tileX === highlightedTile.x)
            ) {
                
                const temp = grid[highlightedTile.y][highlightedTile.x];
                grid[highlightedTile.y][highlightedTile.x] = grid[tileY][tileX];
                grid[tileY][tileX] = temp;

                steps--; 
                const explosionCount = matchesToRemove.length;
                score += explosionCount * 2;
                updateStatus(); 

                if (steps === 0) {
                    endTurn(); 
                    updateStatus();
                }
               
                let matches = checkMatches();
                if (matches.length > 0 && !isAnimating) {
                    isAnimating = true; 
                    removeTiles(matches);
                    animateRemoval(); 
                }

                
                highlightedTile = null;
            } else {
                
                highlightedTile = { x: tileX, y: tileY };
            }
        }
    }
});


function getTileAtMouse(x, y) {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    return { tileX, tileY };
}

function checkMatches() {
    const toRemove = new Set();
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const currentTile = grid[y][x];
            if (!currentTile) continue;

            
            if (x < GRID_SIZE - 2 && currentTile === grid[y][x + 1] && currentTile === grid[y][x + 2]) {
                toRemove.add(`${y},${x}`);
                toRemove.add(`${y},${x + 1}`);
                toRemove.add(`${y},${x + 2}`);
            }
            
            if (y < GRID_SIZE - 2 && currentTile === grid[y + 1][x] && currentTile === grid[y + 2][x]) {
                toRemove.add(`${y},${x}`);
                toRemove.add(`${y + 1},${x}`);
                toRemove.add(`${y + 2},${x}`);
            }
        }
    }
    return Array.from(toRemove);
}

function removeTiles(tilesToRemove) {
    matchesToRemove = tilesToRemove;
    matchesToRemove.forEach(tile => {
        const [y, x] = tile.split(',').map(Number);

        
        explosionTiles.push({ x, y });

        
        const explosionDiv = document.createElement('div');
        explosionDiv.classList.add('explode');
        explosionDiv.style.width = `${TILE_SIZE}px`; 
        explosionDiv.style.height = `${TILE_SIZE}px`;

        
        const canvas = document.getElementById('gameCanvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        
        explosionDiv.style.left = `${canvasRect.left + x * TILE_SIZE}px`;
        explosionDiv.style.top = `${canvasRect.top + y * TILE_SIZE}px`;

        
        const canvasContainer = document.querySelector('#gameCanvas').parentElement; 
        canvasContainer.appendChild(explosionDiv);

        
        explosionDiv.addEventListener('animationend', () => {
            explosionDiv.remove();
        });

        
        grid[y][x] = null;
    });
}

function dropTiles() {
    for (let x = 0; x < GRID_SIZE; x++) {
        let emptyCount = 0;  

       
        for (let y = GRID_SIZE - 1; y >= 0; y--) {
            if (grid[y][x] === null) {
                emptyCount++;  
            } else if (emptyCount > 0) {
                
                grid[y + emptyCount][x] = grid[y][x];
                grid[y][x] = null;
            }
        }

        
        for (let y = 0; y < emptyCount; y++) {
            let newTile;
            newTile = weightedRandomImage();
            
            grid[y][x] = newTile;
        }
    }
    
    const matchesAfterDrop = checkMatches();
    if (matchesAfterDrop.length > 0) {
        removeTiles(matchesAfterDrop);
        return true; 
    }
    
    return false; 

    
}


function animateRemoval() {
    if (matchesToRemove.length > 0) {
        drawGrid(); 
        setTimeout(() => {
            explosionTiles = []; 
            const explosionCount = matchesToRemove.length; 
            const newMatches = dropTiles();
            calculateDamage(explosionCount); 
            if (newMatches) {
                
                
                setTimeout(animateRemoval, 800); 
            } else {

                if(steps == levelsteps ){
                    if (score > enemyScore) {
                        const damage = score - enemyScore;
                        enemyHealth -= damage;
                    }else if (score < enemyScore){
                        const damage = enemyScore - score;
                        playerHealth -= damage;
                    }
                    score = 0 ;

                    if (enemyHealth <= 0) {
        
                        alert('敵人被打敗，進入下一關！');
                        enemyHealth = 0;
                        updateStatus()
                        
                        resetdata();
                    }

                    if( playerHealth <= 0){
                        playerHealth = 0;
                        alert('遊戲結束！'); 
                        resetGame();
                        return;
                
                    }
                    updateStatus();
                }
                matchesToRemove = []; 
                isAnimating = false; 
            }
        }, 800); 
    }
}

canvas.addEventListener('mousedown', (event) => {
    const { tileX, tileY } = getTileAtMouse(event.offsetX, event.offsetY);
    if (tileX >= 0 && tileX < GRID_SIZE && tileY >= 0 && tileY < GRID_SIZE) {
        selectedTile = { x: tileX, y: tileY };
    }
});

canvas.addEventListener('mouseup', (event) => {
    if (selectedTile) {
        const { tileX, tileY } = getTileAtMouse(event.offsetX, event.offsetY);
        
        if (
            (Math.abs(tileX - selectedTile.x) === 1 && tileY === selectedTile.y) || 
            (Math.abs(tileY - selectedTile.y) === 1 && tileX === selectedTile.x)
        ) {
            
            const temp = grid[selectedTile.y][selectedTile.x];
            grid[selectedTile.y][selectedTile.x] = grid[tileY][tileX];
            grid[tileY][tileX] = temp;

             steps--; 
             const explosionCount = matchesToRemove.length;
             score += explosionCount * 2;
             updateStatus(); 
             saveGameData();
            

            if (steps == 0) {
                endTurn(); 
                saveGameData();
                updateStatus();
            }

            

            let matches = checkMatches();
            if (matches.length > 0 && !isAnimating) {
                isAnimating = true; 
                removeTiles(matches);
                animateRemoval(); 
            } 
            
        }
        selectedTile = null; 
    }
});

function gameLoop() {
    drawGrid(); 
    requestAnimationFrame(gameLoop);
}


window.addEventListener('load', () => {
    loadGameData();
    updatePlayerImage(); 
    updateEnemyImage(); 
});


initializeGrid();

gameLoop();
