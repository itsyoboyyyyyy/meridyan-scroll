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

  function setRead(el, v) { if (el) el.style.setProperty('--read-progress', v.toFixed(4)); }

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
  function blFrame(p) {
    if (!bl) return;
    var stage = bl.querySelector('.bluezone-life-stage');
    setVar(stage, '--life-progress', p.toFixed(4));
    var shots = Array.prototype.slice.call(stage.querySelectorAll('.blue-life-shot'));
    var copies = Array.prototype.slice.call(stage.querySelectorAll('.blue-life-copy'));
    var beats = stage.querySelectorAll('.blue-life-beats i');
    var n = shots.length || 1, act = 1 / n, ch = clamp(Math.floor(p * n), 0, n - 1);
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
    }
  }

  function frame() {
    if (hero) heroFrame(progress(hero));
    document.querySelectorAll('.territory-journey').forEach(territory);
    if (bz) bzFrame(progress(bz));
    if (bl) blFrame(progress(bl));
    if (h2o) h2oFrame(progress(h2o));
    if (fw) fwFrame(progress(fw));
    handoffs();
  }

  // continuous rAF loop — keeps lerped handoffs converging even after scroll stops
  function loop() {
    frame();
    requestAnimationFrame(loop);
  }
  window.addEventListener('load', function () { wireVideoFallbacks(); wireChrome(); });
  window.addEventListener('resize', sizeNotch);
  document.addEventListener('DOMContentLoaded', function () { wireVideoFallbacks(); wireChrome(); });
  requestAnimationFrame(loop);
})();
