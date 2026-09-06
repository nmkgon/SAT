from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os, webbrowser
os.chdir(Path(__file__).resolve().parent.parent)
server = ThreadingHTTPServer(("127.0.0.1", 8080), SimpleHTTPRequestHandler)
print("Open http://localhost:8080 — Ctrl+C to stop")
webbrowser.open("http://localhost:8080")
server.serve_forever()
