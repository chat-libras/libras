import { jsx as u, jsxs as m, Fragment as U } from "react/jsx-runtime";
import { createContext as Z, useContext as ee, useState as E, useRef as S, useCallback as R, useEffect as P } from "react";
const k = Z({});
function Re({
  config: e,
  children: t
}) {
  return /* @__PURE__ */ u(k.Provider, { value: e, children: t });
}
function I() {
  return ee(k);
}
const te = "https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-portal@02c29088381b2c779bbbc5fde821d809f532c474/app/target", re = "https://traducao2.vlibras.gov.br/translate";
async function ne(e) {
  if (window.VLibras) return window.VLibras;
  if (await new Promise((t, r) => {
    const n = document.createElement("script");
    n.src = e, n.async = !0, n.onload = () => t(), n.onerror = () => r(new Error(`Falha ao carregar o bundle do VLibras: ${e}`)), document.head.appendChild(n);
  }), !window.VLibras)
    throw new Error("Bundle do VLibras carregado, mas window.VLibras não foi definido.");
  return window.VLibras;
}
let A = null, y = null;
function ae() {
  A = null, y = null;
}
async function se(e, t = {}) {
  if (A) {
    const r = await A;
    if (y && y !== e)
      for (; y.firstChild; ) e.appendChild(y.firstChild);
    return y = e, r;
  }
  return y = e, A = (async () => {
    const r = await ne(t.bundleUrl ?? "/vlibras/vlibras.js"), n = new r.Player({
      targetPath: t.targetPath ?? te,
      // `translator` sobrescreve o endpoint PT→glosa embutido no bundle (gov.br,
      // hoje 401). Sem isto, o player soletra tudo em vez de sinalizar palavras.
      translator: t.translatorUrl ?? re
    });
    return n.load(e), await new Promise((o) => n.on(t.loadEvent ?? "load", () => o())), t.avatar && n.changeAvatar && n.changeAvatar(t.avatar), n;
  })(), A;
}
class oe {
  constructor(t, r = {}) {
    this.player = t, this.maxBacklog = r.maxBacklog ?? 8, this.settleMs = r.settleMs ?? 0, t.on(r.endEvent ?? "animation:end", () => this.onEnd());
  }
  queue = [];
  isSigning = !1;
  lastIssuedAt = 0;
  maxBacklog;
  settleMs;
  /** Trata o evento de fim, ignorando disparos espúrios logo após translate(). */
  onEnd() {
    this.settleMs > 0 && Date.now() - this.lastIssuedAt < this.settleMs || this.advance();
  }
  play(t) {
    const r = t.trim();
    r && (this.queue.push(r), this.queue.length > this.maxBacklog && this.queue.splice(0, this.queue.length - this.maxBacklog), this.isSigning || this.advance());
  }
  /** Puxa a próxima frase da fila e manda o player sinalizar. */
  advance() {
    const t = this.queue.shift();
    if (t === void 0) {
      this.isSigning = !1;
      return;
    }
    this.isSigning = !0, this.lastIssuedAt = Date.now(), this.player.translate(t);
  }
  clear() {
    this.queue.length = 0, this.player.stop?.(), this.isSigning = !1;
  }
  setSpeed(t) {
    this.player.setSpeed?.(t);
  }
  get busy() {
    return this.isSigning;
  }
  get pending() {
    return this.queue.length;
  }
  dispose() {
    this.clear();
  }
}
let _ = null;
function B(e = {}) {
  const t = I(), { vlibras: r = t.vlibras, speed: n = 1, onReady: o } = e, [s, a] = E("loading"), [l, i] = E(null), [c, d] = E(n), f = S(o);
  f.current = o;
  const b = R((p) => {
    d(p), _?.setSpeed(p);
  }, []), h = R((p) => {
    _?.play(p);
  }, []), g = S(!1);
  return { containerRef: R((p) => {
    if (!p) {
      g.current = !1, _ = null, ae(), a("loading");
      return;
    }
    g.current || (g.current = !0, se(p, r).then((w) => {
      _ = new oe(w, { settleMs: 250 }), _.setSpeed(c), _.clear(), a("ready"), f.current?.();
    }).catch((w) => {
      i(w instanceof Error ? w.message : String(w)), a("error");
    }));
  }, []), status: s, error: l, translate: h, speed: c, setSpeed: b, renderer: _ };
}
function ie() {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}
function $(e, t = "pt-BR") {
  const r = ie();
  if (!r) return null;
  const n = new r();
  n.lang = t, n.continuous = !0, n.interimResults = !0, n.maxAlternatives = 1;
  let o = !1;
  return n.onresult = (s) => {
    let a = "";
    for (let l = s.resultIndex; l < s.results.length; l++) {
      const i = s.results[l], c = i[0].transcript;
      if (i.isFinal) {
        const d = c.trim();
        d && e.onFinal(d);
      } else
        a += c;
    }
    a && e.onInterim && e.onInterim(a.trim());
  }, n.onerror = (s) => {
    s.error !== "no-speech" && s.error !== "aborted" && e.onError?.(s.error);
  }, n.onend = () => {
    if (o)
      try {
        n.start();
      } catch {
      }
    else
      e.onStateChange?.(!1);
  }, {
    get listening() {
      return o;
    },
    start() {
      if (!o) {
        o = !0;
        try {
          n.start(), e.onStateChange?.(!0);
        } catch (s) {
          o = !1, e.onError?.(String(s));
        }
      }
    },
    stop() {
      o = !1, n.stop();
    }
  };
}
function O(e) {
  let t = "", r = 0;
  return (n) => {
    const o = n.trim(), s = Date.now();
    o.length < 2 || o === t && s - r < 3e3 || (t = o, r = s, e(o));
  };
}
function q(e, t, r) {
  const n = O(r.onPhrase);
  if (t.provider === "webspeech") {
    if (e.kind === "stream")
      return {
        async start() {
          r.onError?.(
            'Web Speech API só ouve o microfone. Para áudio de chamada, use { provider: "custom", factory } com um ASR de nuvem.'
          );
        },
        stop() {
        }
      };
    const a = $(
      {
        onFinal: n,
        onInterim: r.onInterim,
        onError: r.onError,
        onStateChange: r.onListening
      },
      t.lang
    );
    return {
      async start() {
        if (!a) {
          r.onError?.("Web Speech API não suportada neste navegador (use o Chrome).");
          return;
        }
        a.start();
      },
      stop() {
        a?.stop();
      }
    };
  }
  let o = null, s = null;
  return {
    async start() {
      let a;
      e.kind === "stream" ? a = e.stream : (s = await navigator.mediaDevices.getUserMedia({ audio: !0 }), a = s), o = t.factory({
        onTranscript: (l, i) => {
          r.onInterim?.(l), i && n(l);
        },
        onError: (l) => r.onError?.(l)
      }), r.onListening?.(!0), await o.start(a);
    },
    stop() {
      o?.stop(), o = null, s?.getTracks().forEach((a) => a.stop()), s = null, r.onListening?.(!1);
    }
  };
}
function le(e, t) {
  if (t) return t;
  if (e.kind === "microphone") return { provider: "webspeech", lang: "pt-BR" };
  throw new Error(
    'ASR é obrigatório para AudioSource do tipo "stream". Passe asr={{ provider: "custom", factory: ... }} com um ASR de nuvem (Deepgram, AssemblyAI, etc.).'
  );
}
function ce(e) {
  const { audio: t, asr: r, vlibras: n, autoStart: o = !0, speed: s = 1, onTranscript: a } = e, l = S(null), i = S({ audio: t, asr: r, onTranscript: a });
  i.current = { audio: t, asr: r, onTranscript: a };
  const [c, d] = E(""), [f, b] = E(!1), [h, g] = E(null), C = S(null), p = R(() => {
    l.current?.stop(), l.current = null, b(!1), d("");
  }, []), w = R(() => {
    if (l.current) return;
    const { audio: M, asr: Q, onTranscript: Y } = i.current;
    g(null);
    let x;
    try {
      x = q(M, le(M, Q), {
        onPhrase: (v) => {
          C.current?.translate(v), Y?.(v);
        },
        onInterim: d,
        onError: (v) => g(v),
        onListening: b
      });
    } catch (v) {
      g(v instanceof Error ? v.message : String(v));
      return;
    }
    l.current = x, x.start().catch((v) => g(v instanceof Error ? v.message : String(v)));
  }, []), F = S(o);
  F.current = o;
  const L = B({
    vlibras: n,
    speed: s,
    onReady: () => {
      F.current && w();
    }
  });
  C.current = L, P(() => () => p(), [p]);
  const J = L.status === "error" || h ? "error" : L.status === "loading" ? "loading" : f ? "listening" : "ready", X = L.error ?? h;
  return {
    containerRef: L.containerRef,
    status: J,
    error: X,
    interim: c,
    listening: f,
    start: w,
    stop: p,
    translate: L.translate,
    speed: L.speed,
    setSpeed: L.setSpeed
  };
}
const ue = {
  avatarLoading: "Carregando avatar…",
  captionPlaceholder: "Digitar frase…",
  buttonTranslate: "▶ Traduzir",
  buttonStop: "⏹ Parar",
  buttonSubmitText: "Traduzir texto",
  buttonSpeedLabel: "Ajustar a velocidade do avatar",
  chatSendButton: "Enviar",
  chatSenderPlaceholder: "Digite sua mensagem…",
  chatReceiverPlaceholder: "Responder…",
  chatMicStart: "🎤 Falar",
  chatMicStop: "⏹ Parar",
  avatarAriaLabel: "Avatar de Libras"
};
function G(e) {
  return { ...ue, ...e };
}
function de(e) {
  return e === void 0 || e === !0 ? { start: !0, text: !0, speed: !0 } : e === !1 ? { start: !1, text: !1, speed: !1 } : { start: !!e.start, text: !!e.text, speed: !!e.speed };
}
const j = 0.25, z = 1, W = 2, he = (e) => e >= W ? z : Math.round((e + j) * 100) / 100;
function fe({
  api: e,
  show: t,
  strings: r
}) {
  const [n, o] = E(""), s = e.status === "loading" || e.status === "error", a = () => {
    const i = e.speed >= W ? z : Math.round((e.speed + j) * 100) / 100;
    e.setSpeed(i);
  }, l = (i) => {
    i.preventDefault();
    const c = n.trim();
    c && (e.translate(c), o(""));
  };
  return /* @__PURE__ */ m("div", { className: "libras-translator__controls", children: [
    t.text && /* @__PURE__ */ m("form", { className: "libras-translator__text", onSubmit: l, children: [
      /* @__PURE__ */ u(
        "input",
        {
          className: "libras-translator__input",
          value: n,
          onChange: (i) => o(i.target.value),
          placeholder: r.captionPlaceholder,
          "aria-label": r.captionPlaceholder,
          disabled: s
        }
      ),
      /* @__PURE__ */ u("button", { type: "submit", disabled: s, children: r.buttonSubmitText })
    ] }),
    /* @__PURE__ */ m("div", { className: "libras-translator__buttons", children: [
      t.start && /* @__PURE__ */ u(
        "button",
        {
          className: "libras-translator__btn",
          onClick: e.listening ? e.stop : e.start,
          disabled: s,
          "aria-pressed": e.listening,
          children: e.listening ? r.buttonStop : r.buttonTranslate
        }
      ),
      t.speed && /* @__PURE__ */ m(
        "button",
        {
          className: "libras-translator__btn",
          onClick: a,
          disabled: s,
          title: r.buttonSpeedLabel,
          "aria-label": `${r.buttonSpeedLabel} — ${e.speed.toFixed(2)}×`,
          children: [
            "⏩ ",
            e.speed.toFixed(2),
            "×"
          ]
        }
      )
    ] })
  ] });
}
function Ce({
  className: e,
  style: t,
  showCaptions: r,
  controls: n,
  strings: o,
  ...s
}) {
  const a = I(), l = G({ ...a.strings, ...o }), i = ce(s), c = de(n), d = c.start || c.text || c.speed;
  return /* @__PURE__ */ m("div", { className: `libras-translator ${e ?? ""}`, style: t, children: [
    /* @__PURE__ */ u(
      "div",
      {
        ref: i.containerRef,
        className: "libras-translator__stage",
        role: "img",
        "aria-label": l.avatarAriaLabel
      }
    ),
    i.status === "loading" && /* @__PURE__ */ u("div", { className: "libras-translator__overlay", "data-status": "loading", "aria-live": "polite", children: l.avatarLoading }),
    i.status === "error" && /* @__PURE__ */ u("div", { className: "libras-translator__overlay", "data-status": "error", role: "alert", children: i.error }),
    r && i.interim && /* @__PURE__ */ u("div", { className: "libras-translator__caption", "aria-live": "polite", children: i.interim }),
    d && /* @__PURE__ */ u(fe, { api: i, show: c, strings: l })
  ] });
}
function H({ messages: e, mine: t, labels: r, className: n, style: o }) {
  const s = S(null);
  return P(() => {
    s.current?.scrollIntoView({ block: "end" });
  }, [e.length]), /* @__PURE__ */ m(
    "div",
    {
      className: `libras-chat__log${n ? ` ${n}` : ""}`,
      style: o,
      role: "log",
      "aria-label": "Histórico da conversa",
      children: [
        e.map((a) => /* @__PURE__ */ m(
          "div",
          {
            className: "libras-chat__bubble",
            "data-from": a.from,
            "data-mine": a.from === t,
            children: [
              /* @__PURE__ */ u("span", { className: "libras-chat__who", children: r[a.from] }),
              a.text
            ]
          },
          a.id
        )),
        /* @__PURE__ */ u("div", { ref: s })
      ]
    }
  );
}
function K({ placeholder: e, onSend: t, submitLabel: r = "Enviar", children: n, className: o, style: s }) {
  const [a, l] = E(""), i = (c) => {
    c.preventDefault();
    const d = a.trim();
    d && (t(d), l(""));
  };
  return /* @__PURE__ */ m("form", { className: `libras-chat__form${o ? ` ${o}` : ""}`, style: s, onSubmit: i, children: [
    /* @__PURE__ */ u(
      "input",
      {
        value: a,
        onChange: (c) => l(c.target.value),
        placeholder: e,
        "aria-label": e
      }
    ),
    /* @__PURE__ */ u("button", { type: "submit", children: r }),
    n
  ] });
}
function pe(e, t, r) {
  const [n, o] = E(""), [s, a] = E(!1), [l, i] = E(null), c = S(null), d = S(r);
  d.current = r;
  const f = R(() => {
    if (c.current) {
      c.current.stop(), c.current = null;
      return;
    }
    i(null);
    const b = q(e, t, {
      onPhrase: (h) => {
        d.current(h), o("");
      },
      onInterim: o,
      onListening: a,
      onError: (h) => {
        i(h), o("");
      }
    });
    c.current = b, b.start().catch((h) => i(h instanceof Error ? h.message : String(h)));
  }, [e, t]);
  return P(() => () => c.current?.stop(), []), { interim: n, listening: s, error: l, toggle: f };
}
function me({ messages: e, onSend: t, labels: r, audio: n, asr: o, strings: s }) {
  const a = pe(n, o, t);
  return /* @__PURE__ */ m(U, { children: [
    /* @__PURE__ */ u(H, { messages: e, mine: "sender", labels: r }),
    a.interim && /* @__PURE__ */ m("div", { className: "libras-chat__status", "data-status": "interim", "aria-live": "polite", children: [
      "🎤 ",
      a.interim,
      "…"
    ] }),
    a.error && /* @__PURE__ */ u("div", { className: "libras-chat__status", "data-status": "error", role: "alert", children: a.error }),
    /* @__PURE__ */ u(
      K,
      {
        placeholder: s.chatSenderPlaceholder,
        submitLabel: s.chatSendButton,
        onSend: t,
        children: /* @__PURE__ */ u(
          "button",
          {
            type: "button",
            onClick: a.toggle,
            className: "libras-chat__mic",
            "aria-pressed": a.listening,
            "data-active": a.listening,
            "aria-label": a.listening ? s.chatMicStop : s.chatMicStart,
            children: a.listening ? s.chatMicStop : s.chatMicStart
          }
        )
      }
    )
  ] });
}
const be = {
  sender: "Orador",
  receiver: "Libras"
};
function ge(e) {
  return { ...be, ...e };
}
function ve(e, t, r) {
  return e.slice(r).filter((n) => n.from !== t);
}
function Se(e, t) {
  const r = S(0), n = S(t);
  n.current = t, P(() => {
    for (const o of ve(e, "receiver", r.current))
      n.current(o.text);
    r.current = e.length;
  }, [e]);
}
function Ee({ messages: e, onSend: t, labels: r, vlibras: n, speed: o, strings: s }) {
  const a = B({ speed: o, vlibras: n });
  return Se(e, a.translate), /* @__PURE__ */ m(U, { children: [
    /* @__PURE__ */ m("div", { className: "libras-chat__avatar", children: [
      /* @__PURE__ */ u(
        "div",
        {
          ref: a.containerRef,
          className: "libras-chat__stage",
          role: "img",
          "aria-label": s.avatarAriaLabel
        }
      ),
      /* @__PURE__ */ m(
        "button",
        {
          type: "button",
          className: "libras-chat__speed",
          onClick: () => a.setSpeed(he(a.speed)),
          disabled: a.status !== "ready",
          title: s.buttonSpeedLabel,
          "aria-label": s.buttonSpeedLabel,
          children: [
            "⏩ ",
            a.speed.toFixed(2),
            "×"
          ]
        }
      )
    ] }),
    a.status === "loading" && /* @__PURE__ */ u("div", { className: "libras-chat__status", "data-status": "loading", "aria-live": "polite", children: s.avatarLoading }),
    a.status === "error" && /* @__PURE__ */ u("div", { className: "libras-chat__status", "data-status": "error", role: "alert", children: a.error }),
    /* @__PURE__ */ u(H, { messages: e, mine: "receiver", labels: r }),
    /* @__PURE__ */ u(
      K,
      {
        placeholder: s.chatReceiverPlaceholder,
        submitLabel: s.chatSendButton,
        onSend: t
      }
    )
  ] });
}
function we({
  role: e,
  messages: t,
  onSend: r,
  audio: n,
  asr: o,
  vlibras: s,
  speed: a = 1.3,
  labels: l,
  strings: i,
  className: c,
  style: d
}) {
  const f = I(), b = ge(l), h = G({ ...f.strings, ...i }), g = n ?? f.audio ?? { kind: "microphone" }, C = o ?? f.asr ?? { provider: "webspeech", lang: "pt-BR" }, p = s ?? f.vlibras;
  return /* @__PURE__ */ u("section", { className: `libras-chat ${c ?? ""}`, style: d, "data-role": e, children: e === "sender" ? /* @__PURE__ */ u(
    me,
    {
      messages: t,
      onSend: r,
      labels: b,
      audio: g,
      asr: C,
      strings: h
    }
  ) : /* @__PURE__ */ u(
    Ee,
    {
      messages: t,
      onSend: r,
      labels: b,
      vlibras: p,
      speed: a,
      strings: h
    }
  ) });
}
function Ae({
  role: e,
  incomingMessage: t,
  onMessage: r,
  labels: n,
  speed: o = 1.3,
  ...s
}) {
  const [a, l] = E([]), i = S(void 0), c = e === "speaker" ? "sender" : "receiver", d = e === "speaker" ? "receiver" : "sender";
  P(() => {
    !t || t === i.current || (i.current = t, l((h) => [
      ...h,
      { id: crypto.randomUUID(), from: d, text: t }
    ]));
  }, [t, d]);
  const f = (h) => {
    l((g) => [...g, { id: crypto.randomUUID(), from: c, text: h }]), r?.(h);
  }, b = {
    sender: n?.speaker ?? "Professor",
    receiver: n?.listener ?? "Aluno"
  };
  return /* @__PURE__ */ u(
    we,
    {
      role: c,
      messages: a,
      onSend: f,
      labels: b,
      speed: o,
      ...s
    }
  );
}
function D(e, t) {
  const r = $(
    {
      onFinal: (n) => e.onTranscript(n, !0),
      onInterim: (n) => e.onTranscript(n, !1),
      onError: e.onError
    },
    t
  );
  return {
    async start() {
      if (!r) {
        e.onError(
          "Web Speech API não suportada neste navegador (use Chrome). O provedor principal de ASR também falhou."
        );
        return;
      }
      r.start();
    },
    stop() {
      r?.stop();
    }
  };
}
function Pe(e, t = "pt-BR") {
  return (r) => {
    const n = e(r);
    let o = n;
    return {
      async start(s) {
        if (!s || s.getAudioTracks().length === 0) {
          const a = D(r, t);
          o = a, await a.start(s);
          return;
        }
        try {
          await n.start(s), o = n;
        } catch {
          const a = D(r, t);
          o = a, await a.start(s);
        }
      },
      stop() {
        o.stop();
      }
    };
  };
}
function xe(e) {
  return new MediaStream([e]);
}
function V(...e) {
  const t = e.flatMap((r) => r.getAudioTracks());
  return new MediaStream(t);
}
function T(e) {
  if (e.srcObject instanceof MediaStream)
    return V(e.srcObject);
  const t = e, r = t.captureStream ?? t.mozCaptureStream;
  if (!r)
    throw new Error(
      "Este navegador não suporta captureStream() no <video>. Passe o MediaStream diretamente."
    );
  return V(r.call(e));
}
function Te(e) {
  const t = e.getReceivers().map((r) => r.track).filter((r) => r != null && r.kind === "audio");
  return new MediaStream(t);
}
function N(e) {
  return e ? e instanceof HTMLVideoElement ? e : e.querySelector("video") : null;
}
function Ne(e) {
  const t = N(e.element);
  if (!t)
    throw new Error(
      "O <video> do participante ainda não existe. Use audioStreamFromVideoParticipantAsync() para aguardar o evento de criação."
    );
  return T(t);
}
function Ie(e, t = "videoElementCreated") {
  const r = N(e.element);
  return r ? Promise.resolve(T(r)) : new Promise((n, o) => {
    e.on(t, () => {
      const s = N(e.element);
      s ? n(T(s)) : o(
        new Error(
          `Evento "${t}" disparado mas nenhum <video> encontrado em participant.element. Verifique se o SDK popula o elemento antes do evento.`
        )
      );
    });
  });
}
function Fe(e) {
  return { push: O(e) };
}
const Le = "https://traducao2.vlibras.gov.br/translate";
class Me {
  glosaCache = /* @__PURE__ */ new Map();
  renderer;
  translatorUrl;
  onGlosa;
  onError;
  constructor(t, r = {}) {
    this.renderer = t, this.translatorUrl = r.translatorUrl ?? Le, this.onGlosa = r.onGlosa, this.onError = r.onError;
  }
  /**
   * Recebe uma lista de textos, faz chunking e enfileira cada cláusula.
   * Pode ser chamado com texto parcial (interim ASR) ou final.
   */
  observe(t) {
    for (const r of t)
      for (const n of this.chunkText(r))
        this.signClause(n);
  }
  /**
   * Split por "." → sentenças; split por "," e ";" → cláusulas.
   * Filtra cláusulas vazias ou muito curtas (< 2 chars).
   */
  chunkText(t) {
    return t.split(".").flatMap((r) => r.split(/[,;]/)).map((r) => r.trim()).filter((r) => r.length >= 2);
  }
  /**
   * Sinaliza uma cláusula.
   * - Cache hit: usa renderer.play(cached_glosa) se o renderer suportar
   * - Cache miss: usa renderer.play(clause) e faz prefetch da glosa em background
   */
  signClause(t) {
    const r = t.toLowerCase(), n = this.glosaCache.get(r);
    if (n !== void 0) {
      this.onGlosa?.(t, n, !0), this.renderer.play(n);
      return;
    }
    this.renderer.play(t), this.prefetchGlosa(t, r);
  }
  /**
   * Chama o endpoint de tradução em background para popular o cache.
   * Não bloqueia a sinalização atual.
   */
  prefetchGlosa(t, r) {
    fetch(this.translatorUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: t })
    }).then((n) => {
      if (!n.ok) throw new Error(`HTTP ${n.status}`);
      return n.text();
    }).then((n) => {
      const o = n.trim();
      o && (this.glosaCache.set(r, o), this.onGlosa?.(t, o, !1));
    }).catch(
      (n) => this.onError?.(t, n instanceof Error ? n.message : String(n))
    );
  }
  /** Limpa o cache de glosa (ex: ao trocar de sala). */
  clearCache() {
    this.glosaCache.clear();
  }
  get cacheSize() {
    return this.glosaCache.size;
  }
}
export {
  ue as DEFAULT_STRINGS,
  we as LibrasChat,
  Ae as LibrasChatPanel,
  Me as LibrasObserver,
  Re as LibrasProvider,
  Ce as LibrasTranslator,
  oe as VLibrasSignRenderer,
  Te as audioStreamFromPeerConnection,
  xe as audioStreamFromTrack,
  T as audioStreamFromVideoElement,
  Ne as audioStreamFromVideoParticipant,
  Ie as audioStreamFromVideoParticipantAsync,
  Fe as createCaptionSink,
  se as createVLibrasPlayer,
  B as useLibrasAvatar,
  I as useLibrasConfig,
  ce as useLibrasTranslator,
  Pe as withWebSpeechFallback
};
//# sourceMappingURL=libras-translator.js.map
