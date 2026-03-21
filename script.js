

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
window.GAME_BET_AMOUNT = 75; // PKR
window.GAME_WIN_REWARD = 1000; // PKR
window.isBetGame = false;
let gameTurnCount = 0; // Track total turns for initial CPU 6s
window.redPlayerForfeitCount = 0; // Tracks how many times Red player has forfeited with three 6s

// GLOBAL VARS: These will be loaded from Firebase for dynamic rigging
window.designatedColorWinner = null; // Default CPU color winner (e.g., 'blue')
window.winningUserUID = null;       // Specific user (by UID) designated to win
window.gameSettingsReady = false;   // Flag to track if game settings are loaded

// Flags to ensure each setting listener has fired at least once
let designatedColorWinnerHasLoaded = false;
let winningUserUIDHasLoaded = false;


window.PAKISTANI_NAMES = [

'Ayesha','Fatima','CPU','Maria','Hina','Zainab','Sara','Iqra','Mehreen','Nida',
'Aiman','Amna','Anaya','Areeba','Arisha','Arooj','Asma','Ayat','Azka','Benish',
'Bushra','Dua','Eman','Esha','Fariha','Farwa','Hafsa','Hajra','Hiba','Humaira',
'Ifrah','Inaya','Iram','Isma','Javeria','Kainat','Kanza','Komal','Laiba','Lubna',
'Maham','Mahnoor','Malaika','Mariam','Mehwish','Minal','Misbah','Momina','Nabeela','Nadia',
'Naima','Naila','Nashra','Neelam','Nimra','Noor','Rabab','Rabia','Ramsha','Rania',
'Rashida','Rida','Rimsha','Saba','Sadia','Saima','Samina','Saniya','Shanza',
'Shazia','Sidra','Sobia','Sonia','Sumaira','Tabassum','Tahira','Tania','Tehmina','Uzma',
'Wajiha','Yasmin','Yumna','Zara','Zarmeen','Zehra','Zoya','Zunaira','Sehrish',

// Continue unique 👇
'Aleena','Alishba','Anum','Aqsa','Bareera','Erum','Falak','Ghazal','Hoorain','Jannat',
'Kashaf','Laraib','Mahira','Nargis','Qandeel','Rukhsar','Sahar','Shifa','Tooba','Zimal',

'Aabida','Aafiya','Aalia','Aamina','Aaniya','Aasma','Aatika','Abeer','Abeera','Abeerah',
'Abida','Abeeha','Adeelah','Adeena','Adiba','Adila','Afifa','Afra','Afreen','Afsana',
'Afsheen','Aghnia','Ahad','Ahlam','Aida','Aila','Aimanah','Aini','Aira','Aisha',
'Aiza','Aizah','Aiza','Aizal','Aizel','Ajwa','Akifa','Alaya','Aleesha','Alia',
'Alifa','Alina','Alishah','Aliza','Almas','Alsa','Alveena','Amal','Amani','Amara',
'Amat','Amber','Ambrin','Ameena','Amira','Amirah','Amna','Amreen','Anabia','Anam',
'Anbar','Andaleeb','Aneesa','Anfa','Anfal','Anhar','Anila','Anisa','Aniya','Anjum',
'Anmol','Anousha','Ansa','Anusha','Anwaar','Aqilah','Aqilah','Areej','Areesha','Areesha',
'Arfa','Arham','Arifa','Arjumand','Arshia','Arsala','Arub','Arwa','Asbah','Asfiya',
'Asima','Asiya','Asmaira','Asrar','Atia','Atika','Atiya','Aula','Auni','Ayesha Noor',

'Badria','Bano','Basira','Beenish','Bisma','Bismah','Bushaira','Bushrah','Buthaina',

'Caria','Celia',

'Dania','Daniyal','Daniyah','Darakhshan','Dareen','Daria','Dawoodah','Deeba','Deema','Dilara',
'Dilshad','CPU','Durdanah','Durre','Durre Shahwar',

'Eiliyah','Eimaan','Eiliya','Eira','Eliza','Elma','Erum','Eshaal','Eshal','Eshana','Eshita',

'Faatin','Fadwa','Faeeza','Fahmida','Faiqa','Faiza','Faizah','Fakhra','Falisha','Faran',
'Fareeda','Fareeha','Fareen','Faria','Farida','Farina','Farisha','Farzana','Faryal','Faseeha',
'Fasiha','Fateen','Fatin','Fauzia','Fawzia','Fazia','Feroza','Fizza','Fozia',

'Ghazala','Ghaziyah','Gul','Gulbahar','Gulnaz','Gulshan','Gulsher','Gulzar',

'Habiba','Hadiya','Hafeeza','Hafiza','Hajira','Haleema','Haleema Noor','Halima','Hameeda','Hameera',
'Hamida','Hamna','Hana','Haneen','Hania','Haniya','Hareem','Hareema','Hareera','Hareesa',
'Harisah','Haseena','Haseenah','Hassanah','Haya','Hayat','Hiba Noor','Hifza','Hina Noor',

'Ibadat','Ibra','Iffat','Iffrah','Ijlal','Ikra','Ilham','Iman','Imarah','Imrana',
'Inaaya','Inayat','Insha','Iqbal','Iqra Noor','Iram Fatima','Irfa','Irha','Irsa',

'Jahanara','Jameela','Jamilah','Jannatul','Javeriya','Jiya','Jumanah','Juveria',

'Kabeera','Kainaat','Kalsoom','Kamal','Kanza Noor','Kareema','Karima','Kashifa','Kausar',
'Khadija','Khalida','Khalila','Khawla','Kiran','Kishwar','Kulsoom','Kulsum',

'Labeeba','Laila','Lamees','Lamia','Lamisa','Lara','Latafat','Lateefa','Layan','Leena',
'Lubaba','Lubaina','Lubna Noor','Lujain',

'Mahbuba','Mahdiya','Mahira Noor','Mahjabeen','Mahpara','Mahreen','Mahrukh','Mahvish',
'Malika','Maliha','Maliha Noor','Mansha','Marjan','Maryam','Masooma','Mawra','Mehbooba',
'Mehjabeen','Mehjabeena','Mehreen Fatima','Mehrunisa','Mehwish Noor','Minal Fatima',

'Minahil','Minhaj','Mishal','Mishel','Mishra','Mishkat','Mubeena','Mubina','Mubashira',
'Mudassira','Mufida','Mujtaba','Muneeba','Munira','Muntaha','Munazza','Muniba',

'Nabeela Noor','Nabia','Nabila','Nadira','Nafeesa','Nafeesa Noor','Nagma','Nahid',
'Naheed','Naila Noor','Naimah','Najma','Najwa','Nashita','Nasia','Nasira','Nausheen',
'Naveda','Nayab','Nazia','Nighat','Nimrah','Nisreen','Noreen','Nosheen','Nusrat',

'Qadira','Qamar','Qamra','Qandeel Fatima','Qanita','Qaseeda','Qudsia','Quratulain',

'Rabail','Rabia Noor','Rabiya','Rafia','Raghad','Rahat','Raheela','Raheema','Rahila',
'Rahma','Rahmeen','Rahnuma','Raiha','Rakhshanda','Ramla','Rana','Rania Noor','Rashna',
'Rashmi','Razia','Reema','Rehana','Rehmat','Rehnuma','Reshma','Rida Noor','Rifaa',
'Rimsha Noor','Rizwana','Roha','Roheen','Ronaq','Roshni','Rukhsana','Rumana','Ruqaiya',

'Saba Noor','Sabahat','Sabah','Sabiha','Sabira','Sadaf','Sadia Noor','Safa','Safaa',
'Safiya','Safiyah','Sahar Noor','Sahiba','Sahira','Sahra','Saida','Saima Noor','Saira',
'Sajida','Sakeena','Salima','Salma','Samah','Sameena','Samia','Samina Noor','Sana Noor',
'Sania','Saniya Noor','Saqiba','Sara Noor','Sarina','Sarwat','Savera','Seema','Sehr',
'Seher','Shabana','Shabnam','Shaheen','Shaheena','Shahida','Shahina','Shahnaz','Shahzadi',
'Shaila','Shaima','Shaira','Shajia','Shakira','Shama','Shamaila','Shamim','Shamsa',
'Shamsia','Shanza Noor','Shazia Noor','Shehla','Shehnaz','Shehreen','Shehroze','Shehzadi',
'Shifa Noor','Shireen','Shiza','Shumaila','Shumayla','Sidra Noor','Sobia Noor','Sofia',
'Sonia Noor','Subia','Subhan','Sughra','Sukaina','Sumbal','Sumera','Sumra','Suraiya',

'Tabeer','Tabinda','Tahira Noor','Tahreem','Tahseen','Tajwar','Talha','Tamaana',
'Tamana','Tanzeela','Tanzia','Tasbeeh','Taskeen','Tasleem','Tasneem','Tassadaq',
'Tayyaba','Tehseen','Tehreem','Tuba Noor',

'Uzaira','Uzma Noor','Uzra',

'Wafa','Wafiya','Wahida','Wajeeha','Wajiha Noor','Wajma','Warda','Wardah','Waseema',

'Yalda','Yamna','Yara','Yasira','Yasmeen','Yasmin Noor','Yumna Noor','Yusra',

'Zahida','Zahira','Zahra','Zahra Noor','Zaib','Zaiba','Zaida','Zaira','Zaitoon',
'Zakiya','Zakiyah','Zamzam','Zanib','Zania','Zara Noor','Zareen','Zarina','Zarish',
'Zarmeena','Zarrin','Zeba','Zeenat','Zehra Noor','Zehra Fatima','Zia','Zilal','Zimal Noor',
'Zinat','Zobia','Zohra','Zohra Noor','Zoya Noor','Zubaira','Zubia','Zubaida','Zulekha','Zunaira Noor'

];

