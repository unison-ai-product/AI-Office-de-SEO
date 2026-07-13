import http.server
import os

port = int(os.environ.get('PORT', 8756))
directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'prototype')


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)


with http.server.ThreadingHTTPServer(('', port), Handler) as httpd:
    print(f'Serving {directory} on port {port}')
    httpd.serve_forever()
