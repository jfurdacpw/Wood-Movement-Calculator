# Wood movement calculator

This tool estimates how much a board **shrinks or swells across its width** when moisture content changes. It uses the same numbers and math as the original spreadsheet.

## Inputs

- **Board width (in.)** — Nominal width of the board in inches. Wider boards move more in absolute terms (the model scales linearly with width).
- **Moisture variance** — How much moisture content changes, entered as a **decimal** (for example `0.05` means a five–percentage-point swing in moisture content, matching the spreadsheet’s default).

## Coefficients and grain

Each wood has two shrinkage coefficients (from the reference data baked into `species.json`):

- **Quarter** — Typical movement when growth rings are oriented for **quarter-sawn** stock (movement tied to the smaller, “quarter” coefficient in the sheet).
- **Flat** — Typical movement for **flat-sawn** stock (the larger coefficient in the sheet).

Those values are not measured on your specific board; they are **species averages** for planning joinery and gaps.

## Formula

For each species row:

- **Movement (quarter)** = quarter coefficient × board width × moisture variance × **100**
- **Movement (flat)** = flat coefficient × board width × moisture variance × **100**

The result is shown in the same units style as the spreadsheet (movement numbers derived from that product).

## Using the table

The main table lists every species with its coefficients and both movement values. They all update together when you change board width or moisture variance.

If you pick a species under **Highlight species**, that row is emphasized in the table and a **summary** above the table repeats that species’s name, coefficients, and movement numbers for quick reading.

## Reference

The approach and coefficient style follow [Calculating for wood movement](https://www.finewoodworking.com/2013/08/29/calculating-for-wood-movement) (Fine Woodworking).
