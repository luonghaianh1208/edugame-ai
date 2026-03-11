import { GameQuestion, GameSettings } from './types';

function renderSettings(s: GameSettings) {
  return JSON.stringify({ topic: s.topic, difficulty: s.difficulty, useTimer: s.useTimer, useScoring: s.useScoring, rewardPenalty: s.rewardPenalty });
}

export function treasureHuntTemplate(questions: GameQuestion[], settings: GameSettings): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>🗺️ Kho Báu Tri Thức — ${settings.topic}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',sans-serif;background:#0f172a;color:#e2e8f0;height:100vh;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center}
#game{width:100%;max-width:820px;padding:16px;display:flex;flex-direction:column;gap:12px}
h1{text-align:center;font-size:22px;background:linear-gradient(135deg,#fbbf24,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800}
.subtitle{text-align:center;color:#94a3b8;font-size:13px;margin-top:-6px}
#map{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:4px 0}
.cell{height:54px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid transparent;cursor:default;transition:all .25s;position:relative;font-weight:700;font-size:13px;text-align:center;padding:2px}
.cell.empty{background:#1e293b;border-color:#334155}
.cell.player{background:linear-gradient(135deg,#3b82f6,#6366f1);border-color:#818cf8;box-shadow:0 0 12px rgba(99,102,241,.6)}
.cell.enemy{background:linear-gradient(135deg,#ef4444,#f97316);border-color:#fb923c;box-shadow:0 0 12px rgba(239,68,68,.5)}
.cell.treasure{background:linear-gradient(135deg,#fbbf24,#f59e0b);border-color:#fcd34d;box-shadow:0 0 14px rgba(251,191,36,.7)}
.cell.special{background:linear-gradient(135deg,#8b5cf6,#a78bfa);border-color:#c4b5fd}
.cell.trail{background:#1e3a5f;border-color:#2563eb;opacity:.7}
#hud{display:flex;justify-content:space-between;align-items:center;background:#1e293b;border-radius:12px;padding:10px 16px;gap:8px}
.hud-item{display:flex;flex-direction:column;align-items:center;gap:2px}
.hud-label{font-size:10px;color:#64748b;font-weight:600;letter-spacing:.05em}
.hud-val{font-size:18px;font-weight:800;color:#e2e8f0}
#question-box{background:#1e293b;border-radius:14px;padding:18px;border:1px solid #334155;display:none}
.q-text{font-size:15px;font-weight:600;line-height:1.5;margin-bottom:14px;color:#f1f5f9}
.answers{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ans-btn{padding:10px 14px;border-radius:9px;border:2px solid #334155;background:#0f172a;color:#cbd5e1;cursor:pointer;font-size:13px;text-align:left;transition:all .15s;line-height:1.4}
.ans-btn:hover{border-color:#6366f1;background:#1e1b4b;color:#fff}
.ans-btn.correct{background:#064e3b;border-color:#10b981;color:#6ee7b7}
.ans-btn.wrong{background:#450a0a;border-color:#ef4444;color:#fca5a5}
.ans-btn:disabled{cursor:default;opacity:.85}
#explain{margin-top:10px;padding:10px;background:#0c1a2e;border-radius:8px;font-size:12px;color:#93c5fd;border-left:3px solid #3b82f6;display:none;line-height:1.5}
#intro,#result{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0f172a;z-index:10;gap:16px;padding:32px}
.big-emoji{font-size:72px}
.title-main{font-size:28px;font-weight:800;background:linear-gradient(135deg,#fbbf24,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.desc{color:#94a3b8;text-align:center;max-width:420px;line-height:1.6}
.btn-start{padding:14px 40px;border-radius:12px;border:none;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#1a1a1a;font-size:16px;font-weight:800;cursor:pointer;transition:all .2s}
.btn-start:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(245,158,11,.4)}
.legend{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:4px}
.leg{display:flex;align-items:center;gap:5px;font-size:11px;color:#94a3b8}
.leg-dot{width:12px;height:12px;border-radius:3px}
</style>
</head>
<body>
<div id="intro">
  <div class="big-emoji">🗺️</div>
  <div class="title-main">Kho Báu Tri Thức</div>
  <div class="desc">Trả lời đúng để tiến trên bản đồ. Đúng khó = tiến 3 ô. Đúng dễ = tiến 1 ô. Đến kho báu ✨ trước kẻ thù để thắng!</div>
  <div style="color:#fbbf24;font-weight:700;font-size:14px">Chủ đề: ${settings.topic}</div>
  <button class="btn-start" onclick="startGame()">🚀 Bắt Đầu!</button>
</div>

<div id="result" style="display:none">
  <div class="big-emoji" id="res-emoji">🏆</div>
  <div class="title-main" id="res-title">Xuất Sắc!</div>
  <div class="desc" id="res-desc"></div>
  <button class="btn-start" onclick="restartGame()">🔄 Chơi Lại</button>
</div>

<div id="game" style="display:none">
  <div id="hud">
    <div class="hud-item"><div class="hud-label">❤️ ĐIỂM</div><div class="hud-val" id="score-val">0</div></div>
    <div>
      <h1 style="font-size:16px">🗺️ Kho Báu</h1>
      <div class="subtitle" id="pos-info">Bạn: ô 1 | Kẻ thù: ô 20</div>
    </div>
    <div class="hud-item"><div class="hud-label">📖 CÂU</div><div class="hud-val" id="q-counter">0/${questions.length}</div></div>
  </div>
  <div id="map"></div>
  <div class="legend">
    <div class="leg"><div class="leg-dot" style="background:linear-gradient(135deg,#3b82f6,#6366f1)"></div>Bạn 🧍</div>
    <div class="leg"><div class="leg-dot" style="background:linear-gradient(135deg,#ef4444,#f97316)"></div>Kẻ thù 👾</div>
    <div class="leg"><div class="leg-dot" style="background:linear-gradient(135deg,#fbbf24,#f59e0b)"></div>Kho báu ✨</div>
    <div class="leg"><div class="leg-dot" style="background:linear-gradient(135deg,#8b5cf6,#a78bfa)"></div>Ô đặc biệt ⭐</div>
  </div>
  <div id="question-box">
    <div class="q-text" id="q-text"></div>
    <div class="answers" id="answers"></div>
    <div id="explain"></div>
  </div>
</div>

<script>

var snd=(function(){var _ctx=null;function ctx(){if(!_ctx){_ctx=new(window.AudioContext||window.webkitAudioContext)();}if(_ctx.state==='suspended')_ctx.resume();return _ctx;}function tone(freq,start,dur,type,gain){var o=ctx().createOscillator(),g=ctx().createGain();o.connect(g);g.connect(ctx().destination);o.type=type||'triangle';o.frequency.setValueAtTime(freq,ctx().currentTime+start);g.gain.setValueAtTime(gain||0.25,ctx().currentTime+start);g.gain.exponentialRampToValueAtTime(0.001,ctx().currentTime+start+dur);o.start(ctx().currentTime+start);o.stop(ctx().currentTime+start+dur+0.05);}var _bgmNodes=[],_bgmPlaying=false,_bgmTid=null;var _bgmN=[523,587,659,698,784,880,988,1047];var _bgmP=[0,2,4,2,0,2,4,7,4,2,0,2,4,5,4,2];function _bgmLoop(t){_bgmNodes=[];var spd=0.22;_bgmP.forEach(function(ni,i){var f=_bgmN[ni%_bgmN.length],s=t+i*spd;var o=ctx().createOscillator(),g=ctx().createGain();o.connect(g);g.connect(ctx().destination);o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0.07,s);g.gain.exponentialRampToValueAtTime(0.001,s+spd*0.85);o.start(s);o.stop(s+spd);_bgmNodes.push(o);var b=ctx().createOscillator(),bg=ctx().createGain();b.connect(bg);bg.connect(ctx().destination);b.type='sine';b.frequency.value=f*0.25;bg.gain.setValueAtTime(0.05,s);bg.gain.exponentialRampToValueAtTime(0.001,s+spd*0.9);b.start(s);b.stop(s+spd);_bgmNodes.push(b);});if(_bgmPlaying)_bgmTid=setTimeout(function(){_bgmLoop(ctx().currentTime);},_bgmP.length*spd*1000-80);}return{welcome:function(){[[523,0,0.12,'triangle',0.28],[659,0.13,0.12,'triangle',0.28],[784,0.26,0.12,'triangle',0.28],[1047,0.39,0.25,'triangle',0.28],[784,0.66,0.1,'triangle',0.22],[1047,0.78,0.35,'triangle',0.28],[262,0,0.15,'sine',0.16],[523,0.39,0.3,'sine',0.16],[2093,0.78,0.12,'sine',0.1]].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});},correct:function(){[[523,0,0.1,'triangle',0.24],[659,0.1,0.1,'triangle',0.24],[784,0.2,0.1,'triangle',0.24],[1047,0.3,0.18,'triangle',0.24],[2093,0.48,0.1,'sine',0.1]].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});},wrong:function(){tone(220,0,0.18,'sawtooth',0.22);tone(196,0.2,0.18,'sawtooth',0.2);tone(174,0.4,0.22,'square',0.16);},victory:function(){[[523,0,0.12,'triangle',0.28],[659,0.13,0.12,'triangle',0.28],[784,0.26,0.12,'triangle',0.28],[1047,0.39,0.12,'triangle',0.28],[784,0.52,0.07,'triangle',0.24],[1047,0.6,0.07,'triangle',0.24],[1319,0.68,0.07,'triangle',0.24],[1047,0.76,0.07,'triangle',0.24],[1568,0.84,0.4,'triangle',0.28],[523,0,0.4,'sine',0.16],[659,0.42,0.4,'sine',0.16],[2093,0.84,0.08,'sine',0.1],[2637,0.93,0.15,'sine',0.1]].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});},tick:function(){tone(880,0,0.07,'square',0.18);},bgmStart:function(){if(_bgmPlaying)return;_bgmPlaying=true;_bgmLoop(ctx().currentTime);},bgmStop:function(){_bgmPlaying=false;if(_bgmTid)clearTimeout(_bgmTid);_bgmNodes.forEach(function(n){try{n.stop();}catch(e){}});_bgmNodes=[];}};})();
var questions = ${JSON.stringify(questions)};
var MAP_SIZE = 20;
var TREASURE_POS = 19; // 0-indexed last cell
var playerPos = 0;
var enemyPos = MAP_SIZE - 1;
var score = 0;
var qIndex = 0;
var gameState = 'intro';
var canAnswer = false;
var enemyMoves = [1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2];
var enemyMoveIdx = 0;

function buildMap() {
  var mapEl = document.getElementById('map');
  mapEl.innerHTML = '';
  for (var i = 0; i < MAP_SIZE; i++) {
    var cell = document.createElement('div');
    cell.className = 'cell';
    cell.id = 'cell-' + i;
    if (i === TREASURE_POS) {
      cell.className += ' treasure'; cell.textContent = '✨ Kho Báu';
    } else if (i === 4 || i === 9 || i === 14) {
      cell.className += ' special'; cell.textContent = '⭐';
    } else {
      cell.className += ' empty'; cell.textContent = (i + 1) + '';
    }
    mapEl.appendChild(cell);
  }
  updateMapDisplay();
}

function updateMapDisplay() {
  for (var i = 0; i < MAP_SIZE; i++) {
    var cell = document.getElementById('cell-' + i);
    if (!cell) continue;
    if (i === playerPos && i === enemyPos) {
      cell.style.background = 'linear-gradient(135deg,#3b82f6,#ef4444)';
      cell.textContent = '⚡';
    } else if (i === playerPos) {
      cell.className = 'cell player'; cell.textContent = '🧍';
    } else if (i === enemyPos) {
      cell.className = 'cell enemy'; cell.textContent = '👾';
    } else if (i === TREASURE_POS) {
      cell.className = 'cell treasure'; cell.textContent = '✨';
    } else if (i === 4 || i === 9 || i === 14) {
      cell.className = 'cell special'; cell.textContent = '⭐';
    } else {
      cell.className = 'cell empty'; cell.textContent = (i + 1) + '';
    }
  }
  document.getElementById('pos-info').textContent = 'Bạn: ô ' + (playerPos + 1) + ' | Kẻ thù: ô ' + (enemyPos + 1);
}

function showNextQuestion() {
  if (qIndex >= questions.length) { endGame('draw'); return; }
  var q = questions[qIndex];
  document.getElementById('q-counter').textContent = (qIndex + 1) + '/' + questions.length;
  document.getElementById('q-text').textContent = '❓ ' + q.q;
  var answersEl = document.getElementById('answers');
  answersEl.innerHTML = '';
  var labels = ['A', 'B', 'C', 'D'];
  q.answers.forEach(function(a, i) {
    var btn = document.createElement('button');
    btn.className = 'ans-btn';
    btn.textContent = labels[i] + '. ' + a;
    btn.onclick = function() { handleAnswer(i); };
    answersEl.appendChild(btn);
  });
  document.getElementById('explain').style.display = 'none';
  document.getElementById('question-box').style.display = 'block';
  canAnswer = true;
}

function handleAnswer(idx) {
  if (!canAnswer) return;
  canAnswer = false;
  var q = questions[qIndex];
  var btns = document.querySelectorAll('.ans-btn');
  btns.forEach(function(b, i) {
    b.disabled = true;
    if (i === q.correct) b.className = 'ans-btn correct';
    else if (i === idx) b.className = 'ans-btn wrong';
    snd.wrong();
  });
  var correct = (idx === q.correct);
  if (q.explain) {
    var exEl = document.getElementById('explain');
    exEl.style.display = 'block';
    exEl.textContent = (correct ? '✅ ' : '❌ ') + q.explain;
  }
  qIndex++;
  if (correct) {
    snd.correct();
    var steps = (q.answers.length >= 4) ? 2 : 1;
    if (playerPos === 4 || playerPos === 9 || playerPos === 14) steps += 1;
    score += (steps * 10);
    document.getElementById('score-val').textContent = score;
    setTimeout(function() {
      playerPos = Math.min(TREASURE_POS, playerPos + steps);
      updateMapDisplay();
      if (playerPos >= TREASURE_POS) { endGame('win'); return; }
      enemyStep();
    }, 1200);
  } else {
    setTimeout(function() {
      enemyStep();
    }, 1200);
  }
}

function enemyStep() {
  var move = enemyMoves[enemyMoveIdx % enemyMoves.length] || 1;
  enemyMoveIdx++;
  enemyPos = Math.max(0, enemyPos - move);
  updateMapDisplay();
  if (enemyPos <= 0) { endGame('lose'); return; }
  showNextQuestion();
}

function endGame(outcome) {
  gameState = 'result';
  var resultEl = document.getElementById('result');
  resultEl.style.display = 'flex';
  document.getElementById('game').style.display = 'none';
  var titles = { win: '🏆 Kho Báu Tìm Được!', lose: '💀 Kẻ Thù Đã Thắng!', draw: '⏳ Hết Câu Hỏi!' };
  var emojis = { win: '🏆', lose: '😢', draw: '⏳' };
  snd.bgmStop(); snd.victory();

  document.getElementById('res-title').textContent = titles[outcome] || 'Kết Thúc!';
  document.getElementById('res-emoji').textContent = emojis[outcome] || '🎮';
  document.getElementById('res-desc').textContent = 'Bạn đạt ' + score + ' điểm với ' + qIndex + '/' + questions.length + ' câu trả lời.';
}

function startGame() {
  snd.welcome(); setTimeout(function(){snd.bgmStart();},1200);
  playerPos = 0; enemyPos = MAP_SIZE - 1; score = 0; qIndex = 0; enemyMoveIdx = 0;
  gameState = 'playing';
  document.getElementById('intro').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  document.getElementById('game').style.display = 'flex';
  document.getElementById('score-val').textContent = '0';
  buildMap();
  showNextQuestion();
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
