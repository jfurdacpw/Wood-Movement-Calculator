(function () {
  "use strict";

  /** @type {{ name: string; quarter: number; flat: number }[]} */
  let species = [];

  const boardWidthEl = document.getElementById("boardWidth");
  const moistureEl = document.getElementById("moistureVariance");
  const highlightEl = document.getElementById("speciesHighlight");
  const tbody = document.getElementById("speciesBody");
  const highlightSummaryEl = document.getElementById("highlightSummary");
  const highlightSummaryNameEl = document.getElementById("highlightSummaryName");
  const hsQuarterCoeffEl = document.getElementById("hsQuarterCoeff");
  const hsFlatCoeffEl = document.getElementById("hsFlatCoeff");
  const hsMoveQuarterEl = document.getElementById("hsMoveQuarter");
  const hsMoveFlatEl = document.getElementById("hsMoveFlat");

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

    tbody.replaceChildren();
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
      tbody.appendChild(tr);
    }
  }

  function fillHighlightOptions() {
    const current = highlightEl.value;
    highlightEl.replaceChildren();
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "— None —";
    highlightEl.appendChild(none);
    for (let i = 0; i < species.length; i++) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = species[i].name;
      highlightEl.appendChild(opt);
    }
    if (current !== "" && species[Number(current)]) {
      highlightEl.value = current;
    }
  }

  async function init() {
    const res = await fetch("./species.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load species.json");
    species = await res.json();
    fillHighlightOptions();
    render();

    boardWidthEl.addEventListener("input", render);
    moistureEl.addEventListener("input", render);
    highlightEl.addEventListener("change", render);
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
