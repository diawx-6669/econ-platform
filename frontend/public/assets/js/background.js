/* Живой космический фон: туманность, звёздная пыль с параллаксом,
   лучи из ядра и парящие светящиеся осколки. Всё на dt-таймингах — плавно. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var host = document.querySelector(".aurora-bg");
  if (!host) return;

  var canvas = document.createElement("canvas");
  canvas.id = "bg-canvas";
  canvas.setAttribute("aria-hidden", "true");
  host.insertBefore(canvas, host.firstChild);

  var ctx = canvas.getContext("2d", { alpha: true });
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, cx = 0, cy = 0, R = 0;

  var stars = [], dust = [], shards = [], streaks = [];
  var neb = null;              // офскрин с туманностью
  var mx = 0, my = 0, tx = 0, ty = 0; // параллакс от мыши

  function rand(a, b) { return a + Math.random() * (b - a); }
  function ease(t) { return t * t * (3 - 2 * t); }

  /* ---------- туманность (рисуется один раз в офскрин) ---------- */
  function buildNebula() {
    var c = document.createElement("canvas");
    c.width = Math.max(2, Math.round(W * 0.5));
    c.height = Math.max(2, Math.round(H * 0.5));
    var g = c.getContext("2d");
    var w = c.width, h = c.height;

    var palette = [
      [124, 92, 255],
      [79, 158, 255],
      [45, 212, 218],
      [233, 79, 158],
      [150, 180, 255]
    ];

    g.globalCompositeOperation = "lighter";
    for (var i = 0; i < 26; i++) {
      var col = palette[(Math.random() * palette.length) | 0];
      var px = rand(-0.1, 1.1) * w;
      var py = rand(-0.1, 1.1) * h;
      var pr = rand(0.12, 0.42) * Math.max(w, h);
      var a = rand(0.025, 0.085);
      var rg = g.createRadialGradient(px, py, 0, px, py, pr);
      rg.addColorStop(0, "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + a.toFixed(3) + ")");
      rg.addColorStop(0.45, "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + (a * 0.35).toFixed(3) + ")");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = rg;
      g.beginPath();
      g.arc(px, py, pr, 0, Math.PI * 2);
      g.fill();
    }

    // тонкая волокнистая структура
    g.globalCompositeOperation = "lighter";
    for (var s = 0; s < 70; s++) {
      var x0 = rand(0, w), y0 = rand(0, h);
      var ang = rand(0, Math.PI * 2);
      var len = rand(0.08, 0.4) * Math.max(w, h);
      var alpha = rand(0.01, 0.035);
      g.strokeStyle = "rgba(180,205,255," + alpha.toFixed(3) + ")";
      g.lineWidth = rand(6, 40);
      g.beginPath();
      g.moveTo(x0, y0);
      g.quadraticCurveTo(
        x0 + Math.cos(ang) * len * 0.5 + rand(-60, 60),
        y0 + Math.sin(ang) * len * 0.5 + rand(-60, 60),
        x0 + Math.cos(ang) * len,
        y0 + Math.sin(ang) * len
      );
      g.stroke();
    }
    return c;
  }

  /* ---------- сущности ---------- */
  function makeStar() {
    var depth = rand(0.15, 1);
    return {
      x: rand(0, W), y: rand(0, H),
      r: rand(0.35, 1.5) * (0.5 + depth),
      depth: depth,
      base: rand(0.18, 0.85),
      tw: rand(0, Math.PI * 2),
      twS: rand(0.25, 1.1),
      hue: Math.random() < 0.18 ? [190, 215, 255] : (Math.random() < 0.12 ? [255, 225, 200] : [255, 255, 255])
    };
  }

  function makeDust(fresh) {
    var a = rand(0, Math.PI * 2);
    return {
      a: a,
      d: fresh ? rand(R * 0.02, R * 0.12) : rand(R * 0.02, R * 1.05),
      speed: rand(4, 26),
      r: rand(0.4, 1.7),
      alpha: rand(0.15, 0.8),
      tw: rand(0, Math.PI * 2),
      twS: rand(0.6, 2.0),
      drift: rand(-0.03, 0.03)
    };
  }

  function makeShard(fresh) {
    return {
      a: rand(0, Math.PI * 2),
      d: fresh ? rand(R * 0.05, R * 0.2) : rand(R * 0.05, R * 1.0),
      size: rand(14, 62),
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.16, 0.16),
      speed: rand(2.5, 12),
      wob: rand(0, Math.PI * 2),
      wobS: rand(0.25, 0.75),
      alpha: rand(0.05, 0.22),
      curve: rand(0.5, 1.4),
      drift: rand(-0.012, 0.012)
    };
  }

  function makeStreak() {
    return {
      a: rand(0, Math.PI * 2),
      d: rand(R * 0.08, R * 0.5),
      len: rand(60, 220),
      speed: rand(60, 190),
      life: 0,
      ttl: rand(0.9, 2.2),
      alpha: rand(0.25, 0.7)
    };
  }

  function build() {
    var area = W * H;
    stars = []; dust = []; shards = []; streaks = [];
    var nStars = Math.round(Math.min(420, Math.max(140, area / 3400)));
    var nDust = Math.round(Math.min(190, Math.max(70, area / 8200)));
    var nShards = Math.round(Math.min(30, Math.max(10, area / 52000)));
    for (var i = 0; i < nStars; i++) stars.push(makeStar());
    for (var j = 0; j < nDust; j++) dust.push(makeDust(false));
    for (var k = 0; k < nShards; k++) shards.push(makeShard(false));
    neb = buildNebula();
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W * (W < 980 ? 0.55 : 0.46);
    cy = H * (W < 980 ? 0.32 : 0.5);
    R = Math.max(W, H) * 0.62;
  }

  /* ---------- отрисовка ---------- */
  function drawShard(s, glowK) {
    var x = cx + Math.cos(s.a) * s.d + mx * 26;
    var y = cy + Math.sin(s.a) * s.d * 0.86 + Math.sin(s.wob) * 16 + my * 26;
    if (x < -200 || x > W + 200 || y < -200 || y > H + 200) return;

    var w = s.size, h = s.size * 0.4;
    var t = Math.min(1, s.d / R);
    var fade = ease(Math.min(1, t / 0.12)) * (1 - ease(Math.max(0, (t - 0.72) / 0.28)));
    var a = s.alpha * fade * glowK;
    if (a <= 0.002) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(s.rot);
    ctx.globalCompositeOperation = "lighter";

    var g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.42, "rgba(190,210,255," + (a * 0.75).toFixed(3) + ")");
    g.addColorStop(0.7, "rgba(255,255,255," + a.toFixed(3) + ")");
    g.addColorStop(1, "rgba(130,165,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.quadraticCurveTo(-w * 0.1, -h * s.curve, w / 2, 0);
    ctx.quadraticCurveTo(-w * 0.1, h * s.curve * 0.7, -w / 2, 0);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255," + (a * 0.55).toFixed(3) + ")";
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();
  }

  var last = 0, time = 0, streakTimer = 0;

  function frame(now) {
    if (!last) last = now;
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;

    // сглаженный параллакс
    mx += (tx - mx) * Math.min(1, dt * 2.4);
    my += (ty - my) * Math.min(1, dt * 2.4);

    ctx.clearRect(0, 0, W, H);

    // туманность с очень медленным дыханием
    if (neb) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.9 + 0.1 * Math.sin(time * 0.15);
      var k = 1.06 + 0.03 * Math.sin(time * 0.09);
      ctx.translate(W / 2 + mx * 14, H / 2 + my * 14);
      ctx.rotate(Math.sin(time * 0.02) * 0.03);
      ctx.scale(k, k);
      ctx.drawImage(neb, -W / 2, -H / 2, W, H);
      ctx.restore();
    }

    // звёзды с мерцанием и параллаксом
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      st.tw += dt * st.twS;
      var a = st.base * (0.55 + 0.45 * Math.sin(st.tw));
      var sx = st.x + mx * 34 * st.depth;
      var sy = st.y + my * 34 * st.depth;
      ctx.fillStyle = "rgba(" + st.hue[0] + "," + st.hue[1] + "," + st.hue[2] + "," + a.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(sx, sy, st.r, 0, Math.PI * 2);
      ctx.fill();
      if (st.r > 1.15) {
        var hg = ctx.createRadialGradient(sx, sy, 0, sx, sy, st.r * 6);
        hg.addColorStop(0, "rgba(200,220,255," + (a * 0.28).toFixed(3) + ")");
        hg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(sx, sy, st.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // ядро
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var pulse = 0.5 + 0.5 * Math.sin(time * 0.55);
    var coreR = R * (0.52 + 0.03 * pulse);
    var core = ctx.createRadialGradient(cx + mx * 8, cy + my * 8, 0, cx + mx * 8, cy + my * 8, coreR);
    core.addColorStop(0, "rgba(255,255,255," + (0.16 + 0.05 * pulse).toFixed(3) + ")");
    core.addColorStop(0.12, "rgba(200,220,255,0.075)");
    core.addColorStop(0.34, "rgba(120,150,255,0.035)");
    core.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // пыль/искры, летящие из ядра
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (var j = 0; j < dust.length; j++) {
      var p = dust[j];
      p.d += p.speed * dt;
      p.a += p.drift * dt;
      p.tw += dt * p.twS;
      if (p.d > R * 1.12) { dust[j] = makeDust(true); continue; }
      var px = cx + Math.cos(p.a) * p.d + mx * 20;
      var py = cy + Math.sin(p.a) * p.d * 0.9 + my * 20;
      var t = p.d / R;
      var fade = ease(Math.min(1, t / 0.1)) * (1 - ease(Math.max(0, (t - 0.75) / 0.25)));
      var pa = p.alpha * fade * (0.55 + 0.45 * Math.sin(p.tw));
      if (pa <= 0.003) continue;
      ctx.fillStyle = "rgba(224,236,255," + pa.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // осколки
    for (var s2 = 0; s2 < shards.length; s2++) {
      var sh = shards[s2];
      sh.d += sh.speed * dt;
      sh.rot += sh.spin * dt;
      sh.wob += sh.wobS * dt;
      sh.a += sh.drift * dt;
      if (sh.d > R * 1.05) { shards[s2] = makeShard(true); continue; }
      drawShard(sh, 1);
    }

    // редкие светящиеся стримеры
    streakTimer -= dt;
    if (streakTimer <= 0 && streaks.length < 4) {
      streaks.push(makeStreak());
      streakTimer = rand(1.4, 4.5);
    }
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (var q = streaks.length - 1; q >= 0; q--) {
      var k2 = streaks[q];
      k2.life += dt;
      k2.d += k2.speed * dt;
      var lifeK = Math.sin(Math.min(1, k2.life / k2.ttl) * Math.PI);
      if (k2.life >= k2.ttl) { streaks.splice(q, 1); continue; }
      var ax = cx + Math.cos(k2.a) * k2.d;
      var ay = cy + Math.sin(k2.a) * k2.d * 0.9;
      var bx = cx + Math.cos(k2.a) * (k2.d - k2.len);
      var by = cy + Math.sin(k2.a) * (k2.d - k2.len) * 0.9;
      var lg = ctx.createLinearGradient(bx, by, ax, ay);
      lg.addColorStop(0, "rgba(255,255,255,0)");
      lg.addColorStop(1, "rgba(226,238,255," + (k2.alpha * lifeK).toFixed(3) + ")");
      ctx.strokeStyle = lg;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(ax, ay);
      ctx.stroke();
    }
    ctx.restore();

    requestAnimationFrame(frame);
  }

  function staticFrame() {
    ctx.clearRect(0, 0, W, H);
    if (neb) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.drawImage(neb, 0, 0, W, H); ctx.restore(); }
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      ctx.fillStyle = "rgba(255,255,255," + st.base.toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); build(); if (reduce) staticFrame(); }, 160);
  });

  if (!reduce) {
    window.addEventListener("pointermove", function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  resize();
  build();
  if (reduce) staticFrame();
  else requestAnimationFrame(frame);
})();
