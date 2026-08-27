/* charts.js — 登月者的花未眠 · 图表引擎(canvas手写,懒渲染:IntersectionObserver)
   主题: 月海夜色封面 + 白纸墨蓝正文; 每图独立IIFE,一图失败不连坐 */
(function () {
'use strict';
var INK = '#0a1628', INKMD = '#42566a', INKLO = '#8494a8', LINE = '#dbe2ea',
    BLUE = '#2251ff', BDEEP = '#1233b8', BSOFT = '#7d9bff', NEG = '#c22f4e',
    GOLD = '#d4b06a', PAPER = '#ffffff';
var SERIF = '"et-book","Source Han Serif SC","Noto Serif CJK SC",Palatino,Georgia,serif';
var MONO = 'Menlo,Consolas,"Liberation Mono",monospace';
var REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
var R = window.RPT || {}, S = window.SRCS || [];

function fit(cv, hCss) {
  var dpr = Math.min(2, devicePixelRatio || 1);
  var w = cv.parentElement ? cv.parentElement.clientWidth : 800;
  w = Math.max(320, w - 2);
  var h = hCss || parseInt(cv.getAttribute('height') || 360, 10);
  cv.width = w * dpr; cv.height = h * dpr;
  cv.style.width = w + 'px'; cv.style.height = h + 'px';
  var ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx: ctx, W: w, H: h };
}
function halo(ctx, txt, x, y, opt) {
  opt = opt || {};
  ctx.save();
  ctx.font = opt.font || '11px ' + MONO;
  ctx.fillStyle = opt.color || INK;
  ctx.textAlign = opt.align || 'left';
  ctx.textBaseline = opt.base || 'alphabetic';
  ctx.lineWidth = 4; ctx.strokeStyle = opt.haloColor || PAPER;
  ctx.strokeText(txt, x, y); ctx.fillText(txt, x, y);
  ctx.restore();
}
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function animate(draw) {
  if (REDUCE) { draw(1); return; }
  var t0 = null, D = 900;
  function fr(ts) {
    if (!t0) t0 = ts;
    var k = Math.min(1, (ts - t0) / D);
    draw(easeOut(k));
    if (k < 1) requestAnimationFrame(fr);
  }
  requestAnimationFrame(fr);
}
var queue = [];
function lazy(id, fn) { queue.push({ id: id, fn: fn }); }
var io = new IntersectionObserver(function (es) {
  es.forEach(function (e) {
    if (!e.isIntersecting) return;
    var q = queue.find(function (x) { return x.id === e.target.id; });
    if (q) { io.unobserve(e.target); queue.splice(queue.indexOf(q), 1); try { q.fn(); } catch (err) { console.warn(q.id, err); } }
  });
}, { threshold: 0.18 });
var lzIO = new IntersectionObserver(function (es) {
  es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); lzIO.unobserve(e.target); } });
}, { threshold: 0.08 });
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('canvas.chart').forEach(function (cv) { io.observe(cv); });
  document.querySelectorAll('.sec,.motif,figure,.term-mag').forEach(function (el) { el.classList.add('lz'); lzIO.observe(el); });
  buildTables(); buildPortfolio(); buildK3(); buildSrcTable(); coverSky();
});

window.showDrill = function (o) {
  document.getElementById('d-t').textContent = o.t || '';
  document.getElementById('d-v').textContent = o.v || '';
  document.getElementById('d-s').textContent = o.s || '';
  document.getElementById('d-src').textContent = o.src ? ('SOURCE · ' + o.src) : '';
  document.getElementById('drill').classList.add('on');
};
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-drill]');
  if (el) { showDrill({ t: el.dataset.t, v: el.dataset.v, s: el.dataset.s, src: el.dataset.src }); return; }
  if (e.target.id === 'drill' || e.target.id === 'drill-x') document.getElementById('drill').classList.remove('on');
});