// Function to check if all necessary game settings are loaded
function checkAllGameSettingsReady() {
    if (designatedColorWinnerHasLoaded && winningUserUIDHasLoaded) {
        window.gameSettingsReady = true;
        console.log("All game settings loaded and ready.");
        window.checkGameEligibility(); // Update button state now that settings are ready
    }
}

// Firebase listeners for dynamic rigging settings from admin panel
db.ref("gameSettings/designatedColorWinner").on("value", (snapshot) => {
    if (snapshot.exists()) {
        window.designatedColorWinner = snapshot.val();
        console.log(`Default color winner loaded from DB: ${window.designatedColorWinner}`);
    } else {
        window.designatedColorWinner = 'blue'; // Default to blue if not set in DB
        db.ref("gameSettings/designatedColorWinner").set('blue'); 
        console.log(`Default color winner defaulted to: ${window.designatedColorWinner}`);
    }
    designatedColorWinnerHasLoaded = true; // Mark this setting as loaded
    checkAllGameSettingsReady(); // Check overall readiness
});

db.ref("gameSettings/winningUserUID").on("value", (snapshot) => {
    window.winningUserUID = snapshot.exists() ? snapshot.val() : null; // Null if no specific user selected in admin panel
    console.log(`Specific winning user UID loaded from DB: ${window.winningUserUID || 'none'}`);
    winningUserUIDHasLoaded = true; // Mark this setting as loaded
    checkAllGameSettingsReady(); // Check overall readiness
});


