/* Übungsbühne für den Scratch-Kurs.
   Blöcke wie in Scratch (deutsche Originaltexte), ziehen mit Maus oder Finger, Figur mit Malstift,
   Zeitlupe, Schritt für Schritt, automatische Prüfung.
   Kein Scratch-Code, keine Scratch-Grafiken: alles selbst gebaut. Die Figur „Robo“ ist eigene Zeichnung.
   Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic.

   Skripte werden kurz geschrieben:
     ["flag", ["pendown"], ["repeat", 4, [["move", 100], ["right", 90]]]]
   "!move" = festgenagelt (lässt sich nicht verschieben), Wert "?" = Lücke (gelbes Feld zum Ausfüllen).
*/
(function () {
  "use strict";
  const T = (x) => (window.T ? window.T(x) : x);

  /* ---------------------------------------------------------------- Blöcke */
  // Texte wie im deutschen Scratch 3 (scratch-l10n). Felder: {k: Name, d: Startwert, t: "num"|"text"}
  const DEF = {
    flag:     { cat: "events",  hat: true, parts: ["Wenn", { flag: true }, "angeklickt wird"] },
    move:     { cat: "motion",  parts: ["gehe", { k: "n", d: 10 }, "er Schritt"] },
    right:    { cat: "motion",  parts: ["drehe dich", { icon: "↻" }, "um", { k: "g", d: 15 }, "Grad"] },
    left:     { cat: "motion",  parts: ["drehe dich", { icon: "↺" }, "um", { k: "g", d: 15 }, "Grad"] },
    "goto":   { cat: "motion",  parts: ["gehe zu x:", { k: "x", d: 0 }, "y:", { k: "y", d: 0 }] },
    dir:      { cat: "motion",  parts: ["setze Richtung auf", { k: "g", d: 90 }, "Grad"] },
    say:      { cat: "looks",   parts: ["sage", { k: "t", d: "Hallo!", t: "text" }, "für", { k: "s", d: 2 }, "Sekunden"] },
    costume:  { cat: "looks",   parts: ["wechsle zum nächsten Kostüm"] },
    wait:     { cat: "control", parts: ["warte", { k: "s", d: 1 }, "Sekunden"] },
    repeat:   { cat: "control", c: true, parts: ["wiederhole", { k: "n", d: 10 }, "mal"] },
    pendown:  { cat: "pen",     parts: ["schalte Stift ein"] },
    penup:    { cat: "pen",     parts: ["schalte Stift aus"] },
    clear:    { cat: "pen",     parts: ["lösche alles"] },
  };
  const fieldsOf = (op) => DEF[op].parts.filter((p) => p && p.k);

  let uid = 0;
  /** Kurzschreibweise → Block-Objekt {id, op, args, body?, lock?, gaps?} */
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
      let v = a.length && !Array.isArray(a[0]) ? a.shift() : f.d;
      if (v === "?") { node.gaps[f.k] = true; v = ""; }
      node.args[f.k] = v;
    });
    if (d.c) node.body = (a.length && Array.isArray(a[0]) ? a.shift() : []).map(parse);
    return node;
  }
  const parseList = (list) => (list || []).map(parse);
  function clone(n) {
    const c = { id: "b" + (++uid), op: n.op, args: { ...n.args }, gaps: { ...n.gaps } };
    if (n.lock) c.lock = true;
    if (n.body) c.body = n.body.map(clone);
    return c;
  }
  function count(list) { return list.reduce((s, n) => s + 1 + (n.body ? count(n.body) : 0), 0); }
  function find(list, id, parent) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === id) return { list, index: i, node: list[i], parent };
      if (list[i].body) { const r = find(list[i].body, id, list[i]); if (r) return r; }
    }
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

  /** HTML für einen Block. opt.edit: true | "gaps" | false */
  function blockHTML(n, opt) {
    const d = DEF[n.op];
    const inner = d.parts.map((p) => {
      if (typeof p === "string") return `<span>${esc(p)}</span>`;
      if (p.flag) return FLAG;
      if (p.icon) return `<span class="sb-ico">${p.icon}</span>`;
      const v = n.args[p.k];
      const gap = n.gaps && n.gaps[p.k];
      const editable = opt.edit === true || (opt.edit === "gaps" && gap);
      const cls = "sb-in" + (p.t === "text" ? " sb-txt" : "") + (gap ? " sb-gap" : "");
      if (editable) {
        return `<input class="${cls}" data-k="${p.k}" value="${esc(v)}" style="width:${inW(v)}" ${p.t === "text" ? "" : 'inputmode="decimal"'} aria-label="${esc(p.k)}" autocomplete="off">`;
      }
      return `<span class="${cls}">${v === "" ? "&nbsp;?&nbsp;" : esc(v)}</span>`;
    }).join("");
    const lock = n.lock ? " sb-lock" : "";
    if (d.c) {
      return `<div class="sb sb-${d.cat} sb-c${lock}" data-id="${n.id}"><div class="sb-c-head">${inner}</div>`
        + `<div class="sb-c-mid"><div class="sb-stack" data-list="${n.id}">${n.body.map((b) => blockHTML(b, opt)).join("")}</div></div>`
        + '<div class="sb-c-foot"></div></div>';
    }
    return `<div class="sb sb-${d.cat}${d.hat ? " sb-hat" : ""}${lock}" data-id="${n.id}">${inner}</div>`;
  }
  /** Fertiges Skript als Bild (nicht ziehbar) – für Erklärungen im Text. */
  function render(list, opt) {
    const nodes = parseList(list);
    return `<div class="sb-stack sb-static${opt && opt.small ? " sb-small" : ""}">${nodes.map((n) => blockHTML(n, { edit: false })).join("")}</div>`;
  }

  /* ---------------------------------------------------------------- Ablauf (ohne Anzeige) */
  const rad = (g) => (g * Math.PI) / 180;
  const norm = (g) => { let r = ((g + 179) % 360 + 360) % 360 - 179; return r; };   // wie Scratch: -179 … 180

  function newState(start) {
    return { x: start.x, y: start.y, dir: start.dir, pen: false, costume: 0, wechsel: 0, segs: [], says: [], steps: 0, errors: [] };
  }
  /** Führt einen einfachen Block aus und ändert den Zustand. Gibt Wartezeit in s zurück (warte, sage). */
  function apply(s, n) {
    const a = n.args;
    const need = (k) => {
      const v = num(a[k]);
      if (Number.isNaN(v)) { s.errors.push(n.id); return 0; }
      return v;
    };
    switch (n.op) {
      case "move": {
        const d = need("n");
        const x2 = s.x + d * Math.sin(rad(s.dir)), y2 = s.y + d * Math.cos(rad(s.dir));
        if (s.pen && d !== 0) s.segs.push([s.x, s.y, x2, y2]);
        s.x = x2; s.y = y2; return 0;
      }
      case "right": s.dir = norm(s.dir + need("g")); return 0;
      case "left": s.dir = norm(s.dir - need("g")); return 0;
      case "goto": {
        const x2 = need("x"), y2 = need("y");
        if (s.pen && (x2 !== s.x || y2 !== s.y)) s.segs.push([s.x, s.y, x2, y2]);
        s.x = x2; s.y = y2; return 0;
      }
      case "dir": s.dir = norm(need("g")); return 0;
      case "say": s.says.push(String(a.t)); return Math.max(0, need("s"));
      case "costume": s.costume = (s.costume + 1) % 2; s.wechsel++; return 0;
      case "wait": return Math.max(0, need("s"));
      case "pendown": s.pen = true; return 0;
      case "penup": s.pen = false; return 0;
      case "clear": s.segs = []; return 0;
      default: return 0;
    }
  }
  const MAX_STEPS = 5000;
  /** Ganzes Skript sofort durchrechnen (für Ziele und Prüfungen). */
  function simulate(list, start) {
    const nodes = parseList(list);
    const s = newState(start || { x: 0, y: 0, dir: 90 });
    const hat = nodes[0] && nodes[0].op === "flag";
    const runList = (l) => {
      for (const n of l) {
        if (s.steps++ > MAX_STEPS) return;
        if (n.op === "flag") continue;
        if (n.op === "repeat") {
          const k = Math.floor(num(n.args.n));
          if (Number.isNaN(k)) { s.errors.push(n.id); continue; }
          for (let i = 0; i < Math.min(k, 500); i++) runList(n.body);
        } else apply(s, n);
      }
    };
    if (hat) runList(nodes);
    return trace(s, nodes, hat);
  }
  function trace(s, nodes, hat) {
    return { segs: s.segs, says: s.says, x: s.x, y: s.y, dir: s.dir, costume: s.costume, wechsel: s.wechsel,
      blocks: count(nodes), hat, errors: s.errors, script: nodes };
  }

  /** Zwei Zeichnungen vergleichen: gleiche Linien, egal in welcher Reihenfolge, Richtung oder Stückelung
      („2 × gehe 50“ = „gehe 100“). Linien auf derselben Geraden werden zusammengefasst. */
  function lines(segs) {
    const R = (v) => (Math.round(v * 10) / 10).toFixed(1).replace(/^-0\.0$/, "0.0");
    const groups = new Map();
    segs.forEach(([x1, y1, x2, y2]) => {
      let dx = x2 - x1, dy = y2 - y1;
      const L = Math.hypot(dx, dy);
      if (L < 0.01) return;
      dx /= L; dy /= L;
      if (dx < -1e-9 || (Math.abs(dx) < 1e-9 && dy < 0)) { dx = -dx; dy = -dy; }   // Richtung egal
      const off = x1 * dy - y1 * dx;                                               // Abstand der Geraden
      const key = `${R(dx * 100)}|${R(dy * 100)}|${R(off)}`;
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
        out.add(`${key}|${R(s)}|${R(e)}`);
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
  function roboSVG(costume) {
    const arm = costume
      ? '<path d="M58 44 L70 30" stroke="#2b3a55" stroke-width="5" stroke-linecap="round"/><circle cx="71" cy="28" r="4.5" fill="#ffcf3f" stroke="#2b3a55" stroke-width="2"/>'
      : '<path d="M58 50 L71 56" stroke="#2b3a55" stroke-width="5" stroke-linecap="round"/><circle cx="72" cy="57" r="4.5" fill="#ffcf3f" stroke="#2b3a55" stroke-width="2"/>';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <path d="M40 8 V17" stroke="#2b3a55" stroke-width="3"/><circle cx="40" cy="7" r="4.5" fill="${costume ? "#ff5a5a" : "#ffcf3f"}" stroke="#2b3a55" stroke-width="2"/>
      <rect x="16" y="17" width="44" height="36" rx="11" fill="#ff8c42" stroke="#2b3a55" stroke-width="3"/>
      <rect x="25" y="24" width="30" height="20" rx="6" fill="#fff" stroke="#2b3a55" stroke-width="2"/>
      <circle cx="40" cy="34" r="3.6" fill="#2b3a55"/><circle cx="50" cy="34" r="3.6" fill="#2b3a55"/>
      <circle cx="41.2" cy="32.8" r="1.1" fill="#fff"/><circle cx="51.2" cy="32.8" r="1.1" fill="#fff"/>
      <path d="M60 31 L68 35 L60 39 Z" fill="#2b3a55"/>
      ${arm}
      <rect x="22" y="53" width="32" height="9" rx="4" fill="#2b3a55"/>
      <circle cx="27" cy="66" r="7" fill="#5a6b8c" stroke="#2b3a55" stroke-width="3"/><circle cx="49" cy="66" r="7" fill="#5a6b8c" stroke="#2b3a55" stroke-width="3"/>
    </svg>`;
  }
  const roboImg = [0, 1].map((c) => {
    const img = new Image();
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(roboSVG(c));
    return img;
  });

  /* ---------------------------------------------------------------- Bühne mit Editor */
  const SPEED = { schnell: 90, langsam: 650 };

  function create(el, cfg) {
    cfg = Object.assign({ mode: "frei", edit: true, start: { x: 0, y: 0, dir: 90 }, palette: [], script: [] }, cfg);
    const startScript = () => parseList(cfg.script);
    let script = startScript();
    // Puzzle: die Ablage enthält genau die Blöcke, die verbaut werden sollen (jeder nur einmal)
    let tray = cfg.mode === "puzzle" ? parseList(cfg.palette) : null;
    const startTray = () => (cfg.mode === "puzzle" ? parseList(cfg.palette) : null);
    const editable = cfg.mode !== "lesen";
    const hasPalette = editable && (cfg.mode === "puzzle" || (cfg.palette && cfg.palette.length > 0));
    const editMode = cfg.mode === "puzzle" ? false : cfg.edit;
    const target = cfg.ziel ? simulate(cfg.ziel, cfg.start) : null;

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
        <p class="fb buehne-fb" aria-live="polite"></p>
      </div>
      <div class="buehne-code">
        ${hasPalette ? `<div class="buehne-palette-wrap"><div class="buehne-label">${T(cfg.mode === "puzzle" ? "Diese Blöcke brauchst du" : "Blöcke")}</div><div class="buehne-palette"></div></div>` : ""}
        <div class="buehne-script-wrap"><div class="buehne-label">${T("Skript")}<span class="buehne-count"></span></div><div class="buehne-script"></div></div>
        ${editable ? `<div class="buehne-tools"><button type="button" class="btn secondary reset-code">↺ <span>${T("Von vorn")}</span></button>${hasPalette ? `<span class="buehne-tip">${T("Zum Löschen einen Block zurück zu den Blöcken ziehen.")}</span>` : ""}</div>` : ""}
      </div>`;
    const $ = (s) => el.querySelector(s);
    const canvas = $("canvas"), ctx = canvas.getContext("2d");
    const bubble = $(".buehne-bubble"), fb = $(".buehne-fb");
    const pal = $(".buehne-palette"), scr = $(".buehne-script"), cnt = $(".buehne-count");
    let paletteNodes = cfg.mode === "puzzle" ? null : parseList(cfg.palette);

    function say(msg, kind) { fb.className = "fb buehne-fb show " + kind; fb.innerHTML = T(msg); }

    /* --- Zeichnen */
    let vis = { x: cfg.start.x, y: cfg.start.y, dir: cfg.start.dir, costume: 0 };
    let segs = [], partial = null;
    function draw() {
      const W = 480, H = 360;
      const css = canvas.getBoundingClientRect().width || W;
      const dpr = Math.min(3, (window.devicePixelRatio || 1) * css / W);
      if (canvas.width !== Math.round(W * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#eef1f5"; ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); ctx.stroke(); }
      const P = (x, y) => [W / 2 + x, H / 2 - y];
      const line = (s, style, width, dash) => {
        ctx.strokeStyle = style; ctx.lineWidth = width; ctx.lineCap = "round"; ctx.setLineDash(dash || []);
        ctx.beginPath(); ctx.moveTo(...P(s[0], s[1])); ctx.lineTo(...P(s[2], s[3])); ctx.stroke(); ctx.setLineDash([]);
      };
      if (target) target.segs.forEach((s) => line(s, "#c3cad6", 7, [10, 9]));
      (cfg.sterne || []).forEach(([sx, sy]) => star(...P(sx, sy)));
      segs.forEach((s) => line(s, "#3d5afe", 3.5));
      if (partial) line(partial, "#3d5afe", 3.5);
      const [px, py] = P(vis.x, vis.y);
      const img = roboImg[vis.costume];
      ctx.save(); ctx.translate(px, py); ctx.rotate(rad(vis.dir - 90));
      if (img.complete && img.naturalWidth) ctx.drawImage(img, -32, -32, 64, 64);
      else { ctx.fillStyle = "#ff8c42"; ctx.fillRect(-14, -14, 28, 28); }
      ctx.restore();
    }
    // Ziel-Stern (cfg.sterne: [[x, y], …]) – zeigt, wohin Robo laufen soll
    function star(cx, cy) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 8 : 19, a = Math.PI / 5 * i - Math.PI / 2;
        ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      }
      ctx.closePath(); ctx.fillStyle = "#ffd54a"; ctx.fill();
      ctx.strokeStyle = "#c79100"; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.stroke();
    }
    roboImg.forEach((i) => i.addEventListener("load", draw));
    if (window.ResizeObserver) new ResizeObserver(() => draw()).observe(canvas);

    function sayBubble(text) {
      if (text === null) { bubble.hidden = true; return; }
      bubble.textContent = text;
      bubble.hidden = false;
      const r = canvas.getBoundingClientRect(), k = r.width / 480;
      bubble.style.left = `${Math.max(4, Math.min(r.width - 120, (240 + vis.x + 18) * k))}px`;
      bubble.style.bottom = `${Math.max(4, (180 + vis.y + 22) * k)}px`;
    }

    /* --- Skript anzeigen */
    function renderCode() {
      const opt = { edit: editMode };
      scr.innerHTML = `<div class="sb-stack sb-main" data-list="main">${script.map((n) => blockHTML(n, opt)).join("")}</div>`;
      if (pal) {
        const items = tray || paletteNodes;
        pal.innerHTML = items.map((n) => blockHTML(n, { edit: false })).join("")
          || `<p class="buehne-empty">${T("Alle Blöcke verbaut.")}</p>`;
      }
      cnt.textContent = script.length ? ` · ${count(script)} ${T(count(script) === 1 ? "Block" : "Blöcke")}` : "";
      if (!script.length && editable) scr.firstChild.innerHTML = `<p class="buehne-empty">${T(cfg.mode === "puzzle" ? "Zieh die Blöcke hierher – in der richtigen Reihenfolge." : "Zieh Blöcke hierher.")}</p>`;
      scr.querySelectorAll("input.sb-in").forEach((inp) => {
        inp.addEventListener("input", () => {
          const hit = find(script, inp.closest(".sb").dataset.id);
          if (hit) hit.node.args[inp.dataset.k] = inp.value;
          inp.style.width = inW(inp.value);
          stop(); resetStage(); fb.className = "fb buehne-fb";
        });
      });
    }

    /* --- Ziehen und Ablegen (Maus und Finger: Pointer-Events) */
    let drag = null;
    function listOf(id) { if (id === "main") return script; const h = find(script, id); return h ? h.node.body : null; }
    function slots(dragNode) {
      const out = [];
      scr.querySelectorAll(".sb-stack[data-list]").forEach((st) => {
        const list = listOf(st.dataset.list);
        if (!list) return;
        const kids = [...st.children].filter((c) => c.classList.contains("sb"));
        const r = st.getBoundingClientRect();
        for (let i = 0; i <= kids.length; i++) {
          // Kopfblock (Flagge) nur ganz oben ins Hauptskript; nichts über eine vorhandene Flagge
          const isMain = st.dataset.list === "main";
          if (dragNode && DEF[dragNode.op].hat && !(isMain && i === 0 && !(list[0] && list[0].op === "flag"))) continue;
          if (isMain && i === 0 && list[0] && list[0].op === "flag" && !(dragNode && DEF[dragNode.op].hat)) continue;
          const y = i < kids.length ? kids[i].getBoundingClientRect().top : (kids.length ? kids[kids.length - 1].getBoundingClientRect().bottom : r.top + 4);
          out.push({ list, index: i, x: r.left, y });
        }
      });
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
        const h = find(script, d.node.id);
        d.origin = { list: h.list, index: h.index };
        h.list.splice(h.index, 1);
      } else if (tray) {
        tray = tray.filter((n) => n.id !== d.node.id);
      } else {
        d.node = clone(d.node);                    // aus der Palette: Kopie, die Palette bleibt voll
      }
      renderCode();
      d.ghost = document.createElement("div");
      d.ghost.className = "buehne-ghost";
      d.ghost.innerHTML = `<div class="sb-stack">${blockHTML(d.node, { edit: false })}</div>`;
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
      if (x < r.left - 30 || x > r.right + 30 || y < r.top - 30 || y > r.bottom + 40) return null;
      let best = null, bd = Infinity;
      drag.slots.forEach((s) => {
        const dist = Math.hypot((x - s.x) * 0.8, y - s.y);
        if (dist < bd) { bd = dist; best = s; }
      });
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
      const s = nearest(gx + 8, gy + 6);
      drag.slot = s;
      if (s) {
        drag.mark.style.display = "block";
        drag.mark.style.transform = `translate(${s.x + window.scrollX}px, ${s.y + window.scrollY - 3}px)`;
        drag.mark.style.position = "absolute";
      } else drag.mark.style.display = "none";
    }
    function onUp(ev) {
      if (!drag || ev.pointerId !== drag.pid) return;
      const d = drag;
      drag = null;
      document.documentElement.classList.remove("buehne-dragging");
      if (!d.moved) {
        // Antippen eines Palettenblocks = unten ans Skript anhängen (hilft am Tablet)
        if (!d.fromScript && !(ev.target.closest && ev.target.closest("input"))) {
          const n = tray ? d.node : clone(d.node);
          if (DEF[n.op].hat && script[0] && script[0].op === "flag") return;
          if (tray) tray = tray.filter((x) => x.id !== n.id);
          if (DEF[n.op].hat) script.unshift(n); else script.push(n);
          renderCode(); changed();
        }
        return;
      }
      d.ghost.remove(); d.mark.remove();
      if (d.slot) d.slot.list.splice(d.slot.index, 0, d.node);
      else if (tray) tray.push(d.node);             // im Puzzle zurück in die Ablage
      else if (!hasPalette && d.origin) d.origin.list.splice(d.origin.index, 0, d.node);   // ohne Palette nichts löschen
      renderCode(); changed();
    }
    function changed() {
      fb.className = "fb buehne-fb";
      if (cfg.onChange) cfg.onChange(api);
    }
    if (editable) {
      el.querySelector(".buehne-code").addEventListener("pointerdown", (ev) => {
        if (ev.button !== undefined && ev.button !== 0) return;
        if (ev.target.closest("input")) return;
        const b = ev.target.closest(".sb");
        if (!b) return;
        const inScript = scr.contains(b);
        if (inScript) {
          const h = find(script, b.dataset.id);
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
        stop(); script = startScript(); tray = startTray(); renderCode(); resetStage(); changed();
      });
    }

    /* --- Ausführen */
    let run = null;           // { token, state }
    let speed = "schnell", stepMode = false, stepWait = null;
    // Nächstes Bild: requestAnimationFrame, mit Zeitgeber als Ersatz (rAF ruht in versteckten Tabs)
    const frame = () => new Promise((r) => {
      let done = false;
      const f = () => { if (!done) { done = true; r(); } };
      requestAnimationFrame(f); setTimeout(f, 40);
    });
    const sleep = async (ms, tok) => {
      const t0 = performance.now();
      while (run && run.token === tok && performance.now() - t0 < ms) {
        await new Promise((r) => setTimeout(r, Math.min(40, ms - (performance.now() - t0))));
      }
    };
    function highlight(id) {
      scr.querySelectorAll(".sb-run").forEach((x) => x.classList.remove("sb-run"));
      if (id) { const b = scr.querySelector(`.sb[data-id="${id}"]`); if (b) b.classList.add("sb-run"); }
    }
    function counter(id, i, n) {
      const b = scr.querySelector(`.sb[data-id="${id}"] > .sb-c-head`);
      if (!b) return;
      let c = b.querySelector(".sb-count");
      if (!c) { c = document.createElement("span"); c.className = "sb-count"; b.appendChild(c); }
      c.textContent = i ? T(`Runde ${i} von ${n}`) : "";
      if (!i) c.remove();
    }
    function resetStage() {
      vis = { x: cfg.start.x, y: cfg.start.y, dir: cfg.start.dir, costume: 0 };
      segs = []; partial = null; sayBubble(null); highlight(null);
      scr.querySelectorAll(".sb-count").forEach((c) => c.remove());
      draw();
    }
    // cfg.echtzeit: bei 🐇 so schnell wie echtes Scratch – Blöcke ohne Pause, jede Schleifenrunde ein Bild (1/30 s).
    // So sieht man z. B. eine Animation ohne „warte“ fast gar nicht – genau wie in Scratch.
    const echt = () => cfg.echtzeit && !stepMode && speed === "schnell";
    async function pause(tok, runde) {
      if (stepMode) { await new Promise((res) => { stepWait = res; }); stepWait = null; }
      else if (echt()) { if (runde) await sleep(1000 / 30, tok); }
      else await sleep(SPEED[speed], tok);
    }
    async function animate(from, s, tok) {
      const ms = stepMode ? 350 : echt() ? 0 : Math.min(SPEED[speed] * 0.85, 500);
      const t0 = performance.now();
      const seg = s.segs.length > segs.length ? s.segs[s.segs.length - 1] : null;
      while (run && run.token === tok) {
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
    async function start() {
      stop();
      resetStage();
      const tok = Symbol("lauf");
      const s = newState(cfg.start);
      run = { token: tok, state: s };
      el.classList.add("running");
      $(".stop").disabled = false;
      if (hasEmptyGap(script)) { finish(tok, "Füll zuerst alle gelben Felder aus.", "hint"); return; }
      if (!script[0] || script[0].op !== "flag") {
        await sleep(200, tok);
        finish(tok, script.length ? "Es passiert nichts. Dein Skript braucht ganz oben den Block <b>Wenn ⚑ angeklickt wird</b> – sonst weiß Scratch nicht, wann es losgehen soll."
          : "Das Skript ist noch leer.", "hint");
        return;
      }
      const runList = async (list) => {
        for (const n of list) {
          if (!run || run.token !== tok) return;
          if (s.steps++ > MAX_STEPS) return;
          highlight(n.id);
          if (n.op === "flag") { await pause(tok); continue; }
          if (n.op === "repeat") {
            const k = Math.floor(num(n.args.n));
            if (Number.isNaN(k)) { s.errors.push(n.id); continue; }
            for (let i = 1; i <= Math.min(k, 500); i++) {
              if (!run || run.token !== tok) return;
              highlight(n.id); counter(n.id, i, k);
              await pause(tok, true);
              await runList(n.body);
            }
            counter(n.id, 0);
            continue;
          }
          const from = { x: s.x, y: s.y, dir: s.dir };
          if (n.op === "right" || n.op === "left") from.turn = (n.op === "right" ? 1 : -1) * (num(n.args.g) || 0);
          const wait = apply(s, n);
          await animate(from, s, tok);
          if (n.op === "say") sayBubble(String(n.args.t));
          if (wait > 0) await sleep(wait * 1000, tok);
          if (n.op === "say") sayBubble(null);
          await pause(tok);
        }
      };
      await runList(script);
      if (!run || run.token !== tok) return;
      const tr = trace(s, script, true);
      api.last = tr;
      let res = s.errors.length ? "In einem Feld steht keine Zahl." : cfg.check ? cfg.check(tr, api) : null;
      if (res === null || res === undefined) {
        if (target) res = sameDrawing(tr.segs, target.segs) ? true : "Noch nicht ganz. Vergleich deine Linien mit der grauen Vorlage.";
      }
      if (res === true) finish(tok, cfg.ok || "✔ Geschafft!", "ok", tr);
      else if (typeof res === "string") finish(tok, res, "hint", tr);
      else finish(tok, null, null, tr);
    }
    function hasEmptyGap(list) {
      return list.some((n) => Object.keys(n.gaps || {}).some((k) => String(n.args[k]).trim() === "") || (n.body && hasEmptyGap(n.body)));
    }
    function finish(tok, msg, kind, tr) {
      if (!run || run.token !== tok) return;
      run = null; highlight(null);
      el.classList.remove("running");
      $(".stop").disabled = true;
      if (msg) say(msg, kind);
      if (cfg.onRun && tr) cfg.onRun(tr, kind === "ok", api);
    }
    function stop() {
      if (run) { run = null; el.classList.remove("running"); $(".stop").disabled = true; highlight(null); sayBubble(null); }
      if (stepWait) stepWait();
    }

    $(".go").addEventListener("click", () => { stepMode = false; start(); });
    $(".stop").addEventListener("click", () => { stop(); });
    $(".step").addEventListener("click", () => {
      if (run && stepMode && stepWait) { stepWait(); return; }
      if (run && !stepMode) { stepMode = true; return; }
      stepMode = true; start();
    });
    el.querySelectorAll(".buehne-speed button").forEach((b) => b.addEventListener("click", () => {
      speed = b.dataset.speed;
      el.querySelectorAll(".buehne-speed button").forEach((x) => x.classList.toggle("on", x === b));
    }));

    const api = {
      el,
      get script() { return script; },
      set script(v) { script = parseList(v); renderCode(); resetStage(); },
      run: () => { stepMode = false; return start(); },
      stop, simulate: () => simulate(script, cfg.start), count: () => count(script),
      feedback: (msg, kind) => say(msg, kind),
      last: null,
    };
    renderCode();
    // Puzzle: Ablage behält ihre Höhe, sonst springt das Skript beim Ziehen nach oben
    if (tray && pal) requestAnimationFrame(() => { if (pal.offsetHeight) pal.style.minHeight = pal.offsetHeight + "px"; });
    if (tray && pal && window.ResizeObserver) {
      const ro = new ResizeObserver(() => { if (pal.offsetHeight && !pal.style.minHeight) pal.style.minHeight = pal.offsetHeight + "px"; });
      ro.observe(pal);
    }
    resetStage();
    el.buehne = api;
    return api;
  }

  /** Alle <div data-script='[…]'> auf der Seite als Blockbild zeigen. */
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-script]").forEach((d) => {
      d.innerHTML = render(JSON.parse(d.dataset.script), { small: d.hasAttribute("data-small") });
    });
  });

  window.Buehne = { create, render, simulate, sameDrawing, parse, count, DEF, robo: roboSVG };
})();
