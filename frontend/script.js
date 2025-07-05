const API_URL = "http://localhost:8000/";

// Carrega todas as dúvidas
function carregarDuvidas() {
  hideAllSections();
  fetch(API_URL)
    .then(res => res.json())
    .then(duvidas => {
      const div = document.getElementById("duvidas");
      div.innerHTML = "";
      duvidas.forEach(d => {
        const bloco = document.createElement("div");
        bloco.className = "duvida";
        bloco.innerHTML = `
          <h3>${d.titulo}</h3>
          <p><strong>${d.autor}:</strong> ${d.texto}</p>
          <div>
            ${d.respostas.map(r => `<div class=\"resposta\"><strong>${r.autor}:</strong> ${r.texto}</div>`).join("")}
          </div>
          <input placeholder="Seu nome" id="nome_${d.id}" />
          <input placeholder="Responder..." id="resp_${d.id}" />
          <button onclick="responder('${d.id}')">Responder</button>
        `;
        div.appendChild(bloco);
      });
      document.getElementById("duvidas").style.display = "block";
    });
}

// Exibe formulário de nova dúvida
function mostrarFormDuvida() {
  hideAllSections();
  document.getElementById("formNovaDuvida").style.display = "block";
}

// Posta nova dúvida
function postarDuvida() {
  const autor = document.getElementById("autor").value;
  const titulo = document.getElementById("titulo").value;
  const texto = document.getElementById("texto").value;

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ acao: "nova_duvida", autor, titulo, texto })
  })
    .then(() => carregarDuvidas());
}

// Busca dúvidas
function buscar() {
  hideAllSections();
  const termo = document.getElementById("buscarInput").value;
  fetch(`${API_URL}?buscar=${encodeURIComponent(termo)}`)
    .then(res => res.json())
    .then(result => {
      const div = document.getElementById("duvidas");
      div.innerHTML = "";
      result.forEach(d => {
        const bloco = document.createElement("div");
        bloco.className = "duvida";
        bloco.innerHTML = `
          <h3>${d.titulo}</h3>
          <p><strong>${d.autor}:</strong> ${d.texto}</p>
        `;
        div.appendChild(bloco);
      });
      document.getElementById("duvidas").style.display = "block";
    });
}

// Exibe formulário de novo usuário
function mostrarFormUsuario() {
  hideAllSections();
  document.getElementById("formNovoUsuario").style.display = "block";
}

// Cadastra novo usuário
function postarUsuario() {
  const nome = document.getElementById("usuario_nome").value;
  if (!nome) return;
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ acao: "novo_usuario", nome })
  })
    .then(res => res.json())
    .then(res => {
      alert(res.status === "created" ? "Usuário criado com sucesso." :
            res.status === "exists" ? "Usuário já existe." :
            "Erro ao criar usuário.");
      if (res.status === "created") carregarUsuarios();
    });
}

// Carrega todos os usuários
function carregarUsuarios() {
  hideAllSections();
  fetch(`${API_URL}?acao=listar_usuarios`)
    .then(res => res.json())
    .then(usuarios => {
      const div = document.getElementById("usuarios");
      div.innerHTML = "";
      usuarios.forEach(u => {
        const bloco = document.createElement("div");
        bloco.className = "usuario";
        bloco.innerHTML = `<p><strong>Nome:</strong> ${u.nome}</p>`;
        div.appendChild(bloco);
      });
      document.getElementById("usuarios").style.display = "block";
    });
}

// Exibe estatísticas calculadas no cliente
function mostrarEstatisticas() {
  hideAllSections();
  fetch(API_URL)
    .then(res => res.json())
    .then(duvidas => {
      const div = document.getElementById("estatisticas");
      const map = {};
      let totalAll = 0, answeredAll = 0;
      duvidas.forEach(d => {
        const a = d.autor;
        if (!map[a]) map[a] = { total: 0, answered: 0 };
        map[a].total++;
        totalAll++;
        if (d.respostas && d.respostas.length) {
          map[a].answered++;
          answeredAll++;
        }
      });
      let html = '<h2><br>Estatísticas</h2><ul>';
      for (const u in map) {
        const stats = map[u];
        const pct = ((stats.answered / stats.total) * 100).toFixed(1);
        html += `<li><strong>${u}</strong>: ${stats.total} dúvidas, ${stats.answered} respondidas (${pct}%)</li>`;
      }
      const pctAll = ((answeredAll / totalAll) * 100 || 0).toFixed(1);
      html += `</ul><p><strong>Total:</strong> ${totalAll}, respondidas: ${answeredAll} (${pctAll}%)</p>`;
      div.innerHTML = html;
      div.style.display = "block";
    });
}

// Esconde todas as seções antes de mostrar outra
function hideAllSections() {
  ["duvidas", "usuarios", "formNovaDuvida", "formNovoUsuario", "estatisticas"].forEach(id => {
    document.getElementById(id).style.display = "none";
  });
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
});