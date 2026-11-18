/**
 * Illustration du héros : fenêtre de revue d'une contribution + téléphone affichant une Ship Card.
 * Pure fonction : chaque couleur est fournie par `c` (variables CSS sur le site, valeurs fixes pour les aperçus).
 */
export type HeroPalette = Record<
  | "surface" | "surface2" | "surface3" | "inputBg" | "line" | "lineStrong" | "text" | "soft" | "muted"
  | "ok" | "okBg" | "err" | "errBg" | "warn" | "warnBg" | "gold" | "goldHi" | "blue" | "blueHi" | "navy" | "shadow",
  string
>;

export function heroSvg(c: HeroPalette): string {
  const f = (k: keyof HeroPalette) => `style="fill:${c[k]}"`;
  const s = (k: keyof HeroPalette) => `style="stroke:${c[k]}"`;
  const fs = (fill: keyof HeroPalette, stroke: keyof HeroPalette, w = 1) => `style="fill:${c[fill]};stroke:${c[stroke]};stroke-width:${w}"`;
  const mono = `font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;

  return `<svg viewBox="0 0 640 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Aperçu de DEVEL line : le propriétaire relit une contribution, accepte, et la Ship Card du projet livré s'affiche sur téléphone." style="font-family:inherit">
<defs>
  <linearGradient id="hv-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:${c.goldHi}"/><stop offset="1" style="stop-color:${c.gold}"/></linearGradient>
  <linearGradient id="hv-blue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:${c.blueHi}"/><stop offset="1" style="stop-color:${c.blue}"/></linearGradient>
  <clipPath id="hv-win"><rect x="36" y="70" width="470" height="332" rx="22"/></clipPath>
  <clipPath id="hv-screen"><rect x="462" y="160" width="150" height="336" rx="24"/></clipPath>
</defs>

<!-- ombres de la fenêtre -->
<rect x="40" y="96" width="462" height="330" rx="26" style="fill:${c.shadow};opacity:.10"/>
<rect x="44" y="88" width="454" height="324" rx="24" style="fill:${c.shadow};opacity:.14"/>
<!-- fenêtre -->
<rect x="36" y="70" width="470" height="332" rx="22" ${fs("surface", "lineStrong", 1.5)}/>
<g clip-path="url(#hv-win)">
  <rect x="36" y="70" width="470" height="44" ${f("surface2")}/>
  <rect x="36" y="114" width="150" height="288" ${f("surface2")}/>
  <rect x="186" y="114" width="1.5" height="288" ${f("line")}/>
  <rect x="36" y="113" width="470" height="1.5" ${f("line")}/>
</g>
<circle cx="62" cy="92" r="5.5" style="fill:${c.err}"/><circle cx="80" cy="92" r="5.5" style="fill:${c.gold}"/><circle cx="98" cy="92" r="5.5" style="fill:${c.ok}"/>
<rect x="128" y="80" width="260" height="24" rx="12" ${f("surface3")}/>
<text x="146" y="96" font-size="12" font-weight="600" ${f("muted")}>develline.app/marche-local</text>

<!-- liste des fichiers -->
<text x="56" y="140" font-size="10" font-weight="800" letter-spacing="1.2" ${f("muted")}>FICHIERS MODIFIÉS</text>
<rect x="46" y="152" width="130" height="32" rx="9" ${f("surface3")}/>
<text x="58" y="173" font-size="12.5" font-weight="700" style="${mono};fill:${c.ok}">+ ShopCard.jsx</text>
<text x="58" y="207" font-size="12.5" font-weight="700" style="${mono};fill:${c.warn}">~ App.jsx</text>
<text x="58" y="241" font-size="12.5" font-weight="700" style="${mono};fill:${c.err}">− old-home.jsx</text>
<rect x="56" y="268" width="104" height="8" rx="4" ${f("line")}/><rect x="56" y="286" width="76" height="8" rx="4" ${f("line")}/>

<!-- en-tête de la contribution -->
<text x="206" y="141" font-size="16" font-weight="800" ${f("text")}>Ajout de la vitrine</text>
<text x="206" y="160" font-size="11.5" font-weight="600" ${f("muted")}>Kofi D. · base v1.3</text>
<rect x="394" y="126" width="98" height="26" rx="13" ${f("warnBg")}/>
<text x="443" y="143.5" font-size="11" font-weight="800" text-anchor="middle" ${f("warn")}>En validation</text>

<!-- différences -->
<rect x="204" y="174" width="288" height="128" rx="12" ${fs("inputBg", "line", 1)}/>
<text x="216" y="197" font-size="12" style="${mono};fill:${c.muted}">1</text>
<text x="238" y="197" font-size="12" style="${mono};fill:${c.soft}">function App() {</text>
<rect x="205" y="208" width="286" height="26" ${f("errBg")}/>
<text x="216" y="226" font-size="12" style="${mono};fill:${c.muted}">2</text>
<text x="238" y="226" font-size="12" font-weight="700" style="${mono};fill:${c.err}">− return &lt;Home /&gt;;</text>
<rect x="205" y="234" width="286" height="26" ${f("okBg")}/>
<text x="216" y="252" font-size="12" style="${mono};fill:${c.muted}">2</text>
<text x="238" y="252" font-size="12" font-weight="700" style="${mono};fill:${c.ok}">+ return &lt;ShopCard /&gt;;</text>
<text x="216" y="283" font-size="12" style="${mono};fill:${c.muted}">3</text>
<text x="238" y="283" font-size="12" style="${mono};fill:${c.soft}">}</text>

<!-- actions -->
<rect x="204" y="330" width="132" height="46" rx="15" style="fill:${c.shadow};opacity:.18" transform="translate(0 6)"/>
<rect x="204" y="330" width="132" height="46" rx="15" style="fill:url(#hv-gold)"/>
<rect x="212" y="334" width="116" height="12" rx="6" style="fill:#fff;opacity:.28"/>
<path d="m226 353 4.5 4.5 8-9" style="fill:none;stroke:${c.navy};stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round"/>
<text x="246" y="358" font-size="14" font-weight="800" ${f("navy")}>Accepter</text>
<rect x="346" y="330" width="98" height="46" rx="15" ${fs("surface2", "lineStrong", 1.5)}/>
<text x="395" y="358" font-size="14" font-weight="700" text-anchor="middle" ${f("soft")}>Rejeter</text>

<!-- téléphone -->
<rect x="448" y="170" width="182" height="352" rx="38" style="fill:${c.shadow};opacity:.16"/>
<rect x="450" y="156" width="170" height="350" rx="34" ${fs("surface3", "lineStrong", 2)}/>
<rect x="458" y="164" width="154" height="334" rx="28" ${f("surface")}/>
<g clip-path="url(#hv-screen)" transform="translate(-0 0)">
  <rect x="462" y="160" width="150" height="336" ${f("surface")}/>
  <rect x="462" y="160" width="150" height="62" ${f("surface2")}/>
</g>
<rect x="515" y="170" width="44" height="8" rx="4" ${f("lineStrong")}/>

<rect x="478" y="194" width="46" height="46" rx="16" style="fill:url(#hv-gold)"/>
<rect x="484" y="198" width="34" height="10" rx="5" style="fill:#fff;opacity:.3"/>
<path d="M489 214.5 501 209l12 5.500v10.500L501 231l-12-6zM489 214.500 501 220l12-5.500M501 220v11" style="fill:none;stroke:${c.navy};stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round"/>
<rect x="546" y="203" width="58" height="24" rx="12" ${f("okBg")}/>
<text x="575" y="219" font-size="10.5" font-weight="800" text-anchor="middle" ${f("ok")}>LIVRÉ</text>

<text x="478" y="268" font-size="18" font-weight="800" ${f("text")}>Marché Local</text>
<text x="478" y="286" font-size="10.5" font-weight="600" ${f("muted")}>Vitrine pour commerçants</text>
<text x="478" y="300" font-size="10.5" font-weight="600" ${f("muted")}>de quartier</text>
<rect x="478" y="312" width="44" height="22" rx="11" ${f("inputBg")}/><text x="500" y="327" font-size="10.5" font-weight="700" text-anchor="middle" ${f("text")}>React</text>
<rect x="528" y="312" width="64" height="22" rx="11" ${f("inputBg")}/><text x="560" y="327" font-size="10.5" font-weight="700" text-anchor="middle" ${f("text")}>Node.js</text>

<rect x="478" y="350" width="126" height="1.5" ${f("line")}/>
<text x="478" y="372" font-size="9.5" font-weight="600" ${f("muted")}>Version</text><text x="478" y="388" font-size="13" font-weight="800" ${f("text")}>v1.4</text>
<text x="524" y="372" font-size="9.5" font-weight="600" ${f("muted")}>Total</text><text x="524" y="388" font-size="13" font-weight="800" ${f("text")}>5</text>
<text x="566" y="372" font-size="9.5" font-weight="600" ${f("muted")}>Livré en</text><text x="566" y="388" font-size="13" font-weight="800" ${f("text")}>38 j</text>
<rect x="478" y="398" width="126" height="1.5" ${f("line")}/>

<circle cx="492" cy="422" r="13" style="fill:${c.blue};stroke:${c.surface};stroke-width:2"/><text x="492" y="426" font-size="9.5" font-weight="800" text-anchor="middle" style="fill:#fff">AM</text>
<circle cx="516" cy="422" r="13" style="fill:${c.gold};stroke:${c.surface};stroke-width:2"/><text x="516" y="426" font-size="9.5" font-weight="800" text-anchor="middle" ${f("navy")}>KD</text>
<circle cx="540" cy="422" r="13" style="fill:${c.blueHi};stroke:${c.surface};stroke-width:2"/><text x="540" y="426" font-size="9.5" font-weight="800" text-anchor="middle" style="fill:#fff">FN</text>
<text x="560" y="426" font-size="10" font-weight="700" ${f("soft")}>3 crédités</text>

<rect x="478" y="446" width="126" height="40" rx="14" style="fill:url(#hv-blue)"/>
<rect x="484" y="449" width="114" height="10" rx="5" style="fill:#fff;opacity:.25"/>
<text x="541" y="471" font-size="12.5" font-weight="800" text-anchor="middle" style="fill:#fff">Voir la démo</text>

<!-- pastilles flottantes -->
<rect x="12" y="20" width="226" height="58" rx="19" style="fill:${c.shadow};opacity:.16" transform="translate(0 6)"/>
<rect x="12" y="20" width="226" height="58" rx="19" ${fs("surface", "lineStrong", 1.5)}/>
<circle cx="44" cy="49" r="18" style="fill:url(#hv-blue)"/>
<path d="m35.500 49.500 6 6 10-12" style="fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round"/>
<text x="72" y="46" font-size="13" font-weight="800" ${f("text")}>Contribution acceptée</text>
<text x="72" y="63" font-size="11" font-weight="600" ${f("muted")}>Nouvelle version v1.4</text>

<rect x="40" y="428" width="232" height="58" rx="19" style="fill:${c.shadow};opacity:.16" transform="translate(0 6)"/>
<rect x="40" y="428" width="232" height="58" rx="19" ${fs("surface", "lineStrong", 1.5)}/>
<circle cx="72" cy="457" r="18" style="fill:url(#hv-gold)"/>
<circle cx="72" cy="457" r="9" style="fill:none;stroke:${c.navy};stroke-width:2.6"/><path d="M72 452v5.500l3.500 2" style="fill:none;stroke:${c.navy};stroke-width:2.6;stroke-linecap:round"/>
<text x="100" y="454" font-size="13" font-weight="800" ${f("text")}>Fin du sprint</text>
<text x="100" y="471" font-size="11" font-weight="600" ${f("muted")}>dans 12 jours · 3 sur 4</text>
</svg>`;
}

/** Valeurs fixes pour les aperçus (scripts) : miroir des thèmes de globals.css. */
export const HERO_PALETTES: Record<"dark" | "light", HeroPalette> = {
  dark: { surface: "#0f1b3d", surface2: "#13224a", surface3: "#1c2f62", inputBg: "#0a1330", line: "#1f3166", lineStrong: "#364d92", text: "#f6f8ff", soft: "#d3dcf5", muted: "#a3b1d8", ok: "#a9e6b2", okBg: "#14301c", err: "#ffa5a5", errBg: "#3a1517", warn: "#f4cb78", warnBg: "#3a2c0c", gold: "#c8960c", goldHi: "#f3cb52", blue: "#1f3a8f", blueHi: "#3a58c4", navy: "#0d2660", shadow: "#000000" },
  light: { surface: "#f3f6fd", surface2: "#e9eef8", surface3: "#d9e2f3", inputBg: "#e3eaf7", line: "#d0dbef", lineStrong: "#a9b9de", text: "#141a2c", soft: "#313a52", muted: "#4c5670", ok: "#1e5e1e", okBg: "#e2efda", err: "#a32d2d", errBg: "#fcebeb", warn: "#854f0b", warnBg: "#fff3e0", gold: "#c8960c", goldHi: "#f3cb52", blue: "#1f3a8f", blueHi: "#3a58c4", navy: "#0d2660", shadow: "#0d2660" },
};

/** Palette « site » : chaque valeur est une variable CSS, donc l'image suit le thème sans rechargement. */
export const HERO_VARS: HeroPalette = {
  surface: "var(--surface)", surface2: "var(--surface-2)", surface3: "var(--surface-3)", inputBg: "var(--input-bg)",
  line: "var(--line)", lineStrong: "var(--line-strong)", text: "var(--text)", soft: "var(--text-soft)", muted: "var(--muted)",
  ok: "var(--ok-fg)", okBg: "var(--ok-bg)", err: "var(--err-fg)", errBg: "var(--err-bg)", warn: "var(--warn-fg)", warnBg: "var(--warn-bg)",
  gold: "#c8960c", goldHi: "#f3cb52", blue: "#1f3a8f", blueHi: "#3a58c4", navy: "#0d2660", shadow: "var(--shadow-color)",
};
