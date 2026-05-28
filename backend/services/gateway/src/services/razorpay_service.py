"""Razorpay payment gateway integration.

Replaces the NOWPayments crypto gateway with Razorpay (cards / UPI /
netbanking). The user enters a USD amount; we convert USD→INR at the
configurable `USD_TO_INR_RATE` and charge INR via the Razorpay Orders API
+ Checkout popup. On success we credit the original USD amount to the
user's main wallet.

No `razorpay` pip SDK — the Orders API is a single POST over httpx (HTTP
Basic auth with KEY_ID/KEY_SECRET) and signatures are verified with the
Python stdlib `hmac`/`hashlib`.
"""
import hashlib
import hmac
import logging
from decimal import Decimal, ROUND_HALF_UP

import httpx

from packages.common.src.config import get_settings

logger = logging.getLogger("razorpay_service")

RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders"


def razorpay_configured() -> bool:
    """True when both the key id and key secret are set."""
    s = get_settings()
    return bool(s.RAZORPAY_KEY_ID and s.RAZORPAY_KEY_SECRET)


def usd_to_inr_paise(amount_usd: Decimal) -> int:
    """Convert a USD amount to INR paise (INR × 100).

    Razorpay amounts are integer paise. Uses ROUND_HALF_UP so the charged
    amount never silently truncates a fraction of a paisa.
    """
    rate = Decimal(str(get_settings().USD_TO_INR_RATE))
    paise = (amount_usd * rate * Decimal("100")).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    return int(paise)


async def create_order(amount_usd: Decimal, receipt: str, notes: dict) -> dict:
    """Create a Razorpay order for the INR-equivalent of `amount_usd`.

    POST /v1/orders with HTTP Basic auth (KEY_ID, KEY_SECRET). Returns the
    fields the frontend Checkout popup needs:
        {order_id, amount_paise, amount_inr, currency, key_id}
    Raises HTTPException(502) on any non-200 response (Razorpay error logged).
    """
    from fastapi import HTTPException

    s = get_settings()
    if not razorpay_configured():
        raise HTTPException(status_code=503, detail="Razorpay is not configured")

    amount_paise = usd_to_inr_paise(amount_usd)
    payload = {
        "amount": amount_paise,
        "currency": "INR",
        "receipt": receipt,
        "notes": notes,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            RAZORPAY_ORDERS_URL,
            auth=(s.RAZORPAY_KEY_ID, s.RAZORPAY_KEY_SECRET),
            json=payload,
        )
        try:
            data = resp.json()
        except Exception:
            data = {"raw": resp.text}
        if resp.status_code != 200:
            logger.error(
                "Razorpay create order failed status=%s body=%s",
                resp.status_code, data,
            )
            raise HTTPException(status_code=502, detail="Razorpay order creation failed")

    order_id = data.get("id")
    if not order_id:
        logger.error("Razorpay returned no order id: %s", data)
        raise HTTPException(status_code=502, detail="Razorpay order creation failed")

    logger.info("Razorpay order created: receipt=%s id=%s amount=%s paise", receipt, order_id, amount_paise)

    return {
        "order_id": order_id,
        "amount_paise": amount_paise,
        "amount_inr": float(Decimal(amount_paise) / Decimal("100")),
        "currency": "INR",
        "key_id": s.RAZORPAY_KEY_ID,
    }


def verify_checkout_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """Verify the Checkout handler signature returned to the browser.

    Razorpay signs `f"{order_id}|{payment_id}"` with the KEY_SECRET using
    HMAC-SHA256. Constant-time compare against the `razorpay_signature` the
    client posts back.
    """
    s = get_settings()
    secret = (s.RAZORPAY_KEY_SECRET or "").strip()
    if not secret or not order_id or not payment_id or not signature:
        return False
    expected = hmac.new(
        secret.encode(),
        f"{order_id}|{payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def verify_webhook_signature(raw_body: bytes, received_sig: str) -> bool:
    """Verify the webhook HMAC-SHA256 signature.

    Razorpay signs the raw request body with RAZORPAY_WEBHOOK_SECRET; the
    signature arrives in the `X-Razorpay-Signature` header. Fail closed if
    no webhook secret is configured (never trust an unsigned callback).
    """
    s = get_settings()
    secret = (s.RAZORPAY_WEBHOOK_SECRET or "").strip()
    if not secret:
        logger.error("Razorpay webhook secret not configured — refusing webhook")
        return False
    if not received_sig:
        return False
    expected = hmac.new(secret.encode(), raw_body or b"", hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, received_sig)
