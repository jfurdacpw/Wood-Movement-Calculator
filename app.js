(function () {
  "use strict";

  /** @type {{ name: string; quarter: number; flat: number }[]} */
  let species = [];

  const boardWidthEl = document.getElementById("boardWidth");
  const moistureEl = document.getElementById("moistureVariance");
  const highlightEl = document.getElementById("speciesHighlight");
  const speciesSearchEl = document.getElementById("speciesSearch");
  const tbody = document.getElementById("speciesBody");
  const highlightSummaryEl = document.getElementById("highlightSummary");
  const highlightSummaryNameEl = document.getElementById("highlightSummaryName");
  const hsQuarterCoeffEl = document.getElementById("hsQuarterCoeff");
  const hsFlatCoeffEl = document.getElementById("hsFlatCoeff");
  const hsMoveQuarterEl = document.getElementById("hsMoveQuarter");
  const hsMoveFlatEl = document.getElementById("hsMoveFlat");

  /**
   * Accepts a top-level array or an object with a species array.
   * Coerces string numbers; supports common alternate key names.
   * Drops rows without a usable name or finite coefficients.
   * @param {unknown} raw
   * @returns {{ name: string; quarter: number; flat: number }[]}
   */
  function normalizeSpeciesRows(raw) {
    /** @type {unknown[]} */
    let arr = [];
    if (Array.isArray(raw)) {
      arr = raw;
    } else if (raw && typeof raw === "object") {
      const o = /** @type {Record<string, unknown>} */ (raw);
      if (Array.isArray(o.species)) arr = o.species;
      else if (Array.isArray(o.data)) arr = o.data;
      else if (Array.isArray(o.rows)) arr = o.rows;
    }

    function parseCoeff(v) {
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string") {
        const n = parseFloat(String(v).replace(",", "."), 10);
        return Number.isFinite(n) ? n : NaN;
      }
      return NaN;
    }

    const out = [];
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (!item || typeof item !== "object") continue;
      const rec = /** @type {Record<string, unknown>} */ (item);
      const nameRaw =
        rec.name ?? rec.material ?? rec.species ?? rec.wood ?? rec.speciesName;
      if (nameRaw === undefined || nameRaw === null) continue;
      const name = String(nameRaw).trim();
      if (!name) continue;

      const q = parseCoeff(
        rec.quarter ?? rec.quarterCoeff ?? rec.radial ?? rec.q ?? rec.Quarter
      );
      const f = parseCoeff(
        rec.flat ?? rec.flatCoeff ?? rec.tangential ?? rec.t ?? rec.Flat
      );
      if (!Number.isFinite(q) || !Number.isFinite(f)) continue;
      out.push({ name, quarter: q, flat: f });
    }
    return out;
  }

  function parsePositiveNumber(el, fallback) {
    const v = parseFloat(String(el.value).replace(",", "."), 10);
    if (!Number.isFinite(v) || v < 0) return fallback;
    return v;
  }

  function formatCoeff(n) {
    if (!Number.isFinite(n)) return "—";
    const s = n.toFixed(4);
    return s.replace(/\.?0+$/, "");
  }

  function formatMovement(n) {
    if (!Number.isFinite(n)) return "—";
    const rounded = Math.round(n * 1000) / 1000;
    return String(rounded);
  }

  function movement(quarterCoeff, flatCoeff, boardWidth, moistureVariance) {
    const mq = quarterCoeff * boardWidth * moistureVariance * 100;
    const mf = flatCoeff * boardWidth * moistureVariance * 100;
    return { quarter: mq, flat: mf };
  }

  function debounce(fn, waitMs) {
    let t = 0;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, waitMs);
    };
  }

  function updateHighlightSummary(w, m, highlight) {
    const idx = highlight === "" ? NaN : Number(highlight);
    const row = Number.isInteger(idx) && idx >= 0 && idx < species.length ? species[idx] : null;
    if (!row) {
      highlightSummaryEl.hidden = true;
      return;
    }
    const { quarter: mq, flat: mf } = movement(row.quarter, row.flat, w, m);
    highlightSummaryNameEl.textContent = row.name;
    hsQuarterCoeffEl.textContent = formatCoeff(row.quarter);
    hsFlatCoeffEl.textContent = formatCoeff(row.flat);
    hsMoveQuarterEl.textContent = formatMovement(mq);
    hsMoveFlatEl.textContent = formatMovement(mf);
    highlightSummaryEl.hidden = false;
  }

  function render() {
    const w = parsePositiveNumber(boardWidthEl, 72);
    const m = parsePositiveNumber(moistureEl, 0.05);
    const highlight = highlightEl.value;

    updateHighlightSummary(w, m, highlight);

    const frag = document.createDocumentFragment();
    for (let i = 0; i < species.length; i++) {
      const row = species[i];
      const { quarter: mq, flat: mf } = movement(row.quarter, row.flat, w, m);
      const tr = document.createElement("tr");
      if (highlight !== "" && Number(highlight) === i) {
        tr.classList.add("is-highlighted");
      }
      const nameTd = document.createElement("td");
      nameTd.textContent = row.name;
      const qTd = document.createElement("td");
      qTd.className = "num";
      qTd.textContent = formatCoeff(row.quarter);
      const fTd = document.createElement("td");
      fTd.className = "num";
      fTd.textContent = formatCoeff(row.flat);
      const mqTd = document.createElement("td");
      mqTd.className = "num";
      mqTd.textContent = formatMovement(mq);
      const mfTd = document.createElement("td");
      mfTd.className = "num";
      mfTd.textContent = formatMovement(mf);
      tr.append(nameTd, qTd, fTd, mqTd, mfTd);
      frag.appendChild(tr);
    }
    tbody.replaceChildren(frag);
  }

  function highlightFilterQuery() {
    if (!speciesSearchEl) return "";
    return String(speciesSearchEl.value).trim().toLowerCase();
  }

  /**
   * Rebuilds highlight select options. Optional filter narrows by species name (substring, case-insensitive).
   * Option values remain global species indices so the table and summary stay aligned.
   * @returns {boolean} true if the previous selection is still valid after rebuild
   */
  function fillHighlightOptions() {
    const q = highlightFilterQuery();
    const current = highlightEl.value;
    const frag = document.createDocumentFragment();
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "— None —";
    frag.appendChild(none);

    let keptSelection = false;
    for (let i = 0; i < species.length; i++) {
      if (q && !species[i].name.toLowerCase().includes(q)) continue;
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = species[i].name;
      frag.appendChild(opt);
      if (current !== "" && current === String(i)) keptSelection = true;
    }

    highlightEl.replaceChildren(frag);
    if (current !== "" && keptSelection) {
      highlightEl.value = current;
      return true;
    }
    if (current !== "") {
      highlightEl.value = "";
      return false;
    }
    highlightEl.value = "";
    return true;
  }

  async function init() {
    const res = await fetch("./species.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load species.json");
    const raw = await res.json();
    species = normalizeSpeciesRows(raw);
    if (species.length === 0) {
      throw new Error("species.json has no valid species rows (need name + quarter + flat)");
    }
    fillHighlightOptions();
    render();

    const scheduleRender = debounce(render, 120);
    boardWidthEl.addEventListener("input", scheduleRender);
    moistureEl.addEventListener("input", scheduleRender);
    highlightEl.addEventListener("change", render);

    const scheduleFilter = debounce(function () {
      const prev = highlightEl.value;
      const stillValid = fillHighlightOptions();
      if (prev !== "" && !stillValid) {
        render();
      }
    }, 80);
    if (speciesSearchEl) {
      speciesSearchEl.addEventListener("input", scheduleFilter);
    }
  }

  init().catch(function (err) {
    tbody.innerHTML = "";
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.textContent = "Could not load data. " + (err && err.message ? err.message : "");
    tr.appendChild(td);
    tbody.appendChild(tr);
  });
})();
