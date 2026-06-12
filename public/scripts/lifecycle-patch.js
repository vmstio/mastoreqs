// Fills the "Latest Patch" column on the Support Lifecycle table from the
// vmcrawl release-versions API. Loaded once per page via Starlight's `head`
// config with `defer`, so the DOM is parsed when this runs. Pages without the
// lifecycle table are a harmless no-op.
//
// Progressive enhancement: the cells render "—" server-side and are only
// upgraded on a successful fetch, so a blocked/failed request leaves the table
// reading correctly.
(function () {
  var cells = Array.prototype.slice.call(
    document.querySelectorAll('.lc-patch')
  );
  // Diagram version labels (e.g. "4.5.x") that should resolve to the same
  // patch numbers as the table.
  var labels = Array.prototype.slice.call(
    document.querySelectorAll('.lc-version[data-version]')
  );
  if (cells.length === 0 && labels.length === 0) return; // not the lifecycle page

  fetch('https://vmcrawl.com/stats/release-versions')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      // Map branch -> { latest, status }, including the development (main)
      // branch. `status` lets us decide whether the main row gets a link.
      var byBranch = {};
      (data.release_versions || []).forEach(function (r) {
        byBranch[r.branch] = { latest: r.latest, status: r.status };
      });

      cells.forEach(function (cell) {
        var info = byBranch[cell.dataset.version];
        if (!info || !info.latest) return;

        // Link to the matching GitHub release tag (tags are `v`-prefixed).
        // The main branch only links when it's a beta/rc pre-release, since a
        // plain main build has no published release page.
        var isPrerelease = /-(?:beta|rc)\b/i.test(info.latest);
        var linkable = info.status !== 'main' || isPrerelease;

        if (linkable) {
          var a = document.createElement('a');
          a.href =
            'https://github.com/mastodon/mastodon/releases/tag/v' + info.latest;
          a.textContent = info.latest;
          cell.textContent = '';
          cell.appendChild(a);
        } else {
          cell.textContent = info.latest;
        }
      });

      // Diagram: replace the "4.5.x" placeholder with the actual patch.
      labels.forEach(function (label) {
        var info = byBranch[label.dataset.version];
        if (info && info.latest) label.textContent = info.latest;
      });
    })
    .catch(function (err) {
      console.warn('[lifecycle-patch] fetch failed:', err);
    });
})();