function coverSky() {
  var cv = document.getElementById('stars'); if (!cv) return;
  var o = fit(cv, cv.parentElement.clientHeight || 600), ctx = o.ctx, W = o.W, H = o.H;
  var stars = [];
  for (var i = 0; i < 170; i++) stars.push({ x: Math.random(), y: Math.random() * 0.75, r: Math.random() * 1.3 + 0.3, p: Math.random() * 6.28, s: 0.4 + Math.random() * 0.8 });
  var mw = document.getElementById('moonwrap');
  mw.innerHTML = '<svg viewBox="0 0 150 150" width="150" height="150"><defs><radialGradient id="mg" cx="42%" cy="40%"><stop offset="0%" stop-color="#f5edd8"/><stop offset="70%" stop-color="#d4b06a"/><stop offset="100%" stop-color="#a8853f"/></radialGradient></defs><circle cx="75" cy="75" r="46" fill="url(#mg)" opacity="0.95"/><circle cx="90" cy="68" r="42" fill="#0a1628" opacity="0.9"/><circle cx="75" cy="75" r="46" fill="none" stroke="#d4b06a" stroke-opacity="0.35" stroke-width="1"/></svg>';
  var t0 = null;
  function frame(ts) {
    if (!t0) t0 = ts;
    var t = (ts - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    stars.forEach(function (s) {
      var a = REDUCE ? 0.7 : 0.35 + 0.4 * Math.sin(t * s.s + s.p);
      ctx.globalAlpha = Math.max(0.08, a);
      ctx.fillStyle = '#cfe0ff';
      ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 6.283); ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (!REDUCE) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  addEventListener('resize', function () { var n = fit(cv, cv.parentElement.clientHeight || 600); W = n.W; H = n.H; ctx = n.ctx; });
}

lazy('ch-natline', function () {
  var cv = document.getElementById('ch-natline'); var o = fit(cv, 340), ctx = o.ctx, W = o.W, H = o.H;
  var d = R.national_line, yrs = d.years;
  var mL = 54, mR = 30, mT = 34, mB = 46, cw = (W - mL - mR) / (yrs.length - 1);
  var all = d.A.concat(d.B), lo = Math.min.apply(null, all) - 6, hi = Math.max.apply(null, all) + 6;
  function X(i) { return mL + i * cw; } function Y(v) { return mT + (hi - v) / (hi - lo) * (H - mT - mB); }
  animate(function (k) {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = LINE; ctx.lineWidth = 1; ctx.fillStyle = INKLO;
    for (var v = 265; v <= 290; v += 5) {
      ctx.beginPath(); ctx.moveTo(mL, Y(v)); ctx.lineTo(W - mR, Y(v)); ctx.stroke();
      halo(ctx, String(v), mL - 8, Y(v) + 3, { align: 'right', color: INKLO, font: '10px ' + MONO });
    }
    [['A', BLUE, 'A区'], ['B', GOLD, 'B区']].forEach(function (sr, si) {
      var pts = d[sr[0]].map(function (v, i) { return [X(i), Y(v)]; });
      var n = Math.max(2, Math.ceil(pts.length * k));
      ctx.beginPath(); ctx.moveTo(pts[0][0], H - mB);
      pts.slice(0, n).forEach(function (p) { ctx.lineTo(p[0], p[1]); });
      ctx.lineTo(pts[n - 1][0], H - mB); ctx.closePath();
      ctx.fillStyle = sr[1] + '14'; ctx.fill();
      ctx.beginPath(); pts.slice(0, n).forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.strokeStyle = sr[1]; ctx.lineWidth = 2.5; ctx.stroke();
      pts.forEach(function (p, i) {
        if (i >= n) return;
        ctx.beginPath(); ctx.arc(p[0], p[1], 4.5, 0, 6.283); ctx.fillStyle = PAPER; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = sr[1]; ctx.stroke();
        halo(ctx, String(d[sr[0]][i]), p[0], p[1] - 10, { align: 'center', color: sr[1] === GOLD ? '#b07a10' : BDEEP, font: 'bold 11px ' + MONO });
      });
      halo(ctx, sr[2], pts[3][0] + 8, pts[3][1] + (si ? 22 : -14), { color: sr[1] === GOLD ? '#b07a10' : BDEEP, font: 'bold 12px ' + SERIF });
    });
    yrs.forEach(function (y, i) { halo(ctx, y, X(i), H - mB + 20, { align: 'center', color: INKMD, font: '11px ' + MONO }); });
    if (k > 0.9) {
      halo(ctx, '顶 288', X(1), Y(288) - 22, { align: 'center', color: INKMD, font: '10px ' + MONO });
      halo(ctx, '谷 · 两年-13', X(2), Y(264) + 34, { align: 'center', color: NEG, font: 'bold 10.5px ' + MONO });
    }
  });
  cv.addEventListener('click', function () {
    showDrill({ t: '0702 国家线(A区)', v: '288 → 275', s: '2024顶→2026谷,-13分;B区同步278→265。国家线是全市场最干净的温度计,但需§3一志愿地板分佐证(排除公共课难度变化假说)。', src: 'K3 新东方PDF国家线表, 2026-08-15 · confA' });
  });
});

lazy('ch-modes', function () {
  var cv = document.getElementById('ch-modes'); var o = fit(cv, 420), ctx = o.ctx, W = o.W, H = o.H;
  var defs = [
    { k: 'mixed', n: R.modes.mixed || 0, c: INKLO, lab: 'mixed 混合形态', note: '不满足三型硬阈值' },
    { k: 'beta', n: R.modes.beta || 0, c: BLUE, lab: 'β 零调剂堡垒', note: '连续≥3年零调剂·一志愿率≥0.90' },
    { k: 'vacuum', n: R.modes.vacuum || 0, c: GOLD, lab: 'vacuum 真空窗', note: 'γ结构但通过率≥0.9·调剂填空缺席位' },
    { k: 'gamma', n: R.modes.gamma || 0, c: NEG, lab: 'γ 高调剂陷阱', note: '一志愿实为备胎' },
    { k: 'alpha', n: R.modes.alpha || 0, c: '#008a6d', lab: 'α 过线即录', note: '复试通过率≥0.98' }];
  var tot = defs.reduce(function (a, b) { return a + b.n; }, 0);
  var cx = W * 0.36, cy = H / 2, r0 = 62, r1 = Math.min(150, H / 2 - 30);
  animate(function (k) {
    ctx.clearRect(0, 0, W, H);
    var a0 = -Math.PI / 2;
    defs.forEach(function (d) {
      var sw = d.n / tot * Math.PI * 2 * k;
      ctx.beginPath(); ctx.arc(cx, cy, r1, a0, a0 + sw); ctx.arc(cx, cy, r0, a0 + sw, a0, true);
      ctx.closePath(); ctx.fillStyle = d.c + 'e6'; ctx.fill();
      var mid = a0 + sw / 2;
      if (sw > 0.12) halo(ctx, String(d.n), cx + Math.cos(mid) * (r0 + r1) / 2, cy + Math.sin(mid) * (r0 + r1) / 2 + 4, { align: 'center', color: '#fff', font: 'bold 13px ' + MONO, haloColor: d.c });
      a0 += sw;
    });
    halo(ctx, '53', cx, cy - 2, { align: 'center', color: INK, font: 'bold 30px ' + SERIF });
    halo(ctx, 'SCHOOLS', cx, cy + 18, { align: 'center', color: INKLO, font: '9px ' + MONO });
    var ly0 = cy - defs.length * 26 / 2 + 8;
    defs.forEach(function (d, i) {
      var y = ly0 + i * 26;
      ctx.fillStyle = d.c; ctx.fillRect(W * 0.62, y - 9, 12, 12);
      halo(ctx, d.lab + ' · ' + d.n, W * 0.62 + 20, y + 2, { color: INK, font: 'bold 12px ' + SERIF });
      halo(ctx, d.note, W * 0.62 + 20, y + 15, { color: INKLO, font: '9.5px ' + MONO });
    });
  });
  cv.addEventListener('click', function (e) {
    var rect = cv.getBoundingClientRect(), x = e.clientX - rect.left - cx, y = e.clientY - rect.top - cy;
    var rdist = Math.sqrt(x * x + y * y);
    if (rdist < r0 || rdist > r1 + 8) return;
    var ang = Math.atan2(y, x); if (ang < -Math.PI / 2) ang += Math.PI * 2;
    var a0 = -Math.PI / 2, hit = null;
    for (var i = 0; i < defs.length; i++) { var sw = defs[i].n / tot * Math.PI * 2; if (ang >= a0 && ang < a0 + sw) { hit = defs[i]; break; } a0 += sw; }
    if (hit) {
      var names = (R.mode_schools[hit.k] || []).join('、');
      showDrill({ t: hit.lab, v: hit.n + ' 校', s: names, src: 'K5 panel_critique.py, 2026-08-26 · confA' });
    }
  });
});

lazy('ch-slope', function () {
  var cv = document.getElementById('ch-slope'); var o = fit(cv, 480), ctx = o.ctx, W = o.W, H = o.H;
  var rows = R.beta_floor.slice().sort(function (a, b) { return a.delta - b.delta; });
  var all = []; rows.forEach(function (r) { all.push(r.y2024, r.y2026); });
  var lo = Math.min.apply(null, all) - 10, hi = Math.max.apply(null, all) + 10;
  var mT = 30, mB = 30, x1 = W * 0.28, x2 = W * 0.72;
  function Y(v) { return mT + (hi - v) / (hi - lo) * (H - mT - mB); }
  var labR = rows.map(function (r, i) { return { i: i, y: Y(r.y2026) }; }).sort(function (a, b) { return a.y - b.y; });
  for (var q = 1; q < labR.length; q++) { if (labR[q].y - labR[q - 1].y < 15) labR[q].y = labR[q - 1].y + 15; }
  var labY = {}; labR.forEach(function (e) { labY[e.i] = e.y; });
  var labL = rows.map(function (r, i) { return { i: i, y: Y(r.y2024) }; }).sort(function (a, b) { return a.y - b.y; });
  for (var q2 = 1; q2 < labL.length; q2++) { if (labL[q2].y - labL[q2 - 1].y < 15) labL[q2].y = labL[q2 - 1].y + 15; }
  var labYL = {}; labL.forEach(function (e) { labYL[e.i] = e.y; });
  animate(function (k) {
    ctx.clearRect(0, 0, W, H);
    halo(ctx, '2024', x1, mT - 12, { align: 'center', color: INKMD, font: 'bold 12px ' + MONO });
    halo(ctx, '2026', x2, mT - 12, { align: 'center', color: INKMD, font: 'bold 12px ' + MONO });
    ctx.strokeStyle = LINE; ctx.beginPath(); ctx.moveTo(x1, mT); ctx.lineTo(x1, H - mB); ctx.moveTo(x2, mT); ctx.lineTo(x2, H - mB); ctx.stroke();
    rows.forEach(function (r) {
      var cool = r.delta <= -10, warm = r.delta >= 10;
      var c = cool ? BDEEP : (warm ? NEG : INKLO);
      var y1 = Y(r.y2024), y2 = Y(r.y2026), yy2 = y1 + (y2 - y1) * k;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + (x2 - x1) * k, yy2);
      ctx.strokeStyle = c; ctx.lineWidth = cool ? 2.2 : 1.4; ctx.globalAlpha = cool ? 0.95 : 0.7; ctx.stroke(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(x1, y1, 3, 0, 6.283); ctx.fillStyle = c; ctx.fill();
      if (k > 0.85) { ctx.beginPath(); ctx.arc(x2, y2, cool ? 4 : 3, 0, 6.283); ctx.fillStyle = c; ctx.fill(); }
      halo(ctx, r.school, x1 - 10, labYL[rows.indexOf(r)] + 4, { align: 'right', color: INK, font: (cool ? 'bold ' : '') + '11.5px ' + SERIF });
      halo(ctx, String(r.y2024), x1 + 9, y1 + 4, { color: INKLO, font: '10px ' + MONO });
      if (k > 0.85) {
        var ly = labY[rows.indexOf(r)];
        if (Math.abs(ly - y2) > 3) { ctx.strokeStyle = c + '66'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x2 + 4, y2); ctx.lineTo(x2 + 12, ly + 3); ctx.stroke(); }
        halo(ctx, r.y2026 + ' (' + (r.delta > 0 ? '+' : '') + r.delta + ')', x2 + 14, ly + 4, { color: c, font: 'bold 10.5px ' + MONO });
      }
    });
    if (k > 0.95) halo(ctx, '10 / 13 降温 · 仅云南大学 +29 升温', (x1 + x2) / 2, H - 6, { align: 'center', color: BDEEP, font: 'bold 11px ' + MONO });
  });
  cv.addEventListener('click', function (e) {
    var rect = cv.getBoundingClientRect(), my = e.clientY - rect.top;
    var best = null, bd = 1e9;
    rows.forEach(function (r) { [r.y2024, r.y2026].forEach(function (v) { var d = Math.abs(Y(v) - my); if (d < bd) { bd = d; best = r; } }); });
    if (best && bd < 26) showDrill({ t: best.school + ' · 一志愿地板分', v: best.y2024 + ' → ' + best.y2026, s: 'Δ' + (best.delta > 0 ? '+' : '') + best.delta + '分。β堡垒校零调剂,地板分不含调剂污染,是降温判断的无污染证据。', src: 'K1+K6 无污染验证, 2026-08-26 · confA' });
  });
});

lazy('ch-diverge', function () {
  var cv = document.getElementById('ch-diverge'); var o = fit(cv, 400), ctx = o.ctx, W = o.W, H = o.H;
  var schools = R.divergence.filter(function (d) { return ['山西大学', '郑州大学', '昆明理工大学'].indexOf(d.school) >= 0; });
  var rows = [];
  schools.forEach(function (s) {
    Object.keys(s.codes).forEach(function (c) {
      var e = s.codes[c];
      rows.push({ school: s.school, code: c, dir: e.dir, pat: e.pattern, must: e.must, plate: e.plate });
    });
  });
  var patColor = { beta: BLUE, alpha: '#008a6d', vacuum: GOLD, gamma: NEG, mixed: INKLO };
  var mL = 190, mR = 60, mT = 40, rowH = (H - mT - 30) / rows.length, maxMust = 400;
  function X(v) { return mL + v / maxMust * (W - mL - mR); }
  animate(function (k) {
    ctx.clearRect(0, 0, W, H);
    [275, 300, 350, 400].forEach(function (v) {
      ctx.strokeStyle = LINE; ctx.beginPath(); ctx.moveTo(X(v), mT - 10); ctx.lineTo(X(v), H - 28); ctx.stroke();
      halo(ctx, String(v), X(v), H - 14, { align: 'center', color: INKLO, font: '10px ' + MONO });
    });
    ctx.strokeStyle = GOLD; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X(275), mT - 10); ctx.lineTo(X(275), H - 28); ctx.stroke(); ctx.setLineDash([]);
    halo(ctx, 'A区线275', X(275), mT - 16, { align: 'center', color: '#b07a10', font: '9.5px ' + MONO });
    rows.forEach(function (r, i) {
      var y = mT + i * rowH + rowH / 2;
      var c = patColor[r.pat] || INKLO;
      var firstOfSchool = i === 0 || rows[i - 1].school !== r.school;
      if (firstOfSchool) halo(ctx, r.school, mL - 12, y - 2, { align: 'right', color: INK, font: 'bold 12px ' + SERIF });
      halo(ctx, r.code.replace('0702', '') + ' · ' + r.dir.replace('物理学(总口径)', '物理学').slice(0, 5), mL - 12, y + 13, { align: 'right', color: INKLO, font: '9.5px ' + MONO });
      if (r.must) {
        var bh = Math.min(9, rowH * 0.24);
        ctx.fillStyle = c + '55'; ctx.fillRect(mL, y + rowH * 0.12, (X(r.must) - mL) * k, bh);
        ctx.beginPath(); ctx.arc(mL + (X(r.must) - mL) * k, y - 3, 6, 0, 6.283); ctx.fillStyle = c; ctx.fill();
        halo(ctx, String(r.must), mL + (X(r.must) - mL) * k, y - 14, { align: 'center', color: c, font: 'bold 11px ' + MONO });
      } else {
        halo(ctx, '必达缺测', mL + 6, y - 3, { color: INKLO, font: '10px ' + MONO });
      }
      if (r.plate) {
        var px = r.must ? (mL + (X(r.must) - mL) * k + 12) : (W - 44);
        if (px > W - 40) { halo(ctx, '盘' + r.plate, px - 26, y - 16, { color: INKMD, font: '10px ' + MONO }); }
        else halo(ctx, '盘' + r.plate, px, y - 3, { color: INKMD, font: '10px ' + MONO });
      }
    });
  });
  cv.addEventListener('click', function () {
    showDrill({ t: '方向级判读', v: '必达差最大 100 分', s: '山西大学070203(盘3/必达385/伪α警示) vs 070205(盘25/必达285/真空窗);郑州大学三代码β但314/322/347梯度;昆明理工双代码同价275,070201真空-98 vs 070205 α。', src: 'K1+panel_code_scan.json, 2026-08-26 · confA' });
  });
});

lazy('ch-etf', function () {
  var cv = document.getElementById('ch-etf'); var o = fit(cv, 420), ctx = o.ctx, W = o.W, H = o.H;
  var pv = R.etf.pv, li = R.etf.li;
  var n = pv.dates.length;
  var pvN = pv.close.map(function (v) { return v / pv.close[0] * 100; });
  var liN = li.close.map(function (v) { return v / li.close[0] * 100; });
  var hi = Math.max(Math.max.apply(null, pvN), Math.max.apply(null, liN)) * 1.06, lo = 50;
  var mL = 46, mR = 20, mT = 26, mB = 40;
  function X(i) { return mL + i / (n - 1) * (W - mL - mR); }
  function Y(v) { return mT + (hi - v) / (hi - lo) * (H - mT - mB); }
  animate(function (k) {
    ctx.clearRect(0, 0, W, H);
    [50, 100, 150, 200].forEach(function (v) {
      ctx.strokeStyle = v === 100 ? INKLO : LINE; ctx.setLineDash(v === 100 ? [4, 4] : []);
      ctx.beginPath(); ctx.moveTo(mL, Y(v)); ctx.lineTo(W - mR, Y(v)); ctx.stroke(); ctx.setLineDash([]);
      halo(ctx, String(v), mL - 6, Y(v) + 3, { align: 'right', color: INKLO, font: '10px ' + MONO });
    });
    halo(ctx, '基期=100', W - mR - 4, Y(100) - 6, { align: 'right', color: INKLO, font: '9.5px ' + MONO });
    var cnt = Math.max(2, Math.floor(n * k));
    [[liN, GOLD, '#b07a10', '锂电ETF 159755'], [pvN, BLUE, BDEEP, '光伏ETF 515790']].forEach(function (s) {
      var pts = s[0].map(function (v, i) { return [X(i), Y(v)]; });
      ctx.beginPath(); ctx.moveTo(pts[0][0], H - mB);
      pts.slice(0, cnt).forEach(function (p) { ctx.lineTo(p[0], p[1]); });
      ctx.lineTo(pts[cnt - 1][0], H - mB); ctx.closePath(); ctx.fillStyle = s[1] + '12'; ctx.fill();
      ctx.beginPath(); pts.slice(0, cnt).forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.strokeStyle = s[1]; ctx.lineWidth = 2.4; ctx.stroke();
      var last = pts[cnt - 1];
      halo(ctx, s[3] + ' ' + Math.round(s[0][cnt - 1]), last[0] - 4, last[1] - 10, { align: 'right', color: s[2], font: 'bold 11.5px ' + MONO });
    });
    var yrs = {};
    pv.dates.forEach(function (d, i) { var y = d.slice(0, 4); if (!(y in yrs)) yrs[y] = i; });
    Object.keys(yrs).forEach(function (y) { halo(ctx, y, X(yrs[y]), H - mB + 18, { align: 'center', color: INKMD, font: '10.5px ' + MONO }); });
    if (k > 0.9) {
      halo(ctx, '同期: 隆基 -47%(个体价格战) · 宁德 +185%', mL + 6, mT + 14, { color: INKMD, font: '10.5px ' + MONO });
      halo(ctx, '单龙头≠全链 — 链级ETF修正(v68.69)', mL + 6, mT + 30, { color: NEG, font: 'bold 10.5px ' + MONO });
    }
  });
  cv.addEventListener('click', function (e) {
    var rect = cv.getBoundingClientRect(), mx = e.clientX - rect.left;
    var i = Math.round((mx - mL) / (W - mL - mR) * (n - 1));
    if (i < 0 || i >= n) return;
    showDrill({ t: pv.dates[i], v: '光伏 ' + Math.round(pvN[i]) + ' / 锂电 ' + Math.round(liN[i]), s: '归一化净值(2024-01首周=100),双周采样。光伏ETF较低点+35%/2026均价>2024均价=板块修复;锂电ETF较低点+101%=全链景气。', src: 'K2 Wind, 2026-08-27 · confA' });
  });
});

lazy('ch-nanchang', function () {
  var cv = document.getElementById('ch-nanchang'); var o = fit(cv, 400), ctx = o.ctx, W = o.W, H = o.H;
  var nc = R.nanchang, yrs = Object.keys(nc).sort();
  var must = yrs.map(function (y) { return nc[y].score_must || null; });
  var med = yrs.map(function (y) { return nc[y].score_med || null; });
  var adm = yrs.map(function (y) { return nc[y].admit_first || 0; });
  var lo = 260, hi = 420, mL = 46, mR = 46, mT = 30, mB = 44;
  var cw = (W - mL - mR) / yrs.length;
  function X(i) { return mL + i * cw + cw / 2; } function Y(v) { return mT + (hi - v) / (hi - lo) * (H - mT - mB); }
  animate(function (k) {
    ctx.clearRect(0, 0, W, H);
    [300, 350, 400].forEach(function (v) { ctx.strokeStyle = LINE; ctx.beginPath(); ctx.moveTo(mL, Y(v)); ctx.lineTo(W - mR, Y(v)); ctx.stroke(); halo(ctx, String(v), mL - 6, Y(v) + 3, { align: 'right', color: INKLO, font: '10px ' + MONO }); });
    ctx.strokeStyle = GOLD; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(mL, Y(275)); ctx.lineTo(W - mR, Y(275)); ctx.stroke(); ctx.setLineDash([]);
    halo(ctx, 'A区线', W - mR + 4, Y(275) + 3, { color: '#b07a10', font: '9.5px ' + MONO });
    var maxA = Math.max.apply(null, adm);
    yrs.forEach(function (y, i) {
      var bh = adm[i] / maxA * 56 * k;
      ctx.fillStyle = BLUE + '30'; ctx.fillRect(X(i) - cw * 0.26, H - mB - bh, cw * 0.52, bh);
      halo(ctx, String(adm[i]), X(i), H - mB - bh - 5, { align: 'center', color: INKLO, font: '9.5px ' + MONO });
      halo(ctx, y, X(i), H - mB + 18, { align: 'center', color: INKMD, font: '11px ' + MONO });
    });
    [[must, BDEEP, '必达分'], [med, GOLD, '中位分']].forEach(function (s) {
      var pts = s[0].map(function (v, i) { return v ? [X(i), Y(v)] : null; }).filter(Boolean);
      var nn = Math.max(2, Math.ceil(pts.length * k));
      ctx.beginPath(); pts.slice(0, nn).forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.strokeStyle = s[1]; ctx.lineWidth = 2.4; ctx.stroke();
      pts.forEach(function (p, i) {
        if (i >= nn) return;
        ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, 6.283); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = s[1]; ctx.stroke();
        halo(ctx, String(s[0][i]), p[0], p[1] - 9, { align: 'center', color: s[1] === GOLD ? '#b07a10' : s[1], font: 'bold 10.5px ' + MONO });
      });
    });
    halo(ctx, '柱=一志愿录取(人) · 蓝=必达 · 金=中位 · 调剂五年恒0', mL, mT - 10, { color: INKLO, font: '10px ' + MONO });
    if (k > 0.9) halo(ctx, '-100', X(3) + (X(4) - X(3)) / 2, (Y(383) + Y(283)) / 2, { align: 'center', color: NEG, font: 'bold 13px ' + MONO });
  });
  cv.addEventListener('click', function () {
    showDrill({ t: '南昌大学 070200', v: '383 → 283 (-100)', s: '五年零调剂堡垒;2026通过率34/35=0.97;中位303仍高出A区线28分。市场势能最低点,但639曾谨言量子+光学重载+等离子体名额极少→用户适配维度不成立,观察名单。', src: 'K1 新东方PDF, 2026-08-15 · confA' });
  });
});

