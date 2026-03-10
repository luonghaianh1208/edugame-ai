import { GameQuestion, GameSettings } from './types';

export function tugOfWarTemplate(questions: GameQuestion[], settings: GameSettings): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>🪢 Kéo Co Tri Thức — ${settings.topic}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px}
#game{width:100%;max-width:700px;display:flex;flex-direction:column;gap:14px}
.panel{background:#1e293b;border-radius:14px;padding:16px;border:1px solid #334155}
h1{text-align:center;font-size:20px;font-weight:800;background:linear-gradient(135deg,#ef4444,#f97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
/* Rope area */
#rope-area{position:relative;height:90px;display:flex;align-items:center;justify-content:center}
#rope-track{width:100%;height:10px;background:linear-gradient(90deg,#1d4ed8 0%,#334155 30%,#334155 70%,#dc2626 100%);border-radius:5px;position:relative}
#rope-knot{width:28px;height:28px;background:linear-gradient(135deg,#d4a017,#fbbf24);border-radius:50%;position:absolute;top:50%;transform:translate(-50%,-50%);transition:left .4s cubic-bezier(.34,1.56,.64,1);display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 12px rgba(251,191,36,.6)}
#left-char{position:absolute;left:0;font-size:36px;filter:drop-shadow(0 0 6px rgba(59,130,246,.8))}
#right-char{position:absolute;right:0;font-size:36px;filter:drop-shadow(0 0 6px rgba(239,68,68,.8));transform:scaleX(-1)}
.win-zone{position:absolute;width:18%;height:100%;top:0;border-radius:8px;opacity:.15}
#left-zone{left:0;background:#3b82f6}
#right-zone{right:0;background:#ef4444}
/* Scoreboard */
.scoreboard{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px}
.team{text-align:center}
.team-name{font-size:13px;color:#94a3b8;font-weight:600}
.team-score{font-size:36px;font-weight:800}
.team-left .team-score{color:#60a5fa}
.team-right .team-score{color:#f87171}
.vs{font-size:18px;color:#475569;font-weight:800}
/* Question */
.q-text{font-size:15px;font-weight:600;color:#f1f5f9;margin-bottom:12px;line-height:1.5}
.answers{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ans-btn{padding:10px 12px;border-radius:9px;border:2px solid #334155;background:#0f172a;color:#cbd5e1;cursor:pointer;font-size:13px;text-align:left;transition:all .15s;line-height:1.4}
.ans-btn:hover:not(:disabled){border-color:#6366f1;background:#1e1b4b;color:#fff}
.ans-btn.correct{background:#064e3b;border-color:#10b981;color:#6ee7b7}
.ans-btn.wrong{background:#450a0a;border-color:#ef4444;color:#fca5a5}
.ans-btn:disabled{cursor:default}
#explain{margin-top:10px;padding:10px;background:#0c1a2e;border-radius:8px;font-size:12px;color:#93c5fd;border-left:3px solid #3b82f6;display:none;line-height:1.5}
#timer-bar{height:4px;background:linear-gradient(90deg,#10b981,#3b82f6);border-radius:2px;transition:width .1s linear;margin-bottom:4px}
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
#hud-row{display:flex;justify-content:space-between;align-items:center}
#q-count{font-size:12px;color:#64748b}
#result-msg{font-size:18px;font-weight:800;text-align:center;padding:8px;display:none}
#intro,#result{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0f172a;z-index:10;gap:16px;padding:32px}
.big-emoji{font-size:72px}
.title-main{font-size:26px;font-weight:800;background:linear-gradient(135deg,#ef4444,#f97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.desc{color:#94a3b8;text-align:center;max-width:420px;line-height:1.6}
.btn-start{padding:13px 36px;border-radius:12px;border:none;background:linear-gradient(135deg,#ef4444,#f97316);color:#fff;font-size:16px;font-weight:800;cursor:pointer;transition:all .2s}
.btn-start:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(239,68,68,.4)}
</style>
</head>
<body>
<div id="intro">
  <div class="big-emoji">🦱</div>
  <div class="title-main">Kéo Co Tri Thức</div>
  <div class="desc">${settings.playerMode === '2p' ? 'Hai người lần lượt trả lời câu hỏi! Ai trả lời đúng nhiều hơn sẽ kéo dây về phía mình. Kéo đến điểm thắng thì thắng!' : 'Trả lời đúng câu hỏi để kéo dây về phía bạn! Kéo qua vạch thắng 5 bước thắng. Sai thì đối thủ kéo lại!'}</div>
  <div style="color:#f97316;font-weight:700;font-size:14px">Chủ đề: ${settings.topic}</div>
  <button class="btn-start" onclick="startGame()">💪 Bắt Đầu Kéo!</button>
</div>

<div id="result" style="display:none">
  <div class="big-emoji" id="res-emoji">🏆</div>
  <div class="title-main" id="res-title">Kết Thúc!</div>
  <div class="desc" id="res-desc"></div>
  <button class="btn-start" onclick="restartGame()">🔄 Chơi Lại</button>
</div>

<div id="game" style="display:none">
  <div class="panel">
    <div class="scoreboard">
      <div class="team team-left">
        <div class="team-name" id="left-name">${settings.playerMode === '2p' ? settings.player1Name : '👤 Bạn'}</div>
        <div class="team-score" id="p-score">0</div>
      </div>
      <div class="vs">VS</div>
      <div class="team team-right">
        <div class="team-name" id="right-name">${settings.playerMode === '2p' ? settings.player2Name : '🤖 AI'}</div>
        <div class="team-score" id="e-score">0</div>
      </div>
    </div>
    <div id="rope-area">
      <div id="left-zone" class="win-zone"></div>
      <div id="right-zone" class="win-zone"></div>
      <div id="rope-track">
        <div id="rope-knot">🪢</div>
      </div>
      <div id="left-char">🧍</div>
      <div id="right-char">👾</div>
    </div>
  </div>
  <div class="panel">
    <div id="hud-row">
      <span id="q-count">Câu 1/${questions.length}</span>
      <span id="streak-badge"></span>
    </div>
    <div id="timer-bar" style="width:100%"></div>
    <div class="q-text" id="q-text"></div>
    <div class="answers" id="answers"></div>
    <div id="explain"></div>
  </div>
</div>

<!-- 2p turn overlay -->
<div id="turn-overlay" style="display:none;position:fixed;inset:0;z-index:30;background:rgba(0,0,0,.85);flex-direction:column;align-items:center;justify-content:center;gap:12px">
  <div id="turn-emoji" style="font-size:56px"></div>
  <div id="turn-label" style="font-size:22px;font-weight:800;color:#f1f5f9"></div>
  <div style="font-size:13px;color:#94a3b8">Lướt của bạn! Chuẩn bị...</div>
</div>

<script>
var questions = ${JSON.stringify(questions)};
var IS_2P = ${settings.playerMode === '2p' ? 'true' : 'false'};
var P1_NAME = '${settings.player1Name.replace(/'/g, "'")}';
var P2_NAME = '${settings.player2Name.replace(/'/g, "'")}';
var STEPS_TO_WIN = 5;
var ropePos = 0;
var pScore = 0, eScore = 0;
var qIndex = 0;
var canAnswer = false;
var timerId = null;
var timeLeft = 15;
var streakCount = 0;
// 2p: track who answered this round
var p1Correct = false; // did P1 answer correctly this round?
var waitingForP2 = false; // in 2p, are we waiting for P2's answer?

function updateRope() {
  var pct = ((ropePos + STEPS_TO_WIN) / (STEPS_TO_WIN * 2)) * 100;
  document.getElementById('rope-knot').style.left = pct + '%';
  document.getElementById('p-score').textContent = pScore;
  document.getElementById('e-score').textContent = eScore;
}

function startTimer() {
  if (timerId) clearInterval(timerId);
  timeLeft = 15;
  var bar = document.getElementById('timer-bar');
  timerId = setInterval(function() {
    timeLeft--;
    bar.style.width = (timeLeft / 15 * 100) + '%';
    if (timeLeft <= 5) bar.style.background = 'linear-gradient(90deg,#ef4444,#f97316)';
    if (timeLeft <= 0) {
      clearInterval(timerId);
      handleTimeout();
    }
  }, 1000);
}

function handleTimeout() {
  canAnswer = false;
  streakCount = 0;
  var btns = document.querySelectorAll('.ans-btn');
  btns.forEach(function(b, i) { b.disabled = true; if (i === questions[qIndex - 1 < 0 ? 0 : qIndex < questions.length ? qIndex : qIndex-1].correct) b.className = 'ans-btn correct'; });
  ropePos = Math.min(STEPS_TO_WIN, ropePos + 2);
  eScore += 10;
  updateRope();
  if (ropePos >= STEPS_TO_WIN) { endGame('lose'); return; }
  setTimeout(showNextQuestion, 1400);
}

function showNextQuestion() {
  if (qIndex >= questions.length) { endGame('draw'); return; }
  var q = questions[qIndex];
  document.getElementById('q-count').textContent = 'Câu ' + (qIndex + 1) + '/' + questions.length;
  // Show whose turn it is (2p)
  if (IS_2P) {
    var currName = waitingForP2 ? P2_NAME : P1_NAME;
    document.getElementById('q-text').textContent = '🎯 Lượt ' + currName + ': ' + q.q;
  } else {
    document.getElementById('q-text').textContent = '❓ ' + q.q;
  }
  var answersEl = document.getElementById('answers');
  answersEl.innerHTML = '';
  var labels = ['A','B','C','D'];
  q.answers.forEach(function(a, i) {
    var btn = document.createElement('button');
    btn.className = 'ans-btn';
    btn.textContent = labels[i] + '. ' + a;
    btn.onclick = function() { handleAnswer(i); };
    answersEl.appendChild(btn);
  });
  document.getElementById('explain').style.display = 'none';
  document.getElementById('timer-bar').style.background = 'linear-gradient(90deg,#10b981,#3b82f6)';
  canAnswer = true;
  if (!waitingForP2) qIndex++; // only advance on P1's turn (or 1p)
  startTimer();
}

function handleAnswer(idx) {
  if (!canAnswer) return;
  canAnswer = false;
  if (timerId) clearInterval(timerId);
  var q = questions[qIndex - 1];
  var btns = document.querySelectorAll('.ans-btn');
  btns.forEach(function(b, i) {
    b.disabled = true;
    if (i === q.correct) b.className = 'ans-btn correct';
    else if (i === idx) b.className = 'ans-btn wrong';
  });
  var correct = (idx === q.correct);
  if (q.explain) {
    var ex = document.getElementById('explain');
    ex.style.display = 'block';
    ex.textContent = (correct ? '✅ ' : '❌ ') + q.explain;
  }
  if (IS_2P) {
    // 2p: P1 answers, then show P2's turn overlay, then P2 answers, then update rope
    if (!waitingForP2) {
      // P1 just answered
      p1Correct = correct;
      if (correct) pScore += 10;
      document.getElementById('p-score').textContent = pScore;
      // Show P2 turn overlay
      setTimeout(function() {
        var ov = document.getElementById('turn-overlay');
        document.getElementById('turn-emoji').textContent = '👾';
        document.getElementById('turn-label').textContent = 'Lượt của ' + P2_NAME;
        ov.style.display = 'flex';
        setTimeout(function() {
          ov.style.display = 'none';
          waitingForP2 = true;
          showNextQuestion();
        }, 1500);
      }, 1200);
    } else {
      // P2 just answered
      waitingForP2 = false;
      if (correct) eScore += 10;
      document.getElementById('e-score').textContent = eScore;
      // Update rope: both answered, compare
      if (p1Correct && !correct) ropePos = Math.max(-STEPS_TO_WIN, ropePos - 1);
      else if (!p1Correct && correct) ropePos = Math.min(STEPS_TO_WIN, ropePos + 1);
      // if both or neither correct: rope stays
      updateRope();
      if (ropePos <= -STEPS_TO_WIN) { setTimeout(function(){ endGame('p1win'); }, 600); return; }
      if (ropePos >= STEPS_TO_WIN)  { setTimeout(function(){ endGame('p2win'); }, 600); return; }
      if (qIndex >= questions.length) { setTimeout(function(){ endGame('draw'); }, 600); return; }
      // Show P1 turn overlay for next round
      setTimeout(function() {
        var ov = document.getElementById('turn-overlay');
        document.getElementById('turn-emoji').textContent = '🧑';
        document.getElementById('turn-label').textContent = 'Lượt của ' + P1_NAME;
        ov.style.display = 'flex';
        setTimeout(function() { ov.style.display = 'none'; showNextQuestion(); }, 1500);
      }, 1300);
    }
  } else {
    // 1p vs AI
    if (correct) {
      streakCount++;
      ropePos = Math.max(-STEPS_TO_WIN, ropePos - 1);
      pScore += (10 + (streakCount >= 3 ? 5 : 0));
      var badge = document.getElementById('streak-badge');
      if (streakCount >= 3) badge.innerHTML = '<span class="badge" style="background:rgba(251,191,36,.2);color:#fbbf24">🔥 Combo x' + streakCount + '</span>';
      else badge.innerHTML = '';
    } else {
      streakCount = 0;
      ropePos = Math.min(STEPS_TO_WIN, ropePos + 1);
      eScore += 10;
      document.getElementById('streak-badge').innerHTML = '';
    }
    updateRope();
    if (ropePos <= -STEPS_TO_WIN) { setTimeout(function(){endGame('win')}, 600); return; }
    if (ropePos >= STEPS_TO_WIN) { setTimeout(function(){endGame('lose')}, 600); return; }
    setTimeout(showNextQuestion, 1400);
  }
}

function endGame(outcome) {
  if (timerId) clearInterval(timerId);
  document.getElementById('result').style.display = 'flex';
  document.getElementById('game').style.display = 'none';
  var p1 = IS_2P ? P1_NAME : 'Bạn';
  var p2 = IS_2P ? P2_NAME : 'AI';
  var titles = {
    win: '🏆 ' + p1 + ' Đã Thắng!',
    lose: '😢 ' + p2 + ' Thắng Rồi!',
    p1win: '🏆 ' + p1 + ' Kéo Đứt Dây!',
    p2win: '🎉 ' + p2 + ' Kéo Đứt Dây!',
    draw: '🤝 Hoà!',
  };
  document.getElementById('res-emoji').textContent = (outcome === 'win' || outcome === 'p1win') ? '🏆' : outcome === 'draw' ? '🤝' : '😢';
  document.getElementById('res-title').textContent = titles[outcome] || 'Kết Thúc!';
  document.getElementById('res-desc').textContent = p1 + ': ' + pScore + ' điểm | ' + p2 + ': ' + eScore + ' điểm';
}

function startGame() {
  ropePos = 0; pScore = 0; eScore = 0; qIndex = 0; streakCount = 0;
  p1Correct = false; waitingForP2 = false;
  document.getElementById('intro').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  document.getElementById('game').style.display = 'flex';
  updateRope();
  if (IS_2P) {
    // Show P1 turn overlay first
    var ov = document.getElementById('turn-overlay');
    document.getElementById('turn-emoji').textContent = '🧑';
    document.getElementById('turn-label').textContent = 'Lượt đầu tiên: ' + P1_NAME;
    ov.style.display = 'flex';
    setTimeout(function() { ov.style.display = 'none'; showNextQuestion(); }, 1500);
  } else {
    showNextQuestion();
  }
}

function restartGame() {
  if (timerId) clearInterval(timerId);
  document.getElementById('result').style.display = 'none';
  document.getElementById('intro').style.display = 'flex';
}
</script>
</body>
</html>`;
}