function startWalletListener(uid) {
    db.ref("users/" + uid).on("value", (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            window.userWalletBalance = data.wallet_balance || 0;
            window.userName = data.name || 'User';
            
            const walletDisplay = document.getElementById('wallet-display');
            if (walletDisplay) walletDisplay.textContent = `Wallet: PKR ${window.userWalletBalance}`; // Null check
            
            const profileWallet = document.getElementById('profile-wallet-balance');
            if(profileWallet) profileWallet.textContent = `PKR ${window.userWalletBalance}`;
            
            window.checkGameEligibility();
        } else {
            window.userWalletBalance = 0;
            const walletDisplay = document.getElementById('wallet-display');
            if (walletDisplay) walletDisplay.textContent = 'Wallet: PKR 0'; // Null check
            window.checkGameEligibility();
        }
    });
}

window.checkGameEligibility = function() {
    let btn = document.getElementById('btn-bet');
    if(btn) { // FIX: Add null check for the button element
        if (!window.currentUser) {
            btn.innerText = "🤖 Play vs CPU (Login to Earn)";
            btn.disabled = true; // Disable if not logged in
        } else if (window.userWalletBalance < window.GAME_BET_AMOUNT) {
            btn.innerText = `🤖 Play vs CPU (Need PKR ${window.GAME_BET_AMOUNT})`;
            btn.disabled = true; // Disable if insufficient balance
        } else if (!window.gameSettingsReady) { // Check if game settings are ready
            btn.innerText = "🤖 Play vs CPU (Loading Settings...)";
            btn.disabled = true; // Disable if settings are still loading
        }
        else {
            btn.innerText = `🤖 Play vs CPU (Bet PKR ${window.GAME_BET_AMOUNT})`;
            btn.disabled = false; // Enable if all conditions met
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
    
    // RED is always the logged-in user if window.currentUser is set
    let amountChange = 0;
    let gameResult = ""; 

    // Determine if the current user is the "true" winner based on admin settings
    const isUserTheDesignatedWinner = (window.currentUser && window.winningUserUID === window.currentUser.uid);

    if (isForfeit) {
        gameResult = "Loss (Forfeit)";
    } else if (winnerColor === 'red' && isUserTheDesignatedWinner) { // User wins ONLY if they are the designated winner
        amountChange = window.GAME_WIN_REWARD;
        gameResult = "Win";
    } else {
        gameResult = "Loss"; // Any other scenario for the user is a loss in a betting game
    }

    if (amountChange > 0 && gameResult === 'Win') {
        const userWalletRef = db.ref("users/" + window.currentUser.uid + "/wallet_balance");
        try {
            await userWalletRef.transaction((currentBalance) => {
                return (currentBalance || 0) + amountChange;
            });
        } catch (error) { /* Error handling for transaction */ }
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

// FIX: Wrap auth.onAuthStateChanged in DOMContentLoaded to ensure elements exist
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        window.currentUser = user;
        const authStatusElement = document.getElementById('auth-status');
        const walletDisplayElement = document.getElementById('wallet-display');

        if (user) {
            if (authStatusElement) authStatusElement.textContent = `Hello, ${user.email}`;
            startWalletListener(user.uid);
        } else {
            if (walletDisplayElement) walletDisplayElement.textContent = 'Wallet: PKR -';
            window.userWalletBalance = 0;
            window.userName = 'Guest';
        }
        window.checkGameEligibility(); // Update eligibility after auth state changes
        checkAllGameSettingsReady(); // Also check settings readiness to ensure UI is correctly updated
    });
});


