/**
 * Shared Web Audio API engine injected into every game template.
 * Call getAudioEngine() to get the JS string to embed inside <script>.
 * 
 * Provides the global `snd` object with:
 *   snd.welcome()   – welcome/intro fanfare
 *   snd.correct()   – correct answer chime
 *   snd.wrong()     – wrong answer buzz
 *   snd.victory()   – win celebration
 *   snd.tick()      – single timer tick (call every second when time is low)
 *   snd.bgmStart()  – start looping background music
 *   snd.bgmStop()   – stop background music
 */
export function getAudioEngine(): string {
  return `
var snd=(function(){
  var _ctx=null;
  function ctx(){if(!_ctx){_ctx=new(window.AudioContext||window.webkitAudioContext)();}if(_ctx.state==='suspended')_ctx.resume();return _ctx;}
  function tone(freq,start,dur,type,gain){
    var o=ctx().createOscillator(),g=ctx().createGain();
    o.connect(g);g.connect(ctx().destination);
    o.type=type||'triangle';
    o.frequency.setValueAtTime(freq,ctx().currentTime+start);
    g.gain.setValueAtTime(gain||0.25,ctx().currentTime+start);
    g.gain.exponentialRampToValueAtTime(0.001,ctx().currentTime+start+dur);
    o.start(ctx().currentTime+start);o.stop(ctx().currentTime+start+dur+0.05);
  }
  var _bgmNodes=[],_bgmPlaying=false,_bgmTid=null;
  var _bgmNotes=[523,587,659,698,784,880,988,1047];
  var _bgmPat=[0,2,4,2,0,2,4,7,4,2,0,2,4,5,4,2];
  function _bgmLoop(t){
    _bgmNodes=[];var spd=0.22;
    _bgmPat.forEach(function(ni,i){
      var f=_bgmNotes[ni%_bgmNotes.length],s=t+i*spd;
      var o=ctx().createOscillator(),g=ctx().createGain();
      o.connect(g);g.connect(ctx().destination);
      o.type='triangle';o.frequency.value=f;
      g.gain.setValueAtTime(0.07,s);g.gain.exponentialRampToValueAtTime(0.001,s+spd*0.85);
      o.start(s);o.stop(s+spd);_bgmNodes.push(o);
      var b=ctx().createOscillator(),bg=ctx().createGain();
      b.connect(bg);bg.connect(ctx().destination);
      b.type='sine';b.frequency.value=f*0.25;
      bg.gain.setValueAtTime(0.05,s);bg.gain.exponentialRampToValueAtTime(0.001,s+spd*0.9);
      b.start(s);b.stop(s+spd);_bgmNodes.push(b);
    });
    if(_bgmPlaying)_bgmTid=setTimeout(function(){_bgmLoop(ctx().currentTime);},_bgmPat.length*spd*1000-80);
  }
  return {
    welcome:function(){
      [[523,0,0.12,'triangle',0.28],[659,0.13,0.12,'triangle',0.28],[784,0.26,0.12,'triangle',0.28],
       [1047,0.39,0.25,'triangle',0.28],[784,0.66,0.1,'triangle',0.22],[1047,0.78,0.35,'triangle',0.28],
       [262,0,0.15,'sine',0.16],[523,0.39,0.3,'sine',0.16],[2093,0.78,0.12,'sine',0.1]
      ].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});
    },
    correct:function(){
      [[523,0,0.1,'triangle',0.24],[659,0.1,0.1,'triangle',0.24],
       [784,0.2,0.1,'triangle',0.24],[1047,0.3,0.18,'triangle',0.24],[2093,0.48,0.1,'sine',0.1]
      ].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});
    },
    wrong:function(){
      tone(220,0,0.18,'sawtooth',0.22);
      tone(196,0.2,0.18,'sawtooth',0.2);
      tone(174,0.4,0.22,'square',0.16);
    },
    victory:function(){
      [[523,0,0.12,'triangle',0.28],[659,0.13,0.12,'triangle',0.28],[784,0.26,0.12,'triangle',0.28],
       [1047,0.39,0.12,'triangle',0.28],[784,0.52,0.07,'triangle',0.24],[1047,0.6,0.07,'triangle',0.24],
       [1319,0.68,0.07,'triangle',0.24],[1047,0.76,0.07,'triangle',0.24],[1568,0.84,0.4,'triangle',0.28],
       [523,0,0.4,'sine',0.16],[659,0.42,0.4,'sine',0.16],[2093,0.84,0.08,'sine',0.1],[2637,0.93,0.15,'sine',0.1]
      ].forEach(function(a){tone(a[0],a[1],a[2],a[3],a[4]);});
    },
    tick:function(){tone(880,0,0.07,'square',0.18);},
    bgmStart:function(){if(_bgmPlaying)return;_bgmPlaying=true;_bgmLoop(ctx().currentTime);},
    bgmStop:function(){_bgmPlaying=false;if(_bgmTid)clearTimeout(_bgmTid);_bgmNodes.forEach(function(n){try{n.stop();}catch(e){}});_bgmNodes=[];}
  };
})();
`;
}
