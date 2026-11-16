/* Scratch-Kurs · gemeinsame Bausteine: Hell/Dunkel, Quiz, Vorhersage, Hilfe-Leiter, Ich-kann-Liste.
   Grundlage: Calc-Kurs. Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
(function () {
  "use strict";
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* privater Modus: egal */ } },
  };

  const T = (x) => (window.T ? window.T(x) : x);   // Sprachhilfe (i18n.js), falls geladen

  /* Hell / Dunkel */
  const saved = store.get("scratch-theme");
  if (saved) document.documentElement.dataset.theme = saved;
  document.addEventListener("click", (ev) => {
    const b = ev.target.closest(".theme-btn");
    if (!b) return;
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    store.set("scratch-theme", next);
  });

  /** Rückmeldung in einem .fb-Element anzeigen. kind: ok | hint | info */
  function feedback(el, html, kind) {
    el.className = "fb show " + kind;
    el.innerHTML = T(html);
  }

  /**
   * Eine Auswahlfrage (z. B. Vorhersage „Überleg:“). Antworten in el.querySelectorAll(".choice").
   * opts: { right: index, why, miss: [Satz je falscher Antwort], fb: Element, onDone(ok) }
   */
  function pick(box, opts) {
    const buttons = [...box.querySelectorAll(".choice")];
    buttons.forEach((b, i) => b.addEventListener("click", () => {
      buttons.forEach((x, xi) => { x.disabled = true; if (xi === opts.right) x.classList.add("right"); });
      const ok = i === opts.right;
      if (!ok) b.classList.add("wrong");
      const miss = !ok && opts.miss && opts.miss[i] ? T(opts.miss[i]) + " " : "";
      if (opts.fb) feedback(opts.fb, T(ok ? "✔ Richtig!" : "✘ Nicht ganz.") + " " + miss + T(opts.why || ""), ok ? "ok" : "hint");
      if (opts.onDone) opts.onDone(ok);
    }));
  }

  /**
   * Quiz: questions = [{ q, options:[...], right: index, why, miss:[...] }]
   * miss (optional): pro Antwort ein Satz zum typischen Denkfehler dahinter (null bei der richtigen).
   */
  function quiz(el, questions) {
    let answered = 0, correct = 0;
    const score = document.createElement("p");
    score.className = "quiz-score";
    score.setAttribute("aria-live", "polite");
    questions.forEach((item, qi) => {
      const q = document.createElement("p");
      q.className = "quiz-q";
      q.innerHTML = `${qi + 1}. <span class="t">${item.q}</span>`;
      el.appendChild(q);
      if (item.html) {                     // z. B. ein Skript als Bild der Blöcke
        const extra = document.createElement("div");
        extra.className = "quiz-extra";
        extra.innerHTML = item.html;
        el.appendChild(extra);
      }
      const box = document.createElement("div");
      box.className = "choices";
      const why = document.createElement("p");
      why.className = "fb quiz-why";
      item.options.forEach((opt) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "choice";
        b.innerHTML = opt;
        box.appendChild(b);
      });
      pick(box, {
        right: item.right, why: item.why, miss: item.miss, fb: why,
        onDone(ok) {
          answered++; if (ok) correct++;
          if (answered === questions.length) {
            score.innerHTML = T(correct === questions.length
              ? `🏆 ${correct} von ${questions.length} – stark!`
              : `${correct} von ${questions.length} richtig. Lies dir die Erklärungen noch einmal durch.`);
          }
        },
      });
      el.appendChild(box);
      el.appendChild(why);
    });
    el.appendChild(score);
  }

  /**
   * Hilfe-Leiter: Tipp 1 → Tipp 2 → … → Lösung. Jede Stufe erst nach Klick.
   * steps = ["Tipp 1", "Tipp 2", "Lösung: …"] (die letzte Stufe heißt „Lösung zeigen“)
   */
  function hints(el, steps) {
    el.classList.add("hints");
    const list = document.createElement("ol");
    list.className = "hints-list";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn secondary";
    let n = 0;
    const label = () => {
      btn.textContent = T(n === steps.length - 1 ? "🔑 Lösung zeigen" : `💡 Tipp ${n + 1}`);
    };
    btn.addEventListener("click", () => {
      const li = document.createElement("li");
      li.innerHTML = T(steps[n]);
      if (n === steps.length - 1) li.className = "hints-sol";
      list.appendChild(li);
      n++;
      if (n >= steps.length) btn.remove(); else label();
    });
    label();
    el.appendChild(list);
    el.appendChild(btn);
  }

  /** Ich-kann-Liste, die sich das Gerät merkt (nur lokal, nichts wird gesendet). */
  function checklist(el, key) {
    const boxes = [...el.querySelectorAll("input[type=checkbox]")];
    // Für die Startseite: „scratch-fertig-<key>“ = 1, wenn alles abgehakt ist (Häkchen und „3/8“ am Reiter).
    const summary = () => store.set(`scratch-fertig-${key}`, boxes.every((b) => b.checked) ? "1" : "0");
    boxes.forEach((cb, i) => {
      const k = `scratch-${key}-${i}`;
      cb.checked = store.get(k) === "1";
      cb.addEventListener("change", () => { store.set(k, cb.checked ? "1" : "0"); summary(); });
    });
    summary();
  }

  /* Die Startseite öffnet beim nächsten Mal gleich die Klasse der zuletzt besuchten Lektion. */
  const jg = location.pathname.match(/\/(k\d)\/[^/]+\.html$/);
  if (jg) store.set("scratch-klasse", jg[1]);

  /* Scratch-Wörter: Wer die Sprachhilfe benutzt, sieht die Wortliste gleich aufgeklappt. */
  document.addEventListener("DOMContentLoaded", () => {
    if (document.documentElement.lang && document.documentElement.lang !== "de") {
      document.querySelectorAll("details.woerter").forEach((d) => { d.open = true; });
    }
  });

  window.Kurs = { feedback, pick, quiz, hints, checklist, store };
})();
