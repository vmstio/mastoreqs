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

    function rowFor(ver) {
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].version === ver) return rows[i];
      }
      return null;
    }
    // Versions fully supported on a given column, newest first (DOM order).
    function supportedOn(col) {
      return rows
        .filter(function (r) { return r.states[col] === 'yes'; })
        .map(function (r) { return r.version; });
    }
    // Versions supported on both columns — safe to move to before the upgrade.
    function bridgeBetween(a, b) {
      return rows
        .filter(function (r) {
          return r.states[a] === 'yes' && r.states[b] === 'yes';
        })
        .map(function (r) { return r.version; });
    }

    // Human-readable list: "3.4", "3.4 or 3.3", "3.4, 3.3, or 3.2".
    function formatList(arr) {
      if (arr.length === 0) return '';
      if (arr.length === 1) return arr[0];
      return arr.slice(0, -1).join(', ') + ', or ' + arr[arr.length - 1];
    }

    function render(kind, msg) {
      out.textContent = msg;
      out.className = 'sm-advisor-result is-' + kind;
    }

    function update() {
      var fromCol = Number(fromSel.value);
      var toCol = Number(toSel.value);
      var fromVer = versions[fromCol];
      var toVer = versions[toCol];

      // Mastodon has no supported downgrade path. Versions are listed newest
      // first, so a higher target column index means an older release. Flag
      // this regardless of the component version selected.
      if (toCol > fromCol) {
        render('required', 'Mastodon does not support downgrades — ' + toVer +
          ' is older than your current ' + fromVer +
          '. Choose a target of ' + fromVer + ' or newer.');
        return;
      }

      var cur = curSel.value;
      if (cur === '') {
        render('neutral', 'Select your current ' + name +
          ' version to see upgrade guidance.');
        return;
      }

      var row = rowFor(cur);
      var stateTarget = row ? row.states[toCol] : 'na';
      var stateNow = row ? row.states[fromCol] : 'na';
      var supTarget = supportedOn(toCol); // newest first
      // Versions supported on both releases — the safe "upgrade first" target.
      var bridge = bridgeBetween(fromCol, toCol);

      // Flag an already-invalid current setup, but don't let it mask the
      // forward-looking advice.
      var nowNote = '';
      if (fromCol !== toCol && (stateNow === 'no' || stateNow === 'na')) {
        nowNote = ' Note: ' + name + ' ' + cur +
          ' is not a supported configuration on Mastodon ' + fromVer +
          ' either.';
      }

      if (stateTarget === 'yes') {
        render('ok', name + ' ' + cur + ' is fully supported on Mastodon ' +
          toVer + '.' + (fromCol === toCol
            ? ' Nothing to change.'
            : ' You can upgrade Mastodon without changing ' + name + '.') +
          nowNote);
        return;
      }

      if (stateTarget === 'warn') {
        // Already runs on the target, just deprecated — prefer a version that
        // also works on the current release so it can be done independently.
        var pref = bridge.length ? bridge[0] : supTarget[0];
        render('warn', name + ' ' + cur + ' still works on Mastodon ' + toVer +
          ' but is deprecated (use with caution).' +
          (pref ? ' For full support, move to ' + name + ' ' + pref + '.' : '') +
          nowNote);
        return;
      }

      // 'no' or 'na' — current version will not run on the target.
      if (bridge.length) {
        render('required', name + ' ' + cur +
          ' is not supported on Mastodon ' + toVer + '. Upgrade ' + name +
          ' to ' + bridge[0] + ', which is supported on both Mastodon ' +
          fromVer + ' and ' + toVer + ' — upgrade ' + name +
          ' first, then Mastodon.' + nowNote);
      } else if (supTarget.length) {
        render('required', name + ' ' + cur +
          ' is not supported on Mastodon ' + toVer + '. Upgrade ' + name +
          ' to a version supported on ' + toVer + ' (' +
          formatList(supTarget) + '). No version is supported on both ' +
          fromVer + ' and ' + toVer + ', so coordinate this with the Mastodon ' +
          'upgrade.' + nowNote);
      } else {
        render('required', 'No supported ' + name +
          ' version is listed for Mastodon ' + toVer + '.' + nowNote);
      }
    }

    fromSel.addEventListener('change', update);
    toSel.addEventListener('change', update);
    curSel.addEventListener('change', update);
    update();
  }
})();
