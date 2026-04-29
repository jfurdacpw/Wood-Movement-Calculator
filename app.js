(function () {
  "use strict";

  /** @type {{ name: string; quarter: number; flat: number }[]} */
  let species = [];

  /** @type {number | null} global species index when user picked from list */
  let highlightedSpeciesIndex = null;

  /** Indices currently shown in the dropdown (subset of species, in order) */
  let displayedSpeciesIndices = [];

  /** Keyboard highlight within displayedSpeciesIndices */
  let listActivePos = -1;

  let lockInputSync = false;

  const LIST_MAX = 200;

  const boardWidthEl = document.getElementById("boardWidth");
  const moistureEl = document.getElementById("moistureVariance");
  const comboInput = document.getElementById("speciesComboboxInput");
  const comboList = document.getElementById("speciesComboboxList");
  const comboRoot = document.getElementById("speciesCombobox");
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

  function setListOpen(open) {
    comboList.hidden = !open;
    comboInput.setAttribute("aria-expanded", open ? "true" : "false");
    comboRoot.classList.toggle("species-combobox--open", open);
  }

  function closeList() {
    setListOpen(false);
    listActivePos = -1;
  }

  function openList() {
    setListOpen(true);
  }

  function updateHighlightSummary(w, m) {
    const row =
      highlightedSpeciesIndex !== null &&
      highlightedSpeciesIndex >= 0 &&
      highlightedSpeciesIndex < species.length
        ? species[highlightedSpeciesIndex]
        : null;
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

    updateHighlightSummary(w, m);

    const frag = document.createDocumentFragment();
    for (let i = 0; i < species.length; i++) {
      const row = species[i];
      const { quarter: mq, flat: mf } = movement(row.quarter, row.flat, w, m);
      const tr = document.createElement("tr");
      if (highlightedSpeciesIndex === i) {
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

  function collectMatchingIndices() {
    const q = comboInput.value.trim().toLowerCase();
    const out = [];
    for (let i = 0; i < species.length; i++) {
      if (!q || species[i].name.toLowerCase().includes(q)) {
        out.push(i);
      }
    }
    return out;
  }

  function syncListActiveClass() {
    const items = comboList.querySelectorAll("li[data-index]");
    for (let p = 0; p < items.length; p++) {
      const li = items[p];
      if (p === listActivePos) {
        li.classList.add("is-active");
        li.setAttribute("aria-selected", "true");
        li.scrollIntoView({ block: "nearest" });
      } else {
        li.classList.remove("is-active");
        li.removeAttribute("aria-selected");
      }
    }
  }

  function rebuildSpeciesList() {
    const allMatch = collectMatchingIndices();
    const truncated = allMatch.length > LIST_MAX;
    displayedSpeciesIndices = truncated ? allMatch.slice(0, LIST_MAX) : allMatch;

    comboList.replaceChildren();
    const frag = document.createDocumentFragment();

    if (displayedSpeciesIndices.length === 0) {
      const li = document.createElement("li");
      li.className = "species-combobox__empty";
      li.role = "presentation";
      li.textContent = "No matching species";
      frag.appendChild(li);
      listActivePos = -1;
    } else {
      for (let p = 0; p < displayedSpeciesIndices.length; p++) {
        const i = displayedSpeciesIndices[p];
        const li = document.createElement("li");
        li.role = "option";
        li.dataset.index = String(i);
        li.textContent = species[i].name;
        li.addEventListener("mousedown", function (e) {
          e.preventDefault();
          selectSpeciesByIndex(i);
        });
        frag.appendChild(li);
      }
      if (truncated) {
        const li = document.createElement("li");
        li.className = "species-combobox__trunc";
        li.role = "presentation";
        li.textContent =
          "Showing first " +
          LIST_MAX +
          " of " +
          allMatch.length +
          " matches — keep typing to narrow";
        frag.appendChild(li);
      }
      listActivePos = 0;
    }

    comboList.appendChild(frag);
    if (displayedSpeciesIndices.length > 0) {
      syncListActiveClass();
    }
  }

  function selectSpeciesByIndex(i) {
    if (i < 0 || i >= species.length) return;
    lockInputSync = true;
    highlightedSpeciesIndex = i;
    comboInput.value = species[i].name;
    lockInputSync = false;
    closeList();
    render();
  }

  function onComboInput() {
    if (lockInputSync) return;
    if (highlightedSpeciesIndex !== null) {
      const sel = species[highlightedSpeciesIndex];
      if (sel && comboInput.value.trim().toLowerCase() === sel.name.toLowerCase()) {
        rebuildSpeciesList();
        openList();
        return;
      }
      highlightedSpeciesIndex = null;
      render();
    }
    rebuildSpeciesList();
    openList();
  }

  function onComboKeydown(e) {
    const items = comboList.querySelectorAll("li[data-index]");
    if (!comboList.hidden && items.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        listActivePos = Math.min(listActivePos + 1, items.length - 1);
        syncListActiveClass();
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        listActivePos = Math.max(listActivePos - 1, 0);
        syncListActiveClass();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (listActivePos >= 0 && listActivePos < displayedSpeciesIndices.length) {
          selectSpeciesByIndex(displayedSpeciesIndices[listActivePos]);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        closeList();
        return;
      }
    }
  }

  function onDocumentPointerDown(e) {
    if (!comboRoot.contains(e.target)) {
      closeList();
    }
  }

  async function init() {
    const res = await fetch("./species.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load species.json");
    const raw = await res.json();
    species = normalizeSpeciesRows(raw);
    if (species.length === 0) {
      throw new Error("species.json has no valid species rows (need name + quarter + flat)");
    }

    render();

    const scheduleRender = debounce(render, 120);
    boardWidthEl.addEventListener("input", scheduleRender);
    moistureEl.addEventListener("input", scheduleRender);

    comboInput.addEventListener("input", onComboInput);
    comboInput.addEventListener("keydown", onComboKeydown);

    document.addEventListener("pointerdown", onDocumentPointerDown);
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
