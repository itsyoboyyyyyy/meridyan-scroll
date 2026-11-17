// Meridyan mega menu — MORPHO-style element browser
document.addEventListener('DOMContentLoaded',function(){
  var player=document.querySelector('.morpho-header>.site-player');
  var notchBar=document.querySelector('.morpho-notch-bar');
  if(player&&notchBar)notchBar.appendChild(player);

  // size the notch pill to fit its contents (same math as scroll-engine)
  function sizeNotch(){
    var bar=document.querySelector('.morpho-notch-bar');
    var glass=document.querySelector('.morpho-notch-glass');
    var shape=document.querySelector('.morpho-notch-shape');
    if(!bar||!glass||!shape||!bar.getClientRects().length)return;
    var w=Math.ceil(bar.offsetWidth+44);
    var dFill='M0,0 A22,22 0 0 1 22,22 L22,44 A18,18 0 0 0 40,62 L'+(w-40)+',62 A18,18 0 0 0 '+(w-22)+',44 L'+(w-22)+',22 A22,22 0 0 1 '+w+',0 Z';
    var dEdge=dFill.slice(0,-2);
    glass.style.width=w+'px';
    glass.style.clipPath='path("M 0 0 A 22 22 0 0 1 22 22 L 22 44 A 18 18 0 0 0 40 62 L '+(w-40)+' 62 A 18 18 0 0 0 '+(w-22)+' 44 L '+(w-22)+' 22 A 22 22 0 0 1 '+w+' 0 Z")';
    shape.style.width=w+'px';
    shape.setAttribute('viewBox','0 0 '+w+' 62');
    shape.querySelectorAll('path').forEach(function(p){p.setAttribute('d',p.classList.contains('morpho-notch-edge')?dEdge:dFill);});
  }
  sizeNotch();
  window.addEventListener('load',sizeNotch);
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(sizeNotch,120);});

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
    elements:{eyebrow:'THE EIGHT ELEMENTS',desc:'Eight elements. One world — explore each one and find where you belong.'},
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

(function(){
  var bar=document.createElement('div');
  bar.className='meridyan-announce';
  bar.innerHTML='<span>We’re moving to Oregon — follow the journey.</span><button type="button" aria-label="Dismiss announcement">×</button>';
  document.body.prepend(bar);
  document.documentElement.classList.add('has-announce');
  bar.querySelector('button').addEventListener('click',function(){
    bar.remove();document.documentElement.classList.remove('has-announce');
  });
})();

/* Homepage hero: two-screen scroll — text then collage */
(function(){
  var journey=document.querySelector('.flow-journey');
  if(!journey)return;
  var stage=journey.querySelector('.flow-stage')||journey;
  var mq=window.matchMedia('(min-width: 701px)');
  function upd(){
    var vh=window.innerHeight;
    var total=journey.offsetHeight-vh;
    var top=journey.getBoundingClientRect().top+window.scrollY;
    var p=total>0?Math.min(1,Math.max(0,(window.scrollY-top)/total)):0;
    if(!mq.matches){
      // mobile: text screen, then full-bleed collage screen
      var t=Math.min(1,Math.max(0,(p-0.30)/0.22));
      var c=Math.min(1,Math.max(0,(p-0.45)/0.30));
      var pastEnd=Math.min(1,Math.max(0,(window.scrollY+vh-(top+journey.offsetHeight))/(vh*0.6)));
      stage.style.setProperty('--hero-text-out',t.toFixed(4));
      stage.style.setProperty('--hero-collage-in',(c*(1-pastEnd)).toFixed(4));
      return;
    }
    var t=Math.min(1,Math.max(0,(p-0.40)/0.18));
    var c=Math.min(1,Math.max(0,(p-0.55)/0.20));
    stage.style.setProperty('--hero-text-out',t.toFixed(4));
    stage.style.setProperty('--hero-collage-in',c.toFixed(4));
  }
  window.addEventListener('scroll',upd,{passive:true});
  window.addEventListener('resize',upd);
  upd();
})();

