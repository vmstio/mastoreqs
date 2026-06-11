// Drives the combined Upgrade Advisor (UpgradeAdvisor.astro). Reads the embedded
// matrix data, then for each dependency renders advice via the shared
// window.MastoAdvisor core. A no-op on pages without the advisor.
(function () {
  var root = document.querySelector('.advisor[data-advisor]');
  if (!root || !window.MastoAdvisor) return;

  var dataEl = root.querySelector('[data-advisor-data]');
  var data = JSON.parse(dataEl.textContent);
  var versions = data.mastodonVersions; // Mastodon labels indexed by column
  var matrices = data.matrices; // "component:matrix" -> [{ version, states[] }]

  var fromSel = root.querySelector('.uadv-from');
  var toSel = root.querySelector('.uadv-to');
  var globalNote = root.querySelector('.uadv-global-note');
  var sections = Array.prototype.slice.call(
    root.querySelectorAll('.uadv-section')
  );

  // The matrix key for a section: a provider section reads it off the selected
  // backend option; a single section has it fixed in data-key.
  function keyFor(sec) {
    var prov = sec.querySelector('.uadv-provider');
    return prov ? prov.value : sec.dataset.key;
  }
  // Display name used in the advice copy: the chosen backend's label, or the
  // section's own name for single-backend dependencies.
  function nameFor(sec) {
    var prov = sec.querySelector('.uadv-provider');
    if (prov) {
      var opt = prov.options[prov.selectedIndex];
      return (opt && opt.dataset.label) || 'backend';
    }
    return sec.dataset.name || sec.dataset.section;
  }

  // Repopulate a provider section's version <select> from the chosen backend.
  function populateVersions(sec) {
    var cur = sec.querySelector('.uadv-cur');
    var key = keyFor(sec);
    cur.innerHTML = '';
    var ph = document.createElement('option');
    ph.value = '';
    ph.textContent = 'Select…';
    cur.appendChild(ph);
    if (key && matrices[key]) {
      matrices[key].forEach(function (r) {
        var o = document.createElement('option');
        o.value = r.version;
        o.textContent = r.version;
        cur.appendChild(o);
      });
      cur.disabled = false;
    } else {
      cur.disabled = true;
    }
  }

  function setResult(sec, kind, msg) {
    var out = sec.querySelector('.uadv-result');
    out.textContent = msg;
    out.className = 'uadv-result is-' + kind;
  }

  // ImageMagick is deprecated in Mastodon 4.4 and removed in 4.6, so the generic
  // "pick another ImageMagick version" advice is wrong here — steer to libvips.
  function imageMagickAdvice(cur, toCol) {
    var toVer = versions[toCol];
    var imRows = matrices['libvips:imagemagick'];
    var libRows = matrices['libvips:libvips'];
    var libRec = window.MastoAdvisor.supportedOn(libRows, toCol)[0]; // newest
    var libSuffix = libRec ? ' libvips ' + libRec + ' is supported on ' + toVer + '.' : '';

    var row = null;
    for (var i = 0; i < imRows.length; i++) {
      if (imRows[i].version === cur) { row = imRows[i]; break; }
    }
    var state = row ? row.states[toCol] : 'na';

    if (state === 'yes') {
      return { kind: 'warn', msg: 'ImageMagick ' + cur +
        ' is supported on Mastodon ' + toVer + ', but ImageMagick is deprecated ' +
        'from 4.4 and removed in 4.6. Plan to switch to libvips before 4.6.' +
        (libRec ? ' ' + libSuffix : '') };
    }
    if (state === 'warn') {
      return { kind: 'warn', msg: 'ImageMagick ' + cur + ' still runs on Mastodon ' +
        toVer + ' but is deprecated and is removed in 4.6. Migrate to libvips.' +
        libSuffix };
    }
    return { kind: 'required', msg: 'ImageMagick is not supported on Mastodon ' +
      toVer + ' — it was removed in 4.6. Switch to libvips.' + libSuffix };
  }

  function update() {
    var fromCol = Number(fromSel.value);
    var toCol = Number(toSel.value);

    // One downgrade banner for the whole form rather than repeating it per row.
    if (toCol > fromCol) {
      globalNote.hidden = false;
      globalNote.textContent = 'Mastodon does not support downgrades — ' +
        versions[toCol] + ' is older than your current ' + versions[fromCol] +
        '. Choose a target of ' + versions[fromCol] + ' or newer.';
      sections.forEach(function (sec) { setResult(sec, 'neutral', '—'); });
      return;
    }
    globalNote.hidden = true;
    globalNote.textContent = '';

    sections.forEach(function (sec) {
      var prov = sec.querySelector('.uadv-provider');
      var cur = sec.querySelector('.uadv-cur');
      var key = keyFor(sec);
      var optional = sec.dataset.optional === 'true';

      if (prov && key === '') {
        setResult(sec, 'neutral', optional
          ? 'Not in use — nothing to plan.'
          : 'Choose which backend you run to see guidance.');
        return;
      }
      if (!key || !matrices[key]) {
        setResult(sec, 'neutral', 'Select your version to see upgrade guidance.');
        return;
      }

      // Image processor: once a real version is chosen and ImageMagick is the
      // backend, hand off to the libvips-aware advice.
      if (sec.dataset.image === 'true' && key === 'libvips:imagemagick' && cur.value !== '') {
        var im = imageMagickAdvice(cur.value, toCol);
        setResult(sec, im.kind, im.msg);
        return;
      }

      var res = window.MastoAdvisor.recommend({
        name: nameFor(sec),
        rows: matrices[key],
        versions: versions,
        fromCol: fromCol,
        toCol: toCol,
        cur: cur.value,
      });
      setResult(sec, res.kind, res.msg);
    });
  }

  sections.forEach(function (sec) {
    var prov = sec.querySelector('.uadv-provider');
    var cur = sec.querySelector('.uadv-cur');
    if (prov) {
      prov.addEventListener('change', function () {
        populateVersions(sec);
        update();
      });
      populateVersions(sec);
    }
    cur.addEventListener('change', update);
  });

  fromSel.addEventListener('change', update);
  toSel.addEventListener('change', update);
  update();
})();
