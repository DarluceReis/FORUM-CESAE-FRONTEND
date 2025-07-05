from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import urllib.parse
import uuid

PORT = 8000
FILENAME = "dados.json"

## aa
def carregar_dados():
    try:
        with open(FILENAME, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {"duvidas": []}

def salvar_dados(dados):
    with open(FILENAME, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)

class Servidor(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        dados = carregar_dados()
        parsed = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed.query)
        termo = query.get("buscar", [""])[0].lower()

        resultado = []
        for duvida in dados["duvidas"]:
            if termo in duvida["titulo"].lower() or termo in duvida["texto"].lower():
                resultado.append(duvida)

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(resultado if termo else dados["duvidas"]).encode("utf-8"))

    def do_POST(self):
        length = int(self.headers["Content-Length"])
        body = self.rfile.read(length)
        dados_recebidos = json.loads(body.decode("utf-8"))
        dados = carregar_dados()

        acao = dados_recebidos.get("acao")

        if acao == "nova_duvida":
            duvida = {
                "id": str(uuid.uuid4()),
                "autor": dados_recebidos["autor"],
                "titulo": dados_recebidos["titulo"],
                "texto": dados_recebidos["texto"],
                "respostas": []
            }
            dados["duvidas"].append(duvida)

        elif acao == "responder":
            for duvida in dados["duvidas"]:
                if duvida["id"] == dados_recebidos["id_duvida"]:
                    duvida["respostas"].append({
                        "autor": dados_recebidos["autor"],
                        "texto": dados_recebidos["texto"]
                    })

        salvar_dados(dados)
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"status": "ok"}).encode("utf-8"))

if __name__ == "__main__":
    with HTTPServer(("", PORT), Servidor) as servidor:
        print(f"Servidor iniciado em http://localhost:{PORT}")
        servidor.serve_forever()
