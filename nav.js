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
  var collageEl=null;
  var mq=window.matchMedia('(min-width: 701px)');
  function upd(){
    var vh=window.innerHeight;
    var total=journey.offsetHeight-vh;
    var top=journey.getBoundingClientRect().top+window.scrollY;
    var p=total>0?Math.min(1,Math.max(0,(window.scrollY-top)/total)):0;
    if(!mq.matches){
      // mobile: text screen, then full-bleed collage screen (shorter handoff)
      var t=Math.min(1,Math.max(0,(p-0.10)/0.16));
      var c=Math.min(1,Math.max(0,(p-0.26)/0.16));
      var pastEnd=Math.min(1,Math.max(0,(p-0.80)/0.12));
      var colOp=c*(1-pastEnd);
      stage.style.setProperty('--hero-text-out',t.toFixed(4));
      stage.style.setProperty('--hero-collage-in',colOp.toFixed(4));
      // Gentle push-in while the collage screen is up — cinematic drift, one layer.
      stage.style.setProperty('--hero-collage-zoom',(0.95+0.05*Math.min(1,Math.max(0,(p-0.26)/0.5))).toFixed(4));
      // Fade the mobile nature backdrop out before the section handoff so the
      // next scene doesn't crossfade over the first section's photo.
      stage.style.setProperty('--hero-bg',(1-Math.min(1,Math.max(0,(p-0.66)/0.15))).toFixed(4));
      // Collage only captures touches while visible so mobile swipe works.
      if(!collageEl)collageEl=document.querySelector('.hero-collage');
      if(collageEl)collageEl.style.pointerEvents=colOp>0.02?'auto':'none';
      return;
    }
    var t=Math.min(1,Math.max(0,(p-0.40)/0.18));
    var c=Math.min(1,Math.max(0,(p-0.55)/0.20));
    stage.style.setProperty('--hero-text-out',t.toFixed(4));
    stage.style.setProperty('--hero-collage-in',c.toFixed(4));
    stage.style.setProperty('--hero-bg','1');
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
  // Defer offscreen groups: the collage ships ~60MB of photos, so strip src
  // from every group past the first — the browser only fetches what is shown.
  // show() hydrates the active group; the rest stream in during idle time.
  imgs.forEach(function(im,i){
    if(i>=PER&&im.getAttribute('src')){
      im.setAttribute('data-src',im.getAttribute('src'));
      im.removeAttribute('src');
    }
    im.decoding='async';
  });
  function hydrate(g){
    imgs.forEach(function(im,i){
      if(Math.floor(i/PER)===g&&!im.getAttribute('src')&&im.getAttribute('data-src')){
        im.setAttribute('src',im.getAttribute('data-src'));
      }
    });
  }
  collage.removeAttribute('aria-hidden');
  if(window.innerWidth>700)collage.style.position='relative';
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
  var tx=0,ty=0;
  collage.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
  collage.addEventListener('touchend',function(e){
    var dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)show(gi+(dx<0?1:-1));
  },{passive:true});
  function show(g){
    gi=(g+groups)%groups;
    hydrate(gi);
    hydrate((gi+1)%groups); // keep the next group warm so swipes feel instant
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
  // After first paint, stream the remaining groups in one at a time so later
  // swipes/arrows are instant without blocking the initial load.
  var hi=1;
  function idleHydrate(){
    if(hi>=groups)return;
    hydrate(hi++);
    setTimeout(idleHydrate,500);
  }
  var kick=function(){setTimeout(idleHydrate,1800);};
  if(document.readyState==='complete')kick();
  else window.addEventListener('load',kick,{once:true});
})();

/* Mobile menu — clones desktop nav links, adds element sublist */
(function(){
  var trig=document.querySelector('.morpho-mobile-trigger');
  var nav=document.querySelector('.morpho-main-nav');
  if(!trig||!nav)return;
  // Inside the injected nav iframe on Wix pages: ask the parent page to open the menu.
  // Detect by filename, not iframe height — the coded homepage is also embedded
  // in an iframe on /home2 and may be short at load time before it resizes.
  if(window.parent!==window&&/nav\.html($|\?)/.test(location.pathname)){
    var frameOpen=false;
    trig.addEventListener('click',function(){frameOpen=!frameOpen;window.parent.postMessage({meridyanMenu:frameOpen},'*');});
    window.addEventListener('message',function(e){if(e.data==='meridyanMenuClose')frameOpen=false;});
    // Desktop Wix nav: forward dropdown hover to the parent page mega-menu iframe.
    // innerWidth alone fails when Wix serves its mobile canvas to a desktop —
    // a wide screen + desktop UA means desktop nav regardless of iframe width.
    var __dskUA=!/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    var dskNav = window.innerWidth>700 || (__dskUA && ((window.screen&&window.screen.width>1000)||(window.matchMedia&&window.matchMedia('(pointer:fine)').matches)));
    if(dskNav){
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

// Footer social links
(function(){
  var socials=[
    ['Facebook','https://www.facebook.com/profile.php?id=61576555721497','0 0 24 24','<path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>'],
    ['Instagram','https://www.instagram.com/the.meridyan/','0 0 24 24','<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>'],
    ['TikTok','https://www.tiktok.com/@themeridyan','0 0 24 24','<path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>']
  ];
  function mount(){
    var sig=document.querySelector('.footer-connect-copy h3')||document.querySelector('.footer-invitation')||document.querySelector('.footer-signature');
    var legal=document.querySelector('.footer-legal');
    if((!sig&&!legal)||document.querySelector('.footer-social'))return;
    var wrap=document.createElement('div');
    wrap.className='footer-social';
    socials.forEach(function(s){
      var a=document.createElement('a');
      a.href=s[1];a.target='_blank';a.rel='noopener noreferrer';
      a.setAttribute('aria-label',s[0]+' — The Meridyan');
      a.innerHTML='<svg viewBox="'+s[2]+'" width="64" height="64" fill="currentColor" aria-hidden="true">'+s[3]+'</svg>';
      wrap.appendChild(a);
    });
    if(sig)sig.insertAdjacentElement('afterend',wrap);else legal.parentNode.insertBefore(wrap,legal);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();

// Footer contact info
(function(){
  function mount(){
    var anchor=document.querySelector('.footer-invitation')||document.querySelector('.footer-signature')||document.querySelector('.footer-legal');
    if(!anchor||document.querySelector('.footer-contact'))return;
    var d=document.createElement('div');
    d.className='footer-contact';
    d.innerHTML='<a href="mailto:connect@themeridyan.com">connect@themeridyan.com</a><span aria-hidden="true"> &middot; </span><a href="tel:+15033969063">(503) 396-9063</a>';
    anchor.insertAdjacentElement('afterend',d);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
