import { GameQuestion, GameSettings } from './types';

export function bombDefuseTemplate(questions: GameQuestion[], settings: GameSettings): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>💣 Bom Đếm Ngược — ${settings.topic}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',sans-serif;background:#0f0a1e;color:#e2e8f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px}
#game{width:100%;max-width:640px;display:flex;flex-direction:column;gap:14px}
/* Bomb visual */
#bomb-wrap{display:flex;flex-direction:column;align-items:center;gap:8px}
#bomb-svg{width:110px;height:110px;filter:drop-shadow(0 0 16px rgba(239,68,68,.6));transition:filter .3s}
#bomb-svg.danger{filter:drop-shadow(0 0 24px rgba(239,68,68,1));animation:shake .15s infinite}
@keyframes shake{0%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}100%{transform:translateX(0)}}
#time-display{font-size:56px;font-weight:900;font-variant-numeric:tabular-nums;color:#f1f5f9;line-height:1;transition:color .3s}
#time-display.danger{color:#ef4444}
#time-bar-wrap{width:100%;background:#1e1b4b;border-radius:8px;height:10px;overflow:hidden}
#time-bar{height:10px;background:linear-gradient(90deg,#10b981,#3b82f6);border-radius:8px;transition:width .5s,background .3s}
#time-bar.danger{background:linear-gradient(90deg,#ef4444,#f97316)}
/* Stats */
.stat-row{display:flex;justify-content:center;gap:32px}
.stat{text-align:center}
.stat-val{font-size:24px;font-weight:800}
.stat-label{font-size:11px;color:#64748b;font-weight:600;letter-spacing:.05em}
/* Question */
.panel{background:#1e1b4b;border-radius:14px;padding:16px;border:1px solid #312e81}
.q-label{font-size:11px;color:#818cf8;font-weight:700;letter-spacing:.05em;margin-bottom:8px}
.q-text{font-size:15px;font-weight:600;color:#f1f5f9;line-height:1.5;margin-bottom:12px}
.answers{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ans-btn{padding:10px 12px;border-radius:9px;border:2px solid #3730a3;background:#1e1b4b;color:#c7d2fe;cursor:pointer;font-size:13px;text-align:left;transition:all .15s;line-height:1.4}
.ans-btn:hover:not(:disabled){border-color:#6366f1;background:#312e81;color:#fff}
.ans-btn.correct{background:#064e3b;border-color:#10b981;color:#6ee7b7}
.ans-btn.wrong{background:#450a0a;border-color:#ef4444;color:#fca5a5}
.ans-btn:disabled{cursor:default}
#explain{margin-top:10px;padding:10px;background:#0c0a2e;border-radius:8px;font-size:12px;color:#93c5fd;border-left:3px solid #6366f1;display:none;line-height:1.5}
#result-overlay{position:fixed;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.85);z-index:20;gap:16px}
.big-emoji{font-size:80px}
.title-main{font-size:28px;font-weight:800}
.desc{color:#94a3b8;text-align:center;max-width:400px;line-height:1.6}
.btn-start{padding:13px 36px;border-radius:12px;border:none;color:#fff;font-size:16px;font-weight:800;cursor:pointer;transition:all .2s}
#intro{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0f0a1e;z-index:10;gap:16px;padding:32px}
#intro .title-main{background:linear-gradient(135deg,#ef4444,#f97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
#intro .btn-start{background:linear-gradient(135deg,#7c3aed,#a855f7)}
#intro .btn-start:hover{box-shadow:0 8px 24px rgba(124,58,237,.4);transform:translateY(-2px)}
</style>
</head>
<body>
<div id="intro">
  <div class="big-emoji">💣</div>
  <div class="title-main">Bom Đếm Ngược!</div>
  <div class="desc" style="color:#94a3b8;text-align:center;max-width:380px;line-height:1.6">Bom đang tích tắc! Trả lời đúng: +10 giây ✅ Trả lời sai: -10 giây ❌ Hoàn thành tất cả ${questions.length} câu để phá bom!</div>
  <div style="color:#f97316;font-weight:700;font-size:14px">Chủ đề: ${settings.topic}</div>
  <button class="btn-start" onclick="startGame()">💥 Bắt Đầu Phá Bom!</button>
</div>

<div id="result-overlay">
  <div class="big-emoji" id="res-emoji">💥</div>
  <div class="title-main" id="res-title" style="color:#ef4444">Bom Nổ!</div>
  <div class="desc" id="res-desc"></div>
  <button class="btn-start" style="background:linear-gradient(135deg,#7c3aed,#a855f7)" onclick="restartGame()">🔄 Thử Lại</button>
</div>

<div id="game" style="display:none">
  <div id="bomb-wrap">
    <svg id="bomb-svg" viewBox="0 0 100 100">
      <circle cx="50" cy="60" r="34" fill="#1f1f1f" stroke="#374151" stroke-width="2"/>
      <rect x="45" y="20" width="10" height="14" fill="#374151" rx="3"/>
      <path d="M48,20 Q42,10 52,6 Q62,10 52,19" fill="none" stroke="#fbbf24" stroke-width="2"/>
      <circle cx="38" cy="52" r="5" fill="#374151" opacity=".5"/>
      <circle cx="45" cy="70" r="4" fill="#374151" opacity=".4"/>
      <circle id="fuse-fire" cx="52" cy="7" r="4" fill="#f97316"/>
    </svg>
    <div id="time-display">60</div>
    <div id="time-bar-wrap"><div id="time-bar" style="width:100%"></div></div>
  </div>
  <div class="stat-row">
    <div class="stat"><div class="stat-val" id="correct-count">0</div><div class="stat-label">✅ ĐÚNG</div></div>
    <div class="stat"><div class="stat-val" id="wrong-count">0</div><div class="stat-label">❌ SAI</div></div>
    <div class="stat"><div class="stat-val" id="q-left">${questions.length}</div><div class="stat-label">📖 CÒN LẠI</div></div>
  </div>
  <div class="panel">
    <div class="q-label">❓ CÂU HỎI <span id="q-num">1</span>/${questions.length}</div>
    <div class="q-text" id="q-text"></div>
    <div class="answers" id="answers"></div>
    <div id="explain"></div>
  </div>
</div>

<script>
var questions = ${JSON.stringify(questions)};
var MAX_TIME = 60;
var timeLeft = MAX_TIME;
var qIndex = 0;
var correctCount = 0;
var wrongCount = 0;
var canAnswer = false;
var bombTimer = null;
var fuseFire = null;
var fuseAnim = null;

function updateBomb() {
  var td = document.getElementById('time-display');
  var bar = document.getElementById('time-bar');
  var bomb = document.getElementById('bomb-svg');
  var fire = document.getElementById('fuse-fire');
  td.textContent = timeLeft;
  bar.style.width = Math.max(0, (timeLeft / MAX_TIME) * 100) + '%';
  var isDanger = timeLeft <= 10;
  td.className = isDanger ? 'danger' : '';
  bar.className = isDanger ? 'danger' : '';
  bomb.className = isDanger ? 'danger' : '';
  if (fire) {
    var flicker = ['#f97316','#fbbf24','#ef4444'];
    fire.setAttribute('fill', flicker[Math.floor(Math.random() * 3)]);
  }
}

function tickBomb() {
  timeLeft--;
  updateBomb();
  if (timeLeft <= 0) {
    clearInterval(bombTimer);
    boomExplosion();
  }
}

function boomExplosion() {
  canAnswer = false;
  var overlay = document.getElementById('result-overlay');
  overlay.style.display = 'flex';
  document.getElementById('res-emoji').textContent = '💥';
  document.getElementById('res-title').textContent = 'BỤM! Bom Nổ!';
  document.getElementById('res-title').style.color = '#ef4444';
  document.getElementById('res-desc').textContent = 'Bạn hoàn thành ' + qIndex + '/' + questions.length + ' câu. Đúng: ' + correctCount + ' | Sai: ' + wrongCount;
}

function showNextQuestion() {
  if (qIndex >= questions.length) {
    clearInterval(bombTimer);
    var overlay = document.getElementById('result-overlay');
    overlay.style.display = 'flex';
    document.getElementById('res-emoji').textContent = '🎉';
    document.getElementById('res-title').textContent = 'Phá Bom Thành Công!';
    document.getElementById('res-title').style.color = '#10b981';
    document.getElementById('res-desc').textContent = 'Xuất sắc! Đúng ' + correctCount + '/' + questions.length + '. Còn ' + timeLeft + 'giây.';
    return;
  }
  var q = questions[qIndex];
  document.getElementById('q-num').textContent = qIndex + 1;
  document.getElementById('q-left').textContent = questions.length - qIndex;
  document.getElementById('q-text').textContent = q.q;
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
  canAnswer = true;
  qIndex++;
}

function handleAnswer(idx) {
  if (!canAnswer) return;
  canAnswer = false;
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
  if (correct) {
    correctCount++;
    timeLeft = Math.min(MAX_TIME, timeLeft + 10);
  } else {
    wrongCount++;
    timeLeft = Math.max(1, timeLeft - 10);
  }
  document.getElementById('correct-count').textContent = correctCount;
  document.getElementById('wrong-count').textContent = wrongCount;
  updateBomb();
  setTimeout(showNextQuestion, 1300);
}

function startGame() {
  timeLeft = MAX_TIME; qIndex = 0; correctCount = 0; wrongCount = 0;
  document.getElementById('intro').style.display = 'none';
  document.getElementById('result-overlay').style.display = 'none';
  document.getElementById('game').style.display = 'flex';
  updateBomb();
  if (bombTimer) clearInterval(bombTimer);
  bombTimer = setInterval(tickBomb, 1000);
  showNextQuestion();
}

function restartGame() {
  if (bombTimer) clearInterval(bombTimer);
  document.getElementById('result-overlay').style.display = 'none';
  document.getElementById('intro').style.display = 'flex';
}
</script>
</body>
</html>`;
}
