from __future__ import annotations

import json
from typing import Any, Dict, List
from app.mcp.test_agent import CareerForgeTestAgent

class MCPServer:
    """
    Standard MCP (Model Context Protocol) JSON-RPC 2.0 Server.
    Provides discovery (`tools/list`) and invocation (`tools/call`) for all 15 MCP actions.
    """

    def __init__(self):
        self.agent = CareerForgeTestAgent()

    def list_tools(self) -> List[Dict[str, Any]]:
        return [
            {"name": "open_app", "description": "Open target application URL", "parameters": {"url": "string"}},
            {"name": "navigate_to", "description": "Navigate to specific path or URL", "parameters": {"path_or_url": "string"}},
            {"name": "inspect_page", "description": "Inspect page rendering, errors, and blank screen state", "parameters": {"page_name": "string"}},
            {"name": "find_interactive_elements", "description": "Find interactive buttons, inputs, and selects", "parameters": {}},
            {"name": "click_element", "description": "Simulate clicking an interactive element", "parameters": {"element": "string"}},
            {"name": "fill_input", "description": "Fill form input field with text", "parameters": {"selector": "string", "text": "string"}},
            {"name": "select_option", "description": "Select option in dropdown", "parameters": {"selector": "string", "value": "string"}},
            {"name": "submit_form", "description": "Submit specified form", "parameters": {"form_name": "string"}},
            {"name": "read_visible_text", "description": "Read visible page text content", "parameters": {}},
            {"name": "capture_console_errors", "description": "Retrieve list of captured browser console errors", "parameters": {}},
            {"name": "detect_failed_network_requests", "description": "Retrieve list of failed HTTP network requests", "parameters": {}},
            {"name": "verify_navigation", "description": "Verify current URL matches expected path", "parameters": {"expected": "string"}},
            {"name": "take_screenshot", "description": "Capture screenshot or HTML snapshot on failure", "parameters": {"test_name": "string"}},
            {"name": "run_api_checks", "description": "Run automated checks on FastAPI backend endpoints", "parameters": {}},
            {"name": "run_ai_checks", "description": "Run checks on LLM and RAG capabilities", "parameters": {}}
        ]

    def handle_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        method = payload.get("method", "")
        params = payload.get("params", {})
        req_id = payload.get("id", 1)

        if method == "tools/list":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {"tools": self.list_tools()}
            }

        elif method == "tools/call":
            tool_name = params.get("name", "")
            args = params.get("arguments", {})

            if not hasattr(self.agent, tool_name):
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {"code": -32601, "message": f"Tool '{tool_name}' not found."}
                }

            func = getattr(self.agent, tool_name)
            try:
                res = func(**args) if isinstance(args, dict) else func()
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {"content": [{"type": "text", "text": json.dumps(res, indent=2)}]}
                }
            except Exception as e:
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {"code": -32603, "message": f"Execution error: {e}"}
                }

        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "error": {"code": -32601, "message": f"Method '{method}' not supported."}
        }
