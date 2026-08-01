/* Живой фон: светящееся ядро + парящие осколки и искры (canvas). */
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var host = document.querySelector(".aurora-bg");
  if (!host) return;

  var canvas = document.createElement("canvas");
  canvas.id = "bg-canvas";
  canvas.setAttribute("aria-hidden", "true");
  host.insertBefore(canvas, host.firstChild);

  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, cx = 0, cy = 0;
  var shards = [], sparks = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W * (W < 980 ? 0.6 : 0.58);
    cy = H * (W < 980 ? 0.32 : 0.5);
  }

  function makeShard() {
    var a = rand(0, Math.PI * 2);
    var d = rand(0.05, 1) * Math.max(W, H) * 0.55;
    return {
      a: a,
      d: d,
      size: rand(14, 70),
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.0035, 0.0035),
      speed: rand(0.02, 0.14),
      wob: rand(0, Math.PI * 2),
      wobSpeed: rand(0.004, 0.012),
      alpha: rand(0.06, 0.34),
      curve: rand(0.55, 1.5)
    };
  }

  function makeSpark() {
    var a = rand(0, Math.PI * 2);
    return {
      a: a,
      d: rand(10, Math.max(W, H) * 0.6),
      speed: rand(0.15, 0.7),
      r: rand(0.5, 1.8),
      alpha: rand(0.2, 0.9),
      tw: rand(0, Math.PI * 2)
    };
  }

  function build() {
    var area = W * H;
    var nS = Math.round(Math.min(46, Math.max(16, area / 32000)));
    var nP = Math.round(Math.min(160, Math.max(60, area / 9000)));
    shards = []; sparks = [];
    for (var i = 0; i < nS; i++) shards.push(makeShard());
    for (var j = 0; j < nP; j++) sparks.push(makeSpark());
  }

  function drawShard(s) {
    var x = cx + Math.cos(s.a) * s.d;
    var y = cy + Math.sin(s.a) * s.d * 0.85 + Math.sin(s.wob) * 18;
    if (x < -160 || x > W + 160 || y < -160 || y > H + 160) return;

    var w = s.size, h = s.size * 0.42;
    var depth = Math.min(1, s.d / (Math.max(W, H) * 0.55));
    var glow = 1 - depth;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(s.rot);
    ctx.globalCompositeOperation = "lighter";

    var g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.45, "rgba(215,228,255," + (s.alpha * (0.4 + glow)).toFixed(3) + ")");
    g.addColorStop(0.72, "rgba(255,255,255," + (s.alpha * (0.6 + glow)).toFixed(3) + ")");
    g.addColorStop(1, "rgba(140,170,255,0)");
    ctx.fillStyle = g;

    // лепесток-осколок
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.quadraticCurveTo(-w * 0.1, -h * s.curve, w / 2, 0);
    ctx.quadraticCurveTo(-w * 0.1, h * s.curve * 0.7, -w / 2, 0);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255," + (s.alpha * 0.5).toFixed(3) + ")";
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    // мягкое свечение ядра поверх CSS-градиентов
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var core = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.32);
    core.addColorStop(0, "rgba(255,255,255,0.16)");
    core.addColorStop(0.18, "rgba(180,200,255,0.07)");
    core.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    for (var i = 0; i < sparks.length; i++) {
      var p = sparks[i];
      p.d += p.speed;
      p.tw += 0.05;
      var px = cx + Math.cos(p.a) * p.d;
      var py = cy + Math.sin(p.a) * p.d * 0.9;
      if (px < -40 || px > W + 40 || py < -40 || py > H + 40) {
        sparks[i] = makeSpark(); sparks[i].d = rand(5, 40);
        continue;
      }
      var tw = 0.55 + 0.45 * Math.sin(p.tw);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(226,236,255," + (p.alpha * tw).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (var j = 0; j < shards.length; j++) {
      var s = shards[j];
      s.d += s.speed;
      s.rot += s.spin;
      s.wob += s.wobSpeed;
      s.a += 0.00012;
      var x = cx + Math.cos(s.a) * s.d;
      var y = cy + Math.sin(s.a) * s.d * 0.85;
      if (x < -220 || x > W + 220 || y < -220 || y > H + 220) {
        shards[j] = makeShard();
        shards[j].d = rand(20, 90);
        continue;
      }
      drawShard(s);
    }

    requestAnimationFrame(frame);
  }

  var t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(function () { resize(); build(); }, 150);
  });

  resize();
  build();
  requestAnimationFrame(frame);
})();
