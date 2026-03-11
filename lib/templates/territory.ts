import { GameQuestion, GameSettings } from './types';

export function territoryTemplate(questions: GameQuestion[], settings: GameSettings): string {
  const GRID = 6;
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>🏰 Chiếm Đất — ${settings.topic}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',sans-serif;background:#0f1b0f;color:#e2e8f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px}
#game{width:100%;max-width:720px;display:flex;flex-direction:column;gap:12px}
.panel{background:#1a2e1a;border-radius:14px;padding:14px;border:1px solid #2d4a2d}
.scoreboard{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px}
.team{text-align:center}
.team-name{font-size:12px;color:#86efac;font-weight:700}
.team-score{font-size:34px;font-weight:900}
.t-me .team-score{color:#4ade80}
.t-ai .team-score{color:#f87171}
.vs{font-size:18px;color:#475569;font-weight:800;text-align:center}
/* Grid */
#grid{display:grid;grid-template-columns:repeat(${GRID},1fr);gap:6px}
.grid-cell{height:62px;border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:default;transition:all .25s;border:2px solid transparent;font-size:11px;font-weight:700;text-align:center;padding:2px;user-select:none}
.grid-cell.empty{background:#162016;border-color:#2d4a2d;color:#4b6d4b}
.grid-cell.mine{background:linear-gradient(135deg,#166534,#16a34a);border-color:#4ade80;box-shadow:0 0 10px rgba(74,222,128,.3);color:#fff}
.grid-cell.ai{background:linear-gradient(135deg,#7f1d1d,#dc2626);border-color:#f87171;box-shadow:0 0 10px rgba(248,113,113,.3);color:#fff}
.grid-cell.available{background:#1e3b1e;border-color:#4ade80;cursor:pointer;animation:pulse-green .8s ease-in-out infinite}
.grid-cell.available:hover{background:#166534;transform:scale(1.05)}
@keyframes pulse-green{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.4)}50%{box-shadow:0 0 0 6px rgba(74,222,128,0)}}
/* Q panel */
.q-label{font-size:11px;color:#4ade80;font-weight:700;letter-spacing:.05em;margin-bottom:8px}
.q-text{font-size:15px;font-weight:600;color:#f0fdf4;line-height:1.5;margin-bottom:12px}
.answers{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ans-btn{padding:9px 12px;border-radius:9px;border:2px solid #2d4a2d;background:#0f1b0f;color:#86efac;cursor:pointer;font-size:13px;text-align:left;transition:all .15s;line-height:1.4}
.ans-btn:hover:not(:disabled){border-color:#16a34a;background:#166534;color:#fff}
.ans-btn.correct{background:#052e16;border-color:#16a34a;color:#6ee7b7}
.ans-btn.wrong{background:#450a0a;border-color:#ef4444;color:#fca5a5}
.ans-btn:disabled{cursor:default}
#explain{margin-top:10px;padding:10px;background:#061206;border-radius:8px;font-size:12px;color:#86efac;border-left:3px solid #16a34a;display:none;line-height:1.5}
#select-prompt{font-size:13px;color:#4ade80;font-weight:700;text-align:center;padding:10px;display:none}
#intro,#result{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0f1b0f;z-index:10;gap:16px;padding:32px}
.big-emoji{font-size:72px}
.title-main{font-size:26px;font-weight:800;background:linear-gradient(135deg,#4ade80,#16a34a);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.desc{color:#86efac;text-align:center;max-width:420px;line-height:1.6;opacity:.8}
.btn-start{padding:13px 36px;border-radius:12px;border:none;background:linear-gradient(135deg,#16a34a,#4ade80);color:#0f1b0f;font-size:16px;font-weight:800;cursor:pointer;transition:all .2s}
.btn-start:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(74,222,128,.4)}
</style>
</head>
<body>
<div id="intro">
  <div class="big-emoji">🏰</div>
  <div class="title-main">Chiếm Đất!</div>
  <div class="desc">${settings.playerMode === '2p' ? 'Hai người thay nhau chơi! Ai trả lời đúng tự chọn (ô để chiếm lãnh thổ. Chiếm được nhiều ô nhất thắng!' : 'Trả lời đúng → chọn 1 ô trống trên lưới để chiếm. AI cũng chiếm ô ngẫu nhiên mỗi lượt sai. Ai chiếm nhiều ô hơn sau ${questions.length} câu thắng!'}</div>
  <div style="color:#4ade80;font-weight:700;font-size:14px">Chủ đề: ${settings.topic}</div>
  <button class="btn-start" onclick="startGame()">🏰 Xâm Lược Ngay!</button>
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
      <div class="team t-me"><div class="team-name" id="left-name">${settings.playerMode === '2p' ? settings.player1Name : '🧙 Bạn'}</div><div class="team-score" id="my-score">0</div></div>
      <div class="vs">⚔️<br><span style="font-size:11px;color:#64748b">CHIẾM ĐẤT</span></div>
      <div class="team t-ai"><div class="team-name" id="right-name">${settings.playerMode === '2p' ? settings.player2Name : '🤖 AI'}</div><div class="team-score" id="ai-score">0</div></div>
    </div>
  </div>
  <div class="panel" style="padding:10px">
    <div id="grid"></div>
  </div>
  <div id="select-prompt" style="font-size:13px;font-weight:700;text-align:center;padding:10px;display:none">✅ Đúng rồi! Hãy chọn 1 ô trống để chiếm 🏰</div>
</div>

<!-- 2p turn overlay -->
<div id="turn-overlay" style="display:none;position:fixed;inset:0;z-index:30;background:rgba(0,0,0,.85);flex-direction:column;align-items:center;justify-content:center;gap:12px">
  <div id="turn-emoji" style="font-size:56px"></div>
  <div id="turn-label" style="font-size:22px;font-weight:800;color:#f1f5f9"></div>
  <div style="font-size:13px;color:#94a3b8">Lượt của bạn! Chuẩn bị...</div>
</div>
  <div class="panel" id="q-panel">
    <div class="q-label">❓ CÂU <span id="q-num">1</span>/${questions.length}</div>
    <div class="q-text" id="q-text"></div>
    <div class="answers" id="answers"></div>
    <div id="explain"></div>
  </div>
</div>

<script>

var snd=(function(){var _ctx=null;function ctx(){if(!_ctx){_ctx=new(window.AudioContext||window.webkitAudioContext)();}if(_ctx.state==='suspended')_ctx.resume();return _ctx;}function tone(freq,start,dur,type,gain){var o=ctx().createOscillator(),g=ctx().createGain();o.connect(g);g.connect(ctx().destination);o.type=type||'triangle';o.frequency.setValueAtTime(freq,ctx().currentTime+start);g.gain.setValueAtTime(gain||0.25,ctx().currentTime+start);g.gain.exponentialRampToValueAtTime(0.001,ctx().currentTime+start+dur);o.start(ctx().currentTime+start);o.stop(ctx().currentTime+start+dur+0.05);}var _bgmNodes=[],_bgmPlaying=false,_bgmTid=null;var _bgmN=[523,587,659,698,784,880,988,1047];var _bgmP=[0,2,4,2,0,2,4,7,4,2,0,2,4,5,4,2];function _bgmLoop(t){_bgmNodes=[];var spd=0.22;_bgmP.forEach(function(ni,i){var f=_bgmN[ni%_bgmN.length],s=t+i*spd;var o=ctx().createOscillator(),g=ctx().createGain();o.connect(g);g.connect(ctx().destination);o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0.07,s);g.gain.exponentialRampToValueAtTime(0.001,s+spd*0.85);o.start(s);o.stop(s+spd);_bgmNodes.push(o);var b=ctx().createOscillator(),bg=ctx().createGain();b.connect(bg);bg.connect(ctx().destination);b.type='sine';b.frequency.value=f*0.25;bg.gain.setValueAtTime(0.05,s);bg.gain.exponentialRampToValueAtTime(0.001,s+spd*0.9);b.start(s);b.stop(s+spd);_bgmNodes.push(b);});if(_bgmPlaying)_bgmTid=setTimeout(function(){_bgmLoop(ctx().currentTime);},_bgmP.length*spd*1000-80);}return{welcome:function(){[[523,0,0.12,'triangle',0.28],[659,0.13,0.12,'triangle',0.28],[784,0.26,0.12,'triangle',0.28],[1047,0.39,0.25,'triangle',0.28],[784,0.66,0.1,'triangle',0.22],[1047,0.78,0.35,'triangle',0.28],[262,0,0.15,'sine',0.16],[523,0.39,0.3,'sine',0.16],[2093,0.78,0.12,'sine',0.1]].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});},correct:function(){[[523,0,0.1,'triangle',0.24],[659,0.1,0.1,'triangle',0.24],[784,0.2,0.1,'triangle',0.24],[1047,0.3,0.18,'triangle',0.24],[2093,0.48,0.1,'sine',0.1]].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});},wrong:function(){tone(220,0,0.18,'sawtooth',0.22);tone(196,0.2,0.18,'sawtooth',0.2);tone(174,0.4,0.22,'square',0.16);},victory:function(){[[523,0,0.12,'triangle',0.28],[659,0.13,0.12,'triangle',0.28],[784,0.26,0.12,'triangle',0.28],[1047,0.39,0.12,'triangle',0.28],[784,0.52,0.07,'triangle',0.24],[1047,0.6,0.07,'triangle',0.24],[1319,0.68,0.07,'triangle',0.24],[1047,0.76,0.07,'triangle',0.24],[1568,0.84,0.4,'triangle',0.28],[523,0,0.4,'sine',0.16],[659,0.42,0.4,'sine',0.16],[2093,0.84,0.08,'sine',0.1],[2637,0.93,0.15,'sine',0.1]].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});},tick:function(){tone(880,0,0.07,'square',0.18);},bgmStart:function(){if(_bgmPlaying)return;_bgmPlaying=true;_bgmLoop(ctx().currentTime);},bgmStop:function(){_bgmPlaying=false;if(_bgmTid)clearTimeout(_bgmTid);_bgmNodes.forEach(function(n){try{n.stop();}catch(e){}});_bgmNodes=[];}};})();
var questions = ${JSON.stringify(questions)};
var IS_2P = ${settings.playerMode === '2p' ? 'true' : 'false'};
var P1_NAME = '${settings.player1Name.replace(/'/g, "'")}';
var P2_NAME = '${settings.player2Name.replace(/'/g, "'")}';
var GRID_SIZE = ${GRID} * ${GRID};
var grid = new Array(GRID_SIZE).fill(0); // 0=empty,1=p1,2=p2/ai
var qIndex = 0;
var myScore = 0, aiScore = 0;
var canAnswer = false;
var selectMode = false;
var currentPlayer = 1; // in 2p: 1=P1's turn, 2=P2's turn

function renderGrid() {
  var el = document.getElementById('grid');
  el.innerHTML = '';
  for (var i = 0; i < GRID_SIZE; i++) {
    var cell = document.createElement('div');
    var state = grid[i];
    cell.className = 'grid-cell ' + (state === 1 ? 'mine' : state === 2 ? 'ai' : selectMode ? 'available' : 'empty');
    cell.dataset.idx = i;
    if (state === 1) cell.innerHTML = '🏰<br>Bạn';
    else if (state === 2) cell.innerHTML = '🤖<br>AI';
    else cell.textContent = '';
    if (state === 0 && selectMode) cell.onclick = function() { claimCell(parseInt(this.dataset.idx)); };
    el.appendChild(cell);
  }
  document.getElementById('my-score').textContent = myScore;
  document.getElementById('ai-score').textContent = aiScore;
  // Update cell labels in 2p
  if (IS_2P) {
    var cells = document.querySelectorAll('.grid-cell');
    cells.forEach(function(c) {
      if (grid[parseInt(c.dataset.idx)] === 1) c.innerHTML = '🏰<br>' + P1_NAME.substring(0,4);
      else if (grid[parseInt(c.dataset.idx)] === 2) c.innerHTML = '🏯<br>' + P2_NAME.substring(0,4);
    });
  }
}

function claimCell(idx) {
  if (!selectMode || grid[idx] !== 0) return;
  if (!IS_2P || currentPlayer === 1) { grid[idx] = 1; myScore++; }
  else { grid[idx] = 2; aiScore++; }
  selectMode = false;
  document.getElementById('select-prompt').style.display = 'none';
  document.getElementById('q-panel').style.display = 'block';
  renderGrid();
  // In 2p, switch player after cell pick too
  if (IS_2P && qIndex < questions.length) {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    var nextName = currentPlayer === 1 ? P1_NAME : P2_NAME;
    var nextEmoji = currentPlayer === 1 ? '🧑' : '👾';
    var ov = document.getElementById('turn-overlay');
    document.getElementById('turn-emoji').textContent = nextEmoji;
    document.getElementById('turn-label').textContent = 'Lượt của ' + nextName;
    ov.style.display = 'flex';
    setTimeout(function() { ov.style.display = 'none'; showNextQuestion(); }, 1400);
  } else {
    setTimeout(showNextQuestion, 400);
  }
}

function aiClaim() {
  var empties = [];
  for (var i = 0; i < GRID_SIZE; i++) if (grid[i] === 0) empties.push(i);
  if (empties.length === 0) return;
  // AI prefers corners and center
  var idx = empties[Math.floor(Math.random() * empties.length)];
  grid[idx] = 2;
  aiScore++;
}

function showNextQuestion() {
  if (qIndex >= questions.length) { endGame(); return; }
  var q = questions[qIndex];
  document.getElementById('q-num').textContent = qIndex + 1;
  if (IS_2P) {
    var currName = currentPlayer === 1 ? P1_NAME : P2_NAME;
    document.getElementById('q-text').textContent = '🎯 ' + currName + ': ' + q.q;
  } else {
    document.getElementById('q-text').textContent = q.q;
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
    snd.wrong();
  });
  var correct = (idx === q.correct);
  if (q.explain) {
    var ex = document.getElementById('explain');
    ex.style.display = 'block';
    ex.textContent = (correct ? '✅ ' : '❌ ') + q.explain;
  }
  if (correct) {
    snd.correct();
    var hasEmpty = grid.some(function(v) { return v === 0; });
    if (hasEmpty) {
      selectMode = true;
      document.getElementById('select-prompt').textContent = IS_2P
        ? (currentPlayer === 1 ? '✅ ' + P1_NAME + ' đẳng đ! Chọn ô để chiếm 🏀'
                               : '✅ ' + P2_NAME + ' đẳng đ! Chọn ô để chiếm 🏁')
        : '✅ Đúng rồi! Hãy chọn 1 ô trống để chiếm 🏀';
      document.getElementById('select-prompt').style.display = 'block';
      document.getElementById('q-panel').style.display = 'none';
      renderGrid();
      return;
    } else {
      if (!IS_2P || currentPlayer === 1) myScore++;
      else aiScore++;
    }
  } else {
    if (!IS_2P) aiClaim();
    // In 2p: no penalty for wrong answer
  }
  renderGrid();
  if (IS_2P) {
    // Switch player and show overlay
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    var nextName = currentPlayer === 1 ? P1_NAME : P2_NAME;
    var nextEmoji = currentPlayer === 1 ? '🧑' : '👾';
    if (qIndex >= questions.length) { setTimeout(endGame, 800); return; }
    setTimeout(function() {
      var ov = document.getElementById('turn-overlay');
      document.getElementById('turn-emoji').textContent = nextEmoji;
      document.getElementById('turn-label').textContent = 'Lượt của ' + nextName;
      ov.style.display = 'flex';
      setTimeout(function() { ov.style.display = 'none'; showNextQuestion(); }, 1400);
    }, 1200);
  } else {
    setTimeout(showNextQuestion, 1300);
  }
}

function endGame() {
  snd.bgmStop(); snd.victory();
  var resultEl = document.getElementById('result');
  resultEl.style.display = 'flex';
  document.getElementById('game').style.display = 'none';
  var outcome = myScore > aiScore ? 'win' : myScore < aiScore ? 'lose' : 'draw';
  var p1 = IS_2P ? P1_NAME : 'Bạn';
  var p2 = IS_2P ? P2_NAME : 'AI';
  document.getElementById('res-emoji').textContent = outcome === 'win' ? '🏆' : outcome === 'lose' ? '😢' : '🤝';
  document.getElementById('res-title').textContent = outcome === 'win' ? p1 + ' Bá Chủ Lãnh Thổ!' : outcome === 'lose' ? p2 + ' Chiếm Nhiều Hơn!' : 'Hoà!';
  document.getElementById('res-desc').textContent = p1 + ': ' + myScore + ' ô | ' + p2 + ': ' + aiScore + ' ô | Tổng: ' + GRID_SIZE + ' ô';
}

function startGame() {
  snd.welcome(); setTimeout(function(){snd.bgmStart();},1200);
  grid = new Array(GRID_SIZE).fill(0);
  qIndex = 0; myScore = 0; aiScore = 0; selectMode = false; currentPlayer = 1;
  document.getElementById('intro').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  document.getElementById('game').style.display = 'flex';
  document.getElementById('q-panel').style.display = 'block';
  document.getElementById('select-prompt').style.display = 'none';
  renderGrid();
  if (IS_2P) {
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
  snd.bgmStop();
  document.getElementById('result').style.display = 'none';
  document.getElementById('intro').style.display = 'flex';
}
</script>
</body>
</html>`;
}
