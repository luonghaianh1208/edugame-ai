import { GameQuestion, GameSettings } from './types';

export function mosaicRevealTemplate(questions: GameQuestion[], settings: GameSettings): string {
  const TILES = 16;
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>🔍 Giải Mã Bức Ảnh — ${settings.topic}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',sans-serif;background:#0f0a1e;color:#e2e8f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px}
#game{width:100%;max-width:680px;display:flex;flex-direction:column;gap:12px}
.panel{background:rgba(255,255,255,.05);border-radius:14px;padding:14px;border:1px solid rgba(255,255,255,.1)}
/* Mosaic image */
#image-wrap{position:relative;width:100%;aspect-ratio:1.6;border-radius:12px;overflow:hidden;border:2px solid rgba(255,255,255,.15)}
#base-image{width:100%;height:100%;object-fit:cover;display:block}
#tiles-overlay{position:absolute;inset:0;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);gap:2px;padding:2px}
.tile{background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:4px;transition:all .4s;cursor:default;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#4338ca}
.tile.revealed{background:transparent;color:transparent}
.tile.glowing{animation:glow .4s ease-out;background:linear-gradient(135deg,#7c3aed,#a855f7)}
@keyframes glow{0%{opacity:1;transform:scale(1.05)}100%{opacity:0;transform:scale(1)}}
/* Guess bar */
#guess-area{display:flex;gap:8px}
#guess-input{flex:1;padding:10px 14px;border-radius:9px;border:2px solid rgba(255,255,255,.15);background:rgba(0,0,0,.3);color:#f1f5f9;font-size:14px;outline:none}
#guess-input:focus{border-color:#7c3aed}
#guess-btn{padding:10px 18px;border-radius:9px;border:none;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap}
#guess-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(124,58,237,.5)}
#guess-result{font-size:13px;text-align:center;padding:6px;border-radius:8px;display:none}
.guess-correct{background:rgba(5,150,105,.2);color:#6ee7b7;border:1px solid #10b981}
.guess-wrong{background:rgba(220,38,38,.2);color:#fca5a5;border:1px solid #ef4444}
/* Hud */
.hud{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
.hud-chip{display:flex;flex-direction:column;align-items:center;gap:2px;background:rgba(255,255,255,.06);border-radius:9px;padding:7px 14px}
.chip-val{font-size:20px;font-weight:800}
.chip-label{font-size:10px;color:#6b7280;font-weight:700;letter-spacing:.05em}
/* Q panel */
.q-label{font-size:11px;color:#a78bfa;font-weight:700;letter-spacing:.05em;margin-bottom:8px}
.q-text{font-size:14px;font-weight:600;color:#f1f5f9;line-height:1.5;margin-bottom:10px}
.answers{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.ans-btn{padding:9px 11px;border-radius:9px;border:2px solid rgba(124,58,237,.3);background:rgba(124,58,237,.1);color:#c4b5fd;cursor:pointer;font-size:12px;text-align:left;transition:all .15s;line-height:1.4}
.ans-btn:hover:not(:disabled){border-color:#7c3aed;background:rgba(124,58,237,.3);color:#fff}
.ans-btn.correct{background:rgba(5,150,105,.2);border-color:#10b981;color:#6ee7b7}
.ans-btn.wrong{background:rgba(220,38,38,.2);border-color:#ef4444;color:#fca5a5}
.ans-btn:disabled{cursor:default}
#explain{margin-top:8px;padding:9px;background:rgba(0,0,0,.3);border-radius:8px;font-size:12px;color:#a5b4fc;border-left:3px solid #7c3aed;display:none;line-height:1.5}
/* Upload panel */
#upload-panel{text-align:center;padding:20px}
.upload-zone{border:2px dashed rgba(124,58,237,.5);border-radius:12px;padding:28px;cursor:pointer;transition:all .2s;margin-bottom:14px;background:rgba(124,58,237,.05)}
.upload-zone:hover{border-color:#7c3aed;background:rgba(124,58,237,.1)}
#file-input{display:none}
.u-icon{font-size:48px;margin-bottom:8px}
.u-label{color:#a78bfa;font-size:14px;font-weight:600}
.u-sub{color:#64748b;font-size:12px;margin-top:4px}
.btn-start{padding:12px 32px;border-radius:12px;border:none;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-size:15px;font-weight:800;cursor:pointer;transition:all .2s;margin-top:4px}
.btn-start:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(124,58,237,.5)}
#intro,#result{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0f0a1e;z-index:10;gap:14px;padding:32px}
.big-emoji{font-size:64px}
.title-main{font-size:24px;font-weight:800;background:linear-gradient(135deg,#a78bfa,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.desc{color:#94a3b8;text-align:center;max-width:420px;line-height:1.6}
</style>
</head>
<body>
<div id="intro">
  <div class="big-emoji">🔍</div>
  <div class="title-main">Giải Mã Bức Ảnh</div>
  <div class="desc">Tải lên ảnh bí ẩn, trả lời đúng để lật mở từng ô. Đoán tên bức ảnh sớm sẽ nhận nhiều điểm hơn!</div>
  <div style="color:#a78bfa;font-weight:700;font-size:14px;margin-bottom:4px">Chủ đề: ${settings.topic}</div>
  <div class="panel" id="upload-panel">
    <div class="upload-zone" onclick="document.getElementById('file-input').click()">
      <div class="u-icon">🖼️</div>
      <div class="u-label">Tải ảnh lên</div>
      <div class="u-sub">Nhấn để chọn ảnh (JPG, PNG, GIF...)</div>
    </div>
    <input type="file" id="file-input" accept="image/*" onchange="handleImageUpload(event)">
    <div id="preview-thumb" style="display:none;margin-bottom:12px;text-align:center">
      <img id="thumb-img" style="max-height:90px;border-radius:8px;border:2px solid rgba(124,58,237,.4)" alt="preview">
      <div style="color:#a78bfa;font-size:12px;margin-top:6px">✅ Ảnh đã chọn</div>
    </div>
    <button class="btn-start" onclick="startGame()" id="start-btn" disabled>🚀 Bắt Đầu!</button>
  </div>
</div>

<div id="result" style="display:none">
  <div class="big-emoji" id="res-emoji">🏆</div>
  <div class="title-main" id="res-title">Kết Thúc!</div>
  <div class="desc" id="res-desc"></div>
  <img id="result-img" style="max-width:240px;border-radius:12px;border:2px solid rgba(124,58,237,.5);display:none" alt="revealed">
  <button class="btn-start" onclick="restartGame()">🔄 Chơi Lại</button>
</div>

<div id="game" style="display:none">
  <div id="image-wrap">
    <img id="base-image" src="" alt="mystery">
    <div id="tiles-overlay"></div>
  </div>
  <div class="hud">
    <div class="hud-chip"><div class="chip-val" id="score-val">0</div><div class="chip-label">ĐIỂM</div></div>
    <div class="hud-chip"><div class="chip-val" id="tiles-left">${TILES}</div><div class="chip-label">Ô CÒN LẠI</div></div>
    <div class="hud-chip"><div class="chip-val" id="guess-left">3</div><div class="chip-label">LƯỢT ĐOÁN</div></div>
    <div class="hud-chip"><div class="chip-val" id="q-num">1/${questions.length}</div><div class="chip-label">CÂU HỎI</div></div>
  </div>
  <div class="panel">
    <div id="guess-area">
      <input type="text" id="guess-input" placeholder="Đoán tên bức ảnh...">
      <button id="guess-btn" onclick="makeGuess()">🔍 Đoán!</button>
    </div>
    <div id="guess-result"></div>
  </div>
  <div class="panel" id="q-panel">
    <div class="q-label">❓ CÂU HỎI <span id="q-label-num">1</span>/${questions.length}</div>
    <div class="q-text" id="q-text"></div>
    <div class="answers" id="answers"></div>
    <div id="explain"></div>
  </div>
</div>

<script>

var snd=(function(){var _ctx=null;function ctx(){if(!_ctx){_ctx=new(window.AudioContext||window.webkitAudioContext)();}if(_ctx.state==='suspended')_ctx.resume();return _ctx;}function tone(freq,start,dur,type,gain){var o=ctx().createOscillator(),g=ctx().createGain();o.connect(g);g.connect(ctx().destination);o.type=type||'triangle';o.frequency.setValueAtTime(freq,ctx().currentTime+start);g.gain.setValueAtTime(gain||0.25,ctx().currentTime+start);g.gain.exponentialRampToValueAtTime(0.001,ctx().currentTime+start+dur);o.start(ctx().currentTime+start);o.stop(ctx().currentTime+start+dur+0.05);}var _bgmNodes=[],_bgmPlaying=false,_bgmTid=null;var _bgmN=[523,587,659,698,784,880,988,1047];var _bgmP=[0,2,4,2,0,2,4,7,4,2,0,2,4,5,4,2];function _bgmLoop(t){_bgmNodes=[];var spd=0.22;_bgmP.forEach(function(ni,i){var f=_bgmN[ni%_bgmN.length],s=t+i*spd;var o=ctx().createOscillator(),g=ctx().createGain();o.connect(g);g.connect(ctx().destination);o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0.07,s);g.gain.exponentialRampToValueAtTime(0.001,s+spd*0.85);o.start(s);o.stop(s+spd);_bgmNodes.push(o);var b=ctx().createOscillator(),bg=ctx().createGain();b.connect(bg);bg.connect(ctx().destination);b.type='sine';b.frequency.value=f*0.25;bg.gain.setValueAtTime(0.05,s);bg.gain.exponentialRampToValueAtTime(0.001,s+spd*0.9);b.start(s);b.stop(s+spd);_bgmNodes.push(b);});if(_bgmPlaying)_bgmTid=setTimeout(function(){_bgmLoop(ctx().currentTime);},_bgmP.length*spd*1000-80);}return{welcome:function(){[[523,0,0.12,'triangle',0.28],[659,0.13,0.12,'triangle',0.28],[784,0.26,0.12,'triangle',0.28],[1047,0.39,0.25,'triangle',0.28],[784,0.66,0.1,'triangle',0.22],[1047,0.78,0.35,'triangle',0.28],[262,0,0.15,'sine',0.16],[523,0.39,0.3,'sine',0.16],[2093,0.78,0.12,'sine',0.1]].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});},correct:function(){[[523,0,0.1,'triangle',0.24],[659,0.1,0.1,'triangle',0.24],[784,0.2,0.1,'triangle',0.24],[1047,0.3,0.18,'triangle',0.24],[2093,0.48,0.1,'sine',0.1]].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});},wrong:function(){tone(220,0,0.18,'sawtooth',0.22);tone(196,0.2,0.18,'sawtooth',0.2);tone(174,0.4,0.22,'square',0.16);},victory:function(){[[523,0,0.12,'triangle',0.28],[659,0.13,0.12,'triangle',0.28],[784,0.26,0.12,'triangle',0.28],[1047,0.39,0.12,'triangle',0.28],[784,0.52,0.07,'triangle',0.24],[1047,0.6,0.07,'triangle',0.24],[1319,0.68,0.07,'triangle',0.24],[1047,0.76,0.07,'triangle',0.24],[1568,0.84,0.4,'triangle',0.28],[523,0,0.4,'sine',0.16],[659,0.42,0.4,'sine',0.16],[2093,0.84,0.08,'sine',0.1],[2637,0.93,0.15,'sine',0.1]].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});},tick:function(){tone(880,0,0.07,'square',0.18);},bgmStart:function(){if(_bgmPlaying)return;_bgmPlaying=true;_bgmLoop(ctx().currentTime);},bgmStop:function(){_bgmPlaying=false;if(_bgmTid)clearTimeout(_bgmTid);_bgmNodes.forEach(function(n){try{n.stop();}catch(e){}});_bgmNodes=[];}};})();
var questions = ${JSON.stringify(questions)};
var TILES = ${TILES};
var tilesRevealed = 0;
var score = 0;
var guessLeft = 3;
var qIndex = 0;
var canAnswer = false;
var imageDataURL = '';
var imageName = '';

function handleImageUpload(e) {
  var file = e.target.files[0];
  if (!file) return;
  imageName = file.name.replace(/\.[^.]+$/, '');
  var reader = new FileReader();
  reader.onload = function(ev) {
    imageDataURL = ev.target.result;
    document.getElementById('thumb-img').src = imageDataURL;
    document.getElementById('preview-thumb').style.display = 'block';
    document.getElementById('start-btn').disabled = false;
  };
  reader.readAsDataURL(file);
}

function buildTiles() {
  var overlay = document.getElementById('tiles-overlay');
  overlay.innerHTML = '';
  for (var i = 0; i < TILES; i++) {
    var tile = document.createElement('div');
    tile.className = 'tile';
    tile.id = 'tile-' + i;
    tile.textContent = '?';
    overlay.appendChild(tile);
  }
}

function revealTile() {
  var hidden = [];
  for (var i = 0; i < TILES; i++) {
    var t = document.getElementById('tile-' + i);
    if (t && !t.classList.contains('revealed')) hidden.push(i);
  }
  if (hidden.length === 0) return;
  var idx = hidden[Math.floor(Math.random() * hidden.length)];
  var tile = document.getElementById('tile-' + idx);
  tile.className = 'tile glowing';
  setTimeout(function() { tile.className = 'tile revealed'; }, 400);
  tilesRevealed++;
  document.getElementById('tiles-left').textContent = TILES - tilesRevealed;
  score += Math.max(0, (TILES - tilesRevealed) * 5);
  document.getElementById('score-val').textContent = score;
}

function makeGuess() {
  if (guessLeft <= 0) return;
  var input = document.getElementById('guess-input');
  var guess = input.value.trim().toLowerCase();
  if (!guess) return;
  guessLeft--;
  document.getElementById('guess-left').textContent = guessLeft;
  var resEl = document.getElementById('guess-result');
  // Simple check: any word in guess matches image name
  var target = imageName.toLowerCase();
  var correct = target.includes(guess) || guess.includes(target.split(' ')[0]);
  resEl.style.display = 'block';
  if (correct) {
    snd.correct();
    resEl.className = 'guess-correct';
    resEl.textContent = '🎉 Chính xác! Bạn đoán đúng rồi!';
    endGame('win');
  } else {
    resEl.className = 'guess-wrong';
    resEl.textContent = '❌ Chưa đúng. Còn ' + guessLeft + ' lượt đoán.';
    if (guessLeft <= 0) endGame('out-of-guesses');
  }
  input.value = '';
}

function showNextQuestion() {
  if (qIndex >= questions.length) { endGame('all-done'); return; }
  var q = questions[qIndex];
  document.getElementById('q-label-num').textContent = qIndex + 1;
  document.getElementById('q-num').textContent = (qIndex + 1) + '/' + questions.length;
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
    snd.wrong();
  });
  if (q.explain) {
    var ex = document.getElementById('explain');
    ex.style.display = 'block';
    ex.textContent = ((idx === q.correct) ? '✅ ' : '❌ ') + q.explain;
  }
  if (idx === q.correct) revealTile();
  if (tilesRevealed >= TILES) { endGame('all-revealed'); return; }
  setTimeout(showNextQuestion, 1300);
}

function endGame(reason) {
  canAnswer = false;
  // Reveal all tiles
  for (var i = 0; i < TILES; i++) {
    var t = document.getElementById('tile-' + i);
    if (t) t.className = 'tile revealed';
  }
  setTimeout(function() {
    document.getElementById('result').style.display = 'flex';
    document.getElementById('game').style.display = 'none';
    snd.bgmStop(); snd.victory();

    document.getElementById('res-emoji').textContent = reason === 'win' ? '🏆' : reason === 'all-revealed' ? '🎊' : '📸';
    document.getElementById('res-title').textContent = reason === 'win' ? 'Đoán Được Rồi!' : reason === 'all-revealed' ? 'Toàn Bộ Ảnh Mở!' : 'Hết Lượt!';
    document.getElementById('res-desc').textContent = 'Điểm: ' + score + ' | ' + tilesRevealed + '/' + TILES + ' ô đã lật | Ảnh: ' + imageName;
    var rimg = document.getElementById('result-img');
    rimg.src = imageDataURL;
    rimg.style.display = 'block';
  }, 800);
}

function startGame() {
  snd.welcome(); setTimeout(function(){snd.bgmStart();},1200);
  if (!imageDataURL) return;
  tilesRevealed = 0; score = 0; guessLeft = 3; qIndex = 0;
  document.getElementById('base-image').src = imageDataURL;
  document.getElementById('score-val').textContent = '0';
  document.getElementById('tiles-left').textContent = TILES;
  document.getElementById('guess-left').textContent = '3';
  document.getElementById('guess-result').style.display = 'none';
  document.getElementById('guess-input').value = '';
  document.getElementById('intro').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  document.getElementById('game').style.display = 'flex';
  buildTiles();
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
