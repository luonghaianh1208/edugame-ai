import { GameQuestion, GameSettings } from './types';

export function wheelFortuneTemplate(questions: GameQuestion[], settings: GameSettings): string {
  const playerCount = parseInt(settings.playerMode[0]) || 1;
  const playerNames = [
    settings.player1Name || 'Người chơi 1',
    settings.player2Name || 'Người chơi 2',
    settings.player3Name || 'Người chơi 3',
    settings.player4Name || 'Người chơi 4',
  ].slice(0, playerCount);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>🎡 Vòng Quay Vận Mệnh — ${settings.topic}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',sans-serif;background:#070b18;color:#e2e8f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px}
#game{width:100%;max-width:700px;display:flex;flex-direction:column;gap:12px}
/* Wheel */
#wheel-area{display:flex;flex-direction:column;align-items:center;gap:8px}
#wheel-wrap{position:relative;width:210px;height:210px}
#wheel-canvas{border-radius:50%;box-shadow:0 0 32px rgba(14,165,233,.4)}
#pointer{position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:11px solid transparent;border-right:11px solid transparent;border-top:22px solid #f59e0b;filter:drop-shadow(0 2px 6px rgba(245,158,11,.8))}
#spin-btn{padding:9px 28px;border-radius:12px;border:none;background:linear-gradient(135deg,#0ea5e9,#38bdf8);color:#fff;font-size:14px;font-weight:800;cursor:pointer;transition:all .2s}
#spin-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 20px rgba(14,165,233,.5)}
#spin-btn:disabled{opacity:.5;cursor:not-allowed}
#multiplier-badge{font-size:20px;font-weight:900;text-align:center;padding:6px 16px;border-radius:12px;background:rgba(14,165,233,.15);border:1px solid rgba(14,165,233,.3);min-width:70px}
/* Scoreboard */
#scoreboard{display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
.score-card{display:flex;flex-direction:column;align-items:center;padding:8px 12px;border-radius:10px;border:2px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);min-width:70px;transition:all .3s}
.score-card.active{border-color:#0ea5e9;background:rgba(14,165,233,.12);box-shadow:0 0 12px rgba(14,165,233,.3)}
.score-card.active .sc-name{color:#38bdf8}
.sc-name{font-size:10px;font-weight:700;color:#64748b;letter-spacing:.04em;margin-bottom:2px}
.sc-val{font-size:22px;font-weight:900;color:#f1f5f9}
#q-left-chip{display:flex;flex-direction:column;align-items:center;padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04)}
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
#wheel-hint{font-size:12px;color:#475569;text-align:center}
#turn-indicator{font-size:12px;font-weight:700;color:#38bdf8;text-align:center;padding:4px 0}
#intro,#result{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#070b18;z-index:10;gap:14px;padding:32px}
.big-emoji{font-size:60px}
.title-main{font-size:23px;font-weight:800;background:linear-gradient(135deg,#0ea5e9,#38bdf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.desc{color:#94a3b8;text-align:center;max-width:400px;line-height:1.6}
.btn-start{padding:12px 32px;border-radius:12px;border:none;background:linear-gradient(135deg,#0ea5e9,#38bdf8);color:#fff;font-size:15px;font-weight:800;cursor:pointer;transition:all .2s}
.btn-start:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(14,165,233,.5)}
/* Turn overlay for multi-player */
#turn-overlay{display:none;position:fixed;inset:0;z-index:30;background:rgba(0,0,0,.85);flex-direction:column;align-items:center;justify-content:center;gap:12px}
</style>
</head>
<body>
<div id="intro">
  <div class="big-emoji">🎡</div>
  <div class="title-main">Vòng Quay Vận Mệnh</div>
  <div class="desc">${playerCount > 1 ? `${playerCount} người chơi thay nhau quay bánh xe! Mỗi người spin → nhận nhân điểm → trả lời câu hỏi. Ai tổng điểm cao nhất sau tất cả câu hỏi thắng!` : 'Quay bánh xe để nhận nhân điểm 🎰 Rồi trả lời câu hỏi để nhân điểm đó! ×3 mà đúng thì cực kỳ lợi!'}</div>
  <div style="color:#38bdf8;font-weight:700;font-size:13px">Chủ đề: ${settings.topic} | ${questions.length} câu hỏi | ${playerCount} người chơi</div>
  <button class="btn-start" onclick="startGame()">🎡 Quay Thôi!</button>
</div>

<div id="result" style="display:none">
  <div class="big-emoji" id="res-emoji">🏆</div>
  <div class="title-main" id="res-title">Kết Thúc!</div>
  <div class="desc" id="res-desc"></div>
  <button class="btn-start" onclick="restartGame()">🔄 Quay Lại</button>
</div>

<!-- Turn overlay for multi-player -->
<div id="turn-overlay">
  <div id="turn-ov-emoji" style="font-size:56px"></div>
  <div id="turn-ov-label" style="font-size:22px;font-weight:800;color:#f1f5f9"></div>
  <div style="font-size:13px;color:#94a3b8">Lượt quay của bạn! Chuẩn bị...</div>
</div>

<div id="game" style="display:none">
  <div id="scoreboard">
    ${playerNames.map((n, i) => `<div class="score-card${i === 0 ? ' active' : ''}" id="sc-${i}"><div class="sc-name">${n}</div><div class="sc-val" id="sc-val-${i}">0</div></div>`).join('')}
    <div id="q-left-chip" style="display:flex;flex-direction:column;align-items:center;padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04)">
      <div style="font-size:22px;font-weight:900;color:#38bdf8" id="q-left">${questions.length}</div>
      <div style="font-size:10px;color:#64748b;font-weight:700">CÒN LẠI</div>
    </div>
  </div>
  <div id="turn-indicator">${playerCount > 1 ? `🎯 Lượt: ${playerNames[0]}` : '🎡 Vòng Quay Vận Mệnh'}</div>
  <div class="panel" style="padding:12px">
    <div id="wheel-area">
      <div id="wheel-wrap">
        <canvas id="wheel-canvas" width="210" height="210"></canvas>
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

var snd=(function(){var _ctx=null;function ctx(){if(!_ctx){_ctx=new(window.AudioContext||window.webkitAudioContext)();}if(_ctx.state==='suspended')_ctx.resume();return _ctx;}function tone(freq,start,dur,type,gain){var o=ctx().createOscillator(),g=ctx().createGain();o.connect(g);g.connect(ctx().destination);o.type=type||'triangle';o.frequency.setValueAtTime(freq,ctx().currentTime+start);g.gain.setValueAtTime(gain||0.25,ctx().currentTime+start);g.gain.exponentialRampToValueAtTime(0.001,ctx().currentTime+start+dur);o.start(ctx().currentTime+start);o.stop(ctx().currentTime+start+dur+0.05);}var _bgmNodes=[],_bgmPlaying=false,_bgmTid=null;var _bgmN=[523,587,659,698,784,880,988,1047];var _bgmP=[0,2,4,2,0,2,4,7,4,2,0,2,4,5,4,2];function _bgmLoop(t){_bgmNodes=[];var spd=0.22;_bgmP.forEach(function(ni,i){var f=_bgmN[ni%_bgmN.length],s=t+i*spd;var o=ctx().createOscillator(),g=ctx().createGain();o.connect(g);g.connect(ctx().destination);o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0.07,s);g.gain.exponentialRampToValueAtTime(0.001,s+spd*0.85);o.start(s);o.stop(s+spd);_bgmNodes.push(o);var b=ctx().createOscillator(),bg=ctx().createGain();b.connect(bg);bg.connect(ctx().destination);b.type='sine';b.frequency.value=f*0.25;bg.gain.setValueAtTime(0.05,s);bg.gain.exponentialRampToValueAtTime(0.001,s+spd*0.9);b.start(s);b.stop(s+spd);_bgmNodes.push(b);});if(_bgmPlaying)_bgmTid=setTimeout(function(){_bgmLoop(ctx().currentTime);},_bgmP.length*spd*1000-80);}return{welcome:function(){[[523,0,0.12,'triangle',0.28],[659,0.13,0.12,'triangle',0.28],[784,0.26,0.12,'triangle',0.28],[1047,0.39,0.25,'triangle',0.28],[784,0.66,0.1,'triangle',0.22],[1047,0.78,0.35,'triangle',0.28],[262,0,0.15,'sine',0.16],[523,0.39,0.3,'sine',0.16],[2093,0.78,0.12,'sine',0.1]].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});},correct:function(){[[523,0,0.1,'triangle',0.24],[659,0.1,0.1,'triangle',0.24],[784,0.2,0.1,'triangle',0.24],[1047,0.3,0.18,'triangle',0.24],[2093,0.48,0.1,'sine',0.1]].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});},wrong:function(){tone(220,0,0.18,'sawtooth',0.22);tone(196,0.2,0.18,'sawtooth',0.2);tone(174,0.4,0.22,'square',0.16);},victory:function(){[[523,0,0.12,'triangle',0.28],[659,0.13,0.12,'triangle',0.28],[784,0.26,0.12,'triangle',0.28],[1047,0.39,0.12,'triangle',0.28],[784,0.52,0.07,'triangle',0.24],[1047,0.6,0.07,'triangle',0.24],[1319,0.68,0.07,'triangle',0.24],[1047,0.76,0.07,'triangle',0.24],[1568,0.84,0.4,'triangle',0.28],[523,0,0.4,'sine',0.16],[659,0.42,0.4,'sine',0.16],[2093,0.84,0.08,'sine',0.1],[2637,0.93,0.15,'sine',0.1]].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});},tick:function(){tone(880,0,0.07,'square',0.18);},bgmStart:function(){if(_bgmPlaying)return;_bgmPlaying=true;_bgmLoop(ctx().currentTime);},bgmStop:function(){_bgmPlaying=false;if(_bgmTid)clearTimeout(_bgmTid);_bgmNodes.forEach(function(n){try{n.stop();}catch(e){}});_bgmNodes=[];}};})();
var questions = ${JSON.stringify(questions)};
var PLAYER_COUNT = ${playerCount};
var PLAYER_NAMES = ${JSON.stringify(playerNames)};
var PLAYER_COLORS = ['#38bdf8','#f97316','#a855f7','#10b981'];
var SEGMENTS = [
  {label:'×1',mult:1,color:'#1e3a5f'},{label:'×2',mult:2,color:'#1e4d40'},{label:'×3',mult:3,color:'#4c1d95'},
  {label:'MISS',mult:0,color:'#7f1d1d'},{label:'×2',mult:2,color:'#1e3a5f'},{label:'×1',mult:1,color:'#1e4d40'},
  {label:'×3',mult:3,color:'#1e3a5f'},{label:'×2',mult:2,color:'#4c1d95'}
];
var SEGMENT_ANGLE = (Math.PI * 2) / SEGMENTS.length;
var scores = new Array(PLAYER_COUNT).fill(0);
var currentPlayer = 0;
var currentMultiplier = 1;
var qIndex = 0;
var wheelAngle = 0;
var spinning = false;
var canAnswer = false;

