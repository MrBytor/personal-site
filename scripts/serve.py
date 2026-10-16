"""Preview the independent personal site using Python's standard library."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser
import json
from urllib.parse import urlsplit, parse_qsl, urlencode


class PreviewHandler(SimpleHTTPRequestHandler):
    def legacy_redirect(self):
        requested = urlsplit(self.path)
        filename = requested.path.removeprefix('/')
        if filename == 'index.html':
            return False
        route_file = Path(self.directory) / 'content' / 'legacy-routes.json'
        routes = json.loads(route_file.read_text(encoding='utf-8'))
        if filename not in routes:
            return False
        target = urlsplit(routes[filename])
        query = dict(parse_qsl(target.query))
        query.update((key, value) for key, value in parse_qsl(requested.query) if key != 'page')
        location = '/' + target.path + ('?' + urlencode(query) if query else '')
        if target.fragment:
            location += '#' + target.fragment
        self.send_response(302)
        self.send_header('Location', location)
        self.send_header('Content-Length', '0')
        self.end_headers()
        return True

    def do_GET(self):
        if not self.legacy_redirect():
            super().do_GET()

    def do_HEAD(self):
        if not self.legacy_redirect():
            super().do_HEAD()

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8766)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    try:
        server = ThreadingHTTPServer(
            ("127.0.0.1", args.port), partial(PreviewHandler, directory=str(root))
        )
    except OSError as error:
        parser.exit(1, f"Could not start on port {args.port}: {error}\n"
                    "If this site is already open, use its existing console. "
                    "Otherwise choose another port with --port 8767.\n")
    url = f"http://127.0.0.1:{server.server_port}/"
    print(f"Jacob Mlynarski - Personal Website\nLocal: {url}\nFolder: {root}", flush=True)
    print("Press Ctrl+C or close this console to stop the preview.", flush=True)
    if not args.no_browser:
        webbrowser.open(url)
    with server:
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
