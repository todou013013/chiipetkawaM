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
let score = 0; // 新增分數變數
let showenemyscore = enemyScore ;
let levelsteps = 5 ;
let totalEnemyHealth = 100;
let currentEnemyHealth = 100;

let currentPlayerImage = getRandomImage(playerImages); // 隨機選擇玩家圖片
let currentEnemyImage = getRandomImage(enemyImages); // 隨機選擇敵人圖片
function getRandomImage(images) {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}


window.onload = function() {
    // 隨機選擇並設置自己的圖片
    const playerImage = getRandomImage(playerImages);
    document.getElementById("playerImage").src = playerImage;

    // 隨機選擇並設置敵人的圖片（這是在遊戲開始時選擇）
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
        drawGrid(); // 根據儲存的格子重新繪製遊戲
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

    initializeGrid(); // 重新生成遊戲網格
    updateStatus(); // 更新顯示
    drawGrid(); // 重繪網格
    saveGameData(); // 儲存重置後的資料
}


function resetdata() {
    steps++;
    levelsteps = steps; 
    levels++; // 進入下一關，關卡數加1
    rounds = 8;
    enemyScore = 60 + 10 * (levels-1); 
    enemyHealth = 100 + 20 * (levels-1); 

    totalEnemyHealth =100 + 20 * (levels-1);
    currentEnemyImage = getRandomImage(enemyImages);
    saveGameData();

    updateStatus(); // 更新狀態顯示
    
}
function updateEnemyImage() {
    document.getElementById('en1').src = currentEnemyImage;
}

// 更新玩家圖片顯示
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
    document.getElementById('score').innerText = score; // 更新即時分數
    document.getElementById('showenemyscore').innerText = enemyScore;

    const playerHealthPercent = (playerHealth / 100) * 100;
    const enemyHealthPercent = (enemyHealth / totalEnemyHealth) * 100;

    document.getElementById('playerHealthFill').style.width = playerHealthPercent + '%';
    
    document.getElementById('enemyHealthFill').style.width = enemyHealthPercent + '%';
    saveGameData();

}


function calculateDamage(explosionCount) {
    

    // 更新分數
    score += explosionCount * 2; // 每有一個爆炸方塊得2分

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

// 只刷新遊戲格子的函數
// 只刷新遊戲格子的函數，並避免三個相鄰相同的圖案
function resetGrid() {
    // 重新生成遊戲格子的圖案，確保不會有三個相鄰的相同圖案
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            let newTile;
            let retryCount = 0;

            // 嘗試隨機生成圖案並檢查，最多重試10次
            do {
                newTile = randomImage(); // 隨機生成新圖案
                retryCount++;
                
            } while (checkForAdjacentMatches(x, y, newTile)); // 檢查相鄰的方格

            grid[y][x] = newTile;
        }
    }

    // 重新繪製遊戲板
    drawGrid();
    saveGameData();

}


// 監聽按鈕點擊事件
document.getElementById('resetButton').addEventListener('click', resetGrid);



function resetRound() {
    steps = 5;
    enemyHealth = 100; // 重置敵人血量
    updateStatus();
}

// 檢查並更新步數和回合數
function endTurn() {
    steps = levelsteps; // 重置步數
    rounds--; // 減少回合數
    
    if (rounds <= 0 ) {
        
        alert('遊戲結束！'); // 若回合數歸零，結束遊戲
        resetGame();
        return;

    }

    
    
    const matches = checkMatches();
    if (matches.length > 0) {
        // 如果有匹配，開始動畫，並在 `animateRemoval` 中結算
        removeTiles(matches);
        animateRemoval();
    } else {
        // 如果沒有匹配，直接計算傷害
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
        
        alert('遊戲結束！'); // 若回合數歸零，結束遊戲
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
// 繼續你之前的遊戲邏輯...


function weightedRandomImage(x, y) {
    const neighboringTiles = [];

    // 一層和兩層範圍的方塊
    for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
            if (dx === 0 && dy === 0) continue; // 忽略自己
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                neighboringTiles.push(grid[ny][nx]);
            }
        }
    }

    // 計算鄰居中出現最多次的方塊類型，排除空值
    const count = {};
    neighboringTiles.forEach(tile => {
        if (tile !== undefined) {
            count[tile] = (count[tile] || 0) + 1;
        }
    });

    // 確保有鄰近方塊的有效數據
    
  const mostCommonTile = neighboringTiles.sort((a, b) => count[b] - count[a])[0];
    
    // 動態加權隨機，增加最常見類型的出現機率
    const threshold = count[mostCommonTile] / neighboringTiles.length; // 依據鄰居比例來決定機率
    return Math.random() < threshold ? mostCommonTile : IMAGES[Math.floor(Math.random() * (IMAGES.length - 1))];

}

