import importlib.util
import json
import pathlib
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer

spec = importlib.util.spec_from_file_location(
    "foodzwerge_example", pathlib.Path(__file__).parents[1] / "examples/python/client.py"
)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ClientTest(unittest.TestCase):
    def test_initialize_list_search_and_tool_error(self):
        calls = []

        class Handler(BaseHTTPRequestHandler):
            def do_POST(self):
                message = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
                calls.append((message, dict(self.headers)))
                if message["method"] == "notifications/initialized":
                    self.send_response(202)
                    self.end_headers()
                    return
                if message["method"] == "initialize":
                    result = {"protocolVersion": "2025-06-18", "serverInfo": {"name": "Mock"}}
                elif message["method"] == "tools/list":
                    result = {"tools": [{"name": "find_shops"}]}
                elif message["params"]["name"] == "fail":
                    result = {"isError": True, "content": [{"type": "text", "text": "Bad cart"}]}
                else:
                    result = {"isError": False, "structuredContent": {"shops": [], "count": 0}}
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"jsonrpc": "2.0", "id": message["id"], "result": result}).encode())

            def log_message(self, *args):
                pass

        with HTTPServer(("127.0.0.1", 0), Handler) as server:
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                client = module.McpClient("http://127.0.0.1:%d/mcp" % server.server_port, "test-only")
                client.initialize()
                self.assertEqual(client.list_tools()["tools"][0]["name"], "find_shops")
                self.assertEqual(client.call_tool("find_shops", {"city": "Edemissen"})["count"], 0)
                with self.assertRaisesRegex(RuntimeError, "Bad cart"):
                    client.call_tool("fail")
                self.assertNotIn("id", calls[1][0])
                self.assertEqual(calls[0][1]["Authorization"], "Bearer test-only")
            finally:
                server.shutdown()
                thread.join()

    def test_credentials_and_https_required(self):
        with self.assertRaises(ValueError):
            module.McpClient(None, None)
        with self.assertRaises(ValueError):
            module.McpClient("http://example.com/mcp", "test")


if __name__ == "__main__":
    unittest.main()