lazy('ch-ustb', function () {
  var cv = document.getElementById('ch-ustb'); var o = fit(cv, 380), ctx = o.ctx, W = o.W, H = o.H;
  var data = [
    { y: '2022', rn: null, fc: 60, tr: 2 },
    { y: '2023', rn: null, fc: 62, tr: 2 },
    { y: '2024', rn: null, fc: 56, tr: 2 },
    { y: '2025', rn: 85, fc: 64, tr: 2 },
    { y: '2026', rn: 74, fc: 0, tr: 2 }];
  var mL = 46, mR = 20, mT = 30, mB = 44, cw = (W - mL - mR) / data.length, hi = 90;
  function X(i) { return mL + i * cw + cw / 2; } function Y(v) { return mT + (hi - v) / hi * (H - mT - mB); }
  animate(function (k) {
    ctx.clearRect(0, 0, W, H);
    [0, 30, 60, 90].forEach(function (v) { ctx.strokeStyle = LINE; ctx.beginPath(); ctx.moveTo(mL, Y(v)); ctx.lineTo(W - mR, Y(v)); ctx.stroke(); halo(ctx, String(v), mL - 6, Y(v) + 3, { align: 'right', color: INKLO, font: '10px ' + MONO }); });
    data.forEach(function (d, i) {
      var x = X(i);
      if (d.rn) {
        var bh = (H - mB - Y(d.rn)) * k;
        ctx.fillStyle = i === 4 ? NEG + '30' : BLUE + '22';
        ctx.fillRect(x - cw * 0.3, H - mB - bh, cw * 0.6, bh);
        halo(ctx, '复试' + d.rn, x, H - mB - bh - 8, { align: 'center', color: i === 4 ? NEG : INKMD, font: 'bold 10.5px ' + MONO });
      } else {
        halo(ctx, '复试缺测', x, Y(78), { align: 'center', color: INKLO, font: '9px ' + MONO });
      }
      var yy = H - mB - (H - mB - Y(d.fc)) * k;
      ctx.beginPath(); ctx.arc(x, yy, 6, 0, 6.283);
      ctx.fillStyle = d.fc === 0 ? NEG : BDEEP; ctx.fill();
      halo(ctx, '录' + d.fc, x, yy + 20, { align: 'center', color: d.fc === 0 ? NEG : BDEEP, font: 'bold 11px ' + MONO });
      halo(ctx, d.y, x, H - mB + 18, { align: 'center', color: INKMD, font: '11px ' + MONO });
    });
    if (k > 0.85) {
      ctx.strokeStyle = NEG; ctx.setLineDash([6, 4]);
      ctx.strokeRect(X(4) - cw * 0.42, Y(82), cw * 0.84, Y(0) - Y(82) + 26);
      ctx.setLineDash([]);
      halo(ctx, '2026: 74进0 · confB待核', X(4), Y(88), { align: 'center', color: NEG, font: 'bold 11px ' + MONO });
    }
  });
  cv.addEventListener('click', function () {
    showDrill({ t: '北京科技大学 070200', v: '0 / 74', s: '2026一志愿复试74人录取0人,仅调剂2人(材料中心)。2022-2025为β堡垒(年录56-64)。公示或分批次→confB待9月官方名单复核;若属实=堡垒单年跳变γ。', src: 'K8 经新东方PDF转引, 2026-08-15 · confB' });
  });
});

