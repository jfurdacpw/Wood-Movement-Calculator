import { useState, useRef } from "react";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');`;

const styles = `
  ${FONT}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --bark: #2C1A0E;
    --heartwood: #7B3F1A;
    --sapwood: #C4894A;
    --grain: #E8C99A;
    --pith: #F7EBD8;
    --moss: #4A5E3A;
    --fog: #8B9E7A;
    --paper: #FAF4EC;
  }

  body { background: var(--paper); font-family: 'DM Sans', sans-serif; }

  .app {
    min-height: 100vh;
    background: var(--paper);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px 80px;
    position: relative;
    overflow: hidden;
  }

  .app::before {
    content: '';
    position: fixed;
    inset: 0;
    background: 
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(196,137,74,0.07) 39px, rgba(196,137,74,0.07) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(196,137,74,0.05) 39px, rgba(196,137,74,0.05) 40px);
    pointer-events: none;
    z-index: 0;
  }

  .header {
    text-align: center;
    margin-bottom: 48px;
    position: relative;
    z-index: 1;
  }

  .header-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.25em;
    color: var(--sapwood);
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .header h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2rem, 5vw, 3.5rem);
    color: var(--bark);
    line-height: 1.1;
    margin-bottom: 8px;
  }

  .header h1 em {
    color: var(--heartwood);
    font-style: italic;
  }

  .header-sub {
    font-size: 14px;
    color: var(--fog);
    font-weight: 300;
  }

  .divider {
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--sapwood), transparent);
    margin: 20px auto;
  }

  .card {
    background: white;
    border: 1px solid rgba(196,137,74,0.2);
    border-radius: 4px;
    padding: 32px;
    width: 100%;
    max-width: 680px;
    position: relative;
    z-index: 1;
    box-shadow: 0 2px 20px rgba(44,26,14,0.06), 4px 4px 0 rgba(196,137,74,0.15);
  }

  .section-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--sapwood);
    text-transform: uppercase;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(196,137,74,0.2);
  }

  .search-row {
    display: flex;
    gap: 10px;
    margin-bottom: 28px;
  }

  .search-input {
    flex: 1;
    padding: 12px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: var(--bark);
    background: var(--pith);
    border: 1.5px solid rgba(196,137,74,0.3);
    border-radius: 3px;
    outline: none;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    border-color: var(--sapwood);
  }

  .search-input::placeholder { color: rgba(139,110,74,0.45); }

  .btn {
    padding: 12px 22px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.1em;
    cursor: pointer;
    border-radius: 3px;
    border: none;
    transition: all 0.15s;
  }

  .btn-primary {
    background: var(--heartwood);
    color: white;
  }

  .btn-primary:hover:not(:disabled) { background: var(--bark); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .inputs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 28px;
  }

  .input-group label {
    display: block;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    color: var(--fog);
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .input-group input {
    width: 100%;
    padding: 10px 14px;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    color: var(--bark);
    background: var(--pith);
    border: 1.5px solid rgba(196,137,74,0.3);
    border-radius: 3px;
    outline: none;
    transition: border-color 0.2s;
  }

  .input-group input:focus { border-color: var(--sapwood); }

  .unit-toggle {
    display: flex;
    gap: 0;
    margin-bottom: 28px;
  }

  .unit-btn {
    flex: 1;
    padding: 8px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    cursor: pointer;
    border: 1.5px solid rgba(196,137,74,0.3);
    background: var(--pith);
    color: var(--fog);
    transition: all 0.15s;
  }

  .unit-btn:first-child { border-radius: 3px 0 0 3px; }
  .unit-btn:last-child { border-radius: 0 3px 3px 0; border-left: none; }

  .unit-btn.active {
    background: var(--heartwood);
    color: white;
    border-color: var(--heartwood);
  }

  .wood-found {
    background: var(--pith);
    border: 1px solid rgba(196,137,74,0.25);
    border-radius: 3px;
    padding: 16px 20px;
    margin-bottom: 28px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .wood-icon {
    font-size: 28px;
    line-height: 1;
    flex-shrink: 0;
  }

  .wood-found-info h3 {
    font-family: 'DM Serif Display', serif;
    font-size: 18px;
    color: var(--bark);
    margin-bottom: 2px;
  }

  .wood-found-info .sci-name {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--sapwood);
    font-style: italic;
    margin-bottom: 8px;
  }

  .shrink-chips {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .chip {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    padding: 3px 10px;
    border-radius: 2px;
    background: white;
    border: 1px solid rgba(196,137,74,0.3);
    color: var(--heartwood);
  }

  .results {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 28px;
  }

  .result-box {
    border: 1px solid rgba(196,137,74,0.2);
    border-radius: 3px;
    padding: 20px;
    position: relative;
    overflow: hidden;
  }

  .result-box::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
  }

  .result-box.quarter::before { background: linear-gradient(90deg, var(--heartwood), var(--sapwood)); }
  .result-box.flat::before { background: linear-gradient(90deg, var(--moss), var(--fog)); }

  .result-type {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--fog);
    margin-bottom: 10px;
  }

  .result-value {
    font-family: 'DM Serif Display', serif;
    font-size: 2.5rem;
    line-height: 1;
    margin-bottom: 4px;
  }

  .result-box.quarter .result-value { color: var(--heartwood); }
  .result-box.flat .result-value { color: var(--moss); }

  .result-unit {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--fog);
  }

  .result-desc {
    font-size: 11px;
    color: var(--fog);
    margin-top: 8px;
    line-height: 1.5;
  }

  .loading-bar {
    height: 2px;
    background: rgba(196,137,74,0.15);
    border-radius: 1px;
    margin-bottom: 20px;
    overflow: hidden;
  }

  .loading-bar-inner {
    height: 100%;
    background: linear-gradient(90deg, var(--sapwood), var(--heartwood));
    animation: load 1.5s ease-in-out infinite;
    width: 40%;
  }

  @keyframes load {
    0% { transform: translateX(-200%); }
    100% { transform: translateX(400%); }
  }

  .status-msg {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--sapwood);
    text-align: center;
    padding: 10px;
    letter-spacing: 0.05em;
  }

  .error-msg {
    background: #FFF5F0;
    border: 1px solid rgba(200,80,50,0.2);
    border-radius: 3px;
    padding: 12px 16px;
    font-size: 13px;
    color: #8B3020;
    margin-bottom: 20px;
  }

  .formula-note {
    padding: 16px 20px;
    background: rgba(196,137,74,0.06);
    border-left: 3px solid var(--sapwood);
    border-radius: 0 3px 3px 0;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--fog);
    line-height: 1.7;
  }

  .formula-note strong { color: var(--heartwood); }

  .src-link {
    font-size: 10px;
    color: var(--sapwood);
    text-decoration: none;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.05em;
  }

  .src-link:hover { text-decoration: underline; }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--fog);
  }

  .empty-state .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.4;
  }

  .empty-state p {
    font-size: 13px;
    line-height: 1.6;
    font-family: 'DM Mono', monospace;
  }

  @media (max-width: 520px) {
    .inputs-grid, .results { grid-template-columns: 1fr; }
    .search-row { flex-direction: column; }
  }
`;