window.loginUser = function(email, password) { auth.signInWithEmailAndPassword(email, password).then(() => { window.closeAuthModal(); checkAllGameSettingsReady(); }).catch((e) => alert(e.message)); }
window.signupUser = function(name, email, password) {
    auth.createUserWithEmailAndPassword(email, password).then((u) => {
        db.ref("users/" + u.user.uid).set({ wallet_balance: 50, email: email, name: name });
        window.closeAuthModal();
        checkAllGameSettingsReady(); // Also check settings readiness to ensure UI is correctly updated
    }).catch((e) => alert(e.message));
}
window.logoutUser = function() {
    if (window.currentUser) db.ref("users/" + window.currentUser.uid).off();
    auth.signOut().then(() => { window.closeAuthModal(); resetToMenu(); checkAllGameSettingsReady(); }); // Also check settings readiness to ensure UI is correctly updated
}

window.showAuthModal = function(mode) {
    const modalTitle = document.getElementById('modalTitle');
    const authContent = document.getElementById('authContent');
    const profileContent = document.getElementById('profileContent');
    const authSubmitButton = document.getElementById('authSubmitButton');
    const toggleAuthLink = document.getElementById('toggleAuth');
    const authNameContainer = document.getElementById('authNameContainer');
    const profileEmail = document.getElementById('profile-email');
    const profileWalletBalance = document.getElementById('profile-wallet-balance');

    if (mode === 'profile' && window.currentUser) {
        if (modalTitle) modalTitle.textContent = 'User Profile';
        if (profileEmail) profileEmail.textContent = window.currentUser.email; // Update email in profile
        if (authContent) authContent.style.display = 'none';
        if (profileContent) profileContent.style.display = 'block';
    } else {
        if (modalTitle) modalTitle.textContent = mode === 'login' ? 'Login' : 'Sign Up';
        if (authSubmitButton) authSubmitButton.textContent = mode === 'login' ? 'Login' : 'Sign Up';
        if (toggleAuthLink) toggleAuthLink.textContent = mode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Login';
        if (authContent) authContent.dataset.mode = mode;
        
        if (authNameContainer) { 
            authNameContainer.style.display = mode === 'signup' ? 'block' : 'none';
        }
        
        if (authContent) authContent.style.display = 'block';
        if (profileContent) profileContent.style.display = 'none';
    }
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.style.display = 'block';
}
window.closeAuthModal = function() { 
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.style.display = 'none';
}
window.toggleAuthMode = function() { window.showAuthModal(document.getElementById('authContent').dataset.mode === 'login' ? 'signup' : 'login'); }
window.submitAuthForm = function() {
    const nameInput = document.getElementById('name');
    const name = nameInput ? nameInput.value : ''; 
    
    const emailInput = document.getElementById('authEmail');
    const email = emailInput ? emailInput.value : '';

    const pwdInput = document.getElementById('authPassword');
    const pwd = pwdInput ? pwdInput.value : '';

    const authContent = document.getElementById('authContent');
    const mode = authContent ? authContent.dataset.mode : 'login'; // Default to login if authContent not found

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
    window.redPlayerForfeitCount = 0; // Reset red player's forfeit counter for a new game
    // window.designatedColorWinner and window.winningUserUID are intentionally NOT reset here, they persist across games via DB listener.
}

// ---------------- BETTING & START ---------------- //
async function startBetGame() {
    if (!window.currentUser) { alert("Please Login/Sign Up to play and earn!"); showAuthModal('login'); return; }
    if (window.userWalletBalance < window.GAME_BET_AMOUNT) { alert("Insufficient PKR balance."); return; }
    
    // The button should be disabled if settings aren't ready, so this alert is now redundant
    // if (!window.gameSettingsReady) {
    //     alert("Game settings are still loading. Please wait a moment or refresh the page.");
    //     return;
    // }

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
    // Red player is always the user in this mode
    PLAYER_CONFIG.red.name = window.userName || "You";
    PLAYER_CONFIG.red.isBot = false;
    
    let names = [...window.PAKISTANI_NAMES];
    ['blue', 'yellow', 'green'].forEach(c => {
        PLAYER_CONFIG[c].isBot = true; // Other players are bots
        let rIdx = Math.floor(Math.random() * names.length);
        PLAYER_CONFIG[c].name = names[rIdx]; names.splice(rIdx, 1);
    });
  } else {
    // Practice mode (all human, or mixed as desired for testing without rigging)
    window.isBetGame = false;
    COLORS.forEach((c, i) => { PLAYER_CONFIG[c].isBot = false; PLAYER_CONFIG[c].name = "Player " + (i+1); });
  }
  
  COLORS.forEach(c => { 
    const playerNameElement = document.querySelector(`#card-${c} .player-name`);
    if (playerNameElement) playerNameElement.innerText = PLAYER_CONFIG[c].name;
  });

  const gameUi = document.getElementById('game-ui');
  const menuModal = document.getElementById('menu-modal');
  const btnExit = document.getElementById('btn-exit');

  if (menuModal) menuModal.style.display = 'none';
  if (gameUi) gameUi.style.display = 'flex';
  if (btnExit) btnExit.style.display = window.isBetGame ? 'block' : 'none';
  
  initBoard(); updateBoard(); updateUI();
  log("Game Started! " + PLAYER_CONFIG[COLORS[0]].name + "'s turn.");
}

