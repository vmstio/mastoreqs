// Interactivity for SupportMatrix grids. Loaded once per page via Starlight's
// `head` config with `defer`, so the DOM is fully parsed when this runs. Pages
// without any matrices are a harmless no-op.
(function () {
  var tables = Array.prototype.slice.call(
    document.querySelectorAll('.support-matrix')
  );
  if (tables.length === 0) return;

  // Shared focus state: clicking a Mastodon version column header highlights
  // that column across every matrix on the page and dims the rest. Click again
  // (or pick another version) to change focus.
  var focusedCol = null;

  function applyFocus() {
    tables.forEach(function (table) {
      table.classList.toggle('is-focusing', focusedCol !== null);

      table.querySelectorAll('.sm-version-btn').forEach(function (btn) {
        btn.setAttribute(
          'aria-pressed',
          String(Number(btn.dataset.col) === focusedCol)
        );
      });

      // Tag every column-bearing element so CSS can light the focused column
      // and dim the rest.
      table.querySelectorAll('[data-col]').forEach(function (el) {
        el.classList.toggle(
          'sm-col-focused',
          Number(el.dataset.col) === focusedCol
        );
      });
    });
  }

  tables.forEach(function (table) {
    table.querySelectorAll('.sm-version-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var col = Number(btn.dataset.col);
        focusedCol = focusedCol === col ? null : col;
        applyFocus();
      });
    });

    // Row highlight: hovering any cell lights up its whole row.
    table.querySelectorAll('.sm-cell').forEach(function (cell) {
      var row = cell.closest('tr');
      cell.addEventListener('mouseenter', function () {
        if (row) row.classList.add('sm-row-hover');
      });
      cell.addEventListener('mouseleave', function () {
        if (row) row.classList.remove('sm-row-hover');
      });
    });

    wireAdvisor(table);
  });

  // --- Upgrade advisor -------------------------------------------------- //
  // Reads the matrix data straight out of the rendered table, so it never
  // drifts from what's shown in the grid.
  function wireAdvisor(figure) {
    var details = figure.querySelector('.sm-advisor');
    if (!details) return;

    var fromSel = details.querySelector('.adv-from');
    var toSel = details.querySelector('.adv-to');
    var curSel = details.querySelector('.adv-cur');
    var out = details.querySelector('.sm-advisor-result');
    if (!fromSel || !toSel || !curSel || !out) return;

    var name = details.dataset.componentName || 'component';

    // Mastodon versions, indexed by column.
    var versions = [];
    figure.querySelectorAll('.sm-version-btn').forEach(function (b) {
      versions[Number(b.dataset.col)] = b.dataset.version;
    });

    // Rows of { version, states[] } pulled from the tbody.
    var rows = Array.prototype.slice
      .call(figure.querySelectorAll('tbody tr'))
      .map(function (tr) {
        var head = tr.querySelector('.sm-row-head');
        var states = [];
        tr.querySelectorAll('.sm-cell').forEach(function (td) {
          states[Number(td.dataset.col)] = td.dataset.state;
        });
        return { version: head ? head.textContent.trim() : '', states: states };
      });

    function render(kind, msg) {
      out.textContent = msg;
      out.className = 'sm-advisor-result is-' + kind;
    }

    function update() {
      var res = window.MastoAdvisor.recommend({
        name: name,
        rows: rows,
        versions: versions,
        fromCol: Number(fromSel.value),
        toCol: Number(toSel.value),
        cur: curSel.value,
      });
      render(res.kind, res.msg);
    }

    fromSel.addEventListener('change', update);
    toSel.addEventListener('change', update);
    curSel.addEventListener('change', update);
    update();
  }
})();
