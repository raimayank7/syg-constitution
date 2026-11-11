/* constitution: article finder, practice quiz, print */
(function () {
  'use strict';
  var d = document, SYG = window.SYG, esc = SYG.esc;
  var pr = d.querySelector('[data-print]'); if (pr) pr.addEventListener('click', function () { window.print(); });

  /* article finder: a number matches the article number first (21 finds 21 and 21A), words match the summary */
  var f = d.querySelector('[data-afind]');
  if (f) {
    var rows = d.querySelectorAll('#arts tbody tr'), none = d.querySelector('[data-anone]'), count = d.querySelector('[data-acount]');
    function apply() {
      var v = f.value.toLowerCase().replace(/^art(icle)?\.?\s*/, '').trim(), words = v.split(/\s+/).filter(Boolean), shown = 0, isNo = /^\d+[a-z]*$/.test(v);
      rows.forEach(function (tr) {
        var no = tr.cells[0].textContent.toLowerCase(), s = tr.getAttribute('data-q'), ok;
        if (!v) ok = true; else if (isNo) ok = no === v || no.replace(/[a-z]+$/, '') === v; else ok = words.every(function (w) { return s.indexOf(w) > -1; });
        tr.hidden = !ok; if (ok) shown++;
      });
      none.hidden = shown > 0; d.getElementById('arts').parentNode.hidden = !shown;
      count.textContent = v ? shown + (shown === 1 ? ' article found' : ' articles found') : rows.length + ' articles in this list';
    }
    f.addEventListener('input', apply);
    var q0 = new URLSearchParams(location.search).get('q'); if (q0) f.value = q0;
    apply();
  }

  /* practice quiz */
  var box = d.querySelector('[data-quiz]'), el = d.getElementById('quiz-data');
  if (box && el) {
    var all = JSON.parse(el.textContent), stage = box.querySelector('[data-stage]');
    function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function run() {
      var qs = shuffle(all).slice(0, 10), i = 0, score = 0, wrong = [];
      function show() {
        if (i >= qs.length) {
          var best = 0; try { best = +localStorage.getItem('con-best') || 0; if (score > best) { localStorage.setItem('con-best', score); best = score; } } catch (e) {}
          var share = 'I scored ' + score + ' out of 10 in the Constitution of India quiz. Can you beat me? ' + location.origin + location.pathname;
          stage.innerHTML = '<div class="rise"><p class="big">' + score + ' / 10</p><p>' + (score === 10 ? 'Perfect score. Well done!' : score >= 7 ? 'Good work. Revise the ones you missed.' : 'Read the topic pages and try again.') + '</p><p class="hint">Your best in this browser: ' + best + ' out of 10</p>' +
            (wrong.length ? '<details><summary>Questions you missed (' + wrong.length + ')</summary><ol class="qa">' + wrong.map(function (q) { return '<li><span class="q">' + esc(q.q) + '</span> <b class="ans">' + esc(q.a) + '</b></li>'; }).join('') + '</ol></details>' : '') +
            '<div class="acts"><button class="btn" type="button" data-again>New set of questions</button><button class="btn ghost" type="button" data-wa="' + esc(share) + '">Share score on WhatsApp</button></div></div>';
          stage.querySelector('[data-again]').onclick = run; return;
        }
        var q = qs[i];
        stage.innerHTML = '<div class="rise"><p class="hint">Question ' + (i + 1) + ' of 10 · Score ' + score + '</p><p class="qq">' + esc(q.q) + '</p><div class="opts">' + shuffle([q.a].concat(q.o)).map(function (o) { return '<button type="button" class="opt">' + esc(o) + '</button>'; }).join('') + '</div><div data-fb></div></div>';
        stage.querySelectorAll('.opt').forEach(function (b) {
          b.onclick = function () {
            var ok = b.textContent === q.a;
            stage.querySelectorAll('.opt').forEach(function (x) { x.disabled = true; if (x.textContent === q.a) x.classList.add('right'); });
            if (ok) score++; else { b.classList.add('wrong'); wrong.push(q); }
            stage.querySelector('[data-fb]').innerHTML = '<p class="fb ' + (ok ? 'ok' : 'no') + '" role="status">' + (ok ? 'Correct!' : 'The answer is ' + esc(q.a) + '.') + '</p><div class="acts"><button class="btn" type="button" data-next>' + (i < 9 ? 'Next question' : 'See my score') + '</button></div>';
            var nx = stage.querySelector('[data-next]'); nx.onclick = function () { i++; show(); }; nx.focus();
          };
        });
      }
      show();
    }
    box.addEventListener('click', function (e) { if (e.target.closest('[data-start]')) run(); });
  }
})();
