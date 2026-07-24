declare const chrome: any;

let nomesBloqueados: string[] = [];

if (typeof chrome !== "undefined" && chrome.storage) {
  chrome.storage.local.get(["listaBloqueados"], (result: any) => {
    if (result.listaBloqueados) {
      nomesBloqueados = result.listaBloqueados;
      ocultarMensagens();
    }
  });

  chrome.storage.onChanged.addListener((changes: any, namespace: any) => {
    if (namespace === "local" && changes.listaBloqueados) {
      nomesBloqueados = changes.listaBloqueados.newValue;
      ocultarMensagens();
    }
  });
}

function ocultarMensagens(): void {
  if (nomesBloqueados.length === 0) return;

  const linhas = document.querySelectorAll<HTMLElement>("div[role='row']");
  let ocultandoBlocoAtual = false;

  linhas.forEach((linha) => {
    const autorEl = linha.querySelector<HTMLElement>("[data-testid='author']");
    if (autorEl && autorEl.textContent) {
      ocultandoBlocoAtual = nomesBloqueados.includes(autorEl.textContent);
    }

    const msgContainer = linha.querySelector<HTMLElement>(
      "[data-pre-plain-text]",
    );
    if (msgContainer) {
      const metadados = msgContainer.getAttribute("data-pre-plain-text");
      if (metadados) {
        const temAlvoAqui = nomesBloqueados.some((nome) =>
          metadados.includes(`] ${nome}:`),
        );
        if (temAlvoAqui) {
          ocultandoBlocoAtual = true;
        } else if (autorEl) {
          ocultandoBlocoAtual = false;
        }
      }
    }

    const elementoComId = linha.querySelector<HTMLElement>("div[data-id]");
    if (elementoComId) {
      const dataId = elementoComId.getAttribute("data-id");
      if (dataId && dataId.startsWith("true_")) {
        ocultandoBlocoAtual = false;
      }
    } else {
      ocultandoBlocoAtual = false;
    }
    if (ocultandoBlocoAtual) {
      if (linha.style.display !== "none") {
        linha.style.display = "none";
        console.log(
          "🕵️ WPP Filter: Mídia/Mensagem bloqueada por escaneamento de bloco!",
        );
      }
      const mediaEl = linha.querySelector<HTMLElement>("img");
      if (mediaEl && mediaEl.style.display === "none") {
        mediaEl.style.display = "";
      }
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
