import { GameQuestion, GameSettings } from './types';

export function rpgBattleTemplate(questions: GameQuestion[], settings: GameSettings): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>⚔️ Đấu Trường RPG — ${settings.topic}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',sans-serif;background:radial-gradient(ellipse at center,#1a0630 0%,#0a0118 100%);color:#e2e8f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px}
#game{width:100%;max-width:700px;display:flex;flex-direction:column;gap:12px}
/* Battle arena */
#arena{display:flex;flex-direction:column;gap:8px;background:rgba(255,255,255,.03);border-radius:16px;padding:16px;border:1px solid rgba(255,255,255,.08)}
/* HP bars */
.combatant{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px}
.c-avatar{font-size:44px;line-height:1;filter:drop-shadow(0 0 8px rgba(139,92,246,.8))}
.c-avatar.enemy-avatar{filter:drop-shadow(0 0 8px rgba(239,68,68,.8))}
.c-info{display:flex;flex-direction:column;gap:5px}
.c-name{font-size:13px;font-weight:700;letter-spacing:.03em}
.hp-wrap{height:12px;background:rgba(255,255,255,.1);border-radius:6px;overflow:hidden}
.hp-bar{height:12px;border-radius:6px;transition:width .5s ease}
.hp-me{background:linear-gradient(90deg,#8b5cf6,#a78bfa)}
.hp-enemy{background:linear-gradient(90deg,#ef4444,#f87171)}
.c-hp{font-size:20px;font-weight:900;min-width:40px;text-align:right}
/* Battle log */
#battle-log{background:rgba(0,0,0,.4);border-radius:10px;padding:10px;height:56px;overflow:hidden;font-size:12px;color:#94a3b8;display:flex;align-items:center;justify-content:center;text-align:center;border:1px solid rgba(255,255,255,.06);transition:all .3s}
#battle-log.hit-p{color:#a78bfa;border-color:#7c3aed}
#battle-log.hit-e{color:#f87171;border-color:#ef4444}
#battle-log.big{color:#fbbf24;border-color:#f59e0b}
/* Skill bar */
.combo-row{display:flex;align-items:center;gap:8px;justify-content:center}
.combo-dot{width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.2);transition:all .3s}
.combo-dot.filled{background:#fbbf24;border-color:#f59e0b;box-shadow:0 0 8px rgba(251,191,36,.6)}
.combo-label{font-size:11px;color:#64748b;font-weight:600}
/* Q panel */
.panel{background:rgba(139,92,246,.06);border-radius:14px;padding:14px;border:1px solid rgba(139,92,246,.2)}
.q-label{font-size:11px;color:#a78bfa;font-weight:700;letter-spacing:.05em;margin-bottom:8px}
.q-text{font-size:14px;font-weight:600;color:#f1f5f9;line-height:1.5;margin-bottom:10px}
.answers{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.ans-btn{padding:9px 11px;border-radius:9px;border:2px solid rgba(139,92,246,.25);background:rgba(139,92,246,.08);color:#c4b5fd;cursor:pointer;font-size:12px;text-align:left;transition:all .15s;line-height:1.4}
.ans-btn:hover:not(:disabled){border-color:#7c3aed;background:rgba(139,92,246,.25);color:#fff}
.ans-btn.correct{background:rgba(5,150,105,.2);border-color:#10b981;color:#6ee7b7}
.ans-btn.wrong{background:rgba(220,38,38,.2);border-color:#ef4444;color:#fca5a5}
.ans-btn:disabled{cursor:default}
#explain{margin-top:8px;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;font-size:12px;color:#a5b4fc;border-left:3px solid #7c3aed;display:none;line-height:1.5}
/* Intro / Result */
#intro,#result{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,#1a0630,#0a0118);z-index:10;gap:14px;padding:32px}
.big-emoji{font-size:72px}
.title-main{font-size:26px;font-weight:800;background:linear-gradient(135deg,#a78bfa,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.desc{color:#94a3b8;text-align:center;max-width:420px;line-height:1.6}
.btn-start{padding:12px 32px;border-radius:12px;border:none;background:linear-gradient(135deg,#5b21b6,#7c3aed);color:#fff;font-size:15px;font-weight:800;cursor:pointer;transition:all .2s}
.btn-start:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,58,237,.5)}
@keyframes shake-anim{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
.shake{animation:shake-anim .4s ease}
</style>
</head>
<body>
<div id="intro">
  <div class="big-emoji">⚔️</div>
  <div class="title-main">Đấu Trường RPG</div>
  <div class="desc">Chiến đấu bằng kiến thức! Đúng → tấn công quái vật 💥 Sai → bị phản đòn 💢. Combo 3 đúng liên tiếp = ULTIMATE ⚡ (sát thương ×3)!</div>
  <div style="color:#a78bfa;font-weight:700;font-size:13px">Chủ đề: ${settings.topic} | ${questions.length} vòng chiến</div>
  <button class="btn-start" onclick="startGame()">⚔️ Chiến Đấu!</button>
</div>

<div id="result" style="display:none">
  <div class="big-emoji" id="res-emoji">🏆</div>
  <div class="title-main" id="res-title">Kết Thúc!</div>
  <div class="desc" id="res-desc"></div>
  <button class="btn-start" onclick="restartGame()">🔄 Chiến Lại</button>
</div>

<div id="game" style="display:none">
  <div id="arena">
    <div class="combatant">
      <div class="c-avatar" id="player-avatar">🧙</div>
      <div class="c-info">
        <div class="c-name" style="color:#a78bfa">🧙 Pháp Sư (Bạn)</div>
        <div class="hp-wrap"><div class="hp-bar hp-me" id="my-hp-bar" style="width:100%"></div></div>
      </div>
      <div class="c-hp" style="color:#a78bfa" id="my-hp">100</div>
    </div>
    <div id="battle-log">Chiến đấu bắt đầu! Hãy trả lời câu hỏi để tấn công! ⚔️</div>
    <div class="combatant">
      <div class="c-hp" style="color:#f87171" id="enemy-hp">100</div>
      <div class="c-info">
        <div class="c-name" style="color:#f87171;text-align:right">👹 Boss Tối Thượng</div>
        <div class="hp-wrap"><div class="hp-bar hp-enemy" id="enemy-hp-bar" style="width:100%"></div></div>
      </div>
      <div class="c-avatar enemy-avatar" id="enemy-avatar">👹</div>
    </div>
    <div class="combo-row">
      <div class="combo-label">⚡ ULTIMATE</div>
      <div class="combo-dot" id="dot-0"></div>
      <div class="combo-dot" id="dot-1"></div>
      <div class="combo-dot" id="dot-2"></div>
      <div class="combo-label">3 đúng liên tiếp</div>
    </div>
  </div>
  <div class="panel">
    <div class="q-label">❓ VÒNG <span id="q-num">1</span>/${questions.length}</div>
    <div class="q-text" id="q-text"></div>
    <div class="answers" id="answers"></div>
    <div id="explain"></div>
  </div>
</div>

<script>

var snd=(function(){var _ctx=null;function ctx(){if(!_ctx){_ctx=new(window.AudioContext||window.webkitAudioContext)();}if(_ctx.state==='suspended')_ctx.resume();return _ctx;}function tone(freq,start,dur,type,gain){var o=ctx().createOscillator(),g=ctx().createGain();o.connect(g);g.connect(ctx().destination);o.type=type||'triangle';o.frequency.setValueAtTime(freq,ctx().currentTime+start);g.gain.setValueAtTime(gain||0.25,ctx().currentTime+start);g.gain.exponentialRampToValueAtTime(0.001,ctx().currentTime+start+dur);o.start(ctx().currentTime+start);o.stop(ctx().currentTime+start+dur+0.05);}var _bgmNodes=[],_bgmPlaying=false,_bgmTid=null;var _bgmN=[523,587,659,698,784,880,988,1047];var _bgmP=[0,2,4,2,0,2,4,7,4,2,0,2,4,5,4,2];function _bgmLoop(t){_bgmNodes=[];var spd=0.22;_bgmP.forEach(function(ni,i){var f=_bgmN[ni%_bgmN.length],s=t+i*spd;var o=ctx().createOscillator(),g=ctx().createGain();o.connect(g);g.connect(ctx().destination);o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0.07,s);g.gain.exponentialRampToValueAtTime(0.001,s+spd*0.85);o.start(s);o.stop(s+spd);_bgmNodes.push(o);var b=ctx().createOscillator(),bg=ctx().createGain();b.connect(bg);bg.connect(ctx().destination);b.type='sine';b.frequency.value=f*0.25;bg.gain.setValueAtTime(0.05,s);bg.gain.exponentialRampToValueAtTime(0.001,s+spd*0.9);b.start(s);b.stop(s+spd);_bgmNodes.push(b);});if(_bgmPlaying)_bgmTid=setTimeout(function(){_bgmLoop(ctx().currentTime);},_bgmP.length*spd*1000-80);}return{welcome:function(){[[523,0,0.12,'triangle',0.28],[659,0.13,0.12,'triangle',0.28],[784,0.26,0.12,'triangle',0.28],[1047,0.39,0.25,'triangle',0.28],[784,0.66,0.1,'triangle',0.22],[1047,0.78,0.35,'triangle',0.28],[262,0,0.15,'sine',0.16],[523,0.39,0.3,'sine',0.16],[2093,0.78,0.12,'sine',0.1]].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});},correct:function(){[[523,0,0.1,'triangle',0.24],[659,0.1,0.1,'triangle',0.24],[784,0.2,0.1,'triangle',0.24],[1047,0.3,0.18,'triangle',0.24],[2093,0.48,0.1,'sine',0.1]].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});},wrong:function(){tone(220,0,0.18,'sawtooth',0.22);tone(196,0.2,0.18,'sawtooth',0.2);tone(174,0.4,0.22,'square',0.16);},victory:function(){[[523,0,0.12,'triangle',0.28],[659,0.13,0.12,'triangle',0.28],[784,0.26,0.12,'triangle',0.28],[1047,0.39,0.12,'triangle',0.28],[784,0.52,0.07,'triangle',0.24],[1047,0.6,0.07,'triangle',0.24],[1319,0.68,0.07,'triangle',0.24],[1047,0.76,0.07,'triangle',0.24],[1568,0.84,0.4,'triangle',0.28],[523,0,0.4,'sine',0.16],[659,0.42,0.4,'sine',0.16],[2093,0.84,0.08,'sine',0.1],[2637,0.93,0.15,'sine',0.1]].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});},tick:function(){tone(880,0,0.07,'square',0.18);},bgmStart:function(){if(_bgmPlaying)return;_bgmPlaying=true;_bgmLoop(ctx().currentTime);},bgmStop:function(){_bgmPlaying=false;if(_bgmTid)clearTimeout(_bgmTid);_bgmNodes.forEach(function(n){try{n.stop();}catch(e){}});_bgmNodes=[];}};})();
var questions = ${JSON.stringify(questions)};
var MAX_HP = 100;
var myHp = MAX_HP, enemyHp = MAX_HP;
var qIndex = 0, streak = 0;
var canAnswer = false;

var PLAYER_DMGS = [15, 20, 12, 18, 14];
var ENEMY_DMGS  = [10, 14, 8, 12, 16];
var pIdx = 0, eIdx = 0;

function updateHp() {
  var myPct  = Math.max(0, myHp / MAX_HP * 100);
  var enPct  = Math.max(0, enemyHp / MAX_HP * 100);
  document.getElementById('my-hp').textContent = Math.max(0, myHp);
  document.getElementById('enemy-hp').textContent = Math.max(0, enemyHp);
  document.getElementById('my-hp-bar').style.width = myPct + '%';
  document.getElementById('enemy-hp-bar').style.width = enPct + '%';
}

function updateCombo() {
  for (var i = 0; i < 3; i++) {
    var dot = document.getElementById('dot-' + i);
    if (dot) dot.className = 'combo-dot' + (i < streak ? ' filled' : '');
  }
}

function setLog(msg, cls) {
  var log = document.getElementById('battle-log');
  log.textContent = msg;
  log.className = cls ? 'battle-log ' + cls : '';
  // remove "battle-log" class mismatch - re-set
  log.id = 'battle-log';
  if (cls) {
    log.style.color = cls === 'hit-p' ? '#a78bfa' : cls === 'hit-e' ? '#f87171' : '#fbbf24';
    log.style.borderColor = cls === 'hit-p' ? '#7c3aed' : cls === 'hit-e' ? '#ef4444' : '#f59e0b';
  } else {
    log.style.color = '#94a3b8';
    log.style.borderColor = 'rgba(255,255,255,.06)';
  }
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
    snd.wrong();
  });
  if (q.explain) {
    var ex = document.getElementById('explain');
    ex.style.display = 'block';
    ex.textContent = ((idx === q.correct) ? '✅ ' : '❌ ') + q.explain;
  }
  var correct = (idx === q.correct);
  if (correct) {
    snd.correct();
    streak++;
    updateCombo();
    var dmg = PLAYER_DMGS[pIdx % PLAYER_DMGS.length];
    pIdx++;
    var isUltimate = (streak >= 3);
    if (isUltimate) {
      dmg = dmg * 3;
      streak = 0;
      updateCombo();
      setLog('⚡ ULTIMATE! Phép tối thượng gây ' + dmg + ' sát thương! Boss sắp ngã!', 'big');
    } else {
      setLog('💥 Tấn công trúng! Gây ' + dmg + ' sát thương cho Boss!', 'hit-p');
    }
    enemyHp -= dmg;
    var enemyEl = document.getElementById('enemy-avatar');
    enemyEl.classList.add('shake');
    setTimeout(function() { enemyEl.classList.remove('shake'); }, 400);
  } else {
    streak = 0;
    updateCombo();
    var edamage = ENEMY_DMGS[eIdx % ENEMY_DMGS.length];
    eIdx++;
    setLog('💢 Câu sai! Boss phản công gây ' + edamage + ' sát thương!', 'hit-e');
    myHp -= edamage;
    var playerEl = document.getElementById('player-avatar');
    playerEl.classList.add('shake');
    setTimeout(function() { playerEl.classList.remove('shake'); }, 400);
  }
  updateHp();
  if (enemyHp <= 0) { setTimeout(function(){ endGame('win'); }, 700); return; }
  if (myHp <= 0) { setTimeout(function(){ endGame('lose'); }, 700); return; }
  setTimeout(showNextQuestion, 1500);
}

function endGame(outcome) {
  document.getElementById('result').style.display = 'flex';
  document.getElementById('game').style.display = 'none';
  snd.bgmStop(); snd.victory();

  document.getElementById('res-emoji').textContent = outcome === 'win' ? '🏆' : outcome === 'lose' ? '💀' : '⏳';
  document.getElementById('res-title').textContent = outcome === 'win' ? 'Boss Đã Bị Đánh Bại!' : outcome === 'lose' ? 'Bạn Đã Ngã Xuống...' : 'Hết Câu Hỏi!';
  document.getElementById('res-desc').textContent = 'HP của bạn: ' + Math.max(0, myHp) + ' | HP Boss: ' + Math.max(0, enemyHp) + ' | Hoàn thành ' + qIndex + '/' + questions.length + ' câu';
}

function startGame() {
  snd.welcome(); setTimeout(function(){snd.bgmStart();},1200);
  myHp = MAX_HP; enemyHp = MAX_HP; qIndex = 0; streak = 0; pIdx = 0; eIdx = 0;
  document.getElementById('intro').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  document.getElementById('game').style.display = 'flex';
  updateHp();
  updateCombo();
  setLog('Chiến đấu bắt đầu! Hãy trả lời câu hỏi để tấn công! ⚔️', '');
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
