import { GameQuestion, GameSettings } from './types';

export function wheelFortuneTemplate(questions: GameQuestion[], settings: GameSettings): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>🎡 Vòng Quay Vận Mệnh — ${settings.topic}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',sans-serif;background:#070b18;color:#e2e8f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px}
#game{width:100%;max-width:680px;display:flex;flex-direction:column;gap:12px}
/* Wheel */
#wheel-area{display:flex;flex-direction:column;align-items:center;gap:8px}
#wheel-wrap{position:relative;width:220px;height:220px}
#wheel-canvas{border-radius:50%;box-shadow:0 0 32px rgba(14,165,233,.4);transition:transform 3s cubic-bezier(.17,.67,.12,.99)}
#pointer{position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-top:24px solid #f59e0b;filter:drop-shadow(0 2px 6px rgba(245,158,11,.8))}
#spin-btn{padding:10px 32px;border-radius:12px;border:none;background:linear-gradient(135deg,#0ea5e9,#38bdf8);color:#fff;font-size:15px;font-weight:800;cursor:pointer;transition:all .2s}
#spin-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 20px rgba(14,165,233,.5)}
#spin-btn:disabled{opacity:.5;cursor:not-allowed}
#multiplier-badge{font-size:22px;font-weight:900;text-align:center;padding:6px 18px;border-radius:12px;background:rgba(14,165,233,.15);border:1px solid rgba(14,165,233,.3);min-width:80px}
/* Score */
.hud{display:flex;justify-content:center;gap:24px}
.hud-chip{display:flex;flex-direction:column;align-items:center;gap:2px;background:rgba(255,255,255,.05);border-radius:9px;padding:8px 16px;border:1px solid rgba(255,255,255,.08)}
.chip-val{font-size:24px;font-weight:900;color:#38bdf8}
.chip-label{font-size:10px;color:#64748b;font-weight:700;letter-spacing:.05em}
/* Q panel */
.panel{background:rgba(255,255,255,.04);border-radius:14px;padding:14px;border:1px solid rgba(255,255,255,.08)}
.q-label{font-size:11px;color:#38bdf8;font-weight:700;letter-spacing:.05em;margin-bottom:8px}
.q-text{font-size:14px;font-weight:600;color:#f1f5f9;line-height:1.5;margin-bottom:10px}
.answers{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.ans-btn{padding:9px 11px;border-radius:9px;border:2px solid rgba(14,165,233,.2);background:rgba(14,165,233,.07);color:#bae6fd;cursor:pointer;font-size:12px;text-align:left;transition:all .15s;line-height:1.4}
.ans-btn:hover:not(:disabled){border-color:#0ea5e9;background:rgba(14,165,233,.2);color:#fff}
.ans-btn.correct{background:rgba(5,150,105,.2);border-color:#10b981;color:#6ee7b7}
.ans-btn.wrong{background:rgba(220,38,38,.2);border-color:#ef4444;color:#fca5a5}
.ans-btn:disabled{cursor:default}
#explain{margin-top:8px;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;font-size:12px;color:#7dd3fc;border-left:3px solid #0ea5e9;display:none;line-height:1.5}
#q-panel{display:none}
#wheel-hint{font-size:13px;color:#475569;text-align:center}
#intro,#result{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#070b18;z-index:10;gap:14px;padding:32px}
.big-emoji{font-size:64px}
.title-main{font-size:24px;font-weight:800;background:linear-gradient(135deg,#0ea5e9,#38bdf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.desc{color:#94a3b8;text-align:center;max-width:400px;line-height:1.6}
.btn-start{padding:12px 32px;border-radius:12px;border:none;background:linear-gradient(135deg,#0ea5e9,#38bdf8);color:#fff;font-size:15px;font-weight:800;cursor:pointer;transition:all .2s}
.btn-start:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(14,165,233,.5)}
</style>
</head>
<body>
<div id="intro">
  <div class="big-emoji">🎡</div>
  <div class="title-main">Vòng Quay Vận Mệnh</div>
  <div class="desc">Quay bánh xe để nhận nhân điểm 🎰 Rồi trả lời câu hỏi để nhân điểm đó! ×3 mà đúng thì cực kỳ lợi!</div>
  <div style="color:#38bdf8;font-weight:700;font-size:13px">Chủ đề: ${settings.topic} | ${questions.length} câu hỏi</div>
  <button class="btn-start" onclick="startGame()">🎡 Quay Thôi!</button>
</div>

<div id="result" style="display:none">
  <div class="big-emoji" id="res-emoji">🏆</div>
  <div class="title-main" id="res-title">Kết Thúc!</div>
  <div class="desc" id="res-desc"></div>
  <button class="btn-start" onclick="restartGame()">🔄 Quay Lại</button>
</div>

<div id="game" style="display:none">
  <div class="hud">
    <div class="hud-chip"><div class="chip-val" id="score-val">0</div><div class="chip-label">TỔNG ĐIỂM</div></div>
    <div class="hud-chip"><div class="chip-val" id="q-left">${questions.length}</div><div class="chip-label">CÂU CÒN LẠI</div></div>
  </div>
  <div class="panel" style="padding:12px">
    <div id="wheel-area">
      <div id="wheel-wrap">
        <canvas id="wheel-canvas" width="220" height="220"></canvas>
        <div id="pointer"></div>
      </div>
      <div id="multiplier-badge">× ?</div>
      <button id="spin-btn" onclick="spinWheel()">🎡 Quay!</button>
      <div id="wheel-hint">Quay vòng để nhận nhân điểm cho câu hỏi tiếp theo</div>
    </div>
  </div>
  <div class="panel" id="q-panel">
    <div class="q-label">❓ CÂU <span id="q-num">1</span>/${questions.length} — <span id="mult-label">×1</span> điểm</div>
    <div class="q-text" id="q-text"></div>
    <div class="answers" id="answers"></div>
    <div id="explain"></div>
  </div>
</div>

<script>
var questions = ${JSON.stringify(questions)};
var SEGMENTS = [
  {label:'×1',mult:1,color:'#1e3a5f'},{label:'×2',mult:2,color:'#1e4d40'},{label:'×3',mult:3,color:'#4c1d95'},
  {label:'MISS',mult:0,color:'#7f1d1d'},{label:'×2',mult:2,color:'#1e3a5f'},{label:'×1',mult:1,color:'#1e4d40'},
  {label:'×3',mult:3,color:'#1e3a5f'},{label:'×2',mult:2,color:'#4c1d95'}
];
var SEGMENT_ANGLE = (Math.PI * 2) / SEGMENTS.length;
var currentMultiplier = 1;
var score = 0;
var qIndex = 0;
var wheelAngle = 0;
var spinning = false;
var canAnswer = false;

function drawWheel(angle) {
  var canvas = document.getElementById('wheel-canvas');
  var ctx = canvas.getContext('2d');
  var cx = 110, cy = 110, r = 106;
  ctx.clearRect(0, 0, 220, 220);
  for (var i = 0; i < SEGMENTS.length; i++) {
    var start = angle + i * SEGMENT_ANGLE - Math.PI / 2;
    var end = start + SEGMENT_ANGLE;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = SEGMENTS[i].color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Label
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + SEGMENT_ANGLE / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 14px Segoe UI';
    ctx.fillText(SEGMENTS[i].label, r - 12, 5);
    ctx.restore();
  }
  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.2)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function spinWheel() {
  if (spinning || qIndex >= questions.length) return;
  spinning = true;
  document.getElementById('spin-btn').disabled = true;
  document.getElementById('q-panel').style.display = 'none';
  document.getElementById('multiplier-badge').textContent = '× ?';
  var spins = (Math.random() * 4 + 4) * Math.PI * 2;
  var finalAngle = wheelAngle + spins;
  var start = null;
  var duration = 3000;
  function animate(ts) {
    if (!start) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    var ease = 1 - Math.pow(1 - progress, 3);
    var angle = wheelAngle + spins * ease;
    drawWheel(angle);
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      wheelAngle = finalAngle % (Math.PI * 2);
      // Determine which segment is at top (pointer)
      var ptrAngle = (Math.PI * 2 - wheelAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      var segIdx = Math.floor(ptrAngle / SEGMENT_ANGLE) % SEGMENTS.length;
      var seg = SEGMENTS[segIdx];
      currentMultiplier = seg.mult;
      spinning = false;
      document.getElementById('multiplier-badge').textContent = seg.label === 'MISS' ? '💥 MISS' : '× ' + seg.mult;
      if (seg.mult === 0) {
        setTimeout(showNextQuestion, 600);
      } else {
        setTimeout(function() {
          document.getElementById('spin-btn').disabled = true;
          showQuestionPanel();
        }, 600);
      }
    }
  }
  requestAnimationFrame(animate);
}

function showQuestionPanel() {
  if (qIndex >= questions.length) { endGame(); return; }
  var q = questions[qIndex];
  document.getElementById('q-num').textContent = qIndex + 1;
  document.getElementById('mult-label').textContent = '×' + currentMultiplier;
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
  document.getElementById('q-panel').style.display = 'block';
  canAnswer = true;
  qIndex++;
  document.getElementById('q-left').textContent = questions.length - qIndex;
}

function showNextQuestion() {
  document.getElementById('spin-btn').disabled = false;
  document.getElementById('wheel-hint').textContent = qIndex < questions.length ? 'Quay để nhận nhân điểm tiếp theo!' : 'Hết câu hỏi!';
  if (qIndex >= questions.length) { setTimeout(endGame, 800); }
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
  if (q.explain) {
    var ex = document.getElementById('explain');
    ex.style.display = 'block';
    ex.textContent = ((idx === q.correct) ? '✅ ' : '❌ ') + q.explain;
  }
  if (idx === q.correct) {
    score += 10 * currentMultiplier;
    document.getElementById('score-val').textContent = score;
  }
  setTimeout(showNextQuestion, 1300);
}

function endGame() {
  document.getElementById('result').style.display = 'flex';
  document.getElementById('game').style.display = 'none';
  document.getElementById('res-emoji').textContent = score >= 150 ? '🥇' : score >= 80 ? '🏆' : '🎡';
  document.getElementById('res-title').textContent = score >= 150 ? 'Thiên Tài Vận May!' : 'Vòng Quay Kết Thúc!';
  document.getElementById('res-desc').textContent = 'Tổng điểm: ' + score + ' | Hoàn thành ' + Math.min(qIndex, questions.length) + '/' + questions.length + ' câu';
}

function startGame() {
  score = 0; qIndex = 0; currentMultiplier = 1; wheelAngle = 0;
  document.getElementById('score-val').textContent = '0';
  document.getElementById('q-left').textContent = questions.length;
  document.getElementById('intro').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  document.getElementById('game').style.display = 'flex';
  document.getElementById('q-panel').style.display = 'none';
  document.getElementById('spin-btn').disabled = false;
  document.getElementById('multiplier-badge').textContent = '× ?';
  document.getElementById('wheel-hint').textContent = 'Quay vòng để nhận nhân điểm cho câu hỏi tiếp theo';
  drawWheel(0);
}

function restartGame() {
  document.getElementById('result').style.display = 'none';
  document.getElementById('intro').style.display = 'flex';
}
</script>
</body>
</html>`;
}
