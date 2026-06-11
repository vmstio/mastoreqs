// Shared upgrade-advice logic, used by both the per-page SupportMatrix advisors
// (matrix.js) and the combined Upgrade Advisor (upgrade-advisor.js). Pure: it
// takes plain data and returns a { kind, msg } result, with no DOM access, so
// the two surfaces can never give conflicting guidance.
(function () {
  // Human-readable list: "3.4", "3.4 or 3.3", "3.4, 3.3, or 3.2".
  function formatList(arr) {
    if (arr.length === 0) return '';
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(', ') + ', or ' + arr[arr.length - 1];
  }

  function rowFor(rows, ver) {
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].version === ver) return rows[i];
    }
    return null;
  }
  // Versions fully supported on a given column, newest first (data order).
  function supportedOn(rows, col) {
    return rows
      .filter(function (r) { return r.states[col] === 'yes'; })
      .map(function (r) { return r.version; });
  }
  // Versions supported on both columns — safe to move to before the upgrade.
  function bridgeBetween(rows, a, b) {
    return rows
      .filter(function (r) { return r.states[a] === 'yes' && r.states[b] === 'yes'; })
      .map(function (r) { return r.version; });
  }

  // opts: { name, rows, versions, fromCol, toCol, cur }
  //   name     – display name for the dependency ("Ruby", "Redis", …)
  //   rows     – [{ version, states[] }] where states are 'yes'|'warn'|'no'|'na'
  //   versions – Mastodon version labels indexed by column
  //   fromCol  – column index of the current Mastodon version
  //   toCol    – column index of the target Mastodon version
  //   cur      – the selected dependency version, or '' for none
  // Returns { kind: 'neutral'|'ok'|'warn'|'required', msg }.
  function recommend(opts) {
    var name = opts.name, rows = opts.rows, versions = opts.versions;
    var fromCol = opts.fromCol, toCol = opts.toCol, cur = opts.cur;
    var fromVer = versions[fromCol], toVer = versions[toCol];

    // Mastodon has no supported downgrade path. Versions are listed newest
    // first, so a higher target column index means an older release.
    if (toCol > fromCol) {
      return { kind: 'required', msg: 'Mastodon does not support downgrades — ' +
        toVer + ' is older than your current ' + fromVer +
        '. Choose a target of ' + fromVer + ' or newer.' };
    }

    if (cur === '' || cur == null) {
      return { kind: 'neutral', msg: 'Select your current ' + name +
        ' version to see upgrade guidance.' };
    }

    var row = rowFor(rows, cur);
    var stateTarget = row ? row.states[toCol] : 'na';
    var stateNow = row ? row.states[fromCol] : 'na';
    var supTarget = supportedOn(rows, toCol); // newest first
    var bridge = bridgeBetween(rows, fromCol, toCol);

    // Flag an already-invalid current setup, but don't let it mask the
    // forward-looking advice.
    var nowNote = '';
    if (fromCol !== toCol && (stateNow === 'no' || stateNow === 'na')) {
      nowNote = ' Note: ' + name + ' ' + cur +
        ' is not a supported configuration on Mastodon ' + fromVer + ' either.';
    }

    if (stateTarget === 'yes') {
      return { kind: 'ok', msg: name + ' ' + cur +
        ' is fully supported on Mastodon ' + toVer + '.' + (fromCol === toCol
          ? ' Nothing to change.'
          : ' You can upgrade Mastodon without changing ' + name + '.') + nowNote };
    }

    if (stateTarget === 'warn') {
      // Already runs on the target, just deprecated — prefer a version that also
      // works on the current release so it can be done independently.
      var pref = bridge.length ? bridge[0] : supTarget[0];
      return { kind: 'warn', msg: name + ' ' + cur + ' still works on Mastodon ' +
        toVer + ' but is deprecated (use with caution).' +
        (pref ? ' For full support, move to ' + name + ' ' + pref + '.' : '') + nowNote };
    }

    // 'no' or 'na' — current version will not run on the target.
    if (bridge.length) {
      return { kind: 'required', msg: name + ' ' + cur +
        ' is not supported on Mastodon ' + toVer + '. Upgrade ' + name + ' to ' +
        bridge[0] + ', which is supported on both Mastodon ' + fromVer + ' and ' +
        toVer + ' — upgrade ' + name + ' first, then Mastodon.' + nowNote };
    }
    if (supTarget.length) {
      return { kind: 'required', msg: name + ' ' + cur +
        ' is not supported on Mastodon ' + toVer + '. Upgrade ' + name +
        ' to a version supported on ' + toVer + ' (' + formatList(supTarget) +
        '). No version is supported on both ' + fromVer + ' and ' + toVer +
        ', so coordinate this with the Mastodon upgrade.' + nowNote };
    }
    return { kind: 'required', msg: 'No supported ' + name +
      ' version is listed for Mastodon ' + toVer + '.' + nowNote };
  }

  window.MastoAdvisor = {
    recommend: recommend,
    formatList: formatList,
    supportedOn: supportedOn,
    bridgeBetween: bridgeBetween,
  };
})();
