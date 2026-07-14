import http.server
import socketserver
import webbrowser
import threading
import os
import sys

PORT = 8000

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress server terminal request logs for cleaner console output
        pass

def start_server():
    with socketserver.TCPServer(("", PORT), QuietHandler) as httpd:
        print(f"Server successfully hosted at http://localhost:{PORT}")
        print("Press Ctrl+C to terminate the local server.")
        httpd.serve_forever()

if __name__ == "__main__":
    print("====================================================")
    print("      LOVESPY - LOCAL SHOWCASE AUTOMATIC SERVER")
    print("====================================================")
    
    # Target file validation
    if not os.path.exists("index.html"):
        print("Error: index.html not found in the current directory.")
        sys.exit(1)
        
    # Start HTTP server on a daemon thread
    server_thread = threading.Thread(target=start_server)
    server_thread.daemon = True
    server_thread.start()
    
    # Auto-open browser
    webbrowser.open(f"http://localhost:{PORT}")
    
    # Keep main thread alive
    try:
        server_thread.join()
    except KeyboardInterrupt:
        print("\nStopping showcase server. Goodbye!")
        sys.exit(0)