lazy('ch-timeline', function () {
  var cv = document.getElementById('ch-timeline'); var o = fit(cv, 460), ctx = o.ctx, W = o.W, H = o.H;
  var tl = R.timeline.slice(-10);
  var mL = 118, mR = 30, mT = 40, mB = 30;
  var rowH = (H - mT - mB) / tl.length;
  function phaseOf(v) {
    var n = parseFloat(v.replace('v', ''));
    if (n < 68.60) return -1;
    if (n < 68.63) return 0; if (n < 68.66) return 1;
    if (n < 68.68) return 2; return 3;
  }
  var PH = [
    { id: 0, lab: '数据驱动化', c: BLUE }, { id: 1, lab: '面板扩容', c: '#7d9bff' },
    { id: 2, lab: '批判重扫', c: GOLD }, { id: 3, lab: '自我核查', c: '#008a6d' }];
  animate(function (k) {
    ctx.clearRect(0, 0, W, H);
    var n = Math.max(1, Math.ceil(tl.length * k));
    ctx.strokeStyle = LINE; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(mL, mT); ctx.lineTo(mL, mT + n * rowH - rowH / 2); ctx.stroke();
    var groups = {};
    tl.forEach(function (v, i) { var ph = phaseOf(v.v); if (ph >= 0) { (groups[ph] = groups[ph] || []).push(i); } });
    PH.forEach(function (p) {
      var idx = groups[p.id]; if (!idx) return;
      var y1 = mT + idx[0] * rowH - rowH / 2, y2 = mT + (idx[idx.length - 1] + 1) * rowH - rowH / 2;
      ctx.fillStyle = p.c + '0d'; ctx.fillRect(mL - 26, y1, W - mL - mR + 26, y2 - y1);
      halo(ctx, p.lab, mL - 34, (y1 + y2) / 2 + 3, { align: 'right', color: p.c === GOLD ? '#b07a10' : p.c, font: 'bold 10px ' + MONO });
    });
    tl.forEach(function (v, i) {
      if (i >= n) return;
      var y = mT + i * rowH + rowH / 2;
      ctx.beginPath(); ctx.arc(mL, y, 5.5, 0, 6.283); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 2.2; ctx.strokeStyle = BDEEP; ctx.stroke();
      halo(ctx, v.v, mL + 14, y + 4, { color: BDEEP, font: 'bold 11.5px ' + MONO });
      halo(ctx, v.date.slice(5), mL + 66, y + 4, { color: INKLO, font: '9.5px ' + MONO });
      var t = v.title.length > 30 ? v.title.slice(0, 30) + '…' : v.title;
      halo(ctx, t, mL + 116, y + 4, { color: INK, font: '11.5px ' + SERIF });
    });
  });
  cv.addEventListener('click', function (e) {
    var rect = cv.getBoundingClientRect(), my = e.clientY - rect.top;
    var i = Math.floor((my - mT) / rowH);
    if (i >= 0 && i < tl.length) showDrill({ t: tl[i].v, v: tl[i].date, s: tl[i].title, src: 'K5 CHANGELOG.md · confA' });
  });
});

