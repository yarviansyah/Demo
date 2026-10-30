/* Website riset H₂ panas bumi: bahasa, menu, matriks SotA, pencarian pustaka */
(function () {
  'use strict';
  var root = document.documentElement;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  function lang() { return root.getAttribute('data-lang') === 'en' ? 'en' : 'id'; }
  function setLang(l) {
    root.setAttribute('data-lang', l); root.lang = l; store.set('lang', l);
    var tt = root.getAttribute('data-title-' + l); if (tt) document.title = tt;
    document.querySelectorAll('[data-ph-' + l + ']').forEach(function (el) { el.placeholder = el.getAttribute('data-ph-' + l); });
    if (window.SOTA) renderMatrix(current);
  }
  document.querySelectorAll('.langsw button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-l')); });
  });
  // tautan internal membawa ?lang=en bila pengguna sedang di bahasa Inggris dan penyimpanan lokal tidak tersedia
  var menu = document.querySelector('.menu'), nav = document.getElementById('nav');
  if (menu && nav) menu.addEventListener('click', function () {
    var o = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', o ? 'true' : 'false');
  });

  /* ------------------------------------------------ matriks SotA */
  var NAMA = { G: ['Sudah dikaji', 'Studied'], R: ['Belum dikaji', 'Not studied'], Y: ['Diadopsi', 'Adopted'], B: ['Kebaruan', 'Novelty'] };
  var NAMAD = { Y: ['Diadopsi', 'Adopted'], B: ['Kebaruan', 'Novelty'], R: ['Di luar lingkup', 'Out of scope'] };
  var TX = { G: ['Ya', 'Yes'], R: ['Tidak', 'No'], Y: ['Adopsi', 'Adopt'], B: ['Baru', 'New'] };
  var current = 'X';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function L(pair) { return pair[lang() === 'en' ? 1 : 0]; }
  function counts(m) { return m.cols.map(function (_, j) { return m.rows.reduce(function (a, r) { return a + (r.c[j] === 'G' ? 1 : 0); }, 0); }); }
  function mlabel(m) { return m.p === 'X' ? (lang() === 'en' ? 'Integrated matrix' : 'Matriks terintegrasi') : (lang() === 'en' ? 'Pillar ' : 'Pilar ') + m.p; }
  function cell(code, title, dis) {
    var tx = dis && code === 'R' ? (lang() === 'en' ? 'Out' : 'Luar') : L(TX[code]);
    return '<span class="cell m m-' + code + '" role="img" aria-label="' + esc(title) + '" title="' + esc(title) + '"><span class="tx">' + tx + '</span></span>';
  }
  function renderMatrix(p) {
    var D = window.SOTA, m = D.filter(function (d) { return d.p === p; })[0] || D[0]; current = m.p;
    var cols = lang() === 'en' ? m.cols_en : m.cols, cnt = counts(m), n = m.rows.length, minv = Math.min.apply(null, cnt);
    var h = '<div class="mmsg"><strong>' + esc(mlabel(m)) + ' · ' + esc(L(m.n)) + '.</strong> ' + esc(L(m.m)) + '</div>';
    h += '<div class="mtbl"><table><thead><tr><th scope="col">' + (lang() === 'en' ? 'Author (year) [no.]' : 'Peneliti (tahun) [no.]') + '</th>';
    cols.forEach(function (c, j) { h += '<th scope="col" title="' + esc((lang() === 'en' ? 'Detection keywords: ' : 'Kata kunci deteksi: ') + m.keys[j]) + '">' + esc(c) + '</th>'; });
    h += '</tr></thead><tbody>';
    m.rows.forEach(function (r) {
      var au = r.au.replace(' dkk.', lang() === 'en' ? ' et al.' : ' dkk.');
      var nm = esc(au) + ' (' + r.yr + ') <a class="cite" href="pustaka.html#r' + r.no + '">[' + r.no + ']</a>';
      var head = r.doi ? '<a href="https://doi.org/' + encodeURI(r.doi) + '" target="_blank" rel="noopener">' + esc(au) + ' (' + r.yr + ')</a> <a class="cite" href="pustaka.html#r' + r.no + '">[' + r.no + ']</a>' : '<span>' + nm + '</span>';
      var sub = r.t ? esc(r.t) + (r.j ? ' · ' + esc(r.j) : '') : '';
      h += '<tr><td><div class="paper">' + head + (sub ? '<small title="' + sub + '">' + sub + '</small>' : '') + '</div></td>';
      r.c.split('').forEach(function (c, j) { h += '<td>' + cell(c, cols[j] + ': ' + L(NAMA[c])) + '</td>'; });
      h += '</tr>';
    });
    h += '<tr class="dis"><td>' + (lang() === 'en' ? 'This research (dissertation)' : 'Penelitian ini (disertasi)') + '</td>';
    m.dis.split('').forEach(function (c, j) { h += '<td>' + cell(c, cols[j] + ': ' + L(NAMAD[c]), true) + '</td>'; });
    h += '</tr><tr class="sum"><td>' + (lang() === 'en' ? 'Green count / ' : 'Jumlah hijau / ') + n + (lang() === 'en' ? ' papers' : ' paper') + '</td>';
    cnt.forEach(function (v) { h += '<td class="' + (v === minv ? 'low' : '') + '">' + v + '/' + n + '</td>'; });
    h += '</tr></tbody></table></div><p class="note">' + n + (lang() === 'en' ? ' selected papers' : ' paper terpilih') +
      (m.nc ? (lang() === 'en' ? ' out of ' + m.nc + ' candidates passing the pillar filter' : ' dari ' + m.nc + ' kandidat yang lolos filter pilar') : (lang() === 'en' ? ' across pillars' : ' lintas pilar')) +
      (lang() === 'en' ? '. Red figures mark the least-studied aspect. Author names link to the DOI; numbers link to the reference list.' : '. Angka merah = aspek paling jarang dikaji. Nama peneliti menautkan DOI; nomor menautkan daftar pustaka.') + '</p>';
    document.getElementById('mpanel').innerHTML = h;
    document.querySelectorAll('#mtabs .tab').forEach(function (t) {
      t.setAttribute('aria-selected', t.getAttribute('data-p') === m.p ? 'true' : 'false');
      t.textContent = t.getAttribute('data-p') === 'X' ? (lang() === 'en' ? 'Integrated' : 'Terintegrasi') : t.getAttribute('data-p');
    });
    renderGaps();
  }
  function renderGaps() {
    var tb = document.querySelector('#gaptbl tbody'); if (!tb) return; var out = '';
    window.SOTA.forEach(function (m) {
      var cols = lang() === 'en' ? m.cols_en : m.cols, cnt = counts(m), n = m.rows.length;
      var ord = cnt.map(function (v, j) { return [v, j]; }).sort(function (a, b) { return a[0] - b[0]; }).slice(0, 3);
      var rare = ord.map(function (x) { return '<span class="chip">' + esc(cols[x[1]]) + ' (' + x[0] + '/' + n + ')</span>'; }).join('');
      var blue = m.dis.split('').map(function (c, j) { return c === 'B' ? '<span class="chip b">' + esc(cols[j]) + '</span>' : ''; }).join('') ||
        '<span class="chip">' + (lang() === 'en' ? '— (parameter source, adopted)' : '— (sumber parameter, diadopsi)') + '</span>';
      out += '<tr><td><a href="#matriks" data-go="' + m.p + '">' + esc(mlabel(m)) + '</a><br><span class="muted small">' + esc(L(m.n)) + '</span></td><td>' + rare + '</td><td>' + blue + '</td></tr>';
    });
    tb.innerHTML = out;
    tb.querySelectorAll('[data-go]').forEach(function (a) { a.addEventListener('click', function () { renderMatrix(a.getAttribute('data-go')); }); });
  }
  if (window.SOTA) {
    var tabs = document.getElementById('mtabs');
    window.SOTA.forEach(function (m) {
      var b = document.createElement('button'); b.className = 'tab'; b.setAttribute('role', 'tab'); b.setAttribute('data-p', m.p);
      b.title = m.n[0] + ' / ' + m.n[1]; b.addEventListener('click', function () { renderMatrix(m.p); history.replaceState(null, '', '#' + m.p); }); tabs.appendChild(b);
    });
    tabs.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var list = Array.prototype.slice.call(tabs.querySelectorAll('.tab')), i = list.indexOf(document.activeElement); if (i < 0) return;
      var k = (i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length; list[k].focus(); list[k].click();
    });
    var tbtn = document.getElementById('mtext');
    tbtn.addEventListener('click', function () { var on = document.body.classList.toggle('txtmode'); tbtn.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    var hp = (location.hash || '').replace('#', ''); var start = window.SOTA.some(function (d) { return d.p === hp; }) ? hp : 'X';
    renderMatrix(start);
    if (hp && start === hp) { var sec = document.getElementById('matriks'); if (sec) sec.scrollIntoView(); }
  }

  /* ------------------------------------------------ pencarian pustaka */
  var q = document.getElementById('q');
  if (q) {
    var refs = Array.prototype.slice.call(document.querySelectorAll('.ref')), qn = document.getElementById('qn');
    q.addEventListener('input', function () {
      var s = q.value.trim().toLowerCase(), shown = 0;
      refs.forEach(function (r) { var ok = !s || r.textContent.toLowerCase().indexOf(s) >= 0; r.style.display = ok ? '' : 'none'; if (ok) shown++; });
      qn.textContent = s ? shown + ' / ' + refs.length : '';
    });
  }
  setLang(lang());
})();