// 隨機生成圖案，並確保不會與相鄰方格重複
function randomImage() {
    return IMAGES[Math.floor(Math.random() * (IMAGES.length - 1))]; // 不包括爆炸圖片
}

// 初始化網格並確保不會有三個相鄰的相同圖案
function initializeGrid() {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            let newTile;
            let retryCount = 0; // 設置最大重試次數，防止無窮迴圈

            // 嘗試隨機生成圖案並檢查，最多重試10次
            do {
                newTile = randomImage(); // 隨機生成新圖案
                retryCount++;
                if (retryCount > 10) {
                    console.log("重試達到最大次數，退出重試"); // 如果重試達到最大次數，退出
                    break;
                }
            } while (checkForAdjacentMatches(x, y, newTile)); // 檢查相鄰的方格

            grid[y][x] = newTile;
        }
    }
}

// 檢查是否會產生三個或更多相鄰相同的方格
function checkForAdjacentMatches(x, y, tile) {
    // 檢查水平方向
    if (
        (x > 1 && grid[y][x - 1] === tile && grid[y][x - 2] === tile) ||
        (x > 0 && x < GRID_SIZE - 1 && grid[y][x - 1] === tile && grid[y][x + 1] === tile) ||
        (x < GRID_SIZE - 2 && grid[y][x + 1] === tile && grid[y][x + 2] === tile)
    ) {
        return true;
    }

    // 檢查垂直方向
    if (
        (y > 1 && grid[y - 1][x] === tile && grid[y - 2][x] === tile) ||
        (y > 0 && y < GRID_SIZE - 1 && grid[y - 1][x] === tile && grid[y + 1][x] === tile) ||
        (y < GRID_SIZE - 2 && grid[y + 1][x] === tile && grid[y + 2][x] === tile)
    ) {
        return true;
    }

    return false; // 如果沒有三個相鄰相同，返回 false
}




// 新增變數儲存發光的方塊
let highlightedTile = null; // 用來儲存被選中的方塊
// 建立離屏畫布
const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;
const offscreenCtx = offscreenCanvas.getContext('2d');

