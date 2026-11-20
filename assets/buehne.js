/* Übungsbühne für den Scratch-Kurs.
   Blöcke wie in Scratch (deutsche Originaltexte), ziehen mit Maus oder Finger, Figur mit Malstift,
   Zeitlupe, Schritt für Schritt, automatische Prüfung.
   Klasse 6: mehrere Skripte, Bedingungen (Sechseck-Blöcke), Tasten (mit Knöpfen zum Antippen),
   Farbfelder, Objekte zum Fangen.
   Kein Scratch-Code, keine Scratch-Grafiken: alles selbst gebaut. Die Figur „Robo“ ist eigene Zeichnung.
   Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic.

   Skripte werden kurz geschrieben:
     ["flag", ["pendown"], ["repeat", 4, [["move", 100], ["right", 90]]]]
     ["flag", ["forever", [["if", ["touch", "rand"], [["right", 180]]], ["move", 10]]]]
   "!move" = festgenagelt (lässt sich nicht verschieben), Wert "?" = Lücke (gelbes Feld zum Ausfüllen).
*/
(function () {
  "use strict";
  const T = (x) => (window.T ? window.T(x) : x);

  /* ---------------------------------------------------------------- Blöcke */
  // Texte wie im deutschen Scratch 3 (scratch-l10n, editor/blocks/de.json).
  // Felder: {k: Name, d: Startwert, t: "num" | "text" | "dd" (Auswahl) | "color" | "bool" (Sechseck-Feld)}
  const DEF = {
    flag:     { cat: "events",  hat: true, parts: ["Wenn", { flag: true }, "angeklickt wird"] },
    key:      { cat: "events",  hat: true, parts: ["Wenn Taste", { k: "k", d: "leertaste", t: "dd", opts: "tasten" }, "gedrückt wird"] },
    click:    { cat: "events",  hat: true, parts: ["Wenn diese Figur angeklickt wird"] },
    move:     { cat: "motion",  parts: ["gehe", { k: "n", d: 10 }, "er Schritt"] },
    right:    { cat: "motion",  parts: ["drehe dich", { icon: "↻" }, "um", { k: "g", d: 15 }, "Grad"] },
    left:     { cat: "motion",  parts: ["drehe dich", { icon: "↺" }, "um", { k: "g", d: 15 }, "Grad"] },
    "goto":   { cat: "motion",  parts: ["gehe zu x:", { k: "x", d: 0 }, "y:", { k: "y", d: 0 }] },
    dir:      { cat: "motion",  parts: ["setze Richtung auf", { k: "g", d: 90 }, "Grad"] },
    changex:  { cat: "motion",  parts: ["ändere x um", { k: "n", d: 10 }] },
    setx:     { cat: "motion",  parts: ["setze x auf", { k: "n", d: 0 }] },
    changey:  { cat: "motion",  parts: ["ändere y um", { k: "n", d: 10 }] },
    sety:     { cat: "motion",  parts: ["setze y auf", { k: "n", d: 0 }] },
    bounce:   { cat: "motion",  parts: ["pralle vom Rand ab"] },
    say:      { cat: "looks",   parts: ["sage", { k: "t", d: "Hallo!", t: "text" }, "für", { k: "s", d: 2 }, "Sekunden"] },
    saynow:   { cat: "looks",   parts: ["sage", { k: "t", d: "Hallo!", t: "text" }] },
    costume:  { cat: "looks",   parts: ["wechsle zum nächsten Kostüm"] },
    costumeto:{ cat: "looks",   parts: ["wechsle zu Kostüm", { k: "c", d: "Robo-a", t: "dd", opts: "kostueme" }] },
    setsize:  { cat: "looks",   parts: ["setze Größe auf", { k: "n", d: 100 }, "%"] },
    changesize: { cat: "looks", parts: ["ändere Größe um", { k: "n", d: 10 }] },
    show:     { cat: "looks",   parts: ["zeige dich"] },
    hide:     { cat: "looks",   parts: ["verstecke dich"] },
    gotorandom: { cat: "motion", parts: ["gehe zu", { k: "z", d: "zufall", t: "dd", opts: "gehezu" }] },
    setvar:   { cat: "data",    parts: ["setze", { k: "v", d: "", t: "dd", opts: "variablen" }, "auf", { k: "n", d: 0, t: "text" }] },
    changevar:{ cat: "data",    parts: ["ändere", { k: "v", d: "", t: "dd", opts: "variablen" }, "um", { k: "n", d: 1 }] },
    wait:     { cat: "control", parts: ["warte", { k: "s", d: 1 }, "Sekunden"] },
    repeat:   { cat: "control", c: true, parts: ["wiederhole", { k: "n", d: 10 }, "mal"] },
    forever:  { cat: "control", c: true, cap: true, parts: ["wiederhole fortlaufend"] },
    "if":     { cat: "control", c: true, parts: ["falls", { k: "b", t: "bool" }, ", dann"] },
    ifelse:   { cat: "control", c: true, e: true, parts: ["falls", { k: "b", t: "bool" }, ", dann"], parts2: ["sonst"] },
    until:    { cat: "control", c: true, parts: ["wiederhole bis", { k: "b", t: "bool" }] },
    waituntil:{ cat: "control", parts: ["warte bis", { k: "b", t: "bool" }] },
    stop:     { cat: "control", cap: true, parts: ["stoppe", { k: "w", d: "alles", t: "dd", opts: "stopp" }] },
    pendown:  { cat: "pen",     parts: ["schalte Stift ein"] },
    penup:    { cat: "pen",     parts: ["schalte Stift aus"] },
    clear:    { cat: "pen",     parts: ["lösche alles"] },
    // Wahrheitswert-Blöcke (Sechseck): geben wahr oder falsch
    touch:    { cat: "sensing", bool: true, parts: ["wird", { k: "w", d: "rand", t: "dd", opts: "ziele" }, "berührt?"] },
    color:    { cat: "sensing", bool: true, parts: ["wird Farbe", { k: "f", d: "rot", t: "color" }, "berührt?"] },
    keypressed: { cat: "sensing", bool: true, parts: ["Taste", { k: "k", d: "leertaste", t: "dd", opts: "tasten" }, "gedrückt?"] },
    not:      { cat: "operators", bool: true, parts: ["nicht", { k: "b", t: "bool" }] },
    gt:       { cat: "operators", bool: true, parts: [{ k: "a", d: "", t: "text" }, ">", { k: "b", d: 50, t: "text" }] },
    lt:       { cat: "operators", bool: true, parts: [{ k: "a", d: "", t: "text" }, "<", { k: "b", d: 50, t: "text" }] },
    eq:       { cat: "operators", bool: true, parts: [{ k: "a", d: "", t: "text" }, "=", { k: "b", d: 50, t: "text" }] },
    and:      { cat: "operators", bool: true, parts: [{ k: "a", t: "bool" }, "und", { k: "b", t: "bool" }] },
    or:       { cat: "operators", bool: true, parts: [{ k: "a", t: "bool" }, "oder", { k: "b", t: "bool" }] },
    // Werte-Blöcke (rund): liefern eine Zahl oder einen Text, passen in runde Felder
    "var":    { cat: "data",    rep: true, parts: [{ k: "v", d: "", t: "name" }] },
    xpos:     { cat: "motion",  rep: true, parts: ["x-Position"] },
    ypos:     { cat: "motion",  rep: true, parts: ["y-Position"] },
    richtung: { cat: "motion",  rep: true, parts: ["Richtung"] },
    groesse:  { cat: "looks",   rep: true, parts: ["Größe"] },
    kostuemnr:{ cat: "looks",   rep: true, parts: ["Kostüm", { k: "w", d: "nummer", t: "dd", opts: "nrname" }] },
    add:      { cat: "operators", rep: true, parts: [{ k: "a", d: "" }, "+", { k: "b", d: "" }] },
    sub:      { cat: "operators", rep: true, parts: [{ k: "a", d: "" }, "-", { k: "b", d: "" }] },
    mul:      { cat: "operators", rep: true, parts: [{ k: "a", d: "" }, "*", { k: "b", d: "" }] },
    div:      { cat: "operators", rep: true, parts: [{ k: "a", d: "" }, "/", { k: "b", d: "" }] },
    random:   { cat: "operators", rep: true, parts: ["Zufallszahl von", { k: "a", d: 1 }, "bis", { k: "b", d: 10 }] },
    join:     { cat: "operators", rep: true, parts: ["verbinde", { k: "a", d: "Apfel", t: "text" }, "und", { k: "b", d: "Banane", t: "text" }] },
  };
  const KOSTUEME = [{ name: "Robo-a", pose: 0 }, { name: "Robo-b", pose: 1 }];
  const fieldsOf = (op) => DEF[op].parts.filter((p) => p && p.k);

  // Auswahllisten (Texte wie in Scratch)
  const KEYS = [["leertaste", "Leertaste"], ["oben", "Pfeil nach oben"], ["unten", "Pfeil nach unten"],
    ["rechts", "Pfeil nach rechts"], ["links", "Pfeil nach links"], ["beliebig", "beliebiges"]]
    .concat("abcdefghijklmnopqrstuvwxyz0123456789".split("").map((c) => [c, c]));
  const FARBEN = { rot: "#e5484d", gruen: "#2fb344", blau: "#3d7cf5", gelb: "#f5c400", lila: "#9b59d0", schwarz: "#2b2f36" };
  const ARROWS = ["oben", "links", "unten", "rechts"];
  function ddOptions(f, welt) {
    if (f.opts === "tasten") return KEYS;
    if (f.opts === "stopp") return [["alles", "alles"], ["dieses Skript", "dieses Skript"]];
    if (f.opts === "variablen") return Object.keys((welt && welt.variablen) || {}).map((v) => [v, v]);
    if (f.opts === "kostueme") return ((welt && welt.kostueme) || KOSTUEME).map((c) => [c.name, c.name]);
    if (f.opts === "gehezu") return [["zufall", "Zufallsposition"], ["maus", "Mauszeiger"]];
    if (f.opts === "nrname") return [["nummer", "Nummer"], ["name", "Name"]];
    if (f.opts === "ziele") return [["maus", "Mauszeiger"], ["rand", "Rand"]].concat([...new Set(((welt && welt.objekte) || []).map((o) => o.name))].map((n) => [n, n]));
    if (f.t === "color") return Object.keys(FARBEN).map((c) => [c, c === "gruen" ? "grün" : c]);
    return [];
  }
  function ddLabel(f, v) {
    const hit = ddOptions(f, null).find((o) => o[0] === v);
    return hit ? hit[1] : String(v);
  }

  let uid = 0;
  const isRepShort = (v) => Array.isArray(v) && typeof v[0] === "string" && !!DEF[v[0].replace(/^!/, "")]
    && !!(DEF[v[0].replace(/^!/, "")].rep || DEF[v[0].replace(/^!/, "")].bool);
  const isNode = (v) => !!v && typeof v === "object" && !Array.isArray(v) && !!v.op;
  const isBoolShort = (v) => {
    if (v && v.op) return !!DEF[v.op].bool;
    if (!Array.isArray(v) && typeof v !== "string") return false;
    const op = (Array.isArray(v) ? v[0] : v);
    if (typeof op !== "string") return false;
    const d = DEF[op.replace(/^!/, "")];
    return !!(d && d.bool);
  };
  /** Kurzschreibweise → Block-Objekt {id, op, args, body?, body2?, lock?, gaps?}. Sechseck-Felder enthalten Block-Objekte. */
  function parse(x) {
    if (x && typeof x === "object" && !Array.isArray(x) && x.op) return x;
    const a = Array.isArray(x) ? x.slice() : [x];
    let op = String(a.shift());
    const lock = op.startsWith("!");
    if (lock) op = op.slice(1);
    const d = DEF[op];
    if (!d) throw new Error("Unbekannter Block: " + op);
    const node = { id: "b" + (++uid), op, args: {}, gaps: {} };
    if (lock) node.lock = true;
    fieldsOf(op).forEach((f) => {
      if (f.t === "bool") {
        let v = null;
        if (a.length && (a[0] === "?" || a[0] === null || isBoolShort(a[0]))) v = a.shift();
        if (v === "?") { node.gaps[f.k] = true; v = null; }
        node.args[f.k] = v ? parse(v) : null;
        return;
      }
      if (a.length && (isRepShort(a[0]) || isNode(a[0]))) { node.args[f.k] = parse(a.shift()); return; }   // Werte-Block im runden Feld
      let v = a.length && !Array.isArray(a[0]) ? a.shift() : f.d;
      if (v === "?") { node.gaps[f.k] = true; v = ""; }
      node.args[f.k] = v;
    });
    if (d.c) node.body = (a.length && Array.isArray(a[0]) ? a.shift() : []).map(parse);
    if (d.e) node.body2 = (a.length && Array.isArray(a[0]) ? a.shift() : []).map(parse);
    return node;
  }
  const parseList = (list) => (list || []).map(parse);
  function clone(n) {
    const c = { id: "b" + (++uid), op: n.op, args: { ...n.args }, gaps: { ...n.gaps } };
    fieldsOf(n.op).forEach((f) => { if (isNode(n.args[f.k])) c.args[f.k] = clone(n.args[f.k]); });
    if (n.lit) c.lit = { ...n.lit };
    if (n.lock) c.lock = true;
    if (n.body) c.body = n.body.map(clone);
    if (n.body2) c.body2 = n.body2.map(clone);
    return c;
  }
  const boolKids = (n) => fieldsOf(n.op).map((f) => n.args[f.k]).filter(isNode);     // Blöcke in Feldern (Sechsecke und Werte-Blöcke)
  function countNode(n) {
    return 1 + boolKids(n).reduce((s, b) => s + countNode(b), 0) + (n.body ? count(n.body) : 0) + (n.body2 ? count(n.body2) : 0);
  }
  function count(list) { return list.reduce((s, n) => s + countNode(n), 0); }
  /** Alle Blöcke (auch in Schleifen und Sechseck-Feldern) */
  function walk(list, fn) {
    list.forEach((n) => {
      fn(n);
      boolKids(n).forEach((b) => walk([b], fn));
      if (n.body) walk(n.body, fn);
      if (n.body2) walk(n.body2, fn);
    });
  }
  function find(list, id, parent) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === id) return { list, index: i, node: list[i], parent };
      const r = findIn(list[i], id);
      if (r) return r;
    }
    return null;
  }
  function findIn(n, id) {
    for (const f of fieldsOf(n.op)) {
      const b = n.args[f.k];
      if (!isNode(b)) continue;
      if (b.id === id) return { slot: { node: n, k: f.k }, node: b };
      const r = findIn(b, id);
      if (r) return r;
    }
    if (n.body) { const r = find(n.body, id, n); if (r) return r; }
    if (n.body2) { const r = find(n.body2, id, n); if (r) return r; }
    return null;
  }
  const num = (v) => {
    const f = parseFloat(String(v).replace(",", "."));
    return Number.isFinite(f) ? f : NaN;
  };
  const inW = (v) => `calc(${Math.max(1, String(v).length)}ch + 22px)`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------------------------------------------------------------- Darstellung */
  const FLAG = '<svg class="sb-flag" viewBox="0 0 20 20" aria-label="grüne Flagge"><path d="M4 2v16" stroke="#3a8c2f" stroke-width="2.4" stroke-linecap="round"/><path d="M5 3c4-2 6 2 11 0v8c-5 2-7-2-11 0z" fill="#4cbf56" stroke="#3a8c2f" stroke-width="1.4" stroke-linejoin="round"/></svg>';

  /** HTML für einen Block. opt.edit: true | "gaps" | false; opt.welt: Bühne (für die Auswahl „wird … berührt?“) */
  function partsHTML(n, parts, opt) {
    return parts.map((p) => {
      if (typeof p === "string") return `<span>${esc(p)}</span>`;
      if (p.flag) return FLAG;
      if (p.icon) return `<span class="sb-ico">${p.icon}</span>`;
      const v = n.args[p.k];
      const gap = n.gaps && n.gaps[p.k];
      const editable = opt.edit === true || (opt.edit === "gaps" && gap);
      if (p.t === "bool") {
        if (v) return blockHTML(v, opt);
        return `<span class="sb-slot${gap ? " sb-gap" : ""}" data-slot="${n.id}" data-k="${p.k}" aria-label="${T("leeres Feld für eine Bedingung")}"></span>`;
      }
      if (isNode(v)) return blockHTML(v, opt);                       // Werte-Block im runden Feld
      if (p.t === "name") return `<span class="sb-name">${esc(v)}</span>`;
      if (p.t === "dd" || p.t === "color") {
        const isC = p.t === "color";
        const sw = isC && FARBEN[v] ? ` style="background:${FARBEN[v]}"` : "";
        const cls = "sb-dd" + (isC ? " sb-color" : "") + (gap ? " sb-gap" : "");
        if (editable) {
          const o = (gap ? `<option value=""${v === "" ? " selected" : ""}>?</option>` : "")
            + ddOptions(p, opt.welt).map(([val, lab]) => `<option value="${esc(val)}"${val === v ? " selected" : ""}>${esc(T(lab))}</option>`).join("");
          return `<select class="${cls}" data-k="${p.k}"${sw} aria-label="${esc(T(isC ? "Farbe" : "Auswahl"))}">${o}</select>`;
        }
        if (isC) return `<span class="${cls}"${sw} title="${esc(ddLabel(p, v))}"></span>`;
        return `<span class="${cls}">${v === "" ? "&nbsp;?&nbsp;" : esc(T(ddLabel(p, v)))}<i>▾</i></span>`;
      }
      const cls = "sb-in" + (p.t === "text" ? " sb-txt" : "") + (gap ? " sb-gap" : "");
      const rs = ` data-rs="${n.id}" data-k="${p.k}"`;                // hier passt ein Werte-Block hinein
      if (editable) {
        return `<input class="${cls}"${rs} value="${esc(v)}" style="width:${inW(v)}" ${p.t === "text" ? "" : 'inputmode="decimal"'} aria-label="${esc(p.k)}" autocomplete="off">`;
      }
      return `<span class="${cls}"${rs}>${v === "" ? (gap ? "&nbsp;?&nbsp;" : "&nbsp;") : esc(v)}</span>`;
    }).join("");
  }
  function blockHTML(n, opt) {
    const d = DEF[n.op];
    const inner = partsHTML(n, d.parts, opt);
    const lock = n.lock ? " sb-lock" : "";
    const cap = d.cap ? " sb-cap" : "";
    if (d.bool) return `<div class="sb sb-${d.cat} sb-bool${lock}" data-id="${n.id}">${inner}</div>`;
    if (d.rep) return `<div class="sb sb-${d.cat} sb-rep${lock}" data-id="${n.id}">${inner}</div>`;
    if (d.c) {
      const mid = (list, key) => `<div class="sb-c-mid"><div class="sb-stack" data-list="${key}">${list.map((b) => blockHTML(b, opt)).join("")}</div></div>`;
      return `<div class="sb sb-${d.cat} sb-c${d.e ? " sb-e" : ""}${cap}${lock}" data-id="${n.id}"><div class="sb-c-head">${inner}</div>`
        + mid(n.body, n.id)
        + (d.e ? `<div class="sb-c-head sb-c-else">${partsHTML(n, d.parts2, opt)}</div>` + mid(n.body2, n.id + ":2") : "")
        + '<div class="sb-c-foot"></div></div>';
    }
    return `<div class="sb sb-${d.cat}${d.hat ? " sb-hat" : ""}${cap}${lock}" data-id="${n.id}">${inner}</div>`;
  }
  /** Fertiges Skript als Bild (nicht ziehbar) – für Erklärungen im Text. */
  function render(list, opt) {
    const nodes = parseList(list);
    return `<div class="sb-stack sb-static${opt && opt.small ? " sb-small" : ""}">${nodes.map((n) => blockHTML(n, { edit: false, welt: opt && opt.welt })).join("")}</div>`;
  }

  /* ---------------------------------------------------------------- Ablauf (ohne Anzeige) */
  const rad = (g) => (g * Math.PI) / 180;
  const norm = (g) => { let r = ((g + 179) % 360 + 360) % 360 - 179; return r; };   // wie Scratch: -179 … 180
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const R = 24;                  // Robos „Radius“ für Berühren
  const FX = 250, FY = 190;      // Robo bleibt auf der Bühne (wie Scratch: ein Stück muss sichtbar bleiben)

  function newState(start, welt) {
    welt = welt || {};
    return { x: start.x, y: start.y, dir: start.dir, pen: false, costume: 0, wechsel: 0, segs: [], says: [], steps: 0, errors: [],
      bubble: null, welt, obj: (welt.objekte || []).map((o) => ({ r: 18, ...o, hit: 0, weg: false })), gefangen: 0,
      size: 100, visible: true, vars: { ...(welt.variablen || {}) }, nKost: (welt.kostueme || KOSTUEME).length,
      keys: new Set(), maus: welt.maus || null, tasten: 0, conds: { wahr: 0, falsch: 0 }, randBeruehrt: 0, seed: 7,
      limit: MAX_STEPS, halt: false };
  }
  /** Wert eines Feldes: Zahl/Text – oder das Ergebnis eines Werte-Blocks */
  const fmt = (v) => (typeof v === "number" ? String(Math.round(v * 1e9) / 1e9) : typeof v === "boolean" ? String(v) : String(v));
  const zahl = (v) => { const f = num(v); return Number.isNaN(f) ? 0 : f; };
  const isNum = (v) => typeof v === "number" || (String(v).trim() !== "" && !Number.isNaN(Number(String(v).replace(",", "."))));
  function val(s, v) {
    if (!isNode(v)) return v;
    const a = v.args, A = () => val(s, a.a), Bv = () => val(s, a.b);
    switch (v.op) {
      case "var": return a.v in s.vars ? s.vars[a.v] : 0;
      case "xpos": return Math.round(s.x * 1e6) / 1e6;
      case "ypos": return Math.round(s.y * 1e6) / 1e6;
      case "richtung": return s.dir;
      case "groesse": return s.size;
      case "kostuemnr": return a.w === "name" ? ((s.welt.kostueme || KOSTUEME)[s.costume] || {}).name : s.costume + 1;
      case "add": return zahl(A()) + zahl(Bv());
      case "sub": return zahl(A()) - zahl(Bv());
      case "mul": return zahl(A()) * zahl(Bv());
      case "div": return zahl(Bv()) === 0 ? Infinity : zahl(A()) / zahl(Bv());
      case "random": {
        const lo = zahl(A()), hi = zahl(Bv()), a1 = Math.min(lo, hi), b1 = Math.max(lo, hi);
        if (Number.isInteger(a1) && Number.isInteger(b1) && !String(A()).includes(".") && !String(Bv()).includes(".")) return a1 + Math.floor(rnd(s) * (b1 - a1 + 1));
        return a1 + rnd(s) * (b1 - a1);
      }
      case "join": return fmt(A()) + fmt(Bv());
      default: return DEF[v.op].bool ? test(s, v) : 0;
    }
  }
  function vergleich(x, y) {                       // wie Scratch: Zahlen als Zahlen, sonst Text ohne Groß/klein
    if (isNum(x) && isNum(y)) return zahl(x) - zahl(y);
    const p = fmt(x).toLowerCase(), q = fmt(y).toLowerCase();
    return p < q ? -1 : p > q ? 1 : 0;
  }
  function moveTo(s, x2, y2) {
    x2 = clamp(x2, -FX, FX); y2 = clamp(y2, -FY, FY);
    if (s.pen && (Math.abs(x2 - s.x) > 1e-9 || Math.abs(y2 - s.y) > 1e-9)) s.segs.push([s.x, s.y, x2, y2]);
    s.x = x2; s.y = y2;
  }
  function bounce(s) {
    const dl = s.x - R + 240, dr = 240 - s.x - R, dt = 180 - s.y - R, db = s.y - R + 180;
    const m = Math.min(dl, dr, dt, db);
    if (m >= 0) return;
    let dx = Math.sin(rad(s.dir)), dy = Math.cos(rad(s.dir));
    if (m === dl) dx = Math.max(0.2, Math.abs(dx));
    else if (m === dr) dx = -Math.max(0.2, Math.abs(dx));
    else if (m === dt) dy = -Math.max(0.2, Math.abs(dy));
    else dy = Math.max(0.2, Math.abs(dy));
    s.dir = norm(Math.round(Math.atan2(dx, dy) * 180 / Math.PI * 1e6) / 1e6);
    s.x = clamp(s.x, -240 + R, 240 - R); s.y = clamp(s.y, -180 + R, 180 - R);
  }
  /** Führt einen einfachen Block aus und ändert den Zustand. Gibt Wartezeit in s zurück (warte, sage). */
  function apply(s, n) {
    const a = n.args;
    const need = (k) => {
      if (isNode(a[k])) return zahl(val(s, a[k]));
      const v = num(a[k]);
      if (Number.isNaN(v)) { s.errors.push(n.id); return 0; }
      return v;
    };
    const txt = (k) => fmt(val(s, a[k]));
    switch (n.op) {
      case "move": {
        const d = need("n");
        moveTo(s, s.x + d * Math.sin(rad(s.dir)), s.y + d * Math.cos(rad(s.dir))); return 0;
      }
      case "right": s.dir = norm(s.dir + need("g")); return 0;
      case "left": s.dir = norm(s.dir - need("g")); return 0;
      case "goto": { const x2 = need("x"), y2 = need("y"); moveTo(s, x2, y2); return 0; }
      case "dir": s.dir = norm(need("g")); return 0;
      case "changex": moveTo(s, s.x + need("n"), s.y); return 0;
      case "setx": moveTo(s, need("n"), s.y); return 0;
      case "changey": moveTo(s, s.x, s.y + need("n")); return 0;
      case "sety": moveTo(s, s.x, need("n")); return 0;
      case "bounce": bounce(s); return 0;
      case "say": s.says.push(txt("t")); return Math.max(0, need("s"));
      case "saynow": { const t = txt("t"); s.says.push(t); s.bubble = t || null; return 0; }
      case "costume": s.costume = (s.costume + 1) % s.nKost; s.wechsel++; return 0;
      case "costumeto": {
        const ks = s.welt.kostueme || KOSTUEME, w = val(s, a.c);
        let i = ks.findIndex((c) => c.name === w);
        if (i < 0 && isNum(w)) i = ((Math.round(zahl(w)) - 1) % ks.length + ks.length) % ks.length;
        if (i >= 0 && i !== s.costume) { s.costume = i; s.wechsel++; }
        return 0;
      }
      case "setsize": s.size = clamp(need("n"), 5, 500); return 0;
      case "changesize": s.size = clamp(s.size + need("n"), 5, 500); return 0;
      case "show": s.visible = true; return 0;
      case "hide": s.visible = false; return 0;
      case "gotorandom":
        if (a.z === "maus") { if (s.maus && s.maus.x !== null) moveTo(s, s.maus.x, s.maus.y); }
        else moveTo(s, Math.round(rnd(s) * 480 - 240), Math.round(rnd(s) * 360 - 180));
        return 0;
      case "setvar": { const w = val(s, a.n); if (a.v) s.vars[a.v] = typeof w === "string" && isNum(w) && !/^0\d/.test(w.trim()) ? Number(w.replace(",", ".")) : w; return 0; }
      case "changevar": if (a.v) s.vars[a.v] = zahl(s.vars[a.v]) + need("n"); return 0;
      case "wait": return Math.max(0, need("s"));
      case "pendown": s.pen = true; return 0;
      case "penup": s.pen = false; return 0;
      case "clear": s.segs = []; return 0;
      default: return 0;
    }
  }
  /* Berühren und Wahrheitswerte */
  const rr = (s) => R * (s.size || 100) / 100;          // Robo wird mit seiner Größe breiter
  function beruehrt(s, w) {
    if (s.visible === false) return false;              // wie Scratch: Versteckte Figuren berühren nichts
    const r = rr(s);
    if (w === "rand") return Math.abs(s.x) + r > 240 || Math.abs(s.y) + r > 180;
    if (w === "maus") return !!s.maus && s.maus.x !== null && Math.hypot(s.maus.x - s.x, s.maus.y - s.y) < r + 4;
    return s.obj.some((o) => o.name === w && !o.weg && Math.hypot(o.x - s.x, o.y - s.y) < r + o.r);   // gleiche Namen = Klone
  }
  function farbeBeruehrt(s, f) {
    return (s.welt.felder || []).some(([x1, y1, x2, y2, c]) => {
      if (c !== f) return false;
      const cx = clamp(s.x, Math.min(x1, x2), Math.max(x1, x2)), cy = clamp(s.y, Math.min(y1, y2), Math.max(y1, y2));
      return s.visible !== false && Math.hypot(cx - s.x, cy - s.y) < rr(s) - 4;
    });
  }
  function test(s, b) {
    if (!b) return false;
    switch (b.op) {
      case "touch": { const v = beruehrt(s, b.args.w); if (v && b.args.w === "rand") s.randBeruehrt++; return v; }
      case "color": return farbeBeruehrt(s, b.args.f);
      case "keypressed": return b.args.k === "beliebig" ? s.keys.size > 0 : s.keys.has(b.args.k);
      case "not": return !test(s, b.args.b);
      case "and": return test(s, b.args.a) && test(s, b.args.b);
      case "or": return test(s, b.args.a) || test(s, b.args.b);
      case "gt": return vergleich(val(s, b.args.a), val(s, b.args.b)) > 0;
      case "lt": return vergleich(val(s, b.args.a), val(s, b.args.b)) < 0;
      case "eq": return vergleich(val(s, b.args.a), val(s, b.args.b)) === 0;
      default: return false;
    }
  }
  function cond(s, b) { const v = test(s, b); s.conds[v ? "wahr" : "falsch"]++; return v; }

  /** Ablauf eines Skripts als Generator. Liefert Ereignisse, die die Bühne anzeigt (oder die Rechnung überspringt):
      hat · block · loop (Schleifenrunde = ein Bild) · end · cond (Bedingung geprüft, runde: ein Bild) */
  function* exec(list, s, th) {
    for (const n of list) {
      if (s.halt || th.end) return;
      if (++s.steps > s.limit) { s.halt = "limit"; return; }
      const d = DEF[n.op];
      if (d.hat) { yield { t: "hat", n }; continue; }
      switch (n.op) {
        case "repeat": {
          const k = Math.floor(isNode(n.args.n) ? zahl(val(s, n.args.n)) : num(n.args.n));
          if (Number.isNaN(k)) { s.errors.push(n.id); continue; }
          for (let i = 1; i <= Math.min(k, 500); i++) {
            yield { t: "loop", n, i, k };
            yield* exec(n.body, s, th);
            if (s.halt || th.end) return;
          }
          yield { t: "end", n };
          continue;
        }
        case "forever":
          for (let i = 1; ; i++) {
            yield { t: "loop", n, i };
            yield* exec(n.body, s, th);
            if (s.halt || th.end) return;
          }
        case "until":
          for (let i = 1; ; i++) {
            if (i > 1 && ++s.steps > s.limit) { s.halt = "limit"; return; }   // auch leere Schleifen zählen
            const v = cond(s, n.args.b);
            yield { t: "cond", n, v, i, runde: !v };
            if (v) break;
            yield* exec(n.body, s, th);
            if (s.halt || th.end) return;
          }
          yield { t: "end", n };
          continue;
        case "if": case "ifelse": {
          const v = cond(s, n.args.b);
          yield { t: "cond", n, v };
          const body = v ? n.body : n.body2;
          if (body) { yield* exec(body, s, th); if (s.halt || th.end) return; }
          continue;
        }
        case "waituntil":
          for (;;) {
            const v = cond(s, n.args.b);
            yield { t: "cond", n, v, runde: !v };
            if (v) break;
            if (s.halt || th.end) return;
          }
          continue;
        case "stop":
          if (n.args.w === "dieses Skript") th.end = true; else s.halt = "stop";
          yield { t: "stop", n };
          return;
        default: {
          const from = { x: s.x, y: s.y, dir: s.dir };
          if (n.op === "right" || n.op === "left") from.turn = (n.op === "right" ? 1 : -1) * (num(n.args.g) || 0);
          const wait = apply(s, n);
          yield { t: "block", n, from, wait };
        }
      }
    }
  }
  const isFrame = (e) => e.t === "loop" || (e.t === "cond" && e.runde) || (e.t === "block" && e.wait > 0);

  /** Ein Bild der Welt: Objekte bewegen sich, Sterne werden gefangen. */
  function rnd(s) { s.seed = (s.seed * 16807) % 2147483647; return s.seed / 2147483647; }
  function tick(s) {
    for (const o of s.obj) {
      if (o.weg) continue;
      if (o.dx || o.dy) {
        o.x += o.dx || 0; o.y += o.dy || 0;
        if (Math.abs(o.x) > 240 - o.r) { o.dx = -o.dx; o.x = clamp(o.x, -240 + o.r, 240 - o.r); }
        if (Math.abs(o.y) > 180 - o.r) { o.dy = -o.dy; o.y = clamp(o.y, -180 + o.r, 180 - o.r); }
      }
      if (!o.fangen) continue;
      if (Math.hypot(o.x - s.x, o.y - s.y) < R + o.r) {
        if (++o.hit >= 6) {            // kurz berührt lassen (6 Bilder = 0,2 s), dann ist er gefangen
          o.hit = 0; s.gefangen++;
          if (o.fangen === "weg") o.weg = true;
          else {                         // springt an eine neue Stelle, nicht zu nah an Robo
            for (let i = 0; i < 20; i++) {
              o.x = Math.round((rnd(s) * 400 - 200) / 40) * 40; o.y = Math.round((rnd(s) * 280 - 140) / 40) * 40;
              if (Math.hypot(o.x - s.x, o.y - s.y) > 140) break;
            }
          }
        }
      } else o.hit = 0;
    }
  }

  const MAX_STEPS = 5000, MAX_FRAMES = 3000;
  function runSync(s, ths) {
    let frames = 0;
    while (ths.length && frames < MAX_FRAMES && !s.halt) {
      for (const th of ths) {
        for (;;) {
          const r = th.gen.next();
          if (r.done) { th.done = true; break; }
          if (isFrame(r.value)) break;
        }
        if (s.halt) break;
      }
      ths = ths.filter((t) => !t.done);
      tick(s); frames++;
    }
    if (ths.length && !s.halt) s.endlos = true;              // läuft nach 3000 Bildern noch: endlos
  }
  const hatOf = (st) => (st[0] && DEF[st[0].op].hat ? st[0] : null);
  function keyMatch(st, k) { const h = hatOf(st); return !!h && h.op === "key" && (h.args.k === k || h.args.k === "beliebig"); }
  function newThread(st, s) { const th = { stack: st }; th.gen = exec(st, s, th); return th; }

  /** Ganzes Programm sofort durchrechnen (für Ziele und Prüfungen).
      welt: {felder, objekte, tasten: ["rechts", …] (nacheinander gedrückt), gedrueckt: [...] (gehalten), maus: {x, y}} */
  function simulateAll(stacks, start, welt) {
    welt = welt || {};
    const nodes = stacks.map(parseList);
    const s = newState(start || { x: 0, y: 0, dir: 90 }, welt);
    s.keys = new Set(welt.gedrueckt || []);
    runSync(s, nodes.filter((st) => hatOf(st) && hatOf(st).op === "flag").map((st) => newThread(st, s)));
    (welt.tasten || []).forEach((k) => {
      if (s.halt) return;
      s.tasten++;
      const held = s.keys; s.keys = new Set([...held, k]);
      runSync(s, nodes.filter((st) => keyMatch(st, k)).map((st) => newThread(st, s)));
      s.keys = held;
    });
    if (welt.klick && !s.halt) runSync(s, nodes.filter((st) => hatOf(st) && hatOf(st).op === "click").map((st) => newThread(st, s)));
    return trace(s, nodes);
  }
  function simulate(list, start, welt) { return simulateAll([list], start, welt); }
  function trace(s, stacks) {
    const all = stacks;
    return { segs: s.segs, says: s.says, x: s.x, y: s.y, dir: s.dir, costume: s.costume, wechsel: s.wechsel,
      blocks: all.reduce((k, st) => k + count(st), 0), hat: all.some((st) => st[0] && st[0].op === "flag"),
      errors: s.errors, script: all[0] || [], skripte: all, gefangen: s.gefangen, tasten: s.tasten, conds: { ...s.conds },
      randBeruehrt: s.randBeruehrt, gestoppt: s.halt === "stop", endlos: s.halt === "limit" || !!s.endlos, bubble: s.bubble,
      vars: { ...s.vars }, size: s.size, visible: s.visible, kostuem: ((s.welt.kostueme || KOSTUEME)[s.costume] || {}).name,
      objekte: s.obj.map((o) => ({ name: o.name, x: o.x, y: o.y, weg: o.weg })),
      beruehrt: (w) => beruehrt(s, w), farbe: (f) => farbeBeruehrt(s, f) };
  }

  /** Zwei Zeichnungen vergleichen: gleiche Linien, egal in welcher Reihenfolge, Richtung oder Stückelung
      („2 × gehe 50“ = „gehe 100“). Linien auf derselben Geraden werden zusammengefasst. */
  function lines(segs) {
    const Rd = (v) => (Math.round(v * 10) / 10).toFixed(1).replace(/^-0\.0$/, "0.0");
    const groups = new Map();
    segs.forEach(([x1, y1, x2, y2]) => {
      let dx = x2 - x1, dy = y2 - y1;
      const L = Math.hypot(dx, dy);
      if (L < 0.01) return;
      dx /= L; dy /= L;
      if (dx < -1e-9 || (Math.abs(dx) < 1e-9 && dy < 0)) { dx = -dx; dy = -dy; }   // Richtung egal
      const off = x1 * dy - y1 * dx;                                               // Abstand der Geraden
      const key = `${Rd(dx * 100)}|${Rd(dy * 100)}|${Rd(off)}`;
      const t1 = x1 * dx + y1 * dy, t2 = x2 * dx + y2 * dy;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push([Math.min(t1, t2), Math.max(t1, t2)]);
    });
    const out = new Set();
    groups.forEach((iv, key) => {
      iv.sort((a, b) => a[0] - b[0]);
      let [s, e] = iv[0];
      for (let i = 1; i <= iv.length; i++) {
        if (i < iv.length && iv[i][0] <= e + 0.05) { e = Math.max(e, iv[i][1]); continue; }
        out.add(`${key}|${Rd(s)}|${Rd(e)}`);
        if (i < iv.length) [s, e] = iv[i];
      }
    });
    return out;
  }
  function sameDrawing(a, b) {
    const A = lines(a), B = lines(b);
    if (A.size !== B.size) return false;
    for (const k of A) if (!B.has(k)) return false;
    return true;
  }

  /* ---------------------------------------------------------------- Robo (eigene Figur) */
  function roboSVG(costume, farbe) {
    // Pose 0: Arm unten, 1: Arm oben, 2: Arm waagrecht (Zwischenbild fürs Daumenkino)
    const arm = costume === 2
      ? '<path d="M58 47 L72 45" stroke="#2b3a55" stroke-width="5" stroke-linecap="round"/><circle cx="74" cy="45" r="4.5" fill="#ffcf3f" stroke="#2b3a55" stroke-width="2"/>'
      : costume
      ? '<path d="M58 44 L70 30" stroke="#2b3a55" stroke-width="5" stroke-linecap="round"/><circle cx="71" cy="28" r="4.5" fill="#ffcf3f" stroke="#2b3a55" stroke-width="2"/>'
      : '<path d="M58 50 L71 56" stroke="#2b3a55" stroke-width="5" stroke-linecap="round"/><circle cx="72" cy="57" r="4.5" fill="#ffcf3f" stroke="#2b3a55" stroke-width="2"/>';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <path d="M40 8 V17" stroke="#2b3a55" stroke-width="3"/><circle cx="40" cy="7" r="4.5" fill="${costume === 1 ? "#ff5a5a" : "#ffcf3f"}" stroke="#2b3a55" stroke-width="2"/>
      <rect x="16" y="17" width="44" height="36" rx="11" fill="${farbe || "#ff8c42"}" stroke="#2b3a55" stroke-width="3"/>
      <rect x="25" y="24" width="30" height="20" rx="6" fill="#fff" stroke="#2b3a55" stroke-width="2"/>
      <circle cx="40" cy="34" r="3.6" fill="#2b3a55"/><circle cx="50" cy="34" r="3.6" fill="#2b3a55"/>
      <circle cx="41.2" cy="32.8" r="1.1" fill="#fff"/><circle cx="51.2" cy="32.8" r="1.1" fill="#fff"/>
      <path d="M60 31 L68 35 L60 39 Z" fill="#2b3a55"/>
      ${arm}
      <rect x="22" y="53" width="32" height="9" rx="4" fill="#2b3a55"/>
      <circle cx="27" cy="66" r="7" fill="#5a6b8c" stroke="#2b3a55" stroke-width="3"/><circle cx="49" cy="66" r="7" fill="#5a6b8c" stroke="#2b3a55" stroke-width="3"/>
    </svg>`;
  }
  const roboImgs = {};
  function roboImg(k) {                                   // k: {pose, farbe} – Bilder werden einmal erzeugt
    const key = (k.pose || 0) + "|" + (k.farbe || "");
    if (!roboImgs[key]) {
      const img = new Image();
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(roboSVG(k.pose || 0, k.farbe));
      roboImgs[key] = img;
    }
    return roboImgs[key];
  }

  /* Tastatur: wirkt auf die Bühne, die zuletzt angefasst wurde (und sichtbar ist) */
  let aktiv = null;
  const KEYNAME = { ArrowUp: "oben", ArrowDown: "unten", ArrowLeft: "links", ArrowRight: "rechts", " ": "leertaste", Spacebar: "leertaste" };
  const keyName = (ev) => KEYNAME[ev.key] || (/^[a-z0-9]$/i.test(ev.key) ? ev.key.toLowerCase() : null);
  window.addEventListener("keydown", (ev) => { if (aktiv) aktiv(ev, true); });
  window.addEventListener("keyup", (ev) => { if (aktiv) aktiv(ev, false); });
  window.addEventListener("blur", () => { if (aktiv) aktiv(null, false); });

  /* ---------------------------------------------------------------- Bühne mit Editor */
  const SPEED = { schnell: 90, langsam: 650 };
  const PAD = { oben: "▲", links: "◀", unten: "▼", rechts: "▶", leertaste: "Leertaste" };

  function create(el, cfg) {
    cfg = Object.assign({ mode: "frei", edit: true, start: { x: 0, y: 0, dir: 90 }, palette: [], script: [] }, cfg);
    const pointer = { x: null, y: null };                 // Mauszeiger / Finger auf der Bühne
    const welt = { felder: cfg.felder || [], objekte: cfg.objekte || [], maus: pointer, variablen: cfg.variablen || {}, kostueme: cfg.kostueme || KOSTUEME };
    const startStacks = () => { const st = cfg.scripts ? cfg.scripts.map(parseList) : [parseList(cfg.script)]; return st.length ? st : [[]]; };
    let stacks = startStacks();
    // Puzzle: die Ablage enthält genau die Blöcke, die verbaut werden sollen (jeder nur einmal)
    let tray = cfg.mode === "puzzle" ? parseList(cfg.palette) : null;
    const startTray = () => (cfg.mode === "puzzle" ? parseList(cfg.palette) : null);
    const editable = cfg.mode !== "lesen";
    const hasPalette = editable && (cfg.mode === "puzzle" || (cfg.palette && cfg.palette.length > 0));
    const editMode = cfg.mode === "puzzle" ? false : cfg.edit;
    const target = cfg.ziel ? simulate(cfg.ziel, cfg.start, { felder: welt.felder, objekte: welt.objekte, variablen: welt.variablen, kostueme: welt.kostueme }) : null;

    el.classList.add("buehne", "buehne-" + cfg.mode);
    el.innerHTML = `
      <div class="buehne-stage">
        <div class="buehne-canvas"><canvas width="480" height="360" aria-label="${T("Bühne")}"></canvas><div class="buehne-bubble" hidden></div></div>
        <div class="buehne-ctrl">
          <button type="button" class="btn go" title="${T("Start (grüne Flagge)")}">${FLAG}<span>${T("Start")}</span></button>
          <button type="button" class="btn secondary stop" title="${T("Stopp")}" disabled>⏹</button>
          <button type="button" class="btn secondary step" title="${T("Ein Block weiter")}">👣 <span>${T("Schritt")}</span></button>
          <span class="buehne-speed" role="group" aria-label="${T("Tempo")}">
            <button type="button" class="on" data-speed="schnell" title="${T("schnell")}">🐇</button><button type="button" data-speed="langsam" title="${T("Zeitlupe")}">🐢</button>
          </span>
        </div>
        <div class="buehne-pad" role="group" aria-label="${T("Tasten zum Antippen")}" hidden></div>
        ${cfg.figur ? `<div class="buehne-figur" aria-live="off"></div>` : ""}
        <p class="fb buehne-fb" aria-live="polite"></p>
        ${cfg.wertetabelle ? `<div class="buehne-werte"><div class="buehne-label">${T("Werte-Tabelle")}</div><div class="tbl-scroll"><table class="plain"></table></div></div>` : ""}
      </div>
      <div class="buehne-code">
        ${hasPalette ? `<div class="buehne-palette-wrap"><div class="buehne-label">${T(cfg.mode === "puzzle" ? "Diese Blöcke brauchst du" : "Blöcke")}</div><div class="buehne-palette"></div></div>` : ""}
        <div class="buehne-script-wrap"><div class="buehne-label">${T("Skript")}<span class="buehne-count"></span></div><div class="buehne-script"></div></div>
        ${editable ? `<div class="buehne-tools"><button type="button" class="btn secondary reset-code">↺ <span>${T("Von vorn")}</span></button>${hasPalette ? `<span class="buehne-tip">${T("Zum Löschen einen Block zurück zu den Blöcken ziehen.")}</span>` : ""}</div>` : ""}
      </div>`;
    const $ = (s) => el.querySelector(s);
    const canvas = $("canvas"), ctx = canvas.getContext("2d");
    const bubble = $(".buehne-bubble"), fb = $(".buehne-fb"), pad = $(".buehne-pad");
    const pal = $(".buehne-palette"), scr = $(".buehne-script"), cnt = $(".buehne-count");
    let paletteNodes = cfg.mode === "puzzle" ? null : parseList(cfg.palette);
    let S = newState(cfg.start, welt);                     // Zustand der Figur (bleibt nach dem Lauf, wie in Scratch)

    function say(msg, kind) { fb.className = "fb buehne-fb show " + kind; fb.innerHTML = T(msg); }
    const findAll = (id) => { for (const st of stacks) { const h = find(st, id); if (h) return h; } return null; };

    /* --- Zeichnen */
    let vis = { x: cfg.start.x, y: cfg.start.y, dir: cfg.start.dir, costume: 0 };
    let segs = [], partial = null;
    const P = (x, y) => [240 + x, 180 - y];
    function draw() {
      const W = 480, H = 360;
      const css = canvas.getBoundingClientRect().width || W;
      const dpr = Math.min(3, (window.devicePixelRatio || 1) * css / W);
      if (canvas.width !== Math.round(W * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
      welt.felder.forEach(([x1, y1, x2, y2, c]) => {
        const [a, b] = P(Math.min(x1, x2), Math.max(y1, y2));
        ctx.fillStyle = FARBEN[c] || c; ctx.fillRect(a, b, Math.abs(x2 - x1), Math.abs(y2 - y1));
      });
      ctx.strokeStyle = welt.felder.length ? "rgba(120,140,170,.16)" : "#eef1f5"; ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); ctx.stroke(); }
      if (cfg.koordinaten) {                                // x- und y-Achse mit Beschriftung
        ctx.strokeStyle = "rgba(43,58,85,.55)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 180); ctx.lineTo(W, 180); ctx.moveTo(240, 0); ctx.lineTo(240, H); ctx.stroke();
        ctx.fillStyle = "#2b3a55"; ctx.font = "700 13px system-ui, sans-serif"; ctx.textBaseline = "alphabetic";
        ctx.fillText("x", W - 14, 174); ctx.fillText("y", 246, 14); ctx.fillText("0", 244, 194);
        ctx.font = "600 11px system-ui, sans-serif"; ctx.fillStyle = "#5a6573";
        [-200, -120, -40, 40, 120, 200].forEach((v) => { if (v === 0) return; ctx.fillText(String(v), 240 + v - 9, 194); });
        [-160, -80, 80, 160].forEach((v) => ctx.fillText(String(v), 246, 180 - v + 4));
      }
      const line = (s, style, width, dash) => {
        ctx.strokeStyle = style; ctx.lineWidth = width; ctx.lineCap = "round"; ctx.setLineDash(dash || []);
        ctx.beginPath(); ctx.moveTo(...P(s[0], s[1])); ctx.lineTo(...P(s[2], s[3])); ctx.stroke(); ctx.setLineDash([]);
      };
      if (target) target.segs.forEach((s) => line(s, "#c3cad6", 7, [10, 9]));
      (cfg.sterne || []).forEach(([sx, sy]) => star(...P(sx, sy), 1));
      S.obj.forEach((o) => { if (!o.weg) objekt(o); });
      segs.forEach((s) => line(s, "#3d5afe", 3.5));
      if (partial) line(partial, "#3d5afe", 3.5);
      const [px, py] = P(vis.x, vis.y);
      const kost = welt.kostueme[vis.costume] || welt.kostueme[0];
      const img = roboImg(kost), gr = S.size / 100;
      if (!img.complete) img.addEventListener("load", draw, { once: true });
      if (S.visible) {
        ctx.save(); ctx.translate(px, py); ctx.scale(gr, gr);
        if (cfg.drehtyp === "links-rechts") { if (Math.sign(vis.dir) < 0) ctx.scale(-1, 1); }
        else ctx.rotate(rad(vis.dir - 90));
        if (img.complete && img.naturalWidth) ctx.drawImage(img, -32, -32, 64, 64);
        else { ctx.fillStyle = kost.farbe || "#ff8c42"; ctx.fillRect(-14, -14, 28, 28); }
        ctx.restore();
      }
      // Variablen-Anzeige oben links (wie in Scratch)
      let my = S.obj.some((o) => o.fangen) ? 46 : 8;
      Object.keys(S.vars).forEach((name) => {
        if (cfg.anzeige && !cfg.anzeige.includes(name)) return;
        const w0 = fmt(S.vars[name]);
        ctx.font = "700 14px system-ui, sans-serif";
        const wn = ctx.measureText(name).width, wv = Math.max(26, ctx.measureText(w0).width + 14);
        const W1 = wn + wv + 22;
        ctx.fillStyle = "rgba(230,240,255,.95)"; ctx.strokeStyle = "#c4cede"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(8, my, W1, 28, 6) : ctx.rect(8, my, W1, 28); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#575e75"; ctx.textBaseline = "middle"; ctx.fillText(name, 15, my + 14.5);
        ctx.fillStyle = "#ff8c1a"; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(15 + wn + 6, my + 4, wv, 20, 5) : ctx.rect(15 + wn + 6, my + 4, wv, 20); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.fillText(w0, 15 + wn + 6 + wv / 2, my + 14.5); ctx.textAlign = "left";
        my += 34;
      });
      if (figurEl) {
        const kn = kost.name;
        figurEl.innerHTML = `<span><b>${T("Figur")}</b> Robo</span><span><b>x</b> ${Math.round(vis.x)}</span><span><b>y</b> ${Math.round(vis.y)}</span>`
          + `<span><b>${T("Richtung")}</b> ${Math.round(vis.dir)}</span><span><b>${T("Größe")}</b> ${Math.round(S.size)} %</span>`
          + `<span><b>${T("Kostüm")}</b> ${esc(kn)} (${vis.costume + 1})</span><span><b>${T("sichtbar")}</b> ${T(S.visible ? "ja" : "nein")}</span>`;
      }
      if (S.obj.some((o) => o.fangen)) {
        const icon = S.obj.find((o) => o.fangen).art === "zelle" ? "⚡" : "★";
        const txt = `${icon} ${S.gefangen}`;
        ctx.font = "800 18px system-ui, sans-serif";
        const w = ctx.measureText(txt).width + 18;
        ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.strokeStyle = "#c79100"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(8, 8, w, 30, 15) : ctx.rect(8, 8, w, 30); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#5a4100"; ctx.textBaseline = "middle"; ctx.fillText(txt, 17, 24);
      }
      if (cfg.koordinaten) {                                // Wo steht Robo gerade?
        const txt = `x: ${Math.round(vis.x)}   y: ${Math.round(vis.y)}`;
        ctx.font = "800 16px system-ui, sans-serif";
        const w = ctx.measureText(txt).width + 18;
        ctx.fillStyle = "rgba(255,255,255,.94)"; ctx.strokeStyle = "#4c97ff"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(W - w - 8, H - 38, w, 30, 8) : ctx.rect(W - w - 8, H - 38, w, 30); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#1c3d73"; ctx.textBaseline = "middle"; ctx.fillText(txt, W - w + 1, H - 23);
      }
      if (!bubble.hidden) placeBubble();
    }
    // Stern (cfg.sterne: [[x, y], …] zeigt, wohin Robo laufen soll; Objekte mit art "stern")
    function star(cx, cy, k) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = (i % 2 ? 8 : 19) * k, a = Math.PI / 5 * i - Math.PI / 2;
        ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      }
      ctx.closePath(); ctx.fillStyle = "#ffd54a"; ctx.fill();
      ctx.strokeStyle = "#c79100"; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.stroke();
    }
    function objekt(o) {
      const [cx, cy] = P(o.x, o.y), k = 1 + o.hit * 0.07;
      if (o.art === "zelle") {                                 // Energiezelle (Batterie mit Blitz)
        ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
        ctx.fillStyle = "#2b3a55"; ctx.fillRect(-5, -19, 10, 5);
        ctx.fillStyle = "#3ddc84"; ctx.strokeStyle = "#1b7f4a"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-12, -15, 24, 32, 5) : ctx.rect(-12, -15, 24, 32); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#ffe14d"; ctx.strokeStyle = "#7a5b00"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(2, -11); ctx.lineTo(-6, 3); ctx.lineTo(0, 3); ctx.lineTo(-3, 13); ctx.lineTo(7, -2); ctx.lineTo(1, -2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      } else if (o.art === "meteor") {                         // Hindernis, das sich bewegt
        ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
        ctx.fillStyle = "#8a8f9e"; ctx.strokeStyle = "#4a4f5e"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(0, 0, o.r - 1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#6c7180";
        [[-6, -5, 4], [6, 3, 5], [-3, 8, 3]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); });
        ctx.restore();
      } else star(cx, cy, k);
    }
    const figurEl = el.querySelector(".buehne-figur"), werteEl = el.querySelector(".buehne-werte table");
    if (window.ResizeObserver) new ResizeObserver(() => draw()).observe(canvas);

    function sayBubble(text) {
      if (text === null || text === undefined) { bubble.hidden = true; return; }
      bubble.textContent = text;
      bubble.hidden = false;
      placeBubble();
    }
    function placeBubble() {
      const r = canvas.getBoundingClientRect(), k = r.width / 480;
      bubble.style.left = `${Math.max(4, Math.min(r.width - 120, (240 + vis.x + 18) * k))}px`;
      bubble.style.bottom = `${Math.max(4, (180 + vis.y + 22) * k)}px`;
    }

    /* --- Skript anzeigen */
    function renderCode() {
      const opt = { edit: editMode, welt };
      scr.innerHTML = stacks.map((st, i) => `<div class="sb-stack sb-main" data-list="s${i}">${st.map((n) => blockHTML(n, opt)).join("")}</div>`).join("");
      if (pal) {
        const items = tray || paletteNodes;
        pal.innerHTML = items.map((n) => blockHTML(n, { edit: false, welt })).join("")
          || `<p class="buehne-empty">${T("Alle Blöcke verbaut.")}</p>`;
      }
      const c = stacks.reduce((k, st) => k + count(st), 0);
      cnt.textContent = c ? ` · ${c} ${T(c === 1 ? "Block" : "Blöcke")}` : "";
      if (!c && editable) scr.firstChild.innerHTML = `<p class="buehne-empty">${T(cfg.mode === "puzzle" ? "Zieh die Blöcke hierher – in der richtigen Reihenfolge." : "Zieh Blöcke hierher.")}</p>`;
      const edited = () => { stop(); resetStage(); fb.className = "fb buehne-fb"; };
      scr.querySelectorAll("input.sb-in").forEach((inp) => {
        inp.addEventListener("input", () => {
          const hit = findAll(inp.closest(".sb").dataset.id);
          if (hit) hit.node.args[inp.dataset.k] = inp.value;
          inp.style.width = inW(inp.value);
          edited();
        });
      });
      scr.querySelectorAll("select.sb-dd").forEach((sel) => {
        sel.addEventListener("change", () => {
          const hit = findAll(sel.closest(".sb").dataset.id);
          if (hit) hit.node.args[sel.dataset.k] = sel.value;
          if (sel.classList.contains("sb-color")) sel.style.background = FARBEN[sel.value] || "";
          updatePad(); edited(); if (cfg.onChange) cfg.onChange(api);
        });
      });
      updatePad();
    }

    /* --- Knöpfe zum Antippen (iPad ohne Tastatur): für jede Taste, die im Programm vorkommt */
    function keysUsed() {
      if (cfg.tasten) return cfg.tasten;
      const ks = new Set();
      const look = (n) => { if (n.op === "key" || n.op === "keypressed") ks.add(n.args.k); };
      stacks.forEach((st) => walk(st, look));
      walk(tray || paletteNodes || [], look);
      if (ks.has("beliebig")) { ks.delete("beliebig"); ks.add("leertaste"); }
      ks.delete("");
      const out = [];
      if (ARROWS.some((a) => ks.has(a))) out.push(...ARROWS);
      if (ks.has("leertaste")) out.push("leertaste");
      [...ks].filter((k) => k.length === 1).sort().forEach((k) => out.push(k));
      return out;
    }
    let padKeys = "";
    function updatePad() {
      const ks = keysUsed();
      if (ks.join() === padKeys) return;
      padKeys = ks.join();
      pad.hidden = !ks.length;
      const arrows = ARROWS.filter((a) => ks.includes(a)), rest = ks.filter((k) => !ARROWS.includes(k));
      const btn = (k) => `<button type="button" class="pad-${k.length === 1 ? "char" : k}" data-key="${k}" aria-label="${esc(T(ddLabel(DEF.key.parts[1], k)))}" title="${esc(T(ddLabel(DEF.key.parts[1], k)))}">${esc(T(PAD[k] || k))}</button>`;
      pad.innerHTML = (arrows.length ? `<div class="pad-arrows">${arrows.map(btn).join("")}</div>` : "")
        + rest.map(btn).join("")
        + `<span class="pad-tip">${T("Antippen und halten – wie die Taste auf der Tastatur.")}</span>`;
    }
    const keysDown = new Set();
    const repeatTimers = {};
    function keyDown(k, repeat) {
      aktiv = onKey;
      keysDown.add(k);
      const b = pad.querySelector(`[data-key="${k}"]`); if (b) b.classList.add("down");
      trigger("key", k, repeat);
    }
    function keyUp(k) {
      keysDown.delete(k);
      clearTimeout(repeatTimers[k]); clearInterval(repeatTimers[k + "_"]);
      const b = pad.querySelector(`[data-key="${k}"]`); if (b) b.classList.remove("down");
    }
    pad.addEventListener("pointerdown", (ev) => {
      const b = ev.target.closest("button[data-key]");
      if (!b) return;
      ev.preventDefault();
      try { b.setPointerCapture(ev.pointerId); } catch (e) { /* egal */ }
      const k = b.dataset.key;
      keyDown(k);
      clearTimeout(repeatTimers[k]); clearInterval(repeatTimers[k + "_"]);
      repeatTimers[k] = setTimeout(() => { repeatTimers[k + "_"] = setInterval(() => { if (keysDown.has(k)) trigger("key", k, true); }, 90); }, 400);
    });
    // Kurzes Antippen gilt mindestens 0,1 s lang als gedrückt – sonst übersieht „Taste … gedrückt?“ (30-mal pro Sekunde) es leicht
    const padDownAt = {}, padLater = {};
    pad.addEventListener("pointerdown", (ev) => {
      const b = ev.target.closest("button[data-key]");
      if (b) { padDownAt[b.dataset.key] = performance.now(); clearTimeout(padLater[b.dataset.key]); }
    }, true);
    const padUp = (ev) => {
      const b = ev.target.closest && ev.target.closest("button[data-key]");
      if (!b) return;
      const k = b.dataset.key, rest = 100 - (performance.now() - (padDownAt[k] || 0));
      if (rest > 0) padLater[k] = setTimeout(() => keyUp(k), rest); else keyUp(k);
    };
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => pad.addEventListener(t, padUp));
    pad.addEventListener("contextmenu", (ev) => ev.preventDefault());
    function onKey(ev, down) {
      if (!ev) { [...keysDown].forEach(keyUp); return; }
      const k = keyName(ev);
      if (!k || pad.hidden) return;                       // Bühne ohne Tasten: Pfeile scrollen die Seite wie immer
      if (ev.target && ev.target.closest && ev.target.closest("input, select, textarea")) return;
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      ev.preventDefault();
      if (down) { if (ev.repeat && keysDown.has(k)) trigger("key", k, true); else keyDown(k); }
      else keyUp(k);
    }
    el.addEventListener("pointerdown", () => { aktiv = onKey; }, true);

    /* --- Robo antippen (Wenn diese Figur angeklickt wird) und Mauszeiger */
    function stageXY(ev) {
      const r = canvas.getBoundingClientRect(), k = r.width / 480;
      return { x: (ev.clientX - r.left) / k - 240, y: 180 - (ev.clientY - r.top) / k };
    }
    canvas.addEventListener("pointermove", (ev) => { const p = stageXY(ev); pointer.x = p.x; pointer.y = p.y; });
    canvas.addEventListener("pointerdown", (ev) => {
      const p = stageXY(ev); pointer.x = p.x; pointer.y = p.y;
      if (S.visible && Math.hypot(p.x - vis.x, p.y - vis.y) < Math.max(20, 34 * S.size / 100)) trigger("click");
    });

    /* --- Ziehen und Ablegen (Maus und Finger: Pointer-Events) */
    let drag = null;
    function listOf(id) {
      if (/^s\d+$/.test(id)) return stacks[+id.slice(1)];
      const [bid, two] = id.split(":");
      const h = findAll(bid);
      return h ? (two ? h.node.body2 : h.node.body) : null;
    }
    const isFlagStack = (st) => st[0] && st[0].op === "flag";
    function slots(dragNode) {
      const out = [];
      const d = DEF[dragNode.op];
      if (d.rep) {                                     // Werte-Block: in jedes runde Feld
        scr.querySelectorAll("[data-rs]").forEach((sl) => {
          const r = sl.getBoundingClientRect();
          out.push({ bool: true, rep: true, id: sl.dataset.rs, k: sl.dataset.k, el: sl, x: r.left, y: r.top + r.height / 2 });
        });
        return out;
      }
      if (d.bool) {
        scr.querySelectorAll(".sb-slot").forEach((sl) => {
          const r = sl.getBoundingClientRect();
          out.push({ bool: true, id: sl.dataset.slot, k: sl.dataset.k, el: sl, x: r.left, y: r.top + r.height / 2 });
        });
        return out;
      }
      scr.querySelectorAll(".sb-stack[data-list]").forEach((st) => {
        const id = st.dataset.list, list = listOf(id);
        if (!list) return;
        const top = /^s\d+$/.test(id);
        const kids = [...st.children].filter((c) => c.classList.contains("sb"));
        const r = st.getBoundingClientRect();
        const hasHat = !!hatOf(list);
        for (let i = 0; i <= kids.length; i++) {
          // Startblock nur ganz oben in ein Skript ohne Startblock; nichts über einen Startblock, nichts unter „stoppe“/„fortlaufend“
          if (d.hat) { if (!(top && i === 0 && !hasHat)) continue; }
          else {
            if (top && i === 0 && hasHat) continue;
            if (i > 0 && list[i - 1] && DEF[list[i - 1].op].cap) continue;
          }
          const y = i < kids.length ? kids[i].getBoundingClientRect().top : (kids.length ? kids[kids.length - 1].getBoundingClientRect().bottom : r.top + 4);
          out.push({ list, index: i, x: r.left, y });
        }
      });
      // Startblock: neues Skript darunter (eine zweite Flagge nur, wenn es noch keine gibt)
      if (d.hat && !(dragNode.op === "flag" && stacks.some(isFlagStack)) && stacks.some((st) => st.length)) {
        const all = [...scr.querySelectorAll(".sb-main")];
        const r = all[all.length - 1].getBoundingClientRect();
        out.push({ neu: true, x: r.left, y: r.bottom + 26 });
      }
      return out;
    }
    function startDrag(ev, node, fromScript, srcEl) {
      const rect = srcEl.getBoundingClientRect();
      drag = { node, fromScript, dx: ev.clientX - rect.left, dy: ev.clientY - rect.top, sx: ev.clientX, sy: ev.clientY, moved: false, srcEl, pid: ev.pointerId };
    }
    function beginMove() {
      const d = drag;
      d.moved = true;
      if (d.fromScript) {
        const h = findAll(d.node.id);
        if (h.slot) {
          d.origin = { slot: h.slot };
          const f = fieldsOf(h.slot.node.op).find((q) => q.k === h.slot.k), lit = h.slot.node.lit || {};
          h.slot.node.args[h.slot.k] = f.t === "bool" ? null : (h.slot.k in lit ? lit[h.slot.k] : f.d);   // die Zahl kommt zurück
        }
        else { d.origin = { list: h.list, index: h.index }; h.list.splice(h.index, 1); }
      } else if (tray) {
        tray = tray.filter((n) => n.id !== d.node.id);
      } else {
        d.node = clone(d.node);                    // aus der Palette: Kopie, die Palette bleibt voll
      }
      renderCode();
      d.ghost = document.createElement("div");
      d.ghost.className = "buehne-ghost";
      d.ghost.innerHTML = `<div class="sb-stack">${blockHTML(d.node, { edit: false, welt })}</div>`;
      document.body.appendChild(d.ghost);
      d.mark = document.createElement("div");
      d.mark.className = "buehne-mark";
      document.body.appendChild(d.mark);
      d.slots = slots(d.node);
      document.documentElement.classList.add("buehne-dragging");
      stop(); resetStage();
    }
    function nearest(x, y) {
      const r = scr.getBoundingClientRect();
      if (x < r.left - 30 || x > r.right + 30 || y < r.top - 30 || y > r.bottom + 60) return null;
      let best = null, bd = Infinity;
      drag.slots.forEach((s) => {
        const dist = s.bool ? Math.hypot(x - s.x, y - s.y) : Math.hypot((x - s.x) * 0.8, y - s.y);
        if (dist < bd) { bd = dist; best = s; }
      });
      if (best && best.bool && bd > 70) return null;      // Sechseck nur in die Nähe eines Sechseck-Felds
      return best;
    }
    function onMove(ev) {
      if (!drag || ev.pointerId !== drag.pid) return;
      if (!drag.moved) {
        if (Math.hypot(ev.clientX - drag.sx, ev.clientY - drag.sy) < 6) return;
        beginMove();
      }
      ev.preventDefault();
      const gx = ev.clientX - drag.dx, gy = ev.clientY - drag.dy;
      drag.ghost.style.transform = `translate(${gx}px, ${gy}px)`;
      const isBool = DEF[drag.node.op].bool || DEF[drag.node.op].rep;
      const s = isBool ? nearest(gx + 4, gy + drag.ghost.offsetHeight / 2) : nearest(gx + 8, gy + 6);
      if (drag.slot && drag.slot.el) drag.slot.el.classList.remove("sb-slot-hi");
      drag.slot = s;
      if (s && s.bool) { s.el.classList.add("sb-slot-hi"); drag.mark.style.display = "none"; }
      else if (s) {
        drag.mark.style.display = "block";
        drag.mark.style.transform = `translate(${s.x + window.scrollX}px, ${s.y + window.scrollY - 3}px)`;
        drag.mark.style.position = "absolute";
      } else drag.mark.style.display = "none";
    }
    function dropInSlot(id, k, node) {
      const h = findAll(id);
      if (!h || isNode(h.node.args[k])) return false;
      const f = fieldsOf(h.node.op).find((q) => q.k === k);
      if (f.t === "bool" ? (h.node.args[k] || !DEF[node.op].bool) : !(DEF[node.op].rep)) return false;
      if (f.t !== "bool") h.node.lit = { ...(h.node.lit || {}), [k]: h.node.args[k] };   // Zahl merken, falls der Block wieder herauskommt
      h.node.args[k] = node;
      return true;
    }
    function tidy() {                                   // leere Skripte entfernen (eins bleibt immer)
      stacks = stacks.filter((st, i) => st.length || i === 0);
      if (!stacks[0].length && stacks.length > 1) stacks.shift();
    }
    function onUp(ev) {
      if (!drag || ev.pointerId !== drag.pid) return;
      const d = drag;
      drag = null;
      document.documentElement.classList.remove("buehne-dragging");
      if (!d.moved) {
        // Antippen eines Palettenblocks = ans Skript anhängen (hilft am Tablet)
        if (!d.fromScript && !(ev.target.closest && ev.target.closest("input, select"))) {
          const n = tray ? d.node : clone(d.node);
          const dd = DEF[n.op];
          if (dd.rep) {                                 // Werte-Block: ins erste runde Feld
            const sl = scr.querySelector("[data-rs]");
            if (!sl || !dropInSlot(sl.dataset.rs, sl.dataset.k, n)) return;
          } else if (dd.bool) {                         // Sechseck: ins erste freie Feld
            const sl = scr.querySelector(".sb-slot");
            if (!sl || !dropInSlot(sl.dataset.slot, sl.dataset.k, n)) return;
          } else if (dd.hat) {
            if (n.op === "flag" && stacks.some(isFlagStack)) return;
            const free = stacks.find((st) => !hatOf(st));
            if (free) free.unshift(n); else stacks.push([n]);
          } else stacks[stacks.length - 1].push(n);
          if (tray) tray = tray.filter((x) => x.id !== n.id);
          renderCode(); changed();
        }
        return;
      }
      d.ghost.remove(); d.mark.remove();
      if (d.slot && d.slot.el) d.slot.el.classList.remove("sb-slot-hi");
      let placed = false;
      if (d.slot) {
        if (d.slot.bool) placed = dropInSlot(d.slot.id, d.slot.k, d.node);
        else if (d.slot.neu) { stacks.push([d.node]); placed = true; }
        else { d.slot.list.splice(d.slot.index, 0, d.node); placed = true; }
      }
      if (!placed) {
        if (tray) tray.push(d.node);             // im Puzzle zurück in die Ablage
        else if (!hasPalette && d.origin) {      // ohne Palette nichts löschen
          if (d.origin.slot) d.origin.slot.node.args[d.origin.slot.k] = d.node;
          else d.origin.list.splice(d.origin.index, 0, d.node);
        }
      }
      tidy();
      renderCode(); changed();
    }
    function changed() {
      fb.className = "fb buehne-fb";
      if (cfg.onChange) cfg.onChange(api);
    }
    if (editable) {
      el.querySelector(".buehne-code").addEventListener("pointerdown", (ev) => {
        if (ev.button !== undefined && ev.button !== 0) return;
        if (ev.target.closest("input, select")) return;
        const b = ev.target.closest(".sb");
        if (!b) return;
        const inScript = scr.contains(b);
        if (inScript) {
          const h = findAll(b.dataset.id);
          if (!h || h.node.lock) return;
          startDrag(ev, h.node, true, b);
        } else {
          const items = tray || paletteNodes;
          const n = items.find((x) => x.id === b.dataset.id);
          if (n) startDrag(ev, n, false, b);
        }
      });
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", (ev) => { if (drag && drag.moved) onUp(ev); else drag = null; });
      el.querySelector(".reset-code").addEventListener("click", () => {
        stop(); stacks = startStacks(); tray = startTray(); renderCode(); resetStage(true); werteLeer(); changed();
      });
    }

    /* --- Ausführen */
    let run = null;           // { token, threads, forever, anlass }
    let speed = "schnell", stepMode = false, stepWaits = [];
    // Nächstes Bild: requestAnimationFrame, mit Zeitgeber als Ersatz (rAF ruht in versteckten Tabs)
    const frame = () => new Promise((r) => {
      let done = false;
      const f = () => { if (!done) { done = true; r(); } };
      requestAnimationFrame(f); setTimeout(f, 40);
    });
    const alive = (tok) => !!run && run.token === tok;
    const sleep = async (ms, tok) => {
      const t0 = performance.now();
      while (alive(tok) && performance.now() - t0 < ms) {
        await new Promise((r) => setTimeout(r, Math.min(40, ms - (performance.now() - t0))));
      }
    };
    function showRun() {
      scr.querySelectorAll(".sb-run").forEach((x) => x.classList.remove("sb-run"));
      if (!run) return;
      run.threads.forEach((th) => {
        if (!th.cur) return;
        const b = scr.querySelector(`.sb[data-id="${th.cur}"]`);
        if (b) b.classList.add("sb-run");
      });
    }
    function hi(th, id) {
      th.cur = id;
      scr.querySelectorAll(".sb-val").forEach((c) => c.remove());
      showRun();
    }
    function counter(id, i, n) {
      const b = scr.querySelector(`.sb[data-id="${id}"] > .sb-c-head`);
      if (!b) return;
      let c = b.querySelector(".sb-count");
      if (!c) { c = document.createElement("span"); c.className = "sb-count"; b.appendChild(c); }
      c.textContent = i ? T(n ? `Runde ${i} von ${n}` : `Runde ${i}`) : "";
      if (!i) c.remove();
    }
    function showVal(n, v) {                               // Bedingung: „wahr“ oder „falsch“ neben dem Sechseck
      const b = scr.querySelector(`.sb[data-id="${n.id}"]`);
      const head = b && (b.querySelector(":scope > .sb-c-head") || b);
      if (!head) return;
      const c = document.createElement("span");
      c.className = "sb-val " + (v ? "wahr" : "falsch");
      c.textContent = T(v ? "wahr" : "falsch");
      head.appendChild(c);
    }
    function resetStage(ganz) {
      const alt = S;
      S = newState(cfg.start, welt);
      S.keys = keysDown;
      if (cfg.seed !== undefined) S.seed = cfg.seed;
      if (alt && !ganz) {                                   // wie Scratch: Variablen behalten ihren Wert
        S.vars = alt.vars;
        if (cfg.merken) ["x", "y", "dir", "size", "visible", "costume"].forEach((k) => { S[k] = alt[k]; });
      }
      vis = { x: S.x, y: S.y, dir: S.dir, costume: S.costume };
      segs = []; partial = null; sayBubble(null); showRun();
      scr.querySelectorAll(".sb-count, .sb-val").forEach((c) => c.remove());
      draw();
    }
    // Tempo wie echtes Scratch (bei 🐇): Blöcke ohne Pause, jede Schleifenrunde ein Bild (1/30 s).
    // cfg.echtzeit: true = immer, false = nie; sonst automatisch bei Spielen (Tasten, fortlaufend, Objekte, die sich bewegen).
    function interaktiv() {
      let ja = welt.objekte.some((o) => o.dx || o.dy || o.fangen);
      stacks.forEach((st) => walk(st, (n) => { if (["forever", "key", "click", "keypressed", "waituntil"].includes(n.op)) ja = true; }));
      return ja;
    }
    const echt = () => !stepMode && speed === "schnell" && (cfg.echtzeit === true || (cfg.echtzeit !== false && run && run.interaktiv));
    async function pause(tok, runde) {
      if (stepMode) { await new Promise((res) => { stepWaits.push(res); }); }
      else if (echt()) { if (runde) await sleep(1000 / 30, tok); }
      else await sleep(SPEED[speed], tok);
    }
    async function animate(from, s, tok) {
      const ms = stepMode ? 350 : echt() ? 0 : Math.min(SPEED[speed] * 0.85, 500);
      const t0 = performance.now();
      const seg = s.segs.length > segs.length ? s.segs[s.segs.length - 1] : null;
      while (alive(tok)) {
        const t = ms ? Math.min(1, (performance.now() - t0) / ms) : 1;
        vis.x = from.x + (s.x - from.x) * t; vis.y = from.y + (s.y - from.y) * t;
        let dd = s.dir - from.dir; if (dd > 180) dd -= 360; if (dd < -180) dd += 360;
        if (from.turn !== undefined) dd = from.turn;
        vis.dir = from.dir + dd * t;
        partial = seg ? [seg[0], seg[1], vis.x, vis.y] : null;
        draw();
        if (t >= 1) break;
        await frame();
      }
      partial = null; segs = s.segs.slice(); vis = { x: s.x, y: s.y, dir: s.dir, costume: s.costume }; draw();
    }
    async function handle(e, th, tok) {
      switch (e.t) {
        case "hat": hi(th, e.n.id); await pause(tok); break;
        case "loop": hi(th, e.n.id); counter(e.n.id, e.i, e.k); await pause(tok, true); break;
        case "end": counter(e.n.id, 0); break;
        case "cond":
          hi(th, e.n.id); showVal(e.n, e.v);
          if (e.n.op === "until") counter(e.n.id, e.v ? 0 : e.i);
          await pause(tok, !!e.runde);
          break;
        case "stop": hi(th, e.n.id); break;
        case "block": {
          hi(th, e.n.id);
          await animate(e.from, S, tok);
          if (e.n.op === "say") sayBubble(S.says[S.says.length - 1]);
          if (e.n.op === "setvar" || e.n.op === "changevar") werteZeile(e.n);
          else if (e.n.op === "saynow") sayBubble(S.bubble);
          if (e.wait > 0) await sleep(e.wait * 1000, tok);
          if (e.n.op === "say") { S.bubble = null; sayBubble(null); }
          await pause(tok);
          break;
        }
      }
    }
    async function runThread(th, tok) {
      run.threads.add(th);
      for (;;) {
        if (!alive(tok) || th.end) break;
        const r = th.gen.next();
        if (r.done) break;
        await handle(r.value, th, tok);
        if (S.halt === "stop" && alive(tok)) { done(tok); return; }   // „stoppe alles“
      }
      if (!alive(tok)) return;
      run.threads.delete(th); th.cur = null; showRun();
      if (!run.threads.size) done(tok);
    }
    function beginRun(anlass) {
      const tok = Symbol("lauf");
      run = { token: tok, threads: new Set(), anlass, interaktiv: interaktiv(), forever: stacks.some((st) => { let f = false; walk(st, (n) => { if (n.op === "forever") f = true; }); return f; }) };
      if (cfg.seed === undefined) S.seed = 1 + Math.floor(Math.random() * 2147483645);
      S.halt = false; S.steps = 0; S.limit = run.forever || run.interaktiv || anlass !== "flag" ? Infinity : cfg.limit || MAX_STEPS;
      el.classList.add("running");
      $(".stop").disabled = false;
      aktiv = onKey;
      // Die Welt läuft mit 30 Bildern pro Sekunde weiter (Objekte, Sterne fangen, Prüfung bei Spielen)
      const ticker = setInterval(() => {
        if (!alive(tok)) { clearInterval(ticker); return; }
        if (stepMode) return;
        tick(S); draw();
        if (run.forever && cfg.check) {
          const tr = trace(S, stacks); tr.live = true; tr.anlass = run.anlass;
          const res = cfg.check(tr, api);
          if (res === true) { api.last = tr; finish(tok, cfg.ok || "✔ Geschafft!", "ok", tr); }
          else if (typeof res === "string" && res !== run.hinweis) { run.hinweis = res; say(res, "hint"); }   // Spiel läuft weiter
        }
      }, 1000 / 30);
      return tok;
    }
    /* Werte-Tabelle: eine Zeile pro setze/ändere */
    let werteNr = 0;
    function werteLeer() {
      if (!werteEl) return;
      const vs = Object.keys(welt.variablen);
      werteNr = 0;
      werteEl.innerHTML = `<tr><th>${T("Schritt")}</th><th>${T("Block")}</th>${vs.map((v) => `<th>${esc(v)}</th>`).join("")}</tr>`;
    }
    function werteZeile(n) {
      if (!werteEl) return;
      const vs = Object.keys(welt.variablen), a = n.args;
      const w = isNode(a.n) ? "(…)" : fmt(a.n);
      const txt = n.op === "setvar" ? `setze ${a.v} auf ${w}` : `ändere ${a.v} um ${w}`;
      werteEl.insertAdjacentHTML("beforeend", `<tr><td>${++werteNr}</td><td>${esc(txt)}</td>${vs.map((v) => `<td>${esc(fmt(S.vars[v]))}</td>`).join("")}</tr>`);
    }
    async function start() {
      stop();
      resetStage();
      werteLeer();
      const tok = beginRun("flag");
      if (hasEmptyGap()) { finish(tok, "Füll zuerst alle gelben Felder aus.", "hint"); return; }
      const flagStacks = stacks.filter(isFlagStack);
      if (!flagStacks.length) {
        await sleep(200, tok);
        const keyHat = stacks.find((st) => hatOf(st) && hatOf(st).op !== "flag");
        finish(tok, keyHat
          ? (hatOf(keyHat).op === "key" ? "Dein Skript startet nicht mit der Flagge, sondern mit einer <b>Taste</b>. Drück die Taste – oder tipp unter der Bühne auf den Knopf."
            : "Dein Skript startet, wenn du <b>Robo antippst</b> (oder anklickst).")
          : stacks.some((st) => st.length) ? "Es passiert nichts. Dein Skript braucht ganz oben den Block <b>Wenn ⚑ angeklickt wird</b> – sonst weiß Scratch nicht, wann es losgehen soll."
            : "Das Skript ist noch leer.", "hint");
        return;
      }
      await Promise.all(flagStacks.map((st) => runThread(newThread(st, S), tok)));
    }
    /** Taste gedrückt oder Robo angeklickt: passende Skripte starten (läuft schon eins, bleibt es dabei – wie Scratch). */
    function trigger(kind, k, repeat) {
      const st = stacks.filter((x) => (kind === "key" ? keyMatch(x, k) : hatOf(x) && hatOf(x).op === kind));
      if (kind === "key" && !repeat) S.tasten++;
      if (!st.length) return;
      if (hasEmptyGap()) { say("Füll zuerst alle gelben Felder aus.", "hint"); return; }
      if (!run) { beginRun(kind); fb.className = "fb buehne-fb"; }
      const tok = run.token;
      st.forEach((x) => {
        if ([...run.threads].some((th) => th.stack === x)) return;
        runThread(newThread(x, S), tok);
      });
    }
    function hasEmptyGap() {
      let leer = false;
      stacks.forEach((st) => walk(st, (n) => {
        Object.keys(n.gaps || {}).forEach((k) => {
          if (!n.gaps[k]) return;
          const f = fieldsOf(n.op).find((q) => q.k === k);
          if (f && f.t === "bool" ? !n.args[k] : String(n.args[k]).trim() === "") leer = true;
        });
      }));
      return leer;
    }
    function done(tok) {
      if (!alive(tok)) return;
      const tr = trace(S, stacks); tr.anlass = run.anlass;
      api.last = tr;
      let res = S.errors.length ? "In einem Feld steht keine Zahl." : cfg.check ? cfg.check(tr, api) : null;
      if ((res === null || res === undefined) && S.halt === "limit") {
        res = "Robo hat nach sehr vielen Blöcken aufgehört. Hört eine Schleife nie auf? (In Scratch würde sie ewig laufen.)";
      }
      if ((res === null || res === undefined) && target && run.anlass === "flag") {
        res = sameDrawing(tr.segs, target.segs) ? true : "Noch nicht ganz. Vergleich deine Linien mit der grauen Vorlage.";
      }
      if (res === true) finish(tok, cfg.ok || "✔ Geschafft!", "ok", tr);
      else if (typeof res === "string") finish(tok, res, "hint", tr);
      else finish(tok, null, null, tr);
    }
    function finish(tok, msg, kind, tr) {
      if (!alive(tok)) return;
      run = null; showRun();
      scr.querySelectorAll(".sb-val").forEach((c) => c.remove());
      el.classList.remove("running");
      $(".stop").disabled = true;
      stepWaits.splice(0).forEach((r) => r());
      if (msg) say(msg, kind);
      draw();
      if (cfg.onRun && tr) cfg.onRun(tr, kind === "ok", api);
    }
    function stop() {
      if (run) { run = null; el.classList.remove("running"); $(".stop").disabled = true; showRun(); S.bubble = null; sayBubble(null); }
      stepWaits.splice(0).forEach((r) => r());
    }

    $(".go").addEventListener("click", () => { stepMode = false; start(); });
    $(".stop").addEventListener("click", () => { stop(); });
    $(".step").addEventListener("click", () => {
      if (run && stepMode && stepWaits.length) { stepWaits.splice(0).forEach((r) => r()); return; }
      if (run && !stepMode) { stepMode = true; return; }
      stepMode = true; start();
    });
    el.querySelectorAll(".buehne-speed button").forEach((b) => b.addEventListener("click", () => {
      speed = b.dataset.speed;
      el.querySelectorAll(".buehne-speed button").forEach((x) => x.classList.toggle("on", x === b));
    }));

    const api = {
      el,
      get script() { return stacks[0]; },
      set script(v) { stacks = [parseList(v)]; renderCode(); resetStage(true); },
      get scripts() { return stacks; },
      set scripts(v) { stacks = v.map(parseList); if (!stacks.length) stacks = [[]]; renderCode(); resetStage(true); },
      /** alles auf Anfang: Variablen, Attribute, Werte-Tabelle */
      reset: () => { stop(); resetStage(true); werteLeer(); },
      run: () => { stepMode = false; return start(); },
      stop, simulate: () => simulateAll(stacks, cfg.start, { felder: welt.felder, objekte: welt.objekte, variablen: welt.variablen, kostueme: welt.kostueme }),
      count: () => stacks.reduce((k, st) => k + count(st), 0),
      feedback: (msg, kind) => say(msg, kind),
      /** Taste drücken (wie Knopf oder Tastatur): taste("rechts") drückt kurz, taste("rechts", true/false) hält / lässt los */
      taste: (k, halten) => { if (halten === false) keyUp(k); else { keyDown(k); if (halten !== true) keyUp(k); } },
      klick: () => trigger("click"),
      /** wartet, bis nichts mehr läuft */
      fertig: () => new Promise((r) => { const f = () => (run ? setTimeout(f, 20) : r()); f(); }),
      get state() { return S; },
      get laeuft() { return !!run; },
      last: null,
    };
    renderCode();
    // Puzzle: Ablage behält ihre Höhe, sonst springt das Skript beim Ziehen nach oben
    if (tray && pal) requestAnimationFrame(() => { if (pal.offsetHeight) pal.style.minHeight = pal.offsetHeight + "px"; });
    if (tray && pal && window.ResizeObserver) {
      const ro = new ResizeObserver(() => { if (pal.offsetHeight && !pal.style.minHeight) pal.style.minHeight = pal.offsetHeight + "px"; });
      ro.observe(pal);
    }
    resetStage(true);
    werteLeer();
    el.buehne = api;
    return api;
  }

  /** Alle <div data-script='[…]'> auf der Seite als Blockbild zeigen. */
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-script]").forEach((d) => {
      d.innerHTML = render(JSON.parse(d.dataset.script), { small: d.hasAttribute("data-small") });
    });
  });

  window.Buehne = { create, render, simulate, simulateAll, sameDrawing, parse, count, DEF, FARBEN, robo: roboSVG };
})();