function initBoard() {
  const grid = document.getElementById('grid'); 
  if (!grid) { console.error("Grid element not found!"); return; } // Safety check
  grid.innerHTML = ''; // Clear previous grid content

  for (let r = 0; r < 15; r = r + 1) {
    for (let c = 0; c < 15; c = c + 1) {
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
  if (!board) { console.error("Board element not found!"); return; } // Safety check
  document.querySelectorAll('.token').forEach(e => e.remove()); // Clean old tokens
  COLORS.forEach(color => {
    for (let i = 0; i < 4; i = i + 1) { 
      let token = document.createElement('div'); token.className = `token ${color}`; token.id = `token-${color}-${i}`;
      token.onclick = () => handleTokenClick(color, i);
      let pointer = document.createElement('div'); pointer.className = 'pointer'; token.appendChild(pointer);
      board.appendChild(token);
    }
  });
}

function log(msg) { 
    const logElement = document.getElementById('log');
    if (logElement) logElement.innerText = msg; // Null check
    else console.log("LOG:", msg); // Fallback to console if log element not found
}
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
      if (!el) return; // Safety check for token element

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
  COLORS.forEach(c => { 
    const cardElement = document.getElementById(`card-${c}`);
    const diceElement = document.getElementById(`dice-${c}`);
    if (cardElement) cardElement.classList.remove('active');
    if (diceElement) diceElement.classList.add('disabled');
  });
  
  const activeCard = document.getElementById(`card-${currColor}`);
  const activeDice = document.getElementById(`dice-${currColor}`);
  const boardElement = document.getElementById('board');

  if (activeCard) activeCard.classList.add('active');
  if (boardElement) boardElement.className = `turn-${currColor}`;
  if (!state.diceRolled && !state.isAnimating && activeDice) { 
    activeDice.classList.remove('disabled'); 
  }
  document.querySelectorAll('.token').forEach(t => t.classList.remove('highlight'));
}

function getBlockades() {
  let mainCounts = {};
  COLORS.forEach(c => { state.tokens[c].forEach(pos => { if (pos >= 0 && pos <= 50) { let key = `${c}-${getAbsoluteMainIndex(c, pos)}`; mainCounts[key] = (mainCounts[key] || 0) + 1; } }); });
  let blockedAbsoluteIndices = []; for (let k in mainCounts) { if (mainCounts[k] >= 2) blockedAbsoluteIndices.push(parseInt(k.split('-')[1])); }
  return blockedAbsoluteIndices;
}

// Custom getValidMoves logic
function getValidMoves(color, roll) {
    let valid = [];
    let blockades = getBlockades();

    // Determine if the current player is the "true" winner based on admin settings
    const isCurrentUserTheDesignatedWinner = (window.currentUser && window.winningUserUID === window.currentUser.uid);
    const isCurrentCPUTheDesignatedWinner = (!window.winningUserUID && color === window.designatedColorWinner);
    const isThisPlayerTheWinner = (color === 'red' && isCurrentUserTheDesignatedWinner) || (color !== 'red' && isCurrentCPUTheDesignatedWinner);

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
            
            // RIGGING: Designated winner is never blocked on the path in a betting game
            // This allows the winner to move through opponent stacks.
            if (window.isBetGame && isThisPlayerTheWinner) {
                isBlocked = false; // Designated winner can always move through any blockades
            } else {
                // Original blocking logic for other players (non-winners)
                for (let step = 1; step <= roll; step = step + 1) { 
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
            }
            if (!isBlocked) valid.push(idx);
        }
    });

    return valid;
}

