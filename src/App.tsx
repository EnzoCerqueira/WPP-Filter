import { useState, useEffect } from "react";

declare const chrome: any;

function App() {
  const [bloqueados, setBloqueados] = useState<string[]>([]);
  const [novoNome, setNovoNome] = useState("");

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["listaBloqueados"], (result: any) => {
        if (result.listaBloqueados) {
          setBloqueados(result.listaBloqueados);
        }
      });
    }
  }, []);

  const adicionarNome = () => {
    if (!novoNome.trim()) return;
    const novaLista = [...bloqueados, novoNome.trim()];
    setBloqueados(novaLista);
    setNovoNome("");
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ listaBloqueados: novaLista });
    }
  };

  const removerNome = (nomeParaRemover: string) => {
    const novaLista = bloqueados.filter((nome) => nome !== nomeParaRemover);
    setBloqueados(novaLista);
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ listaBloqueados: novaLista });
    }
  };

  return (
    <div style={{ padding: "16px", width: "320px", fontFamily: "sans-serif" }}>
      <h2>WA Filter 🕵️‍♂️</h2>
      <p style={{ fontSize: "14px", color: "#666" }}>
        Oculte mensagens no WhatsApp Web.
      </p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          type="text"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Ex: galinho tuta"
          style={{ flex: 1, padding: "8px" }}
        />
        <button
          onClick={adicionarNome}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          Bloquear
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {bloqueados.map((nome, index) => (
          <li
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
              padding: "8px",
              background: "#f0f0f0",
              borderRadius: "4px",
            }}
          >
            <span>{nome}</span>
            <button
              onClick={() => removerNome(nome)}
              style={{ color: "red", border: "none", cursor: "pointer" }}
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
