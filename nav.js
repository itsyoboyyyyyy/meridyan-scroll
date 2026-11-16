// Meridyan mega menu — MORPHO-style element browser
document.addEventListener('DOMContentLoaded',function(){
  var mega=document.getElementById('meridyan-mega');
  if(!mega)return;
  var video=mega.querySelector('video');
  var caption=document.getElementById('mega-caption');
  var eyebrow=document.getElementById('mega-eyebrow');
  var desc=document.getElementById('mega-desc');
  var toggle=document.getElementById('mega-video-toggle');
  var header=document.querySelector('.morpho-header');
  var TAGLINES={"wildamore": "Where Curiosity Grows Wild", "siren": "Where the Waves Take You", "ember": "What Remains Can Rise", "horizon": "Where Perspective Meets Possibility", "summit": "Great Heights Begin Within", "mirage": "Not All Who Wander Are Lost", "halcyon": "The Beauty of Simply Being", "astoria": "Question Everything. Imagine Anything."};
  var MENUS={
    workshops:{eyebrow:'CREATE WITH YOUR COMMUNITY',desc:'Our workshops are about more than making a crystal tree — a chance to slow down, try something new, laugh a little, connect with the people around you, and leave with something you created entirely by hand.'},
    retreats:{eyebrow:'GATHER. GROW. TOGETHER.',desc:'Immersive retreats for every element — time away to reconnect, create, and return renewed.'}
  };
  var PLAY='<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"></path></svg>';
  var PAUSE='<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>';
  var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var userPaused=false;

  function setVideo(key){
    if(!key)return;
    var src='assets/user/'+key+'.mp4';
    if(video.getAttribute('src')!==src){video.setAttribute('src',src);video.load();}
    if(caption&&TAGLINES[key])caption.textContent=TAGLINES[key];
    if(!reduced&&!userPaused)video.play().catch(function(){});
  }
  function open(menu){
    var m=MENUS[menu]||MENUS.workshops;
    if(eyebrow)eyebrow.textContent=m.eyebrow;
    if(desc)desc.textContent=m.desc;
    mega.hidden=false;
    mega.removeAttribute('hidden');
    setVideo('wildamore');
  }
  function close(){mega.setAttribute('hidden','');mega.hidden=true;video.pause();}
  var hideTimer=null;
  function scheduleClose(){clearTimeout(hideTimer);hideTimer=setTimeout(close,220);}
  function cancelClose(){clearTimeout(hideTimer);}

  document.querySelectorAll('.nav-drop[data-menu]').forEach(function(drop){
    drop.addEventListener('mouseenter',function(){cancelClose();open(drop.dataset.menu);});
    drop.addEventListener('mouseleave',scheduleClose);
  });
  mega.addEventListener('mouseenter',cancelClose);
  mega.addEventListener('mouseleave',scheduleClose);
  if(header)header.addEventListener('mouseleave',scheduleClose);

  mega.querySelectorAll('.morpho-mega-links a[data-e]').forEach(function(a){
    a.addEventListener('mouseenter',function(){setVideo(a.dataset.e);});
    a.addEventListener('focus',function(){setVideo(a.dataset.e);});
  });

  if(toggle){
    toggle.addEventListener('click',function(){
      if(video.paused){userPaused=false;video.play().catch(function(){});toggle.innerHTML=PAUSE;toggle.setAttribute('aria-label','Pause menu video');}
      else{userPaused=true;video.pause();toggle.innerHTML=PLAY;toggle.setAttribute('aria-label','Play menu video');}
    });
    video.addEventListener('play',function(){toggle.innerHTML=PAUSE;});
    video.addEventListener('pause',function(){if(!userPaused)toggle.innerHTML=PLAY;});
  }
});
