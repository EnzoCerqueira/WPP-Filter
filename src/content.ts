declare const chrome: any;

let nomesBloqueados: string[] = [];

const style = document.createElement("style");
style.innerHTML = `
.wpp-filter-hidden {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    height: 0 !important;
    pointer-events: none !important;
    margin: 0 !important;
    padding: 0 !important;
}
.wpp-filter-oculto * {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
  }`;
document.head.appendChild(style);

if (typeof chrome !== "undefined" && chrome.storage) {
  chrome.storage.local.get(["listaBloqueados"], (result: any) => {
    if (result.listaBloqueados) {
      nomesBloqueados = result.listaBloqueados;
      ocultarMensagens();
    }
  });

  chrome.storage.onChanged.addListener((changes: any, namespace: any) => {
    if (namespace === "local" && changes.listaBloqueados) {
      nomesBloqueados = changes.listaBloqueados.newValue || [];
      ocultarMensagens();
    }
  });
}

function ocultarMensagens(): void {
  const linhas = document.querySelectorAll<HTMLElement>(
    "#main div[role='row']",
  );

  if (linhas.length === 0) return;

  if (nomesBloqueados.length === 0) {
    linhas.forEach((linha) => {
      linha.classList.remove("wpp-filter-hidden");
    });
    return;
  }

  const nomesNormalizados = nomesBloqueados.map((nome) => nome.toLowerCase());
  let ocultandoBlocoAtual = false;

  linhas.forEach((linha) => {
    const autorEl = linha.querySelector<HTMLElement>("[data-testid='author']");
    const msgContainer = linha.querySelector<HTMLElement>(
      "[data-pre-plain-text]",
    );
    const elementoComId = linha.querySelector<HTMLElement>("div[data-id]");

    // Failsafe (Metadados invisíveis)
    if (msgContainer) {
      const metadados =
        msgContainer.getAttribute("data-pre-plain-text")?.toLowerCase() || "";
      const temAlvoAqui = nomesNormalizados.some((nome) =>
        metadados.includes(nome),
      );
      ocultandoBlocoAtual = temAlvoAqui;
    }
    // 2. Fallback visual para o nome
    else if (autorEl && autorEl.textContent) {
      const nomeAutor = autorEl.textContent.toLowerCase();
      ocultandoBlocoAtual = nomesNormalizados.includes(nomeAutor);
    }
    // 3. Trava de segurança: Nunca ocultar a SUA PRÓPRIA mensagem (true_)
    else if (elementoComId) {
      const dataId = elementoComId.getAttribute("data-id");
      if (dataId && dataId.startsWith("true_")) {
        ocultandoBlocoAtual = false;
      }
    }

    if (ocultandoBlocoAtual) {
      linha.classList.add("wpp-filter-hidden");

      
      const possivelAvatarIrmao =
        linha.previousElementSibling as HTMLElement | null;
      if (possivelAvatarIrmao?.querySelector("img")) {
        possivelAvatarIrmao.classList.add("wpp-filter-hidden");
      }

      const avatarNaLinha = linha.querySelector(
        "img[src*='pps.whatsapp.net'], [data-testid='avatar'], [data-testid='default-user']",
      );
      if (!avatarNaLinha) {
        const grupoPai = linha.closest(
          "div[tabindex], div[data-id]",
        )?.parentElement;
        const avatarNoGrupo = grupoPai?.querySelector<HTMLElement>(
          "img[src*='pps.whatsapp.net'], [data-testid='avatar'], [data-testid='default-user']",
        );
        avatarNoGrupo?.classList.add("wpp-filter-hidden");
      }
    } else {
      linha.classList.remove("wpp-filter-hidden");
    }
  });
}

const observer = new MutationObserver(() => {
  ocultarMensagens();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

ocultarMensagens();
console.log("🕵️ WPP Filter: Iniciando a filtragem de mensagens...");
