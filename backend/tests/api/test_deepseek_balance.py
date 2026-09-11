import httpx
import pytest
import respx


async def provider(client, url="https://api.deepseek.com/v1"):
    response = await client.post("/api/v1/model-providers", data={
        "name":"DeepSeek", "url":url, "provider_type":"openai-compatible", "api_key":"sk-balance-test",
    })
    assert response.status_code == 201
    return response.json()["id"]


@pytest.mark.asyncio
@respx.mock
async def test_official_balance_uses_server_key_and_preserves_currency(client):
    provider_id = await provider(client)
    payload = {"is_available":True, "balance_infos":[{"currency":"CNY", "total_balance":"12.3456", "granted_balance":"2.0000", "topped_up_balance":"10.3456"}]}
    request = respx.get("https://api.deepseek.com/user/balance").mock(return_value=httpx.Response(200,json=payload))
    response = await client.get(f"/api/v1/model-providers/{provider_id}/balance")
    assert response.status_code == 200
    assert response.json() == payload
    assert request.calls.last.request.headers["Authorization"] == "Bearer sk-balance-test"
    assert "sk-balance-test" not in response.text


@pytest.mark.asyncio
@respx.mock
async def test_third_party_balance_rejected_without_sending_key(client):
    provider_id = await provider(client, "https://api.deepseek.com.example.org/v1")
    response = await client.get(f"/api/v1/model-providers/{provider_id}/balance")
    assert response.status_code == 400
    assert len(respx.calls) == 0


@pytest.mark.asyncio
@respx.mock
async def test_balance_does_not_follow_redirects_or_expose_provider_errors(client):
    provider_id = await provider(client)
    respx.get("https://api.deepseek.com/user/balance").mock(return_value=httpx.Response(302,headers={"Location":"https://example.org/key"}))
    response = await client.get(f"/api/v1/model-providers/{provider_id}/balance")
    assert response.status_code == 502
    assert len(respx.calls) == 1