async function rollDice(colorClick) {
  let currColor = COLORS[state.turnIndex];
  if (colorClick !== currColor || state.diceRolled || state.isAnimating || state.gameOver) return;
  
  // Ensure designated winner settings are loaded from Firebase before rigging dice
  if (!window.gameSettingsReady && window.isBetGame) { 
      log("Game settings not loaded yet. Please wait.");
      state.isAnimating = false; // Release animation lock
      return;
  }

  state.isAnimating = true; 
  const diceButton = document.getElementById(`dice-${currColor}`);
  if (diceButton) diceButton.classList.add('disabled'); // Null check

  let diceCube = document.getElementById(`cube-${currColor}`);
  if (diceCube) { // Null check
    diceCube.style.animation = 'none'; diceCube.offsetHeight; diceCube.style.animation = 'spin3D 0.5s ease-out forwards';
  }
  
  await sleep(500);
  
  // ==========================================
  // RIGGING LOGIC (Dynamic Winner / All others lose)
  // ==========================================
  let val = Math.floor(Math.random() * 6) + 1; // Default random roll

  if (window.isBetGame) { // Only apply rigging in a betting game
        // Determine if the current player is the "true" winner based on admin settings
        const isCurrentUserTheDesignatedWinner = (currColor === 'red' && window.currentUser && window.winningUserUID === window.currentUser.uid);
        const isCurrentCPUTheDesignatedWinner = (!window.winningUserUID && currColor === window.designatedColorWinner);
        const isThisPlayerTheWinner = isCurrentUserTheDesignatedWinner || isCurrentCPUTheDesignatedWinner;

        if (isThisPlayerTheWinner) {
            // --- Designated Winner Rigging (Guaranteed Win) ---
            let winnerTokens = state.tokens[currColor];
            let tokensInBase = winnerTokens.filter(p => p === -1).length;
            let tokensInHomePath = winnerTokens.filter(p => p >= 51 && p <= 55).length;
            let finishedTokens = winnerTokens.filter(p => p === 56).length;

            let bestRollForWinner = -1;

            // RIGGING: Priority 1: Prevent 3 consecutive 6s for the designated winner
            // This ensures the designated winner's tokens never forfeit.
            if (state.consecutiveSixes === 2) { 
                bestRollForWinner = Math.floor(Math.random() * 5) + 1; // Force a non-6 (1-5)
            } else {
                // Priority 2: Try to finish a token (reach 56)
                for (let i = 0; i < 4; i = i + 1) { 
                    let pos = winnerTokens[i];
                    if (pos >= 0 && pos < 56) {
                        let needed = 56 - pos; // Roll needed to reach home (56)
                        if (needed > 0 && needed <= 6) {
                            let tempValidMoves = getValidMoves(currColor, needed); // Check valid move with winner-specific logic
                            if (tempValidMoves.includes(i)) {
                                bestRollForWinner = needed;
                                break;
                            }
                        }
                    }
                }

                // Priority 3: If no token can finish, try to enter home path (pos 50 to 51)
                if (bestRollForWinner === -1) {
                    for (let i = 0; i < 4; i = i + 1) { 
                        if (winnerTokens[i] === 50) { // Token is just before home entry
                            let tempValidMoves = getValidMoves(currColor, 1); // Needs 1 to enter
                            if (tempValidMoves.includes(i)) {
                                 bestRollForWinner = 1;
                                 break;
                            }
                        }
                    }
                }

                // Priority 4: If no tokens finishing or entering home, try to bring out from base with a 6
                // This is crucial for recovering after being captured.
                if (bestRollForWinner === -1 && tokensInBase > 0) {
                    let canBringOut = false;
                    for (let i = 0; i < 4; i = i + 1) { 
                        if (winnerTokens[i] === -1) {
                            // Check if the starting cell for this token is safe (not blocked by own color)
                            const targetAbsIdx = getAbsoluteMainIndex(currColor, 0);
                            let isStartingCellBlockedByOwn = winnerTokens.filter((p, k) => k !== i && p >= 0 && p <= 50 && getAbsoluteMainIndex(currColor, p) === targetAbsIdx).length > 0;
                            if (!isStartingCellBlockedByOwn) {
                                canBringOut = true;
                                break;
                            }
                        }
                    }
                    if (canBringOut) {
                        bestRollForWinner = 6;
                    }
                }
            }

            if (bestRollForWinner !== -1) {
                val = bestRollForWinner;
            } else {
                // Default high rolls for the winning player to make fast progress
                if (Math.random() < 0.8) { // 80% chance of a high roll (4-6)
                    val = Math.floor(Math.random() * 3) + 4; // 4, 5, 6
                } else {
                    val = Math.floor(Math.random() * 3) + 1; // 1, 2, 3
                }
                // (Redundant check here as Priority 1 already handles it for winning player, but harmless)
                if (val === 6 && state.consecutiveSixes === 2) {
                    val = Math.floor(Math.random() * 5) + 1;
                }
            }

        } else {
            // --- All Other Players Rigging (Guaranteed Loss) ---
            let playerTokens = state.tokens[currColor];
            let finishedTokens = playerTokens.filter(p => p === 56).length;
            let tokensInBase = playerTokens.filter(p => p === -1).length;
            let tokensInHomePath = playerTokens.filter(p => p >= 51 && p <= 55).length;
            let canMakeValidMoveWith6 = getValidMoves(currColor, 6).length > 0;

            let targetRollToPrevent = -1; // The specific roll to prevent for a token to finish/enter home

            // Check if any token can finish (reach 56) or enter home path (from 50 to 51) with a specific roll
            for (let i = 0; i < 4; i = i + 1) { 
                let pos = playerTokens[i];
                if (pos >= 0 && pos < 56) { // Active token
                    let needed = 56 - pos; // Roll needed to reach home (56)
                    if (needed > 0 && needed <= 6) {
                        // Check if this move is actually valid (no blockades in path)
                        let tempValidMoves = getValidMoves(currColor, needed); // Check valid move with regular blocking logic
                        if (tempValidMoves.includes(i)) {
                            targetRollToPrevent = needed;
                            break; // Found a token that can finish, prioritize preventing this
                        }
                    }
                }
            }

            // RIGGING LOGIC for losing players:
            if (targetRollToPrevent !== -1) {
                // Priority 1: Prevent token from finishing or entering home path.
                // Ensure 'val' is NOT 'targetRollToPrevent'.
                let attempts = 0;
                do {
                    val = Math.floor(Math.random() * 6) + 1;
                    attempts = attempts + 1; 
                } while (val === targetRollToPrevent && attempts < 20); 

                if (val === targetRollToPrevent) { // Fallback if 20 attempts failed
                    val = (targetRollToPrevent % 6) + 1;
                    if (val === targetRollToPrevent) val = (val === 1) ? 2 : 1; 
                }
            } else if (state.consecutiveSixes < 2 && canMakeValidMoveWith6 && 
                       ((currColor === 'red' && window.redPlayerForfeitCount < 3) || // Red user specific forfeit counter (for "pali guti")
                        (finishedTokens === 3 && tokensInHomePath === 1))) { // Force forfeit for last token too
                // Priority 2: Force 6 for forfeits to send tokens back (if not preventing a win already)
                val = 6;
            } else {
                // Priority 3: Default: General slow down. Mix of non-6 and occasional 6s.
                if (Math.random() < 0.7) { // Higher chance for a low/mid roll (1-5)
                    val = Math.floor(Math.random() * 5) + 1; // 1, 2, 3, 4, 5
                } else {
                    val = 6; // Still allow 6 sometimes to keep the 3-sixes forfeit possibility active.
                }
            }
        }
    }
    // ==========================================

  state.diceValue = val; state.diceRolled = true;
  if (diceCube) diceCube.style.transform = DICE_TRANSFORMS[val]; // Null check
  if (diceCube) diceCube.style.animation = 'none'; // Null check
  log(`${PLAYER_CONFIG[currColor].name} rolled a ${val}!`);
  
  if (val === 6) {
    state.consecutiveSixes = state.consecutiveSixes + 1; 
    if (state.consecutiveSixes === 3) { 
      log("Three 6s! Turn forfeited.");
      // Determine if the current player is the "true" winner based on admin settings
      const isCurrentUserTheDesignatedWinner = (currColor === 'red' && window.currentUser && window.winningUserUID === window.currentUser.uid);
      const isCurrentCPUTheDesignatedWinner = (!window.winningUserUID && currColor === window.designatedColorWinner);
      const isThisPlayerTheWinner = isCurrentUserTheDesignatedWinner || isCurrentCPUTheDesignatedWinner;

      // Only increment red player's forfeit count if it's red and is NOT the designated winner in a bet game
      if (currColor === 'red' && window.isBetGame && !isThisPlayerTheWinner) {
          window.redPlayerForfeitCount = window.redPlayerForfeitCount + 1; 
      }
      
      // Forfeit action: Send the last moved token back to base (if any)
      // This specifically sends ONLY the last moved token back to base (-1 position), 
      // without resetting the entire game (via `resetToMenu()`).
      if (state.lastMovedToken && state.lastMovedToken.color === currColor) { 
        state.tokens[currColor][state.lastMovedToken.index] = -1; updateBoard(); 
      }
      state.isAnimating = false; 
      setTimeout(nextTurn, 1000); // Game continues, next turn starts immediately.
      return;
    }
  } else { 
      state.consecutiveSixes = 0; // Reset consecutive sixes if not a 6
  }
  
  processPostRoll();
}