function drawWheel(angle) {
  var canvas = document.getElementById('wheel-canvas');
  var ctx = canvas.getContext('2d');
  var cx = 105, cy = 105, r = 101;
  ctx.clearRect(0, 0, 210, 210);
  for (var i = 0; i < SEGMENTS.length; i++) {
    var start = angle + i * SEGMENT_ANGLE - Math.PI / 2;
    var end = start + SEGMENT_ANGLE;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end); ctx.closePath();
    ctx.fillStyle = SEGMENTS[i].color; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(start + SEGMENT_ANGLE / 2);
    ctx.textAlign = 'right'; ctx.fillStyle = '#f1f5f9'; ctx.font = 'bold 13px Segoe UI';
    ctx.fillText(SEGMENTS[i].label, r - 10, 5); ctx.restore();
  }
  ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 2; ctx.stroke();
}

function updateScoreCards() {
  for (var i = 0; i < PLAYER_COUNT; i++) {
    var card = document.getElementById('sc-' + i);
    if (card) {
      card.className = 'score-card' + (i === currentPlayer ? ' active' : '');
      document.getElementById('sc-val-' + i).textContent = scores[i];
    }
  }
  if (PLAYER_COUNT > 1) {
    document.getElementById('turn-indicator').textContent = '🎯 Lượt: ' + PLAYER_NAMES[currentPlayer];
    document.getElementById('turn-indicator').style.color = PLAYER_COLORS[currentPlayer];
  }
}

