from http.server import HTTPServer, BaseHTTPRequestHandler
import ssl

httpd = HTTPServer(('localhost', 4443), BaseHTTPRequestHandler)

httpd.socket = ssl.wrap_socket (httpd.socket,
				certfile='server.pem', server_side=True,ssl_version=ssl.PROTOCOL_TLSv1_2) 


httpd.serve_forever()