function processPostRoll() {
  let currColor = COLORS[state.turnIndex]; 
  let validMoves = getValidMoves(currColor, state.diceValue);

  // Determine if the current player is the "true" winner based on admin settings
  const isCurrentUserTheDesignatedWinner = (currColor === 'red' && window.currentUser && window.winningUserUID === window.currentUser.uid);
  const isCurrentCPUTheDesignatedWinner = (!window.winningUserUID && currColor === window.designatedColorWinner);
  const isThisPlayerTheWinner = isCurrentUserTheDesignatedWinner || isCurrentCPUTheDesignatedWinner;

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
    // If the current player is a bot, or if the current human player is the designated winner, automate/highlight accordingly.
    if (PLAYER_CONFIG[currColor].isBot) { // All bots (winner or not) move automatically
        setTimeout(() => handleTokenClick(currColor, validMoves[0]), 600); 
    } else if (currColor === 'red' && isThisPlayerTheWinner) { // Human player is designated winner, highlight for them
        validMoves.forEach(idx => { 
            const tokenElement = document.getElementById(`token-${currColor}-${idx}`);
            if (tokenElement) tokenElement.classList.add('highlight'); // Null check
        }); 
    } else { // Human player is NOT the designated winner, highlight for them (they will still lose due to rigging)
      validMoves.forEach(idx => { 
            const tokenElement = document.getElementById(`token-${currColor}-${idx}`);
            if (tokenElement) tokenElement.classList.add('highlight'); // Null check
        }); 
    }
  }
}