/* Hero collage: grouped photo carousel (4 per screen, arrow navigation) */
(function(){
  var collage=document.querySelector('.hero-collage');
  if(!collage)return;
  var imgs=Array.prototype.slice.call(collage.querySelectorAll('img'));
  if(imgs.length<=4)return;
  var PER=4, groups=Math.ceil(imgs.length/PER), gi=0;
  collage.removeAttribute('aria-hidden');
  collage.style.position='relative';
  function chevron(left){
    var NS='http://www.w3.org/2000/svg';
    var s=document.createElementNS(NS,'svg');
    s.setAttribute('width','18');s.setAttribute('height','18');
    s.setAttribute('viewBox','0 0 24 24');s.setAttribute('fill','none');
    s.setAttribute('stroke','currentColor');s.setAttribute('stroke-width','2');
    s.setAttribute('stroke-linecap','round');s.setAttribute('stroke-linejoin','round');
    s.setAttribute('aria-hidden','true');
    var p=document.createElementNS(NS,'path');
    if(left){p.setAttribute('d','m15 18-6-6 6-6');}else{p.setAttribute('d','m9 18 6-6-6-6');}
    s.appendChild(p);return s;
  }
  function makeBtn(cls,label,left){
    var b=document.createElement('button');
    b.type='button';b.className='hero-nav '+cls;
    b.setAttribute('aria-label',label);
    b.appendChild(chevron(left));
    b.addEventListener('click',function(){show(gi+(left?-1:1));});
    collage.appendChild(b);return b;
  }
  makeBtn('hero-nav-prev','Previous photos',true);
  makeBtn('hero-nav-next','Next photos',false);
  function show(g){
    gi=(g+groups)%groups;
    var vis=[];
    imgs.forEach(function(im,i){
      var on=Math.floor(i/PER)===gi;
      im.style.display=on?'':'none';
      im.style.gridRow='';im.style.gridColumn='';
      if(on)vis.push(im);
    });
    if(vis.length===1){vis[0].style.gridRow='span 2';vis[0].style.gridColumn='span 2';}
    else if(vis.length===2){vis[0].style.gridRow='span 2';vis[1].style.gridRow='span 2';}
    else if(vis.length===3){vis[2].style.gridColumn='span 2';}
  }
  show(0);
})();

/* Mobile menu — clones desktop nav links, adds element sublist */
(function(){
  var trig=document.querySelector('.morpho-mobile-trigger');
  var nav=document.querySelector('.morpho-main-nav');
  if(!trig||!nav)return;
  // Inside the small injected-nav iframe on Wix pages: ask the parent page to open the menu
  if(window.parent!==window&&window.innerHeight<400){
    var frameOpen=false;
    trig.addEventListener('click',function(){frameOpen=!frameOpen;window.parent.postMessage({meridyanMenu:frameOpen},'*');});
    window.addEventListener('message',function(e){if(e.data==='meridyanMenuClose')frameOpen=false;});
    // Desktop Wix nav: forward dropdown hover to the parent page mega-menu iframe
    if(window.innerWidth>700){
      document.querySelectorAll('.nav-drop[data-menu]').forEach(function(d){
        d.addEventListener('mouseenter',function(){window.parent.postMessage({meridyanMega:true},'*');});
        d.addEventListener('mouseleave',function(){window.parent.postMessage({meridyanMega:false},'*');});
      });
    }
    return;
  }
  var panel=document.createElement('div');
  panel.className='morpho-mobile-menu';
  panel.id='morpho-mobile-menu';
  var list=document.createElement('nav');
  list.setAttribute('aria-label','Mobile navigation');
  var logo=document.querySelector('.morpho-header-logo img, .morpho-header-logo');
  if(logo){
    var lg=document.createElement('div');
    lg.className='mmm-logo';
    var im=logo.tagName==='IMG'?logo:logo.querySelector('img');
    if(im){var ci=im.cloneNode(true);ci.removeAttribute('width');ci.removeAttribute('height');lg.appendChild(ci);}
    else lg.innerHTML=logo.innerHTML;
    list.appendChild(lg);
  }
  var els=[['wildamore','Wildamore'],['siren','Siren'],['ember','Ember'],['horizon','Horizon'],['summit','Summit'],['mirage','Mirage'],['halcyon','Halcyon'],['astoria','Astoria']];
  nav.querySelectorAll('a').forEach(function(a){
    var c=a.cloneNode(true);
    c.classList.add('mmm-link');
    c.removeAttribute('id');
    list.appendChild(c);
    if((a.getAttribute('href')||'').indexOf('elements.html')>-1){
      var sub=document.createElement('div');
      sub.className='mmm-sub';
      els.forEach(function(e){
        var s=document.createElement('a');
        s.className='mmm-link mmm-el';
        s.href='element.html?e='+e[0];
        if(a.target)s.target=a.target;
        s.textContent=e[1];
        sub.appendChild(s);
      });
      list.appendChild(sub);
    }
  });

  // Mobile-only: add account + cart links at the bottom of the menu
  var actions=document.querySelector('.morpho-header-actions');
  if(actions){
    var tail=document.createElement('div');
    tail.className='mmm-tail';
    actions.querySelectorAll('a').forEach(function(a){
      var c=a.cloneNode(true);
      c.classList.add('mmm-link','mmm-tail-link');
      c.removeAttribute('id');
      if(!c.textContent.trim())c.textContent='Cart';
      tail.appendChild(c);
    });
    list.appendChild(tail);
  }
  panel.appendChild(list);
  document.body.appendChild(panel);
  function setOpen(open){
    panel.classList.toggle('open',open);
    trig.setAttribute('aria-expanded',open?'true':'false');
    document.documentElement.style.overflow=open?'hidden':'';
  }
  trig.addEventListener('click',function(){setOpen(!panel.classList.contains('open'));});
  panel.addEventListener('click',function(e){if(e.target.closest('a'))setOpen(false);});
  document.addEventListener('click',function(e){
    if(panel.classList.contains('open')&&!panel.contains(e.target)&&!trig.contains(e.target))setOpen(false);
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')setOpen(false);});
})();
