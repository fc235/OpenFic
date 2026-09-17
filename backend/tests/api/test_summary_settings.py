import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_summary_settings_save_and_reload(client: AsyncClient) -> None:
    values = {
        "summary_auto_generate_chapter": False,
        "summary_auto_generate_long_term": False,
        "summary_min_chapter_word_count": 0,
        "summary_batch_size": 3,
        "summary_chapter_target_length": 100,
        "summary_long_term_target_length": 300,
    }
    response = await client.put("/api/v1/settings", json=values)
    assert response.status_code == 200
    response = await client.get("/api/v1/settings")
    assert response.status_code == 200
    assert {key: response.json()[key] for key in values} == values


@pytest.mark.asyncio
async def test_summary_interval_requires_confirmation(client: AsyncClient) -> None:
    original = (await client.get("/api/v1/settings")).json()["summary_long_term_interval"]
    values = {"summary_long_term_interval": original + 1}
    response = await client.put("/api/v1/settings", json=values)
    assert response.status_code == 409
    assert response.json()["detail"]["code"] == "summary_range_invalidation_required"
    assert (await client.get("/api/v1/settings")).json()["summary_long_term_interval"] == original
    response = await client.put(
        "/api/v1/settings",
        json={**values, "confirm_summary_range_invalidation": True},
    )
    assert response.status_code == 200
    assert response.json()["summary_long_term_interval"] == original + 1
