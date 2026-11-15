/* Scroll engine for the ported MORPHO page.
   Re-drives the site's CSS-variable scroll scenes (the original runtime is not included). */
(function () {
  'use strict';

  var clamp = function (v, a, b) { a = a || 0; b = b === undefined ? 1 : b; return Math.min(b, Math.max(a, v)); };
  var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  var vh = function () { return window.innerHeight; };

  function setVar(el, k, v) { if (el) el.style.setProperty(k, v); }

  // progress of a tall section whose inner stage is position:sticky;top:0;height:100svh
  function progress(section) {
    var r = section.getBoundingClientRect();
    var dist = r.height - vh();
    if (dist <= 0) return clamp((vh() - r.top) / vh());
    return clamp(-r.top / dist);
  }

  function visibleFraction(el) {
    var r = el.getBoundingClientRect();
    var vis = Math.min(r.bottom, vh()) - Math.max(r.top, 0);
    return clamp(vis / vh());
  }

  function scrub(video, t) {
    if (!video) return;
    var d = video.duration;
    if (video.readyState >= 1 && isFinite(d) && d > 0) {
      var target = clamp(t, 0, 1) * d;
      if (Math.abs(video.currentTime - target) > 0.04) video.currentTime = target;
    }
  }

  // ambient playback: play when the scene is active, pause otherwise
  function manageVideo(video, active) {
    if (!video) return;
    if (active) {
      if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    } else if (!video.paused) video.pause();
  }

  // --read-progress feeds --word-on = clamp(0,(read - word-start)*40,1).
  // Every block's last word has --word-start:1.0000, so read must exceed 1
  // (needs >=1.025) or the final word — the one ending in the period — can
  // never fully highlight. Overshoot by 5%; CSS clamps word-on at 1 anyway.
  // During autoplay the scroll moves fast, so --read-progress advances at a
  // capped rate instead of snapping to the scroll position — the word-by-word
  // highlight reads at a cinematic pace. Manual scrolling is untouched.
  var autoplayActive = false;
  var readCur = new WeakMap();
  var readEls = null;
  var READ_MAX_RATE = 0.1; // progress units per second during autoplay
  function setRead(el, v) {
    if (!el) return;
    var now = performance.now();
    var st = readCur.get(el);
    if (!st) { st = { p: v, t: now, tg: v }; readCur.set(el, st); }
    st.tg = v;
    var dt = Math.min(0.1, (now - st.t) / 1000); st.t = now;
    if (autoplayActive) {
      var d = v - st.p, m = READ_MAX_RATE * dt;
      st.p += Math.max(-m, Math.min(m, d));
    } else {
      st.p = v;
    }
    el.style.setProperty('--read-progress', (st.p * 1.05).toFixed(4));
  }

  // During autoplay, is any on-screen reading block still catching up?
  // Used to crawl the scroll so scenes never advance mid-sentence.
  function readPending() {
    if (!readEls) readEls = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-reading]'));
    var vh = window.innerHeight;
    for (var i = 0; i < readEls.length; i++) {
      var el = readEls[i], r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      var st = readCur.get(el);
      if (st && st.p < 0.99 && st.tg > st.p + 0.015) return true;
    }
    return false;
  }

  // ---------- HERO ----------
  var hero = document.getElementById('flow-hero');
  function heroFrame(p) {
    if (!hero) return;
    var stage = hero.querySelector('.flow-stage');
    setVar(stage, '--intro', (1 - ss(0.1, 0.35, p)).toFixed(4));
    setVar(stage, '--hero-light', ss(0.35, 0.85, p).toFixed(4));
    setVar(stage, '--object', (1 - ss(0.7, 0.92, p)).toFixed(4));
    setVar(stage, '--open', '0');
    setVar(stage, '--pour', '0');
    setVar(stage, '--source', '0');
    setVar(stage, '--nature-copy', '0');
    setVar(stage, '--line', (p * 100).toFixed(2) + '%');
    setVar(hero, '--scene-exit', ss(0.92, 1, p).toFixed(4));
    setVar(hero, '--nature-exit', '0');
    var desc = stage.querySelector('[data-scroll-reading]');
    setRead(desc, ss(0.03, 0.2, p));
  }

  // ---------- TERRITORY (flow-life, flow-everyday) ----------
  function territory(section) {
    var stage = section.querySelector('.territory-stage');
    if (!stage) return;
    var p = progress(section);
    setVar(section, '--territory-progress', (p * 100).toFixed(2) + '%');
    var panels = Array.prototype.slice.call(stage.querySelectorAll('.territory-panel'));
    var n = panels.length || 1;
    var act = 1 / n, best = 0, bestOp = -1;
    panels.forEach(function (panel, i) {
      var a0 = i * act, a1 = (i + 1) * act;
      var local = clamp((p - a0) / (a1 - a0));
      var fin = i === 0 ? 1 : ss(a0 - 0.06, a0 + 0.02, p);
      var fout = i === n - 1 ? 1 : (1 - ss(a1 - 0.02, a1 + 0.12, p));
      var op = fin * fout;
      var copy = op * ss(0.02, 0.3, local) * (i === n - 1 ? 1 : (1 - ss(0.85, 1, local)));
      var drift = clamp(local * 0.5);
      var title = ss(0.04, 0.4, local);
      var body = ss(0.15, 0.55, local);
      setVar(panel, '--panel-opacity', op.toFixed(4));
      setVar(panel, '--copy-opacity', copy.toFixed(4));
      setVar(panel, '--panel-drift', drift.toFixed(4));
      setVar(panel, '--ritual-progress', local.toFixed(4));
      setVar(panel, '--title-reveal', title.toFixed(4));
      setVar(panel, '--body-reveal', body.toFixed(4));
      setVar(panel, '--copy-rise', ((1 - ss(0.05, 0.45, local)) * 28).toFixed(2) + 'px');
      setRead(panel.querySelector('[data-scroll-reading]'), ss(0.2, 0.8, local));
      var running = op > 0.6;
      panel.setAttribute('data-running', String(running));
      panel.setAttribute('aria-hidden', String(op < 0.5));
      if (op < 0.05) panel.setAttribute('inert', ''); else panel.removeAttribute('inert');
      var video = panel.querySelector('.territory-film-image');
      if (video) {
        video.style.opacity = op.toFixed(3);
        manageVideo(video, op > 0.55);
        video.setAttribute('data-playback', op > 0.55 ? 'playing' : 'paused');
      }
      if (op > bestOp) { bestOp = op; best = i; }
    });
    var shot = panels[best] && panels[best].getAttribute('data-shot');
    if (shot && section.getAttribute('data-active-shot') !== shot) {
      section.setAttribute('data-active-shot', shot);
      section.setAttribute('data-surf-visible', String(shot === 'surf' && bestOp > 0.6));
      section.setAttribute('data-surf-playing', String(shot === 'surf' && bestOp > 0.6));
    }
    stage.setAttribute('data-pinned', String(p > 0.001 && p < 0.999));
  }

  // ---------- BLUE ZONES journey ----------
  var bzNames = [
    ['Okinawa', 'Japan'], ['Sardinia', 'Italy'], ['Ikaria', 'Greece'],
    ['Loma Linda', 'California, USA'], ['Nicoya', 'Costa Rica']
  ];
  var bz = document.getElementById('flow-bluezones');
  function bzFrame(p) {
    if (!bz) return;
    var stage = bz.querySelector('.bluezone-stage');
    setVar(bz, '--bz-progress', (p * 100).toFixed(2) + '%');
    setVar(bz, '--bz-zoom', ss(0.5, 0.95, p).toFixed(4));
    var cf = Math.min(p * 5, 4.999);
    var ch = clamp(Math.floor(cf), 0, 4);
    if (bz.getAttribute('data-chapter') !== String(ch)) bz.setAttribute('data-chapter', String(ch));
    var pins = stage.querySelectorAll('.bz-pin');
    pins.forEach(function (pin, i) {
      pin.setAttribute('data-active', String(i === ch));
      // continuous crossfade: pins fade by distance to the fractional chapter position
      pin.style.opacity = clamp(1.15 - Math.abs(i - cf), 0, 1).toFixed(3);
    });
    var target = stage.querySelector('.bz-nicoya-target');
    if (target) target.style.opacity = ch === 4 ? '1' : '0';
    var lis = stage.querySelectorAll('.bz-index li');
    lis.forEach(function (li, i) { li.setAttribute('data-active', String(i === ch)); });
    var place = stage.querySelector('.bz-current-place');
    if (place) {
      var num = place.querySelector('span'), nm = place.querySelector('strong'), ct = place.querySelector('small');
      if (num) num.textContent = '0' + (ch + 1) + ' / 05';
      if (nm) nm.textContent = bzNames[ch][0];
      if (ct) ct.textContent = bzNames[ch][1];
    }
    var worldRead = stage.querySelector('.bz-world [data-scroll-reading]');
    var nicoyaRead = stage.querySelector('.bz-nicoya [data-scroll-reading]');
    setRead(worldRead, ss(0.02, 0.4, p));
    setRead(nicoyaRead, ss(0.4, 0.9, p));
    stage.setAttribute('data-pinned', String(p > 0.001 && p < 0.999));
  }

  // ---------- BLUE ZONE LIFE (flow-essential) ----------
  var bl = document.getElementById('flow-essential');
  var lastBeat = 0;
  function blFrame(p) {
    if (!bl) return;
    var stage = bl.querySelector('.bluezone-life-stage');
    setVar(stage, '--life-progress', p.toFixed(4));
    var shots = Array.prototype.slice.call(stage.querySelectorAll('.blue-life-shot'));
    var copies = Array.prototype.slice.call(stage.querySelectorAll('.blue-life-copy'));
    var beats = stage.querySelectorAll('.blue-life-beats i');
    var n = shots.length || 1, act = 1 / n, ch = clamp(Math.floor(p * n), 0, n - 1);
    lastBeat = ch;
    bl.setAttribute('data-beat', String(ch));
    beats.forEach(function (b, i) { b.setAttribute('data-active', String(i === ch)); });
    shots.forEach(function (shot, i) {
      var a0 = i * act, a1 = (i + 1) * act;
      var local = clamp((p - a0) / (a1 - a0));
      var fin = i === 0 ? 1 : ss(a0 - 0.05, a0 + 0.02, p);
      var fout = i === n - 1 ? 1 : (1 - ss(a1 - 0.02, a1 + 0.1, p));
      var op = fin * fout;
      setVar(shot, '--film-opacity', op.toFixed(4));
      var video = shot.querySelector('video');
      if (video) {
        video.style.opacity = op.toFixed(3);
        manageVideo(video, op > 0.55);
      }
      var shotImg = shot.querySelector('img');
      if (shotImg) shotImg.style.opacity = op.toFixed(3);
      var copy = copies[i];
      if (copy) {
        var lc = op * ss(0.05, 0.35, local) * (i === n - 1 ? 1 : (1 - ss(0.85, 1, local)));
        setVar(copy, '--life-copy', lc.toFixed(4));
        setVar(copy, '--life-rise', ((1 - ss(0.05, 0.4, local)) * 14).toFixed(2) + 'px');
        setRead(copy.querySelector('[data-scroll-reading]'), ss(0.15, 0.75, local));
        copy.setAttribute('aria-hidden', String(lc < 0.5));
        if (lc < 0.05) copy.setAttribute('inert', ''); else copy.removeAttribute('inert');
      }
    });
    stage.setAttribute('data-pinned', String(p > 0.001 && p < 0.999));
  }

  // ---------- MINERAL / WATER CINEMA (flow-h2o) ----------
  var h2o = document.getElementById('flow-h2o');
  function h2oFrame(p) {
    if (!h2o) return;
    var stage = h2o.querySelector('.mineral-story-stage') || h2o.querySelector('.water-cinema-stage');
    if (!stage) return;
    setVar(stage, '--pour-progress', p.toFixed(4));
    setVar(stage, '--pour-finish', ss(0.72, 1, p).toFixed(4));
    setVar(h2o, '--scene-exit', ss(0.85, 1, p).toFixed(4));
    var video = stage.querySelector('.mineral-pour-film video');
    var poster = stage.querySelector('.mineral-film-poster');
    if (video) {
      var vin = ss(0.08, 0.5, p);
      video.style.opacity = vin.toFixed(3);
      scrub(video, p);
    }
    if (poster) poster.style.opacity = (1 - ss(0.08, 0.5, p)).toFixed(3);
    stage.querySelectorAll('.mineral-property').forEach(function (el, i) {
      setVar(el, '--mineral-reveal', ss(0.28 + i * 0.13, 0.45 + i * 0.13, p).toFixed(4));
    });
    setRead(stage.querySelector('.mineral-story-heading [data-scroll-reading]') || stage.querySelector('[data-scroll-reading]'), ss(0.02, 0.25, p));
    stage.setAttribute('data-pinned', String(p > 0.001 && p < 0.999));
  }

  // ---------- PRODUCT FINALE (flow-water) ----------
  var fw = document.getElementById('flow-water');
  var burstDone = false;
  function fwFrame(p) {
    if (!fw) return;
    var stage = fw.querySelector('.product-reveal');
    if (!stage) return;
    setVar(stage, '--return-world', (1 - ss(0.04, 0.34, p)).toFixed(4));
    setVar(stage, '--return-studio', ss(0.18, 0.48, p).toFixed(4));
    setVar(stage, '--return-model', ss(0.34, 0.62, p).toFixed(4));
    setVar(stage, '--product-rise', ss(0.5, 0.85, p).toFixed(4));
    setVar(stage, '--pair-progress', ss(0.58, 0.9, p).toFixed(4));
    setVar(stage, '--final-copy', ss(0.74, 1, p).toFixed(4));
    setVar(stage, '--recap-copy', ss(0.5, 0.82, p).toFixed(4));
    var eff = stage.querySelector('.sparkling-effervescence');
    if (eff) {
      var pair = ss(0.58, 0.9, p);
      if (pair > 0.92 && !burstDone) { eff.setAttribute('data-burst', 'true'); burstDone = true; }
      if (pair < 0.4) burstDone = false;
    }
    stage.setAttribute('data-pinned', String(p > 0.001 && p < 0.999));
  }

  // ---------- HANDOFFS (crossfade between pinned stages) ----------
  var handoffStages = Array.prototype.slice.call(document.querySelectorAll('[data-handoff="true"]'));
  var handoffSmooth = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  function handoffs() {
    var blStage = bl && bl.querySelector('.bluezone-life-stage');
    handoffStages.forEach(function (stage) {
      // Elements stage enters from below the fold — pin it fixed during the
      // entry window so hero -> Wildamore crossfades instead of wiping
      if (stage === blStage) {
        var br = bl.getBoundingClientRect();
        var entry = clamp((vh() - br.top) / vh());
        if (br.top > 0 && br.top < vh()) stage.classList.add('is-incoming');
        else stage.classList.remove('is-incoming');
        var btarget = ss(0.08, 0.92, entry);
        var bprev = handoffSmooth ? (handoffSmooth.get(stage) || 0) : btarget;
        var bo = bprev + (btarget - bprev) * 0.16;
        if (handoffSmooth) handoffSmooth.set(stage, bo);
        setVar(stage, '--handoff-opacity', bo.toFixed(4));
        setVar(stage, '--handoff-copy', ss(0.2, 0.75, bo).toFixed(4));
        setVar(stage, '--handoff-exit-copy', ss(0, 0.55, bo).toFixed(4));
        stage.setAttribute('data-offscreen', String(entry < 0.02));
        stage.setAttribute('data-pinned', String(br.top <= 1));
        if (entry < 0.03) stage.setAttribute('inert', ''); else stage.removeAttribute('inert');
        return;
      }
      var f = visibleFraction(stage);
      // dissolve: stage stays translucent until ~90% visible so adjacent
      // scenes genuinely crossfade instead of one wiping over the other
      var target = ss(0, 0.9, f);
      var prev = handoffSmooth ? (handoffSmooth.get(stage) || 0) : target;
      var o = prev + (target - prev) * 0.16;
      if (handoffSmooth) handoffSmooth.set(stage, o);
      setVar(stage, '--handoff-opacity', o.toFixed(4));
      setVar(stage, '--handoff-copy', ss(0.2, 0.75, o).toFixed(4));
      setVar(stage, '--handoff-exit-copy', ss(0, 0.55, o).toFixed(4));
      stage.setAttribute('data-offscreen', String(f < 0.02));
      var pinned = stage.getBoundingClientRect();
      stage.setAttribute('data-pinned', String(pinned.top <= 1 && pinned.bottom >= vh() - 1));
      if (f < 0.03) stage.setAttribute('inert', ''); else stage.removeAttribute('inert');
      stage.style.opacity = '';
    });
  }

  // ---------- fallback poster for the hero landscape video ----------
  function wireVideoFallbacks() {
    var land = document.querySelector('.flow-landscape');
    if (land && !land.dataset.fbWired) {
      land.dataset.fbWired = '1';
      var poster = land.getAttribute('poster');
      if (poster) {
        var img = document.createElement('img');
        img.src = poster;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
        land.parentNode.insertBefore(img, land);
        var hide = function () { img.style.display = 'none'; };
        land.addEventListener('playing', hide);
        land.addEventListener('loadeddata', hide);
        land.addEventListener('error', function () { img.style.display = 'block'; });
      }
      land.load();
    }
    // nudge every video to load
    document.querySelectorAll('video').forEach(function (v) { try { v.load(); } catch (e) {} });
  }

  // ---------- size the header notch pill to fit the nav ----------
  function sizeNotch() {
    var bar = document.querySelector('.morpho-notch-bar');
    var glass = document.querySelector('.morpho-notch-glass');
    var shape = document.querySelector('.morpho-notch-shape');
    if (!bar || !glass || !shape || !bar.getClientRects().length) return;
    // pill is 44px wider than the bar and offset left:-22px (see site CSS)
    var w = Math.ceil(bar.offsetWidth + 44);
    var dFill = 'M0,0 A22,22 0 0 1 22,22 L22,44 A18,18 0 0 0 40,62 L' + (w - 40) + ',62 A18,18 0 0 0 ' + (w - 22) + ',44 L' + (w - 22) + ',22 A22,22 0 0 1 ' + w + ',0 Z';
    var dEdge = dFill.slice(0, -2);
    glass.style.width = w + 'px';
    glass.style.clipPath = 'path("M 0 0 A 22 22 0 0 1 22 22 L 22 44 A 18 18 0 0 0 40 62 L ' + (w - 40) + ' 62 A 18 18 0 0 0 ' + (w - 22) + ' 44 L ' + (w - 22) + ' 22 A 22 22 0 0 1 ' + w + ' 0 Z")';
    shape.style.width = w + 'px';
    shape.setAttribute('viewBox', '0 0 ' + w + ' 62');
    shape.querySelectorAll('path').forEach(function (p) {
      p.setAttribute('d', p.classList.contains('morpho-notch-edge') ? dEdge : dFill);
    });
  }

  // ---------- INSTAGRAM controls + mobile menu ----------
  function wireChrome() {
    var track = document.getElementById('instagram-posts');
    var controls = document.querySelector('.instagram-gallery_controls__5w4Xq');
    if (track && controls) {
      var btns = controls.querySelectorAll('button');
      var w = function () { var c = track.querySelector('.instagram-gallery_card__GllSd'); return c ? c.offsetWidth + 12 : 320; };
      var update = function () {
        var max = track.scrollWidth - track.clientWidth;
        if (btns[0]) btns[0].disabled = track.scrollLeft <= 4;
        if (btns.length > 1) btns[btns.length - 1].disabled = track.scrollLeft >= max - 4;
      };
      if (btns[0]) btns[0].addEventListener('click', function () { track.scrollBy({ left: -w(), behavior: 'smooth' }); });
      if (btns[btns.length - 1] && btns.length > 1) btns[btns.length - 1].addEventListener('click', function () { track.scrollBy({ left: w(), behavior: 'smooth' }); });
      track.addEventListener('scroll', update, { passive: true });
      update();
    }
    var wrap = document.querySelector('.finale-sparkling-wrap');
    var eff = document.querySelector('.sparkling-effervescence');
    if (wrap && eff) {
      wrap.addEventListener('click', function () {
        if (eff.getAttribute('data-burst') === 'true') {
          eff.setAttribute('data-burst', 'false');
          requestAnimationFrame(function () { requestAnimationFrame(function () { eff.setAttribute('data-burst', 'true'); }); });
        } else eff.setAttribute('data-burst', 'true');
      });
    }
    sizeNotch();
    var header = document.querySelector('.morpho-header');
    if (header) {
      header.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.closest('.morpho-main-nav, .flow-language, .morpho-header-actions a')) return;
          header.setAttribute('data-open', header.getAttribute('data-open') === 'true' ? 'false' : 'true');
        });
      });
      header.querySelectorAll('.morpho-main-nav a, .morpho-main-nav button').forEach(function (el) {
        el.addEventListener('click', function () { header.setAttribute('data-open', 'false'); });
      });
      document.addEventListener('click', function (e) {
        if (header.getAttribute('data-open') === 'true' && !e.target.closest('.morpho-header')) {
          header.setAttribute('data-open', 'false');
        }
      });
    }
  }

  function frame() {
    if (hero) heroFrame(progress(hero));
    if (bl) {
      blFrame(progress(bl));
      var blr = bl.getBoundingClientRect();
      if (blr.top < window.innerHeight && blr.bottom > 0) {
        setSectionSound(SOUND_FILES[lastBeat] || 'wildamore');
      }
    }
    document.querySelectorAll('.territory-journey').forEach(territory);
    if (bz) bzFrame(progress(bz));
    if (h2o) h2oFrame(progress(h2o));
    if (fw) fwFrame(progress(fw));
    handoffs();
  }

  // continuous rAF loop — keeps lerped handoffs converging even after scroll stops
  function loop() {
    frame();
    requestAnimationFrame(loop);
  }
  // ---------- ambient section audio ----------
  var SOUND_FILES = ['wildamore', 'siren', 'ember', 'horizon', 'summit', 'mirage', 'halcyon', 'astoria'];
  var soundOn = false, currentSound = null;
  var soundEls = {};
  window.__meridyanSnd = soundEls; // debug/testing hook
  function soundEl(name) {
    if (!soundEls[name]) {
      var a = new Audio('assets/user/sounds/' + name + '.mp3');
      a.loop = true; a.volume = 0; a.preload = 'auto';
      soundEls[name] = a;
    }
    return soundEls[name];
  }
  function fadeVol(a, target, dur, done) {
    var from = a.volume, t0 = performance.now();
    cancelAnimationFrame(a._fr);
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur);
      a.volume = +(from + (target - from) * k).toFixed(3);
      if (k < 1) a._fr = requestAnimationFrame(step);
      else if (done) done();
    })(t0);
  }
  function setSectionSound(name) {
    if (!name || name === currentSound) return;
    currentSound = name;
    Object.keys(soundEls).forEach(function (k) {
      if (k !== name) { var a = soundEls[k]; fadeVol(a, 0, 400, function () { a.pause(); }); }
    });
    var n = soundEl(name);
    if (soundOn) { n.play().catch(function () {}); fadeVol(n, 0.4, 700); }
  }
  function setSoundEnabled(on) {
    soundOn = on;
    if (on) {
      var name = currentSound || SOUND_FILES[lastBeat] || 'wildamore';
      // preload every element track so section changes are instant
      SOUND_FILES.forEach(function (n) { soundEl(n).load(); });
      var a = soundEl(name);
      a.play().catch(function () {});
      fadeVol(a, 0.4, 600);
      currentSound = name;
    } else {
      Object.keys(soundEls).forEach(function (k) { var a = soundEls[k]; fadeVol(a, 0, 350, function () { a.pause(); }); });
    }
  }

  // ---------- sound toggle ----------
  var VOL_X = '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><line x1="22" x2="16" y1="9" y2="15"></line><line x1="16" x2="22" y1="9" y2="15"></line>';
  var VOL_2 = '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><path d="M16 9a5 5 0 0 1 0 6"></path><path d="M19.364 18.364a9 9 0 0 0 0-12.728"></path>';
  function wireSound() {
    var player = document.querySelector('.site-player');
    var btn = document.querySelector('.site-sound-toggle');
    if (!player || !btn || btn.dataset.wired) return;
    btn.dataset.wired = '1';
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
      var svg = btn.querySelector('svg');
      if (svg) {
        svg.innerHTML = on ? VOL_2 : VOL_X;
        svg.classList.toggle('lucide-volume-x', !on);
        svg.classList.toggle('lucide-volume-2', on);
      }
      var span = btn.querySelector('span');
      if (span) span.textContent = on ? 'Sound On' : 'Sound Off';
      player.setAttribute('data-sound', on ? 'on' : 'off');
      setSoundEnabled(on);
    });
  }

  // ---------- autoplay: cinematic auto-scroll through the whole page ----------
  var PLAY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play" aria-hidden="true"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path></svg>';
  var PAUSE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause" aria-hidden="true"><rect x="14" y="3" width="5" height="18" rx="1"></rect><rect x="5" y="3" width="5" height="18" rx="1"></rect></svg>';
  var AUTO_SPEED = 190; // px per second — matches MORPHO's cinematic pace
  function wireAutoplay() {
    var btn = document.querySelector('.site-autoplay');
    var player = document.querySelector('.site-player');
    if (!btn || !player || btn.dataset.wired) return;
    btn.dataset.wired = '1';
    var playing = false, raf = 0, last = 0;
    function setState(on) {
      autoplayActive = on;
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Pause experience' : 'Play experience');
      btn.innerHTML = (on ? PAUSE_SVG : PLAY_SVG) + '<span>' + (on ? 'Pause' : 'Play') + '</span>';
      player.setAttribute('data-autoplay', on ? 'true' : 'false');
    }
    function tick(t) {
      if (!playing) return;
      if (!last) last = t;
      var dt = (t - last) / 1000; last = t;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var y = window.scrollY || document.documentElement.scrollTop;
      if (y >= max - 2) { stop(); window.scrollTo({ top: max, behavior: 'instant' }); return; }
      var speed = readPending() ? 55 : AUTO_SPEED;
      window.scrollTo({ top: y + speed * dt, behavior: 'instant' });
      raf = requestAnimationFrame(tick);
    }
    function start() {
      if (playing) return;
      playing = true; last = 0; setState(true);
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      if (!playing) return;
      playing = false; cancelAnimationFrame(raf); setState(false);
    }
    btn.addEventListener('click', function () { playing ? stop() : start(); });
    // any manual scroll input takes over and pauses the auto-play
    ['wheel', 'touchstart', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, function () { if (playing) stop(); }, { passive: true });
    });
  }

  window.addEventListener('load', function () { wireVideoFallbacks(); wireChrome(); wireSound(); wireAutoplay(); });
  window.addEventListener('resize', sizeNotch);
  document.addEventListener('DOMContentLoaded', function () { wireVideoFallbacks(); wireChrome(); wireSound(); wireAutoplay(); });
  requestAnimationFrame(loop);
})();
