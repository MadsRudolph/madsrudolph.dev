"""After npm run build, export both CV PDFs using a locally installed Chromium."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
import subprocess
import tempfile
import threading

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
if not (dist / 'cv.html').exists():
    raise SystemExit('Run npm run build first.')
chromium = shutil.which('chromium') or shutil.which('google-chrome')
if not chromium:
    raise SystemExit('Install Chromium or Google Chrome to export the PDFs.')
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(dist)))
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    for language, route in [('en', 'cv.html'), ('da', 'da/cv.html')]:
        output = root / 'public/media/cv' / f'mads-rudolph-{language}.pdf'
        output.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='portfolio-cv-') as profile:
            subprocess.run([
                chromium, '--headless', '--disable-gpu', '--no-pdf-header-footer',
                f'--user-data-dir={profile}', '--timeout=15000',
                f'--print-to-pdf={output}',
                f'http://127.0.0.1:{server.server_port}/{route}',
            ], check=True, timeout=60, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if not output.is_file() or output.stat().st_size < 1000:
            raise SystemExit(f'PDF export failed: {output}')
        target = dist / 'media/cv' / output.name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(output, target)
        print(output)
finally:
    server.shutdown()
    server.server_close()
