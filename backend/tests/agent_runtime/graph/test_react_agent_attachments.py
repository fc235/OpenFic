import asyncio
import json
from unittest.mock import AsyncMock, Mock, patch

import httpx
import pytest
import respx
from langchain_core.messages import HumanMessage

from app.agent_runtime.context.settings import ContextSettings
from app.agent_runtime.graph.react_agent import create_react_agent
from app.agent_runtime.types import ReactAgentConfig, TerminationCondition
from app.models.clients.openai_codex import OpenAICodexChatModel


@pytest.mark.asyncio
@pytest.mark.parametrize("with_runtime_context", [False, True])
@pytest.mark.parametrize(("attachment", "expected_text"), [
    ({"id": "text-id", "file_name": "notes.txt", "mime_type": "text/plain"},
     "[附件: notes.txt (id: text-id)]"),
    ({"id": "pdf-id", "file_name": "outline.pdf", "mime_type": "application/pdf"},
     "[附件: outline.pdf (id: pdf-id)]"),
    ({"id": "failed-id", "file_name": "broken.pdf", "mime_type": "application/pdf",
      "error": "PDF extraction failed"},
     "[附件处理失败: broken.pdf] PDF extraction failed"),
])
@respx.mock
async def test_injected_file_attachment_reaches_model(
    attachment, expected_text, with_runtime_context, tmp_path, monkeypatch,
):
    monkeypatch.setattr(
        "app.agent_runtime.attachments.ensure_agent_attachments_dir", lambda: tmp_path
    )
    queue = asyncio.Queue()
    queue.put_nowait(("pending-message", "user", "Review the attachment"))
    consume = AsyncMock(return_value=True)
    attachment_lookup = Mock(return_value=[attachment])
    route = respx.post("https://api.openai.com/v1/responses").mock(
        return_value=httpx.Response(200, text=(
            'data: {"type":"response.output_text.delta","delta":"Reviewed"}\n\n'
            'data: {"type":"response.completed","response":{"id":"resp_injected"}}\n\n'
        ))
    )
    model = OpenAICodexChatModel(model="gpt-test", api_key="mock-token")
    graph = create_react_agent(
        ReactAgentConfig(name="writer", tools=[], max_iterations=1,
                         termination=TerminationCondition(mode="no_tool_call")),
        model=model, inject_queue=queue,
    )
    configurable = {
        "inject_message_consumed_sink": consume,
        "inject_message_attachments": attachment_lookup,
    }
    if with_runtime_context:
        configurable.update({
            "runtime_state": {"session_id": "s", "task_id": "t", "project_id": "p",
                              "model_config": {"max_context_tokens": 8000}, "user_request": "Start"},
            "db_session": AsyncMock(),
        })
    with (
        patch("app.agent_runtime.graph.react_agent.build_context_parts",
              new=AsyncMock(return_value=[])),
        patch("app.agent_runtime.graph.react_agent.load_context_settings",
              new=AsyncMock(return_value=ContextSettings(auto_compact_context=False))),
    ):
        result = await graph.ainvoke(
            {"messages": [HumanMessage(content="Start")], "iteration_count": 0,
             "is_done": False, "final_output": None},
            config={"configurable": configurable},
        )
    consume.assert_awaited_once_with("pending-message")
    attachment_lookup.assert_called_once_with("pending-message")
    assert queue.empty()
    assert result["messages"][-1].content == "Reviewed"
    payload = json.loads(route.calls[0].request.content)
    injected = payload["input"][-1]
    assert injected["role"] == "user"
    assert injected["content"] == [
        {"type": "input_text", "text": "Review the attachment"},
        {"type": "input_text", "text": expected_text},
    ]
