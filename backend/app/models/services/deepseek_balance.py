"""Read official DeepSeek account balance without exposing API credentials."""

from typing import Literal
from urllib.parse import urlsplit

import httpx
from fastapi import HTTPException
from pydantic import BaseModel, ValidationError


class BalanceInfo(BaseModel):
    currency: Literal["CNY", "USD"]
    total_balance: str
    granted_balance: str
    topped_up_balance: str


class DeepSeekBalance(BaseModel):
    is_available: bool
    balance_infos: list[BalanceInfo]


def is_official_deepseek_url(url: str) -> bool:
    try:
        parsed = urlsplit(url)
        return (parsed.scheme == "https" and parsed.hostname == "api.deepseek.com"
                and parsed.port in (None, 443) and not parsed.username and not parsed.password
                and not parsed.query and not parsed.fragment
                and parsed.path.rstrip("/") in ("", "/v1", "/beta", "/anthropic"))
    except ValueError:
        return False


async def fetch_deepseek_balance(url: str, api_key: str | None) -> DeepSeekBalance:
    if not is_official_deepseek_url(url):
        raise HTTPException(400, "余额查询仅支持 DeepSeek 官方 API")
    if not api_key:
        raise HTTPException(400, "请先配置 DeepSeek API Key")
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=False) as client:
            response = await client.get("https://api.deepseek.com/user/balance", headers={"Authorization": f"Bearer {api_key}"})
        if response.status_code == 401:
            raise HTTPException(401, "DeepSeek API Key 无效")
        if response.status_code == 429:
            raise HTTPException(429, "DeepSeek 余额查询过于频繁，请稍后重试")
        if response.status_code != 200:
            raise HTTPException(502, "DeepSeek 余额查询暂时不可用")
        return DeepSeekBalance.model_validate(response.json())
    except httpx.TimeoutException as exc:
        raise HTTPException(504, "DeepSeek 余额查询超时") from exc
    except (httpx.RequestError, ValidationError, ValueError) as exc:
        raise HTTPException(502, "DeepSeek 余额查询失败") from exc
