import { GameQuestion, GameSettings } from './types';

export function mountainClimbTemplate(questions: GameQuestion[], settings: GameSettings): string {
  const PEAK = 15;
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>🏔️ Leo Núi — ${settings.topic}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',sans-serif;background:linear-gradient(180deg,#0c1445 0%,#1a2464 40%,#2d3a7a 70%,#4a5a9a 100%);color:#e2e8f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px}
#game{width:100%;max-width:700px;display:flex;flex-direction:column;gap:12px}
/* Mountain visual */
#mountain-area{position:relative;height:220px;display:flex;align-items:flex-end;justify-content:center;overflow:hidden}
#mountain-svg{width:100%;height:200px;position:absolute;bottom:0}
#left-climber{position:absolute;bottom:10px;left:15%;font-size:28px;transition:bottom .6s cubic-bezier(.34,1.56,.64,1),left .3s;filter:drop-shadow(0 2px 8px rgba(99,102,241,1))}
#right-climber{position:absolute;bottom:10px;right:15%;font-size:28px;transition:bottom .6s cubic-bezier(.34,1.56,.64,1),right .3s;filter:drop-shadow(0 2px 8px rgba(239,68,68,1));transform:scaleX(-1)}
.peak-flag{position:absolute;top:8px;left:50%;transform:translateX(-50%);font-size:24px}
/* Progress bars */
.progress-section{display:grid;grid-template-columns:1fr 48px 1fr;gap:8px;align-items:center}
.progress-wrap{display:flex;flex-direction:column;gap:4px}
.p-label{font-size:11px;font-weight:700}
.p-me .p-label{color:#818cf8}
.p-ai .p-label{color:#f87171;text-align:right}
.p-bar-track{height:10px;background:rgba(255,255,255,.1);border-radius:5px;overflow:hidden}
.p-bar{height:10px;border-radius:5px;transition:width .5s}
.p-bar-me{background:linear-gradient(90deg,#6366f1,#818cf8)}
.p-bar-ai{background:linear-gradient(90deg,#ef4444,#f87171);float:right;margin-left:auto;display:block}
.vs-badge{text-align:center;font-size:13px;color:#94a3b8;font-weight:800}
.step-count{font-size:22px;font-weight:900}
/* Q panel */
.panel{background:rgba(255,255,255,.06);backdrop-filter:blur(8px);border-radius:14px;padding:14px;border:1px solid rgba(255,255,255,.1)}
.q-label{font-size:11px;color:#818cf8;font-weight:700;letter-spacing:.05em;margin-bottom:8px}
.q-text{font-size:15px;font-weight:600;color:#f1f5f9;line-height:1.5;margin-bottom:12px}
.answers{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ans-btn{padding:10px 12px;border-radius:9px;border:2px solid rgba(255,255,255,.12);background:rgba(0,0,0,.3);color:#cbd5e1;cursor:pointer;font-size:13px;text-align:left;transition:all .15s;line-height:1.4;backdrop-filter:blur(4px)}
.ans-btn:hover:not(:disabled){border-color:#6366f1;background:rgba(99,102,241,.2);color:#fff}
.ans-btn.correct{background:rgba(5,150,105,.3);border-color:#10b981;color:#6ee7b7}
.ans-btn.wrong{background:rgba(220,38,38,.3);border-color:#ef4444;color:#fca5a5}
.ans-btn:disabled{cursor:default}
#explain{margin-top:10px;padding:10px;background:rgba(0,0,0,.3);border-radius:8px;font-size:12px;color:#93c5fd;border-left:3px solid #6366f1;display:none;line-height:1.5}
#intro,#result{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(180deg,#0c1445,#1a2464);z-index:10;gap:16px;padding:32px}
.big-emoji{font-size:72px}
.title-main{font-size:26px;font-weight:800;background:linear-gradient(135deg,#818cf8,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.desc{color:#94a3b8;text-align:center;max-width:420px;line-height:1.6}
.btn-start{padding:13px 36px;border-radius:12px;border:none;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:16px;font-weight:800;cursor:pointer;transition:all .2s}
.btn-start:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(79,70,229,.5)}
</style>
</head>
<body>
<div id="intro">
  <div class="big-emoji">🏔️</div>
  <div class="title-main">Leo Núi!</div>
  <div class="desc">Bạn vs AI leo núi song song. Trả lời đúng → bạn leo thêm 1 tầng. Sai → AI leo. Ai lên đỉnh trước (${ PEAK } tầng) thắng!</div>
  <div style="color:#818cf8;font-weight:700;font-size:14px">Chủ đề: ${settings.topic}</div>
  <button class="btn-start" onclick="startGame()">🏔️ Bắt Đầu Leo!</button>
</div>

<div id="result" style="display:none">
  <div class="big-emoji" id="res-emoji">🏆</div>
  <div class="title-main" id="res-title">Kết Thúc!</div>
  <div class="desc" id="res-desc"></div>
  <button class="btn-start" onclick="restartGame()">🔄 Leo Lại</button>
</div>

<div id="game" style="display:none">
  <div class="panel">
    <div class="progress-section">
      <div class="progress-wrap p-me">
        <div class="p-label">🧍 Bạn — <span id="my-step">0</span>/${PEAK}</div>
        <div class="p-bar-track"><div class="p-bar p-bar-me" id="my-bar" style="width:0%"></div></div>
      </div>
      <div class="vs-badge">⚡<br>VS</div>
      <div class="progress-wrap p-ai">
        <div class="p-label" style="text-align:right">🤖 AI — <span id="ai-step">0</span>/${PEAK}</div>
        <div class="p-bar-track"><div class="p-bar p-bar-ai" id="ai-bar" style="width:0%"></div></div>
      </div>
    </div>
  </div>
  <div id="mountain-area">
    <span class="peak-flag">🏳️</span>
    <svg id="mountain-svg" viewBox="0 0 700 200" preserveAspectRatio="none">
      <polygon points="350,5 50,195 650,195" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <polygon points="350,5 170,130 530,130" fill="#263347" opacity=".6"/>
      <polygon points="350,5 270,90 430,90" fill="#2d3e52" opacity=".5"/>
    </svg>
    <div id="left-climber">🧍</div>
    <div id="right-climber">👾</div>
  </div>
  <div class="panel">
    <div class="q-label">❓ CÂU <span id="q-num">1</span>/${questions.length}</div>
    <div class="q-text" id="q-text"></div>
    <div class="answers" id="answers"></div>
    <div id="explain"></div>
  </div>
</div>

<script>
var questions = ${JSON.stringify(questions)};
var PEAK = ${PEAK};
var mySteps = 0, aiSteps = 0;
var qIndex = 0;
var canAnswer = false;

function updateClimbers() {
  var myPct = mySteps / PEAK;
  var aiPct = aiSteps / PEAK;
  // Left climber: start bottom-left, go toward peak
  var lc = document.getElementById('left-climber');
  var rc = document.getElementById('right-climber');
  lc.style.bottom = (10 + myPct * 150) + 'px';
  lc.style.left = (15 + myPct * 20) + '%';
  rc.style.bottom = (10 + aiPct * 150) + 'px';
  rc.style.right = (15 + aiPct * 20) + '%';
  document.getElementById('my-step').textContent = mySteps;
  document.getElementById('ai-step').textContent = aiSteps;
  document.getElementById('my-bar').style.width = (myPct * 100) + '%';
  document.getElementById('ai-bar').style.width = (aiPct * 100) + '%';
}

function showNextQuestion() {
  if (qIndex >= questions.length) { endGame('draw'); return; }
  var q = questions[qIndex];
  document.getElementById('q-num').textContent = qIndex + 1;
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
    mySteps = Math.min(PEAK, mySteps + 1);
  } else {
    aiSteps = Math.min(PEAK, aiSteps + 1);
  }
  updateClimbers();
  if (mySteps >= PEAK) { setTimeout(function(){ endGame('win'); }, 700); return; }
  if (aiSteps >= PEAK) { setTimeout(function(){ endGame('lose'); }, 700); return; }
  setTimeout(showNextQuestion, 1400);
}

function endGame(outcome) {
  document.getElementById('result').style.display = 'flex';
  document.getElementById('game').style.display = 'none';
  document.getElementById('res-emoji').textContent = outcome === 'win' ? '🏆' : outcome === 'lose' ? '😢' : '⏳';
  document.getElementById('res-title').textContent = outcome === 'win' ? 'Lên Đỉnh Núi!' : outcome === 'lose' ? 'AI Leo Nhanh Hơn!' : 'Hết Câu Hỏi!';
  document.getElementById('res-desc').textContent = 'Bạn: ' + mySteps + '/' + PEAK + ' tầng | AI: ' + aiSteps + '/' + PEAK + ' tầng';
}

function startGame() {
  mySteps = 0; aiSteps = 0; qIndex = 0;
  document.getElementById('intro').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  document.getElementById('game').style.display = 'flex';
  updateClimbers();
  showNextQuestion();
}

function restartGame() {
  document.getElementById('result').style.display = 'none';
  document.getElementById('intro').style.display = 'flex';
}
</script>
</body>
</html>`;
}
