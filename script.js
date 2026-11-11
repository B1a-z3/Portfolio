// Portfolio animations: binary rain, scroll-linked reveals, hero text effects,
// card tilt and cursor spotlight. No dependencies.
(function () {
  'use strict';

  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function accent() {
    var v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    return v || '#22C55E';
  }
  function bit() { return Math.random() < 0.5 ? '0' : '1'; }

  /* ---------- Falling binary rain (three depth layers) ---------- */
  function startRain() {
    var canvas = document.getElementById('rain');
    if (!canvas) return;
    var BG = '#0A0D10';
    var LAYERS = [
      { size: 11, speed: 0.45, alpha: 0.35 },
      { size: 15, speed: 0.7, alpha: 0.65 },
      { size: 20, speed: 1, alpha: 1 }
    ];
    var f = null;
    var last = 0;
    var color = accent();

    function setup() {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      if (!w || !h) return null;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      var ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);
      var drops = [[], [], []];
      for (var x = 0; x < w; x += 18) {
        var r = Math.random();
        var li = r < 0.4 ? 0 : (r < 0.75 ? 1 : 2);
        drops[li].push({ x: x, y: (Math.random() * 2 - 1) * h / LAYERS[li].size });
      }
      return { ctx: ctx, w: w, h: h, drops: drops };
    }

    function draw(fd) {
      var ctx = fd.ctx;
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(10, 13, 16, 0.12)';
      ctx.fillRect(0, 0, fd.w, fd.h);
      ctx.textBaseline = 'top';
      ctx.fillStyle = color;
      for (var li = 0; li < LAYERS.length; li++) {
        var L = LAYERS[li];
        var list = fd.drops[li];
        ctx.font = L.size + 'px "JetBrains Mono", ui-monospace, monospace';
        ctx.globalAlpha = L.alpha;
        for (var i = 0; i < list.length; i++) {
          var d = list[i];
          var prev = Math.floor(d.y);
          d.y += L.speed;
          var row = Math.floor(d.y);
          if (row !== prev && row >= 0) ctx.fillText(bit(), d.x, row * L.size);
          if (row * L.size > fd.h && Math.random() > 0.97) d.y = 0;
        }
      }
    }

    function step() {
      if (!f || f.w !== canvas.clientWidth || f.h !== canvas.clientHeight) f = setup();
      if (f) draw(f);
    }

    if (reduced) {              // still frame for visitors who prefer less motion
      for (var n = 0; n < 140; n++) step();
      return;
    }
    function tick(t) {
      if (!document.hidden && t - last >= 55) { last = t; step(); }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Scroll-linked reveal (progress follows scroll position) ---------- */
  function startReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    var items = [];
    for (var i = 0; i < els.length; i++) items.push({ el: els[i], ty: 0 });
    var queued = false;
    function clamp(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

    function update() {
      queued = false;
      var se = document.scrollingElement || document.documentElement;
      var vh = window.innerHeight || se.clientHeight;
      var y = window.pageYOffset || se.scrollTop || 0;
      var remaining = Math.max(se.scrollHeight - vh - y, 0);
      var topFree = clamp(1 - y / 160);          // nothing fades at the very top
      var botFree = clamp(1 - remaining / 220);  // or at the very bottom
      for (var k = 0; k < items.length; k++) {
        var it = items[k];
        var el = it.el;
        var r = el.getBoundingClientRect();
        var h = el.offsetHeight;
        var c = r.top + r.height / 2 - it.ty;
        var p = Math.max(clamp((vh - (c - h / 2)) / 220), botFree);
        var q = Math.max(clamp((c + h / 2) / 160), topFree);
        var prog = Math.min(p, q);
        if (prog >= 1) {
          if (it.ty !== 0 || el.style.opacity) { el.style.opacity = ''; el.style.scale = ''; el.style.translate = ''; }
          it.ty = 0;
        } else {
          var ty = p < q ? (1 - p) * 36 : -(1 - q) * 24;
          el.style.opacity = prog.toFixed(3);
          el.style.scale = (0.95 + 0.05 * prog).toFixed(4);
          el.style.translate = '0 ' + ty.toFixed(1) + 'px';
          it.ty = ty;
        }
      }
    }
    function request() { if (!queued) { queued = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
    request();
  }

  /* ---------- Hero text: typewriter, decode, count-up (replays on return) ---------- */
  var originals = {};
  var run = 0;
  function textNode(id) {
    var o = originals[id];
    if (o) { o.node.nodeValue = o.text; return o; }
    var el = document.getElementById(id);
    if (!el) return null;
    var n = el.firstChild;
    if (!n || n.nodeType !== 3 || el.childNodes.length !== 1) return null;
    o = { node: n, text: n.nodeValue };
    originals[id] = o;
    return o;
  }

  function startText() {
    run += 1;
    var mine = run;
    function live() { return run === mine; }

    var eb = textNode('hero-eyebrow');
    if (eb) {
      var i = 0;
      eb.node.nodeValue = '\u00A0';
      var type = function () {
        if (!live()) return;
        i += 1;
        eb.node.nodeValue = eb.text.slice(0, i);
        if (i < eb.text.length) setTimeout(type, 28);
      };
      setTimeout(type, 200);
    }

    var ht = textNode('hero-title');
    if (ht) {
      var text = ht.text;
      var start = null;
      var lastDraw = 0;
      var scramble = function (done) {
        var out = text.slice(0, done);
        for (var k = done; k < text.length; k++) out += text.charAt(k) === ' ' ? ' ' : bit();
        return out;
      };
      var frame = function (t) {
        if (!live()) return;
        if (start === null) start = t;
        var p = Math.min((t - start) / 1700, 1);
        if (p >= 1) { ht.node.nodeValue = text; return; }
        if (t - lastDraw >= 45) { lastDraw = t; ht.node.nodeValue = scramble(Math.floor(p * text.length)); }
        requestAnimationFrame(frame);
      };
      ht.node.nodeValue = scramble(0);
      setTimeout(function () { if (live()) requestAnimationFrame(frame); }, 500);
    }

    ['count-profit', 'count-entry'].forEach(function (id) {
      var o = textNode(id);
      if (!o) return;
      var txt = o.text;
      var m = txt.match(/\d+(\.\d+)?/);
      if (!m) return;
      var target = parseFloat(m[0]);
      var dec = m[1] ? m[1].length - 1 : 0;
      var pre = txt.slice(0, m.index);
      var post = txt.slice(m.index + m[0].length);
      var s0 = null;
      var stepFn = function (t) {
        if (!live()) return;
        if (s0 === null) s0 = t;
        var p = Math.min((t - s0) / 1500, 1);
        if (p >= 1) { o.node.nodeValue = txt; return; }
        var e = 1 - Math.pow(1 - p, 3);
        o.node.nodeValue = pre + (target * e).toFixed(dec) + post;
        requestAnimationFrame(stepFn);
      };
      o.node.nodeValue = pre + (0).toFixed(dec) + post;
      setTimeout(function () { if (live()) requestAnimationFrame(stepFn); }, 700);
    });
  }

  function watchHero() {
    var hero = document.getElementById('top');
    if (!hero || !('IntersectionObserver' in window)) { startText(); return; }
    var inView = false;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !inView) { inView = true; startText(); }
        else if (!e.isIntersecting) { inView = false; }
      });
    }, { threshold: 0 }).observe(hero);
  }

  /* ---------- Card tilt (featured projects) ---------- */
  function startTilt() {
    var cards = document.querySelectorAll('.tilt');
    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener('mousemove', function (e) {
        var el = e.currentTarget;
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform .12s ease-out';
        el.style.transform = 'perspective(1400px) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' + (px * 5).toFixed(2) + 'deg)';
      });
      cards[i].addEventListener('mouseleave', function (e) {
        var el = e.currentTarget;
        el.style.transition = 'transform .5s ease';
        el.style.transform = '';
      });
    }
  }

  /* ---------- Cursor spotlight on cards ---------- */
  function startSpot() {
    document.addEventListener('mousemove', function (e) {
      var t = e.target;
      var el = t && t.closest ? t.closest('.spot') : null;
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
    }, { passive: true });
  }

  function init() {
    startRain();
    startSpot();
    if (!reduced) {
      startReveal();
      watchHero();
      startTilt();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
