"""Wallet API — Deposits, Withdrawals, Transactions."""
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, Query, Request, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from packages.common.src.database import get_db
from packages.common.src.schemas import (
    DepositRequest,
    InternalWalletTransferRequest,
    OnchainDepositRequest,
    OnchainWithdrawRequest,
    RazorpayOrderRequest,
    RazorpayVerifyRequest,
    TransferMainToTradingRequest,
    TransferTradingToMainRequest,
    TxHashSaveRequest,
    WithdrawalRequest,
)
from packages.common.src.auth import get_current_user
from ..services import wallet_service, onchain_deposit_service, onchain_withdraw_service

router = APIRouter()


@router.post("/deposit", status_code=201)
async def create_deposit(
    req: DepositRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await wallet_service.create_deposit(
        req=req, user_id=current_user["user_id"], db=db,
    )


# ─── Manual bank / UPI deposit (multipart with proof file) ──────────────────


@router.post("/deposit/manual", status_code=201)
async def create_manual_deposit(
    amount: Decimal = Form(...),
    transaction_id: str = Form(...),
    file: UploadFile = File(...),
    account_id: UUID | None = Form(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Manual bank / UPI deposit: user uploads payment proof; goes to admin
    queue for review. Body is multipart/form-data (not JSON) because of the
    file upload."""
    return await wallet_service.create_manual_deposit(
        user_id=current_user["user_id"],
        account_id=account_id,
        amount=amount,
        transaction_id=transaction_id,
        file=file,
        db=db,
    )


@router.post("/withdraw/manual", status_code=201)
async def create_manual_withdrawal(
    amount: Decimal = Form(...),
    upi_id: str = Form(""),
    payout_notes: str = Form(""),
    file: UploadFile | None = File(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Manual UPI / QR-payout withdrawal: user submits UPI ID and/or a QR
    image; goes to admin queue for manual payout. Multipart body."""
    return await wallet_service.create_manual_withdrawal(
        user_id=current_user["user_id"],
        amount=amount,
        upi_id=upi_id,
        payout_notes=payout_notes,
        file=file,
        db=db,
    )


# ─── Local Banking request (admin-mediated, KYC-gated) ────────────────────


@router.post("/deposit/local-banking", status_code=201)
async def create_local_banking_request(
    amount: Decimal = Form(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Stage 1 of the local banking flow — user submits a request, admin
    reviews KYC and shares a payment link out of band (or attaches it via
    the admin panel). KYC must be approved or the call 403s with
    KYC_REQUIRED so the trader UI can route to /kyc."""
    return await wallet_service.create_local_banking_request(
        amount=amount,
        user_id=current_user["user_id"],
        db=db,
    )


# ─── Razorpay deposits (Checkout popup, charged in INR) ───────────────────


@router.get("/deposit/razorpay/rate")
async def get_razorpay_rate(
    current_user: dict = Depends(get_current_user),
):
    """Live USD→INR rate the next Razorpay charge will use, so the trader UI
    can preview an accurate rupee amount before opening the Checkout popup."""
    from ..services import razorpay_service

    rate = await razorpay_service.get_usd_to_inr_rate()
    return {"rate": float(rate), "currency": "INR"}


@router.post("/deposit/razorpay/order", status_code=201)
async def create_razorpay_order(
    req: RazorpayOrderRequest,
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a pending Deposit + a Razorpay order. The user enters a USD
    amount; the order is charged in INR (USD_TO_INR_RATE). Returns the
    fields the frontend Razorpay Checkout popup needs. Balance is credited
    only on /deposit/razorpay/verify or the payment.captured webhook.

    Honours the `Idempotency-Key` header — a network-blip retry of the same
    key returns the same order instead of creating a second Razorpay order."""
    from packages.common.src.idempotency import get_cached_response, store_response

    cached = await get_cached_response(
        request, scope="deposit_razorpay_order",
        user_id=current_user["user_id"], db=db,
    )
    if cached is not None:
        return cached

    result = await wallet_service.create_razorpay_deposit(
        amount=req.amount,
        account_target=req.account_target,
        user_id=current_user["user_id"],
        db=db,
    )
    await store_response(
        request, scope="deposit_razorpay_order",
        user_id=current_user["user_id"], response_json=result,
        status_code=201, db=db,
    )
    return result


@router.post("/deposit/razorpay/verify")
async def verify_razorpay_deposit(
    req: RazorpayVerifyRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify the Razorpay Checkout signature and idempotently credit the
    deposit. Safe to race with the webhook — whichever lands first credits
    once, the other is a no-op."""
    return await wallet_service.verify_and_credit_razorpay(
        razorpay_order_id=req.razorpay_order_id,
        razorpay_payment_id=req.razorpay_payment_id,
        razorpay_signature=req.razorpay_signature,
        user_id=current_user["user_id"],
        db=db,
    )


# ─── Decentralized USDT deposit flow ──────────────────────────────────────
# User picks a chain, signs a transfer in their own wallet, submits the
# tx hash. The chain_verifier_engine confirms on-chain and credits.


@router.post("/deposit/onchain", status_code=201)
async def create_onchain_deposit(
    req: OnchainDepositRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Open a wallet-connect deposit. Returns the admin deposit address
    for the picked chain plus everything the trader UI needs to invoke
    MetaMask / TronLink: token contract, chain id, base-units amount,
    expiry. The user's wallet does the actual transfer."""
    return await onchain_deposit_service.create_onchain_deposit(
        user_id=current_user["user_id"],
        network=req.network,
        amount=req.amount,
        db=db,
        target=req.target,
    )


@router.post("/deposit/{deposit_id}/confirm-tx", status_code=202)
async def confirm_onchain_tx(
    deposit_id: UUID,
    req: TxHashSaveRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Record the on-chain tx hash for a wallet-connect deposit. The
    chain_verifier_engine will pick it up on its next tick and credit
    the user's main wallet once the transfer has enough confirmations."""
    return await onchain_deposit_service.confirm_tx_hash(
        deposit_id=deposit_id, tx_hash=req.tx_hash,
        user_id=current_user["user_id"], db=db,
    )


@router.get("/deposit/{deposit_id}/onchain-status")
async def get_onchain_deposit_status(
    deposit_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Polling endpoint the trader UI uses to tail the deposit's status
    from 'initiated' → 'submitted' → 'auto_approved' / 'rejected'."""
    return await onchain_deposit_service.get_status(
        deposit_id=deposit_id, user_id=current_user["user_id"], db=db,
    )


@router.post("/withdraw", status_code=201)
async def create_withdrawal(
    req: WithdrawalRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await wallet_service.create_withdrawal(
        req=req, user_id=current_user["user_id"], db=db,
    )


# ─── Decentralized USDT withdraw flow (mirror of /deposit/onchain) ─────────


@router.post("/withdraw/onchain", status_code=201)
async def create_onchain_withdrawal(
    req: OnchainWithdrawRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """User initiates a wallet-connect withdrawal: pick chain + paste their
    own destination address. We freeze the user's main wallet balance,
    queue the row for admin review. Admin signs the on-chain payout and
    pastes the tx hash; the chain_verifier_engine confirms and flips the
    row to 'paid'."""
    return await onchain_withdraw_service.create_onchain_withdrawal(
        user_id=current_user["user_id"],
        network=req.network,
        amount=req.amount,
        destination_address=req.destination_address,
        db=db,
        source=req.source,
    )


@router.get("/withdraw/{withdrawal_id}/onchain-status")
async def get_onchain_withdrawal_status(
    withdrawal_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Polling endpoint for the trader UI: pending → approved → sent → paid
    (or rejected with reason)."""
    return await onchain_withdraw_service.get_status(
        withdrawal_id=withdrawal_id, user_id=current_user["user_id"], db=db,
    )


@router.post("/transfer-internal", status_code=200)
async def internal_wallet_transfer(
    req: InternalWalletTransferRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Move funds between the user's own live trading accounts (available balance only)."""
    return await wallet_service.internal_wallet_transfer(
        req=req, user_id=current_user["user_id"], db=db,
    )


@router.post("/transfer-trading-to-main", status_code=200)
async def transfer_trading_to_main(
    req: TransferTradingToMainRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Move available balance from a live trading account into the user's main wallet."""
    return await wallet_service.transfer_trading_to_main(
        req=req, user_id=current_user["user_id"], db=db,
    )


@router.post("/transfer-main-to-trading", status_code=200)
async def transfer_main_to_trading(
    req: TransferMainToTradingRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fund a live trading account from the main wallet."""
    return await wallet_service.transfer_main_to_trading(
        req=req, user_id=current_user["user_id"], db=db,
    )


@router.get("/deposits")
async def list_deposits(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await wallet_service.list_deposits(
        user_id=current_user["user_id"], db=db,
    )


@router.get("/withdrawals")
async def list_withdrawals(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await wallet_service.list_withdrawals(
        user_id=current_user["user_id"], db=db,
    )


@router.get("/transactions")
async def list_transactions(
    account_id: UUID | None = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await wallet_service.list_transactions(
        user_id=current_user["user_id"], account_id=account_id, db=db,
    )


@router.get("/summary")
async def wallet_summary(
    account_id: UUID | None = Query(
        None,
        description="Scope trading balance/equity to one live account. Main wallet + deposit/withdraw totals are always user-wide.",
    ),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Main wallet holds funds for external deposit/withdraw; live trading accounts hold trading balance."""
    return await wallet_service.wallet_summary(
        user_id=current_user["user_id"], account_id=account_id, db=db,
    )


