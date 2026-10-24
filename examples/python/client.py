"""Foodzwerge MCP example. Uses Python's standard library only."""
import argparse
import json
import os
import urllib.error
import urllib.parse
import urllib.request

PROTOCOL_VERSION = "2025-06-18"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class McpClient:
    def __init__(self, url, token):
        if not url or not token:
            raise ValueError("Set FOODZWERGE_MCP_URL and FOODZWERGE_MCP_TOKEN.")
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme != "https" and not (
            parsed.scheme == "http" and parsed.hostname in ("localhost", "127.0.0.1", "::1")
        ):
            raise ValueError("Use HTTPS, or HTTP on localhost for development.")
        if parsed.username or parsed.password:
            raise ValueError("Credentials must use the Authorization header.")
        self.url, self.token, self.next_id = url, token, 1
        self.opener = urllib.request.build_opener(NoRedirect())

    def send(self, method, params=None, notification=False):
        message = {"jsonrpc": "2.0", "method": method}
        request_id = None
        if not notification:
            request_id = self.next_id
            self.next_id += 1
            message["id"] = request_id
        if params is not None:
            message["params"] = params
        headers = {
            "Authorization": "Bearer " + self.token,
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
        }
        if method != "initialize":
            headers["MCP-Protocol-Version"] = PROTOCOL_VERSION
        request = urllib.request.Request(
            self.url, data=json.dumps(message).encode(), headers=headers, method="POST"
        )
        try:
            with self.opener.open(request, timeout=30) as response:
                if notification and response.status == 202:
                    return None
                body = json.load(response)
        except urllib.error.HTTPError as error:
            raise RuntimeError("MCP HTTP status " + str(error.code)) from None
        if body.get("jsonrpc") != "2.0" or body.get("id") != request_id:
            raise RuntimeError("Invalid MCP response envelope.")
        if "error" in body:
            raise RuntimeError("MCP error: " + str(body["error"].get("message")))
        if "result" not in body:
            raise RuntimeError("Missing MCP result.")
        return body["result"]

    def initialize(self):
        result = self.send("initialize", {
            "protocolVersion": PROTOCOL_VERSION,
            "capabilities": {},
            "clientInfo": {"name": "foodzwerge-agent-kit-python", "version": "0.1.0"},
        })
        if result.get("protocolVersion") != PROTOCOL_VERSION:
            raise RuntimeError("Unsupported negotiated MCP protocol.")
        self.send("notifications/initialized", notification=True)
        return result

    def list_tools(self):
        return self.send("tools/list")

    def call_tool(self, name, arguments=None):
        result = self.send("tools/call", {"name": name, "arguments": arguments or {}})
        if result.get("isError"):
            text = next((item["text"] for item in result.get("content", []) if item.get("type") == "text"), name)
            raise RuntimeError("Tool failed: " + text)
        return result.get("structuredContent", result.get("content"))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--city")
    args = parser.parse_args()
    client = McpClient(os.getenv("FOODZWERGE_MCP_URL"), os.getenv("FOODZWERGE_MCP_TOKEN"))
    server = client.initialize()
    print(json.dumps({"server": server["serverInfo"], "tools": client.list_tools()}, ensure_ascii=False, indent=2))
    if args.city:
        print(json.dumps(client.call_tool("find_shops", {
            "city": args.city, "order_type": "pickup", "limit": 5,
        }), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, RuntimeError, urllib.error.URLError) as error:
        raise SystemExit(str(error))