function spinWheel() {
  if (spinning || qIndex >= questions.length) return;
  spinning = true;
  document.getElementById('spin-btn').disabled = true;
  document.getElementById('q-panel').style.display = 'none';
  document.getElementById('multiplier-badge').textContent = '× ?';
  var spins = (Math.random() * 4 + 4) * Math.PI * 2;
  var finalAngle = wheelAngle + spins;
  var startTs = null, duration = 3000;
  function animate(ts) {
    if (!startTs) startTs = ts;
    var progress = Math.min((ts - startTs) / duration, 1);
    var ease = 1 - Math.pow(1 - progress, 3);
    drawWheel(wheelAngle + spins * ease);
    if (progress < 1) { requestAnimationFrame(animate); return; }
    wheelAngle = finalAngle % (Math.PI * 2);
    var ptrAngle = (Math.PI * 2 - wheelAngle + Math.PI * 2) % (Math.PI * 2);
    var segIdx = Math.floor(ptrAngle / SEGMENT_ANGLE) % SEGMENTS.length;
    var seg = SEGMENTS[segIdx];
    currentMultiplier = seg.mult;
    spinning = false;
    document.getElementById('multiplier-badge').textContent = seg.mult === 0 ? '💥 MISS' : '× ' + seg.mult;
    if (seg.mult === 0) {
      // MISS — skip question, next player
      setTimeout(function() { nextPlayerOrEnd(); }, 700);
    } else {
      setTimeout(function() { showQuestionPanel(); }, 600);
    }
  }
  requestAnimationFrame(animate);
}