function buildTables() {
  var mb = document.querySelector('#tbl-modes tbody');
  if (mb) {
    var rows = [
      ['beta', 'β 零调剂堡垒', R.modes.beta, '高保护,核查必达分硬门槛', '东华/中科大/南昌/郑大'],
      ['alpha', 'α 过线即录', R.modes.alpha, '单向成功路径,警惕筛选前置', '宁夏大学/昆明理工/浙工大'],
      ['vacuum', 'vacuum 真空窗', R.modes.vacuum, '调剂填空缺席位,过线即录(新设)', '江苏大学/海大/石河子/西北师大'],
      ['gamma', 'γ 高调剂陷阱', R.modes.gamma, '一志愿实为备胎,红灯', '北科大/南理工/烟大/温大'],
      ['mixed', 'mixed 混合形态', R.modes.mixed, '不满足硬阈值,逐校个案', '深大/福大/广西大学/新大']];
    mb.innerHTML = rows.map(function (r) {
      return '<tr' + (r[0] === 'vacuum' ? ' class="hl"' : '') + '><td><span class="badge ' + r[0] + '">' + r[1] + '</span></td><td class="num">' + r[2] + '</td><td>' + r[3] + '</td><td class="small">' + r[4] + '</td></tr>';
    }).join('');
  }
  var dv = document.querySelector('#tbl-diverge tbody');
  if (dv) {
    var out = [];
    R.divergence.forEach(function (d) {
      Object.keys(d.codes).forEach(function (c, i) {
        var e = d.codes[c];
        var verdict = e.pattern === 'vacuum' ? '捡漏首选' : (e.pattern === 'alpha' && e.plate <= 5 ? '伪α警示·小盘高门槛' : (e.pattern === 'alpha' ? '坦途' : (e.pattern === 'beta' ? '低配入口' : '边缘/观察')));
        out.push('<tr' + (e.pattern === 'vacuum' ? ' class="hl"' : '') + '>' + (i === 0 ? '<td rowspan="' + Object.keys(d.codes).length + '"><b>' + d.school + '</b></td>' : '') +
          '<td class="num">' + c + '</td><td>' + e.dir + '</td><td><span class="badge ' + e.pattern + '">' + e.pattern + '</span></td><td class="num">' + (e.must || '—') + '</td><td class="num">' + (e.plate || '—') + '</td><td class="small">' + verdict + '</td></tr>');
      });
    });
    dv.innerHTML = out.join('');
  }
  var vb = document.querySelector('#tbl-versions tbody');
  if (vb) vb.innerHTML = R.timeline.map(function (v) { return '<tr><td class="num">' + v.v + '</td><td class="num">' + v.date + '</td><td>' + v.title + '</td></tr>'; }).join('');
}
function buildPortfolio() {
  var g = document.getElementById('portfolio-grid'); if (!g) return;
  var P = R.portfolio, html = '';
  function block(title, cls, items) {
    var h = '<div style="margin:26px 0"><p class="kicker" style="color:' + cls + '">' + title + '</p>';
    items.forEach(function (it) {
      h += '<div style="display:grid;grid-template-columns:1fr auto;gap:4px 18px;padding:10px 0;border-bottom:1px solid var(--line-lo)">' +
        '<div><b>' + it.school + '</b> <span class="badge ' + it.mode + '">' + it.mode + '</span>' +
        '<div class="small">' + it.note + '</div></div>' +
        '<div style="text-align:right" class="num">' + (it.must ? '必达' + it.must : '小盘') + (it.med ? '<br><span class="small">中位' + it.med + '</span>' : '') + (it.drop ? '<br><span style="color:var(--neg)">坍缩-' + it.drop + '</span>' : '') + '</div></div>';
    });
    return h + '</div>';
  }
  html += block('主力 · B区265线', 'var(--blue-deep)', P.main_B);
  html += block('替补 · A区275线', 'var(--gold-deep)', P.sub_A);
  html += '<div style="margin:26px 0"><p class="kicker" style="color:var(--neg)">剔除 / 降级</p>' + P.removed.map(function (r) {
    return '<div style="padding:10px 0;border-bottom:1px solid var(--line-lo)"><b style="color:var(--neg)">' + r.school + '</b><div class="small">' + r.reason + '</div></div>'; }).join('') + '</div>';
  g.innerHTML = html;
}
function buildK3() {
  var g = document.getElementById('k3-grid'); if (!g) return;
  var B = R.k3_buckets;
  g.innerHTML = ['A', 'B', 'C'].map(function (k) {
    var b = B[k];
    return '<div style="border-top:2px solid var(--ink);padding-top:14px;margin:22px 0"><p class="kicker">BUCKET ' + k + '</p><h3 style="font-size:19px;margin:4px 0 10px">' + b.name + '</h3><ul style="list-style:none">' +
      b.items.map(function (i) { return '<li style="padding:6px 0;border-bottom:1px solid var(--line-lo);font-size:15px">· ' + i + '</li>'; }).join('') + '</ul></div>';
  }).join('');
}
function buildSrcTable() {
  var t = document.getElementById('tbl-src'); if (!t) return;
  t.innerHTML = S.map(function (s) {
    return '<tr><td class="k">' + s.k + '</td><td>' + s.src + '</td><td class="k">' + s.date + '</td><td><span class="src-cat ' + s.cat + '">' + s.cat.toUpperCase() + '</span></td><td style="color:#7d93c4">' + s.use + '</td></tr>';
  }).join('');
}
})();