async function handleTokenClick(color, idx) {
  let currColor = COLORS[state.turnIndex];
  if (color !== currColor || !state.diceRolled || state.isAnimating || state.gameOver) return;
  
  // Determine if the current player is the "true" winner based on admin settings
  const isCurrentUserTheDesignatedWinner = (currColor === 'red' && window.currentUser && window.winningUserUID === window.currentUser.uid);
  const isCurrentCPUTheDesignatedWinner = (!window.winningUserUID && currColor === window.designatedColorWinner);
  const isThisPlayerTheWinner = isCurrentUserTheDesignatedWinner || isCurrentCPUTheDesignatedWinner;

  let validMoves = getValidMoves(currColor, state.diceValue); 
  // IMPORTANT: For any player not the designated winner (or even the designated winner if it's human),
  // re-check valid moves after rigging to ensure no impossible moves are highlighted or attempted.
  if (window.isBetGame && !validMoves.includes(idx)) { 
      log("Invalid move. Please select a valid token.");
      document.querySelectorAll('.token').forEach(t => t.classList.remove('highlight')); // Clear invalid highlights
      
      let actualValidMoves = getValidMoves(currColor, state.diceValue);
      if (actualValidMoves.length > 0) {
          actualValidMoves.forEach(idx => { 
            const tokenElement = document.getElementById(`token-${currColor}-${idx}`);
            if (tokenElement) tokenElement.classList.add('highlight'); // Null check
          }); 
      } else {
          // If no actual valid moves even after a forced 6, player's turn passes
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
    for (let i = 0; i < steps; i = i + 1) { 
      state.tokens[color][idx] = state.tokens[color][idx] + 1; 
      updateBoard(color, idx); await sleep(250); 
    }
    updateBoard(); 
  }
  
  let extraTurn = state.diceValue === 6; let targetPos = state.tokens[color][idx];
  
  if (targetPos >= 0 && targetPos <= 50) {
    let absIdx = getAbsoluteMainIndex(color, targetPos); let myGrid = getGridCoords(color, targetPos); let key = `${myGrid[0]},${myGrid[1]}`;
    if (!SAFE_COORDS.has(key)) { // Only capture on non-safe cells
      COLORS.forEach(oppColor => {
        if (oppColor !== color) {
            // Determine if the opponent's token belongs to the "true" winner based on admin settings
            const isOpponentUserTheDesignatedWinner = (oppColor === 'red' && window.currentUser && window.winningUserUID === window.currentUser.uid);
            const isOpponentCPUTheDesignatedWinner = (!window.winningUserUID && oppColor === window.designatedColorWinner);
            const isOpponentTokenTheWinner = isOpponentUserTheDesignatedWinner || isOpponentCPUTheDesignatedWinner;

            // NEW: Designated winner's tokens CAN now be captured.
            // The previous immunity check is removed, allowing normal capture logic to proceed.
            // This means if a non-winner lands on a winner's token, the winner's token goes back to base.
            
            state.tokens[oppColor].forEach((oppPos, oppIdx) => {
                if (oppPos >= 0 && oppPos <= 50 && getAbsoluteMainIndex(oppColor, oppPos) === absIdx) { 
                    state.tokens[oppColor][oppIdx] = -1; // Send token back to base
                    log(`${PLAYER_CONFIG[color].name} captured ${PLAYER_CONFIG[oppColor].name}!`); 
                    extraTurn = true; // Capture always gives an extra turn
                    updateBoard();
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
  if (extraTurn) { log(`${PLAYER_CONFIG[color].name} gets an extra turn!`); state.diceRolled = false; updateUI(); 
    // If the current player is a bot, or if the current human player is the designated winner, automate their next roll.
    if (PLAYER_CONFIG[currColor].isBot) { // All bots (winner or not) automate their rolls on extra turn
             setTimeout(() => rollDice(currColor), 1000); 
    }
    // If human and designated winner, they'll just see the "roll dice" enabled for their extra turn.
  } 
  else { nextTurn(); }
}

function nextTurn() {
  state.turnIndex = (state.turnIndex + 1) % 4; 
  state.diceRolled = false; 
  state.diceValue = null; 
  state.consecutiveSixes = 0; // Reset consecutive sixes for the new player
  
  gameTurnCount = gameTurnCount + 1; 
  
  updateUI();
  let nextC = COLORS[state.turnIndex]; log(`${PLAYER_CONFIG[nextC].name}'s turn.`);
  
  // Determine if the next player is the "true" winner based on admin settings
  const isNextUserTheDesignatedWinner = (nextC === 'red' && window.currentUser && window.winningUserUID === window.currentUser.uid);
  const isNextCPUTheDesignatedWinner = (!window.winningUserUID && nextC === window.designatedColorWinner);
  const isNextPlayerTheWinner = isNextUserTheDesignatedWinner || isNextCPUTheDesignatedWinner;

  // If the next player is a bot, or if the next human player is the designated winner, automate their roll.
  if (PLAYER_CONFIG[nextC].isBot && !state.gameOver) { // All bots (winner or not) automate their rolls
      setTimeout(() => rollDice(nextC), 1000); 
  } 
  // If the next player is human AND they are the designated winner, they will see the "roll dice" button enabled.
  // If the next player is human AND NOT the designated winner, they will also see the "roll dice" button enabled, but their play will be rigged to lose.
}
