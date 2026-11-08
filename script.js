/* ==========================================================
   CONFIGURAÇÃO — edite aqui sem mexer no resto do código
   ========================================================== */

// Níveis de 0 a 100 (ajuste para refletir a sua realidade)
const SKILLS = [
  { nome: "HTML",       nivel: 90, desc: "Estrutura semântica e acessível.",
    icone: '<path d="M8 8l-5 4 5 4M16 8l5 4-5 4"/>' },
  { nome: "CSS",        nivel: 85, desc: "Layouts responsivos, animações e design de interface.",
    icone: '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/>' },
  { nome: "JavaScript", nivel: 80, desc: "Interatividade, lógica de front-end e consumo de dados.",
    icone: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>' },
  { nome: "Python",     nivel: 88, desc: "Automação, processamento de dados e sistemas.",
    icone: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>' },
];

// Quando tiver projetos reais, adicione-os aqui. Exemplo:
// { tag: "Automação / Python", titulo: "Sistema de Gestão", desc: "Descrição curta.",
//   links: [{ rotulo: "Código", url: "https://github.com/..." }, { rotulo: "Demo", url: "https://..." }] }
const PROJETOS = [];

// Cards "Em obras..." exibidos enquanto PROJETOS estiver vazio
const EM_OBRAS = [
  { tag: "Automação / Python" },
  { tag: "Front-End / Web" },
  { tag: "Dados & Sistemas" },
];

const FRASES = ["Tech Enthusiast", "Automation Builder", "Data Thinker", "Problem Solver"];

/* ========================================================== */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduzMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- Skills (medidor em segmentos) ---- */
function renderSkills() {
  $("#stats").innerHTML = SKILLS.map(s => `
    <article class="stat">
      <div class="stat-top">
        <h3><svg viewBox="0 0 24 24" aria-hidden="true">${s.icone}</svg>${s.nome}</h3>
        <span class="pct" data-alvo="${s.nivel}">0%</span>
      </div>
      <p>${s.desc}</p>
      <div class="meter" data-nivel="${s.nivel}" role="img" aria-label="${s.nome}: ${s.nivel}%">
        ${'<i></i>'.repeat(20)}
      </div>
    </article>`).join("");
}

/* ---- Projetos ---- */
function renderProjetos() {
  const lista = PROJETOS.length ? PROJETOS : EM_OBRAS;
  $("#cards").innerHTML = lista.map(p => {
    if (!PROJETOS.length) {
      return `
        <article class="card soon reveal">
          <span class="chip">${p.tag}</span>
          <h3>Em obras...</h3>
          <p>Novo projeto sendo preparado no vestiário.</p>
          <div class="build"><small><span>Carregando</span><span>em breve</span></small>
            <div class="bar"><i></i></div></div>
        </article>`;
    }
    const links = (p.links || []).map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.rotulo}</a>`).join("");
    return `
      <article class="card reveal">
        <span class="chip">${p.tag}</span>
        <h3>${p.titulo}</h3>
        <p>${p.desc}</p>
        ${links ? `<div class="links">${links}</div>` : ""}
      </article>`;
  }).join("");
}

/* ---- Contador animado ---- */
function contar(el, alvo, sufixo = "") {
  if (reduzMovimento) { el.textContent = alvo + sufixo; return; }
  const dur = 1400, ini = performance.now();
  const passo = t => {
    const p = Math.min((t - ini) / dur, 1);
    el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3))) + sufixo;
    if (p < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

/* ---- Animações ao entrar na tela ---- */
function iniciarObservers() {
  const io = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add("in");

      $$("[data-fill]", el).forEach(b => b.style.width = b.dataset.fill + "%");
      $$("[data-count]", el).forEach(c => contar(c, +c.dataset.count));
      $$(".meter", el).forEach((m, i) => {
        const ligar = Math.round(m.dataset.nivel / 5);
        $$("i", m).forEach((seg, n) => setTimeout(() => seg.classList.toggle("on", n < ligar), n * 45 + i * 120));
        contar(m.closest(".stat").querySelector(".pct"), +m.dataset.nivel, "%");
      });
      io.unobserve(el);
    });
  }, { threshold: 0.18 });

  $$(".reveal").forEach(el => io.observe(el));
}

/* ---- Nav: fundo, barra de progresso e seção ativa ---- */
function iniciarNav() {
  const nav = $("#nav"), barra = $("#progress");
  const links = $$(".menu a:not(.cta)");
  const secoes = links.map(a => $(a.getAttribute("href"))).filter(Boolean);

  const aoRolar = () => {
    const topo = scrollY, total = document.documentElement.scrollHeight - innerHeight;
    barra.style.width = (topo / total * 100) + "%";
    nav.classList.toggle("scrolled", topo > 30);
    const atual = secoes.findLast?.(s => s.offsetTop - 140 <= topo) ?? secoes[0];
    links.forEach(a => a.classList.toggle("active", atual && a.getAttribute("href") === "#" + atual.id));
  };
  addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  const burger = $("#burger"), menu = $("#menu");
  const alternar = abrir => {
    menu.classList.toggle("open", abrir);
    burger.setAttribute("aria-expanded", abrir);
  };
  burger.addEventListener("click", () => alternar(!menu.classList.contains("open")));
  $$("a", menu).forEach(a => a.addEventListener("click", () => alternar(false)));
}

/* ---- Texto digitado no hero ---- */
function digitar() {
  const alvo = $("#typed");
  if (reduzMovimento) return;
  let f = 0, c = FRASES[0].length, apagando = true;
  const ciclo = () => {
    const frase = FRASES[f];
    alvo.textContent = frase.slice(0, c);
    if (apagando) {
      if (--c < 0) { apagando = false; f = (f + 1) % FRASES.length; c = 0; }
      return setTimeout(ciclo, 45);
    }
    if (++c > FRASES[f].length) { apagando = true; c = FRASES[f].length; return setTimeout(ciclo, 2200); }
    setTimeout(ciclo, 85);
  };
  setTimeout(ciclo, 2200);
}

/* ---- Luz que segue o cursor ---- */
function iniciarGlow() {
  const glow = $("#glow");
  if (matchMedia("(pointer: coarse)").matches) { glow.remove(); return; }
  addEventListener("pointermove", e => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  }, { passive: true });
}

/* ---- Lightbox da galeria ---- */
function iniciarLightbox() {
  const box = $("#lightbox"), img = $("img", box);
  $$(".shot").forEach(b => b.addEventListener("click", () => {
    img.src = b.dataset.src;
    img.alt = $("img", b).alt;
    box.hidden = false;
  }));
  box.addEventListener("click", () => box.hidden = true);
  addEventListener("keydown", e => { if (e.key === "Escape") box.hidden = true; });
}

/* ---- Iniciar ---- */
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  renderSkills();
  renderProjetos();
  iniciarNav();
  iniciarGlow();
  iniciarLightbox();
  digitar();
  iniciarObservers();
});
