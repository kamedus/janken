// ゲーム状態管理
let gameStats = {
    wins: 0,
    losses: 0,
    draws: 0
};

let currentPlayerChoice = '';
let currentComputerChoice = '';

// 音声関連
function playAudio(filename, callback = null) {
    const audio = new Audio(`audio/${filename}`);
    audio.volume = 1.0;
    
    if (callback) {
        audio.onended = callback;
    }
    
    audio.onerror = () => {
        console.error(`音声ファイルの読み込みに失敗: ${filename}`);
    };
    
    audio.play().catch(err => {
        console.error(`音声再生エラー: ${err}`);
    });
}

// ランダム音声再生
function playRandomAudio(filenames, callback = null) {
    const randomIndex = Math.floor(Math.random() * filenames.length);
    playAudio(filenames[randomIndex], callback);
}

// 画面切り替え
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// ゲーム開始
function startGame() {
    // タイトルを非表示にする
    document.getElementById('gameTitle').style.display = 'none';
    showScreen('countdownScreen');
    startCountdown();
}

// カウントダウン開始
function startCountdown() {
    const countdownText = document.getElementById('countdownText');
    const sequence = [
        { text: 'さいしょはぐー', audio: 'saisyo.mp3', duration: 1500 },
        { text: 'じゃん', audio: 'jan.mp3', duration: 600 },
        { text: 'けん', audio: 'ken.mp3', duration: 600 }
    ];
    
    let currentIndex = 0;
    
    function nextPhase() {
        if (currentIndex < sequence.length) {
            const phase = sequence[currentIndex];
            countdownText.textContent = phase.text;
            
            // 音声再生
            playAudio(phase.audio);
            
            currentIndex++;
            setTimeout(nextPhase, phase.duration);
        } else {
            // 「ぽん」の音声を再生してから選択画面へ
            countdownText.textContent = 'ぽん';
            playAudio('pon.mp3', () => {
                showScreen('choiceScreen');
            });
        }
    }
    
    nextPhase();
}

// プレイヤーの選択
function playerChoice(choice) {
    currentPlayerChoice = choice;
    
    // コンピューターの選択を決定（プレイヤーに有利な確率）
    currentComputerChoice = getComputerChoice(choice);
    
    // 結果を表示
    showResult();
}

// コンピューターの選択（プレイヤー有利な確率）
function getComputerChoice(playerChoice) {
    const random = Math.random();
    
    // プレイヤー勝利: 60%, 引き分け: 30%, プレイヤー敗北: 10%
    if (random < 0.6) {
        // プレイヤーが勝つ選択
        switch (playerChoice) {
            case 'gu': return 'choki';      // グー > チョキ
            case 'choki': return 'pa';      // チョキ > パー
            case 'pa': return 'gu';         // パー > グー
        }
    } else if (random < 0.9) {
        // 引き分け
        return playerChoice;
    } else {
        // プレイヤーが負ける選択
        switch (playerChoice) {
            case 'gu': return 'pa';         // グー < パー
            case 'choki': return 'gu';      // チョキ < グー
            case 'pa': return 'choki';      // パー < チョキ
        }
    }
}

// 結果表示
function showResult() {
    // 画像と選択肢名の設定
    const choices = {
        'gu': { img: 'images/gu.png', name: 'ぐー' },
        'choki': { img: 'images/choki.png', name: 'ちょき' },
        'pa': { img: 'images/pa.png', name: 'ぱー' }
    };
    
    // プレイヤーの選択を表示
    document.getElementById('playerChoiceImg').src = choices[currentPlayerChoice].img;
    
    // コンピューターの選択を表示
    document.getElementById('computerChoiceImg').src = choices[currentComputerChoice].img;
    
    // 勝敗判定
    const result = getGameResult();
    const resultText = document.getElementById('resultText');
    
    switch (result) {
        case 'win':
            resultText.textContent = 'かち！';
            resultText.className = 'result-text win';
            gameStats.wins++;
            playRandomAudio(['kati1.mp3', 'kati2.mp3', 'kati3.mp3']);
            break;
        case 'lose':
            resultText.textContent = 'まけ';
            resultText.className = 'result-text lose';
            gameStats.losses++;
            playRandomAudio(['make1.mp3', 'make2.mp3']);
            break;
        case 'draw':
            resultText.textContent = 'あいこ';
            resultText.className = 'result-text draw';
            gameStats.draws++;
            playRandomAudio(['aiko1.mp3', 'aiko2.mp3']);
            break;
    }
    
    showScreen('resultScreen');
}

// 勝敗判定
function getGameResult() {
    if (currentPlayerChoice === currentComputerChoice) {
        return 'draw';
    }
    
    const winConditions = {
        'gu': 'choki',      // グーはチョキに勝つ
        'choki': 'pa',      // チョキはパーに勝つ
        'pa': 'gu'          // パーはグーに勝つ
    };
    
    return winConditions[currentPlayerChoice] === currentComputerChoice ? 'win' : 'lose';
}

// もう一回プレイ
function playAgain() {
    showScreen('countdownScreen');
    startCountdown();
}

// ゲーム終了
function endGame() {
    // 最終結果を表示
    document.getElementById('winCount').textContent = gameStats.wins;
    document.getElementById('loseCount').textContent = gameStats.losses;
    document.getElementById('drawCount').textContent = gameStats.draws;
    document.getElementById('totalCount').textContent = 
        gameStats.wins + gameStats.losses + gameStats.draws;
    
    // 総合結果の音声
    const totalGames = gameStats.wins + gameStats.losses + gameStats.draws;
    let finalMessage = `ぜんぶで${totalGames}かいやって、${gameStats.wins}かいかった！`;
    
    if (gameStats.wins > gameStats.losses) {
        finalMessage += 'すごいね！';
    } else if (gameStats.wins === gameStats.losses) {
        finalMessage += 'いいしょうぶだった！';
    } else {
        finalMessage += 'こんどはがんばろう！';
    }
    
    // 最終結果は音声ファイルではなくWeb Speech APIを使用（フォールバック用）
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(finalMessage);
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
    }
    
    showScreen('finalScreen');
}

// ゲームリセット
function resetGame() {
    gameStats = {
        wins: 0,
        losses: 0,
        draws: 0
    };
    
    // タイトルを再表示
    document.getElementById('gameTitle').style.display = 'block';
    showScreen('startScreen');
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // 音声ファイルの事前読み込み（オプション）
    const audioFiles = [
        'saisyo.mp3', 'jan.mp3', 'ken.mp3', 'pon.mp3',
        'kati1.mp3', 'kati2.mp3', 'kati3.mp3',
        'aiko1.mp3', 'aiko2.mp3',
        'make1.mp3', 'make2.mp3'
    ];
    
    audioFiles.forEach(file => {
        const audio = new Audio(`audio/${file}`);
        audio.preload = 'auto';
    });
});