export default function WoodMovementCalculator() {
  const [query, setQuery] = useState("");
  const [boardWidth, setBoardWidth] = useState(12);
  const [moistureChange, setMoistureChange] = useState(4);
  const [unit, setUnit] = useState("in");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [woodData, setWoodData] = useState(null);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const searchWood = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setWoodData(null);
    setStatusMsg("Searching wood database…");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          system: `You are a wood properties lookup assistant. The user will provide a wood species name.
Search wood-database.com for that species and extract its shrinkage data.
Return ONLY a JSON object (no markdown, no backticks) with this exact structure:
{
  "name": "Common Name",
  "scientific_name": "Scientific name",
  "radial": 4.4,
  "tangential": 7.3,
  "volumetric": 12.6,
  "found": true,
  "url": "https://www.wood-database.com/red-alder/"
}
If the wood is not found or has no shrinkage data, return {"found": false, "name": "..."}.
The radial and tangential values are percentages (shrinkage from green to oven-dry).
Do NOT include any text outside the JSON object.`,
          messages: [{ role: "user", content: `Find shrinkage data for: ${query}` }]
        })
      });

      const data = await response.json();
      setStatusMsg("Parsing results…");

      // Extract text from response
      let text = "";
      for (const block of data.content || []) {
        if (block.type === "text") text += block.text;
      }

      // Parse JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse wood data");

      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.found) {
        setError(`Could not find shrinkage data for "${query}". Try a different name or check wood-database.com directly.`);
      } else {
        setWoodData(parsed);
      }
    } catch (e) {
      setError("Search failed: " + e.message);
    } finally {
      setLoading(false);
      setStatusMsg("");
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") searchWood(); };

  // Calculate movement
  const mc = moistureChange / 100;
  const w = parseFloat(boardWidth) || 0;
  const radCoeff = woodData ? woodData.radial / 100 : 0;
  const tanCoeff = woodData ? woodData.tangential / 100 : 0;

  // Shrinkage coefficients are % per % MC, so divide by 28 (green to oven-dry ≈ 28% MC range)
  // Actually the DB values are total shrinkage from green to oven-dry
  // Coefficient per 1% MC = total_shrinkage% / 28
  const radPerMC = radCoeff / 28;
  const tanPerMC = tanCoeff / 28;

  let quarterMove = w * radPerMC * moistureChange;
  let flatMove = w * tanPerMC * moistureChange;

  if (unit === "mm") {
    quarterMove = quarterMove * 25.4;
    flatMove = flatMove * 25.4;
  }

  const fmt = (n) => n.toFixed(unit === "mm" ? 1 : 3);

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <div className="header-eyebrow">Woodworking Tool</div>
          <h1>Wood <em>Movement</em><br />Calculator</h1>
          <div className="divider" />
          <div className="header-sub">Radial & tangential shrinkage from wood-database.com</div>
        </div>

        <div className="card">
          <div className="section-label">Species Lookup</div>

          <div className="search-row">
            <input
              className="search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="e.g. white oak, black walnut, sapele…"
            />
            <button
              className="btn btn-primary"
              onClick={searchWood}
              disabled={loading || !query.trim()}
            >
              {loading ? "…" : "Search"}
            </button>
          </div>

          {loading && (
            <>
              <div className="loading-bar"><div className="loading-bar-inner" /></div>
              <div className="status-msg">{statusMsg}</div>
            </>
          )}

          {error && <div className="error-msg">{error}</div>}

          {woodData && (
            <div className="wood-found">
              <div className="wood-icon">🌳</div>
              <div className="wood-found-info">
                <h3>{woodData.name}</h3>
                {woodData.scientific_name && (
                  <div className="sci-name">{woodData.scientific_name}</div>
                )}
                <div className="shrink-chips">
                  <span className="chip">Radial: {woodData.radial}%</span>
                  <span className="chip">Tangential: {woodData.tangential}%</span>
                  {woodData.volumetric && <span className="chip">Volumetric: {woodData.volumetric}%</span>}
                  {woodData.url && (
                    <a href={woodData.url} target="_blank" rel="noopener" className="src-link chip">
                      Source ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="section-label">Parameters</div>

          <div className="inputs-grid">
            <div className="input-group">
              <label>Board Width ({unit})</label>
              <input
                type="number"
                value={boardWidth}
                onChange={e => setBoardWidth(e.target.value)}
                min="0.1"
                step="0.5"
              />
            </div>
            <div className="input-group">
              <label>Moisture Change (%)</label>
              <input
                type="number"
                value={moistureChange}
                onChange={e => setMoistureChange(e.target.value)}
                min="0.1"
                max="28"
                step="0.5"
              />
            </div>
          </div>

          <div className="unit-toggle">
            <button
              className={`unit-btn ${unit === "in" ? "active" : ""}`}
              onClick={() => setUnit("in")}
            >Inches</button>
            <button
              className={`unit-btn ${unit === "mm" ? "active" : ""}`}
              onClick={() => setUnit("mm")}
            >Millimeters</button>
          </div>

          {woodData ? (
            <>
              <div className="section-label">Calculated Movement</div>
              <div className="results">
                <div className="result-box quarter">
                  <div className="result-type">Quartersawn</div>
                  <div className="result-value">{fmt(quarterMove)}</div>
                  <div className="result-unit">{unit} movement</div>
                  <div className="result-desc">
                    Across radial plane — most stable grain orientation
                  </div>
                </div>
                <div className="result-box flat">
                  <div className="result-type">Flatsawn</div>
                  <div className="result-value">{fmt(flatMove)}</div>
                  <div className="result-unit">{unit} movement</div>
                  <div className="result-desc">
                    Across tangential plane — wider boards move more
                  </div>
                </div>
              </div>

              <div className="formula-note">
                <strong>Formula:</strong> Movement = Width × (Shrinkage% ÷ 28) × ΔMC%<br />
                Shrinkage coefficients divided by 28 to get movement per 1% MC change.<br />
                Data sourced from <a href="https://www.wood-database.com" target="_blank" rel="noopener" className="src-link">wood-database.com</a>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🪵</div>
              <p>Search for any wood species above to calculate movement.<br />
              589+ species from wood-database.com are accessible.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
