"""Preview the independent personal site using Python's standard library."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser


class PreviewHandler(SimpleHTTPRequestHandler):
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