function drawGrid() {
    // 清空離屏畫布
    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    // 在離屏畫布上繪製內容
    grid.forEach((row, y) => {
        row.forEach((img, x) => {
            const image = new Image();
            image.src = img;
            offscreenCtx.drawImage(image, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

            // 如果該方塊是被選中的方塊，繪製框線
            if (highlightedTile && highlightedTile.x === x && highlightedTile.y === y) {
                offscreenCtx.strokeStyle = 'gray'; // 框線顏色
                offscreenCtx.lineWidth = 6; // 框線粗細
                offscreenCtx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        });
    });

    // 將離屏畫布的內容渲染到主畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvas, 0, 0);
}


// 監聽單擊事件進行選擇和交換
canvas.addEventListener('click', (event) => {
    const { tileX, tileY } = getTileAtMouse(event.offsetX, event.offsetY);

    // 確保點擊在有效範圍內
    if (tileX >= 0 && tileX < GRID_SIZE && tileY >= 0 && tileY < GRID_SIZE) {
        if (!highlightedTile) {
            // 若尚未選中任何方塊，則選擇當前方塊
            highlightedTile = { x: tileX, y: tileY };
        } else {
            // 如果已選中方塊，檢查是否為相鄰方塊
            if (
                (Math.abs(tileX - highlightedTile.x) === 1 && tileY === highlightedTile.y) || 
                (Math.abs(tileY - highlightedTile.y) === 1 && tileX === highlightedTile.x)
            ) {
                // 若相鄰，進行交換
                const temp = grid[highlightedTile.y][highlightedTile.x];
                grid[highlightedTile.y][highlightedTile.x] = grid[tileY][tileX];
                grid[tileY][tileX] = temp;

                steps--; // 每移動一步，步數減1
                const explosionCount = matchesToRemove.length;
                score += explosionCount * 2;
                updateStatus(); // 更新狀態顯示

                if (steps === 0) {
                    endTurn(); // 當步數歸0，執行結束回合的邏輯
                    updateStatus();
                }
               
                let matches = checkMatches();
                if (matches.length > 0 && !isAnimating) {
                    isAnimating = true; // 開始動畫
                    removeTiles(matches);
                    animateRemoval(); // 開始消除動畫
                }

                // 清除選中的方塊
                highlightedTile = null;
            } else {
                // 若非相鄰，則取消選中並重新選擇
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

            // 檢查水平方向
            if (x < GRID_SIZE - 2 && currentTile === grid[y][x + 1] && currentTile === grid[y][x + 2]) {
                toRemove.add(`${y},${x}`);
                toRemove.add(`${y},${x + 1}`);
                toRemove.add(`${y},${x + 2}`);
            }
            // 檢查垂直方向
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

        // 記錄爆炸的方塊位置
        explosionTiles.push({ x, y });

        // 在 canvas 上觸發爆炸效果
        const explosionDiv = document.createElement('div');
        explosionDiv.classList.add('explode');
        explosionDiv.style.width = `${TILE_SIZE}px`; // 根據格子大小設置爆炸效果大小
        explosionDiv.style.height = `${TILE_SIZE}px`;

        // 取得 canvas 元素相對於頁面的偏移量
        const canvas = document.getElementById('gameCanvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        // 設置爆炸效果的位置：加上 canvas 相對於頁面的偏移量
        explosionDiv.style.left = `${canvasRect.left + x * TILE_SIZE}px`;
        explosionDiv.style.top = `${canvasRect.top + y * TILE_SIZE}px`;

        // 爆炸效果添加到 canvas 父元素中
        const canvasContainer = document.querySelector('#gameCanvas').parentElement; // 父容器
        canvasContainer.appendChild(explosionDiv);

        // 動畫結束後移除 explosionDiv
        explosionDiv.addEventListener('animationend', () => {
            explosionDiv.remove();
        });

        // 將消除的格子設為 null
        grid[y][x] = null;
    });
}

function dropTiles() {
    for (let x = 0; x < GRID_SIZE; x++) {
        let emptyCount = 0;  // 記錄每列中空方塊的數量

        // 從下往上檢查
        for (let y = GRID_SIZE - 1; y >= 0; y--) {
            if (grid[y][x] === null) {
                emptyCount++;  // 若為空方塊則計數
            } else if (emptyCount > 0) {
                // 將上方的方塊移到空位，並將原位置設為空
                grid[y + emptyCount][x] = grid[y][x];
                grid[y][x] = null;
            }
        }

        // 在最上方生成新方塊來填補空位
        for (let y = 0; y < emptyCount; y++) {
            let newTile;
            newTile = weightedRandomImage();
            // 確保新方塊不會立即形成匹配
            grid[y][x] = newTile;
        }
    }
    // 檢查掉落後是否有新的組合
    const matchesAfterDrop = checkMatches();
    if (matchesAfterDrop.length > 0) {
        removeTiles(matchesAfterDrop);
        return true; // 返回有新消除發生
    }
    
    return false; // 返回無新消除發生

    
}


function animateRemoval() {
    if (matchesToRemove.length > 0) {
        drawGrid(); // 畫出目前的狀態
        setTimeout(() => {
            explosionTiles = []; // 清空爆炸動畫
            const explosionCount = matchesToRemove.length; // 計算爆炸方塊的數量
            const newMatches = dropTiles();
            calculateDamage(explosionCount); // 傳遞爆炸方塊的數量到計算傷害的函數
            if (newMatches) {
                // 如果有新的消除，則再次執行動畫
                
                setTimeout(animateRemoval, 800); // 這裡使用 setTimeout 來控制動畫流暢度
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
                        alert('遊戲結束！'); // 若回合數歸零，結束遊戲
                        resetGame();
                        return;
                
                    }
                    updateStatus();
                }
                matchesToRemove = []; // 清空消除的區域
                isAnimating = false; // 動畫結束
            }
        }, 800); // 延長時間到800毫秒
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
        // 檢查是否移動到相鄰的方格
        if (
            (Math.abs(tileX - selectedTile.x) === 1 && tileY === selectedTile.y) || 
            (Math.abs(tileY - selectedTile.y) === 1 && tileX === selectedTile.x)
        ) {
            // 交換位置
            const temp = grid[selectedTile.y][selectedTile.x];
            grid[selectedTile.y][selectedTile.x] = grid[tileY][tileX];
            grid[tileY][tileX] = temp;

             steps--; // 每移動一步，步數減1
             const explosionCount = matchesToRemove.length;
             score += explosionCount * 2;
             updateStatus(); // 更新狀態顯示
             saveGameData();
            

            if (steps == 0) {
                endTurn(); // 當步數歸0，執行結束回合的邏輯
                saveGameData();
                updateStatus();
            }

            

            let matches = checkMatches();
            if (matches.length > 0 && !isAnimating) {
                isAnimating = true; // 開始動畫
                removeTiles(matches);
                animateRemoval(); // 開始消除動畫
            } 
            
        }
        selectedTile = null; // 重置選中的方塊
    }
});

function gameLoop() {
    drawGrid(); // 每次都重畫畫布
    requestAnimationFrame(gameLoop);
}


window.addEventListener('load', () => {
    loadGameData();
    updatePlayerImage(); // 更新玩家圖片
    updateEnemyImage(); // 更新敵人圖片
});

// 初始化網格並開始遊戲
initializeGrid();

gameLoop();