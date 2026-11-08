"""
Servidor local para visualizar o site.

Uso:
    python servidor.py            # abre em http://localhost:8000
    python servidor.py 5500       # porta personalizada
"""
import http.server
import socketserver
import sys
import webbrowser
from pathlib import Path

PORTA = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
PASTA = Path(__file__).parent


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PASTA), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")  # sempre mostra a versão mais recente
        super().end_headers()


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORTA), Handler) as httpd:
        url = f"http://localhost:{PORTA}"
        print(f"🏁 Site rodando em {url}  (Ctrl+C para parar)")
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nEncerrado.")