function showQuestionPanel() {
  if (qIndex >= questions.length) { endGame(); return; }
  var q = questions[qIndex];
  document.getElementById('q-num').textContent = qIndex + 1;
  document.getElementById('mult-label').textContent = '×' + currentMultiplier;
  document.getElementById('q-text').textContent = (PLAYER_COUNT > 1 ? PLAYER_NAMES[currentPlayer] + ': ' : '') + q.q;
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

function handleAnswer(idx) {
  if (!canAnswer) return;
  canAnswer = false;
  var q = questions[qIndex - 1];
  var btns = document.querySelectorAll('.ans-btn');
  btns.forEach(function(b, i) {
    b.disabled = true;
    if (i === q.correct) b.className = 'ans-btn correct';
    else if (i === idx) b.className = 'ans-btn wrong';
    snd.wrong();
  });
  if (q.explain) {
    var ex = document.getElementById('explain');
    ex.style.display = 'block';
    ex.textContent = (idx === q.correct ? '✅ ' : '❌ ') + q.explain;
  }
  if (idx === q.correct) {
    snd.correct();
    scores[currentPlayer] += 10 * currentMultiplier;
    updateScoreCards();
  }
  setTimeout(function() { nextPlayerOrEnd(); }, 1400);
}

function nextPlayerOrEnd() {
  if (qIndex >= questions.length) { endGame(); return; }
  if (PLAYER_COUNT === 1) {
    document.getElementById('spin-btn').disabled = false;
    document.getElementById('wheel-hint').textContent = 'Quay để nhận nhân điểm tiếp theo!';
    document.getElementById('q-panel').style.display = 'none';
    return;
  }
  // Multi-player: switch to next player with overlay
  currentPlayer = (currentPlayer + 1) % PLAYER_COUNT;
  updateScoreCards();
  var ov = document.getElementById('turn-overlay');
  document.getElementById('turn-ov-emoji').textContent = '🎡';
  document.getElementById('turn-ov-label').textContent = 'Lượt của ' + PLAYER_NAMES[currentPlayer];
  ov.style.display = 'flex';
  setTimeout(function() {
    ov.style.display = 'none';
    document.getElementById('spin-btn').disabled = false;
    document.getElementById('q-panel').style.display = 'none';
    document.getElementById('multiplier-badge').textContent = '× ?';
    document.getElementById('wheel-hint').textContent = 'Quay để nhận nhân điểm!';
  }, 1600);
}

function endGame() {
  snd.bgmStop(); snd.victory();
  document.getElementById('result').style.display = 'flex';
  document.getElementById('game').style.display = 'none';
  if (PLAYER_COUNT === 1) {
    var s = scores[0];
    document.getElementById('res-emoji').textContent = s >= 150 ? '🥇' : s >= 80 ? '🏆' : '🎡';
    document.getElementById('res-title').textContent = s >= 150 ? 'Thiên Tài Vận May!' : 'Vòng Quay Kết Thúc!';
    document.getElementById('res-desc').textContent = 'Tổng điểm: ' + s + ' | Hoàn thành ' + Math.min(qIndex, questions.length) + '/' + questions.length + ' câu';
  } else {
    var maxScore = Math.max.apply(null, scores);
    var winnerIdx = scores.indexOf(maxScore);
    var allTied = scores.every(function(s) { return s === maxScore; });
    document.getElementById('res-emoji').textContent = allTied ? '🤝' : '🏆';
    document.getElementById('res-title').textContent = allTied ? 'Hoà Cả Làng!' : PLAYER_NAMES[winnerIdx] + ' Thắng!';
    var desc = scores.map(function(s, i) { return PLAYER_NAMES[i] + ': ' + s; }).join(' | ');
    document.getElementById('res-desc').textContent = desc;
  }
}

function startGame() {
  snd.welcome(); setTimeout(function(){snd.bgmStart();},1200);
  scores = new Array(PLAYER_COUNT).fill(0);
  currentPlayer = 0;
  qIndex = 0; currentMultiplier = 1; wheelAngle = 0;
  document.getElementById('q-left').textContent = questions.length;
  document.getElementById('intro').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  document.getElementById('game').style.display = 'flex';
  document.getElementById('q-panel').style.display = 'none';
  document.getElementById('spin-btn').disabled = false;
  document.getElementById('multiplier-badge').textContent = '× ?';
  document.getElementById('wheel-hint').textContent = 'Quay vòng để nhận nhân điểm cho câu hỏi tiếp theo';
  updateScoreCards();
  drawWheel(0);
}

function restartGame() {
  snd.bgmStop();
  document.getElementById('result').style.display = 'none';
  document.getElementById('intro').style.display = 'flex';
}
</script>
</body>
</html>`;
}
