'use client';

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import DashboardShell from '@/components/layout/DashboardShell';
import DemoLockGate from '@/components/demo/DemoLockGate';
import { formatCurrency } from '@/lib/formatters';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api/client';
// Wallet-integration components removed in the wallet-purge — they
// depended on RainbowKit / wagmi / viem which are no longer installed.
// If a crypto-deposit flow comes back, build a NOWPayments-only
// hosted-invoice modal (calls POST /wallet/deposit/hosted-invoice and
// redirects to the returned payment_url) — no client-side signing
// needed.
import {
  Wallet as WalletIcon,
  CreditCard,
  ArrowUpFromLine,
  ArrowLeftRight,
  History as HistoryIcon,
  ChevronDown,
  Ticket,
  RefreshCcw,
  CheckCircle2,
  Hourglass,
} from 'lucide-react';

interface AccountItem {
  id: string;
  account_number?: string;
  currency?: string;
  is_demo?: boolean;
  is_active?: boolean;
  is_wallet_account?: boolean;
  balance?: number;
  account_group?: {
    id?: string;
    name?: string;
    minimum_deposit?: number;
  } | null;
}

interface LiveAccountRow {
  id: string;
  account_number: string;
  balance: number;
  credit?: number;
  margin_used?: number;
  currency?: string;
  free_margin?: number;
  is_wallet_account?: boolean;
  account_group?: {
    id?: string;
    name?: string;
    minimum_deposit?: number;
  } | null;
}

interface WalletData {
  balance: number;
  currency: string;
  main_wallet_balance: number;
  bonus_balance: number;
  total_deposited: number;
  total_withdrawn: number;
  pending_withdrawals: number;
  total_live_balance?: number;
  /** When the user has migrated to the wallet-bound model, the
   *  primary spendable balance lives on this trading account instead
   *  of main_wallet_balance. */
  wallet_account?: {
    id: string;
    account_number: string;
    balance: number;
  } | null;
}

interface WalletSummaryResponse {
  balance?: number;
  credit?: number;
  equity?: number;
  main_wallet_balance?: number;
  total_deposited?: number;
  total_withdrawn?: number;
  total_live_balance?: number;
  live_accounts?: LiveAccountRow[];
}

interface WalletListItem {
  id: string;
  created_at: string | null;
  type: string;
  method: string;
  amount: number;
  status: string;
  currency: string;
}

const DEMO_FUNDING_MSG =
  'Demo accounts cannot deposit, withdraw, or transfer funds. Open a live account to use wallet funding.';

// Provider used for new deposits. NOWPayments replaced OxaPay in this build;
// the OxaPay backend code stays mounted so historical / in-flight OxaPay
// deposits still settle, but new deposits are always created against
// NOWPayments. Withdrawals still echo the OxaPay-style payout payload.
const CRYPTO_DEPOSIT_METHOD = 'nowpayments';

/** UI grid — selection is sent with NOWPayments / payout details for finance matching. */
const CRYPTO_ASSETS = [
  { id: 'USDT_BSC', label: 'USDT', sub: 'BEP20' },
  { id: 'USDT_ERC', label: 'USDT', sub: 'ERC20' },
  { id: 'USDT_TRC', label: 'USDT', sub: 'TRC20' },
  { id: 'BTC', label: 'BTC', sub: 'Bitcoin' },
  { id: 'ETH', label: 'ETH', sub: 'Ethereum' },
  { id: 'USDC_ERC', label: 'USDC', sub: 'ERC20' },
  { id: 'TRX', label: 'TRX', sub: 'Tron' },
  { id: 'USDC_TRC', label: 'USDC', sub: 'TRC20' },
  { id: 'USDT_SOL', label: 'USDT', sub: 'SOL' },
  { id: 'USDC_SOL', label: 'USDC', sub: 'SOL' },
  { id: 'SOL', label: 'SOL', sub: 'Solana' },
  { id: 'XRP', label: 'XRP', sub: 'XRP' },
] as const;

// Networks the on-chain USDT payout supports (admin signs the transfer
// manually). Must mirror `ALLOWED_NETWORKS` in onchain_withdraw_service.py.
const WITHDRAW_NETWORK_OPTIONS = [
  {
    network: 'tron' as const,
    label: 'USDT TRC20',
    sub: 'Tron network',
    addressHint: 'Address starts with T (e.g. TXYZ…)',
    addressRegex: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
  },
  {
    network: 'bsc' as const,
    label: 'USDT BEP20',
    sub: 'BNB Smart Chain',
    addressHint: 'EVM address — 0x followed by 40 hex characters',
    addressRegex: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    network: 'eth' as const,
    label: 'USDT ERC20',
    sub: 'Ethereum',
    addressHint: 'EVM address — 0x followed by 40 hex characters',
    addressRegex: /^0x[a-fA-F0-9]{40}$/,
  },
];

// 'crypto' = automated provider flow (NOWPayments for deposits, OxaPay-style
// payout details for withdrawals). 'manual' = legacy bank/UPI manual path.
type FundingChannel = 'crypto' | 'manual';

interface ManualBankDetailsResponse {
  bank_name?: string;
  account_holder?: string;
  account_number?: string;
  ifsc_code?: string;
  upi_id?: string;
  qr_code_url?: string;
}

type FundsTab = 'deposit' | 'withdrawal' | 'transfer' | 'history';

/** Synthetic id used inside the transfer source/destination pickers to
 *  represent the user's main wallet bucket (which is not an account row). */
const MAIN_WALLET_OPTION_ID = '__MAIN_WALLET__';

function WalletPageContent() {
  const isDemo = useAuthStore((s) => s.user?.is_demo);
  // Wallet-integration purged: the SIWE link flow that populated this
  // field is gone, so `user.wallet_address` is always undefined now.
  const linkedWalletAddress = useAuthStore((s) => s.user?.wallet_address || '');
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountFromUrl = searchParams.get('account');
  const withdrawDeepLinkHandled = useRef(false);

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [liveAccounts, setLiveAccounts] = useState<LiveAccountRow[]>([]);
  /** True when user has accounts but none are live (all demo). */
  const [demoFundingBlocked, setDemoFundingBlocked] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadGen = useRef(0);

  /** Top-level Vantage-style tab bar. */
  const [tab, setTab] = useState<FundsTab>('deposit');

  // Internal "fund target" preference — kept for backwards-compat with the
  // submit handlers (they branch on this for wallet-bound users).
  const [fundTargetPreference, setFundTargetPreference] = useState<'main' | 'wallet'>('main');

  // Channel chips ("Crypto" / "Bank/UPI") sit just below the voucher on
  // the Deposit and Withdrawal forms — kept inline (instead of moved into a
  // follow-up modal) so we don't have to surgically rewrite the submit
  // handlers' channel branching.
  const [depositUiSection, setDepositUiSection] = useState<'crypto' | 'manual'>('crypto');
  const [withdrawUiSection, setWithdrawUiSection] = useState<'crypto' | 'bank'>('crypto');
  const [selectedCryptoDeposit, setSelectedCryptoDeposit] = useState<string>(CRYPTO_ASSETS[0].id);

  const [depositChannel, setDepositChannel] = useState<FundingChannel>('crypto');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAccountId, setDepositAccountId] = useState<string | null>(null);
  const [depositTxId, setDepositTxId] = useState('');
  const [depositProofFile, setDepositProofFile] = useState<File | null>(null);
  const [manualBankInfo, setManualBankInfo] = useState<ManualBankDetailsResponse | null>(null);
  const [depositSubmitting, setDepositSubmitting] = useState(false);

  const [withdrawChannel, setWithdrawChannel] = useState<FundingChannel>('crypto');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAccountId, setWithdrawAccountId] = useState<string | null>(null);
  const [withdrawNetwork, setWithdrawNetwork] = useState<'tron' | 'bsc' | 'eth'>('tron');
  const [withdrawCryptoAddress, setWithdrawCryptoAddress] = useState('');
  const [manualWithdrawUpi, setManualWithdrawUpi] = useState('');
  const [manualWithdrawNotes, setManualWithdrawNotes] = useState('');
  const [manualWithdrawQrFile, setManualWithdrawQrFile] = useState<File | null>(null);
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);

  // Transfer-between-accounts form (replaces the old card-level "balanceTransfer"
  // modal). Source / destination can be the synthetic main wallet (id =
  // MAIN_WALLET_OPTION_ID) or a real trading-account id.
  const [transferSourceId, setTransferSourceId] = useState<string>('');
  const [transferDestinationId, setTransferDestinationId] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferSubmitting, setTransferSubmitting] = useState(false);

  // History tab — recent ledger items rendered as a compact table.
  const [historyItems, setHistoryItems] = useState<WalletListItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      const id = ++loadGen.current;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setLoadError(null);

      try {
        const [summaryRes, wdRes, accountsRes] = await Promise.allSettled([
          api.get<WalletSummaryResponse>('/wallet/summary'),
          api.get<{ items?: WalletListItem[] }>('/wallet/withdrawals'),
          api.get<{ items?: AccountItem[] }>('/accounts'),
        ]);

        if (id !== loadGen.current) return;

        let currency = 'USD';
        let balance = 0;
        let mainWalletBalance = 0;
        let bonusBalance = 0;
        let totalDeposited = 0;
        let totalWithdrawn = 0;
        let totalLiveBalance: number | undefined;

        if (summaryRes.status === 'fulfilled' && summaryRes.value) {
          const s = summaryRes.value as WalletSummaryResponse & { bonus_balance?: number };
          const live = s.live_accounts || [];
          setLiveAccounts(live);
          mainWalletBalance = Number(s.main_wallet_balance) || 0;
          bonusBalance = Number(s.bonus_balance) || 0;
          totalDeposited = Number(s.total_deposited) || 0;
          totalWithdrawn = Number(s.total_withdrawn) || 0;
          totalLiveBalance =
            typeof s.total_live_balance === 'number' ? s.total_live_balance : undefined;

          let targetId = selectedAccountId;
          if (!targetId || !live.some((a) => a.id === targetId)) {
            targetId =
              accountFromUrl && live.some((a) => a.id === accountFromUrl)
                ? accountFromUrl
                : live[0]?.id ?? null;
          }
          setSelectedAccountId(targetId);

          const sel = live.find((a) => a.id === targetId);
          balance = sel ? Number(sel.balance) || 0 : Number(s.balance) || 0;
          if (sel?.currency) currency = sel.currency;
        } else if (accountsRes.status === 'fulfilled') {
          const items = accountsRes.value?.items || [];
          const live = items.find((a) => a.is_demo === false) || items[0];
          if (live && typeof live.balance === 'number') balance = live.balance;
          if (summaryRes.status === 'rejected') {
            setLoadError('Wallet summary unavailable — balance from account only.');
            toast.error('Could not load wallet summary (totals may be incomplete).');
          }
        } else {
          const msg =
            summaryRes.status === 'rejected' && summaryRes.reason instanceof Error
              ? summaryRes.reason.message
              : 'Failed to load wallet';
          setLoadError(msg);
          toast.error(msg);
        }

        const wdItems =
          wdRes.status === 'fulfilled' ? wdRes.value?.items || [] : [];

        setDemoFundingBlocked(false);

        if (wdRes.status === 'rejected') {
          toast.error('Could not load pending withdrawal count.');
        }

        const pendingWd = wdItems.filter(
          (w) => (w.status || '').toLowerCase() === 'pending',
        ).length;

        const accountItems =
          accountsRes.status === 'fulfilled' ? accountsRes.value?.items || [] : [];
        const walletAcc = accountItems.find(
          (a) => Boolean(a.is_wallet_account) && a.is_active !== false,
        );
        const walletAccount = walletAcc
          ? {
              id: walletAcc.id,
              account_number: walletAcc.account_number || '',
              balance: Number(walletAcc.balance) || 0,
            }
          : null;

        setWallet({
          balance,
          currency,
          main_wallet_balance: mainWalletBalance,
          bonus_balance: bonusBalance,
          total_deposited: totalDeposited,
          total_withdrawn: totalWithdrawn,
          pending_withdrawals: pendingWd,
          total_live_balance: totalLiveBalance,
          wallet_account: walletAccount,
        });
      } catch (err) {
        if (id !== loadGen.current) return;
        const message = err instanceof Error ? err.message : 'Failed to load wallet';
        setLoadError(message);
        toast.error(message);
        setDemoFundingBlocked(false);
        setWallet({
          balance: 0,
          currency: 'USD',
          main_wallet_balance: 0,
          bonus_balance: 0,
          total_deposited: 0,
          total_withdrawn: 0,
          pending_withdrawals: 0,
        });
      } finally {
        if (id === loadGen.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [selectedAccountId, accountFromUrl],
  );

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const fmt = useCallback(
    (n: number) => formatCurrency(n, wallet?.currency || 'USD'),
    [wallet?.currency],
  );

  // Channel-chip state mirrors the legacy depositUiSection / withdrawUiSection
  // so the existing submit handlers (which branch on depositChannel /
  // withdrawChannel) keep working unchanged.
  useEffect(() => {
    setDepositChannel(depositUiSection === 'manual' ? 'manual' : 'crypto');
  }, [depositUiSection]);

  useEffect(() => {
    setWithdrawChannel(withdrawUiSection === 'crypto' ? 'crypto' : 'manual');
  }, [withdrawUiSection]);

  // Default the deposit / withdrawal account picker to the first live row
  // (or the wallet-bound account if migrated) once accounts are loaded.
  useEffect(() => {
    if (liveAccounts.length === 0) return;
    const defaultId = wallet?.wallet_account?.id ?? liveAccounts[0]?.id ?? null;
    setDepositAccountId((cur) => cur && liveAccounts.some((a) => a.id === cur) ? cur : defaultId);
    setWithdrawAccountId((cur) => cur && liveAccounts.some((a) => a.id === cur) ? cur : defaultId);
  }, [liveAccounts, wallet?.wallet_account?.id]);

  // Default transfer pickers: source = main wallet (or wallet account if
  // migrated), destination = first non-source trading account.
  useEffect(() => {
    if (liveAccounts.length === 0) return;
    setTransferSourceId((cur) => {
      if (cur) return cur;
      return wallet?.wallet_account?.id ?? MAIN_WALLET_OPTION_ID;
    });
    setTransferDestinationId((cur) => {
      if (cur) return cur;
      const first = liveAccounts.find((a) => a.id !== wallet?.wallet_account?.id);
      return first?.id ?? '';
    });
  }, [liveAccounts, wallet?.wallet_account?.id]);

  // Sync fundTargetPreference from the picked deposit/withdraw account so
  // the legacy submit handlers continue to tag the request correctly.
  useEffect(() => {
    if (!wallet?.wallet_account) return;
    if (tab === 'deposit') {
      setFundTargetPreference(depositAccountId === wallet.wallet_account.id ? 'wallet' : 'main');
    } else if (tab === 'withdrawal') {
      setFundTargetPreference(withdrawAccountId === wallet.wallet_account.id ? 'wallet' : 'main');
    }
  }, [tab, depositAccountId, withdrawAccountId, wallet?.wallet_account]);

  const loadManualBankDetails = useCallback(async () => {
    try {
      const amt = parseFloat(depositAmount);
      const body =
        !Number.isNaN(amt) && amt > 0 ? { amount: amt } : {};
      const d = await api.post<ManualBankDetailsResponse>('/wallet/deposit/bank-details', body);
      setManualBankInfo(d && Object.keys(d).length > 0 ? d : null);
    } catch {
      setManualBankInfo(null);
    }
  }, [depositAmount]);

  // Preload manual bank details whenever the user is on the manual deposit
  // chip so the destination bank/UPI is visible immediately.
  useEffect(() => {
    if (tab !== 'deposit' || depositUiSection !== 'manual') return;
    void loadManualBankDetails();
  }, [tab, depositUiSection, loadManualBankDetails]);

  /** Open withdraw via ?action=withdraw deep link. */
  useEffect(() => {
    if (loading || withdrawDeepLinkHandled.current) return;
    const act = searchParams.get('action');
    if (!act) return;
    if (act.toLowerCase() === 'withdraw') {
      if (demoFundingBlocked) {
        withdrawDeepLinkHandled.current = true;
        toast.error(DEMO_FUNDING_MSG);
        const next = new URLSearchParams(searchParams.toString());
        next.delete('action');
        const qs = next.toString();
        router.replace(qs ? `/wallet?${qs}` : '/wallet', { scroll: false });
        return;
      }
      withdrawDeepLinkHandled.current = true;
      setTab('withdrawal');
      setWithdrawUiSection('crypto');
      setWithdrawAmount('');
      setWithdrawCryptoAddress('');
      setManualWithdrawUpi('');
      setManualWithdrawNotes('');
      setManualWithdrawQrFile(null);
    } else if (act.toLowerCase() === 'deposit') {
      withdrawDeepLinkHandled.current = true;
      setTab('deposit');
    }
    const next = new URLSearchParams(searchParams.toString());
    next.delete('action');
    const qs = next.toString();
    router.replace(qs ? `/wallet?${qs}` : '/wallet', { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once when deep-linked
  }, [loading, searchParams, router, demoFundingBlocked]);

  /** Open a specific tab via ?tab=history|transfer|withdrawal|deposit.
   *  Used by the consolidated transaction history (/transactions now
   *  redirects here with ?tab=history) and the account-card "Transfer
   *  funds" action (?tab=transfer). */
  const tabDeepLinkHandled = useRef(false);
  useEffect(() => {
    if (tabDeepLinkHandled.current) return;
    const t = searchParams.get('tab');
    if (!t) return;
    const valid: FundsTab[] = ['deposit', 'withdrawal', 'transfer', 'history'];
    if ((valid as string[]).includes(t)) {
      tabDeepLinkHandled.current = true;
      setTab(t as FundsTab);
    }
  }, [searchParams]);

  // Lazy-load history items when the user lands on the History tab.
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const [dep, wd] = await Promise.allSettled([
        api.get<{ items?: WalletListItem[] }>('/wallet/deposits'),
        api.get<{ items?: WalletListItem[] }>('/wallet/withdrawals'),
      ]);
      const depItems = dep.status === 'fulfilled' ? dep.value?.items || [] : [];
      const wdItems = wd.status === 'fulfilled' ? wd.value?.items || [] : [];
      const merged = [...depItems, ...wdItems].sort((a, b) => {
        const ad = a.created_at ? Date.parse(a.created_at) : 0;
        const bd = b.created_at ? Date.parse(b.created_at) : 0;
        return bd - ad;
      });
      setHistoryItems(merged);
    } catch {
      setHistoryItems([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab !== 'history') return;
    void loadHistory();
  }, [tab, loadHistory]);

  const submitWithdraw = async () => {
    if (demoFundingBlocked) {
      toast.error(DEMO_FUNDING_MSG);
      return;
    }
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (withdrawChannel === 'crypto') {
      const opt = WITHDRAW_NETWORK_OPTIONS.find((o) => o.network === withdrawNetwork)
        ?? WITHDRAW_NETWORK_OPTIONS[0]!;
      const addr = withdrawCryptoAddress.trim();
      if (!addr) {
        toast.error('Enter your USDT wallet address');
        return;
      }
      if (!opt.addressRegex.test(addr)) {
        toast.error(`Invalid ${opt.label} address. ${opt.addressHint}`);
        return;
      }
      setWithdrawSubmitting(true);
      try {
        await api.post('/wallet/withdraw/onchain', {
          network: opt.network,
          amount: amt,
          destination_address: addr,
          source: wallet?.wallet_account ? fundTargetPreference : undefined,
        });
        toast.success(`Withdrawal of $${amt.toLocaleString()} submitted — pending approval`);
        setWithdrawCryptoAddress('');
        void fetchData(true);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Withdrawal failed');
      } finally {
        setWithdrawSubmitting(false);
      }
      return;
    }

    const upi = manualWithdrawUpi.trim();
    if (!upi && !manualWithdrawQrFile) {
      toast.error('Enter your UPI ID and/or upload a QR code for manual payout');
      return;
    }
    setWithdrawSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('amount', String(amt));
      fd.append('upi_id', upi);
      fd.append('payout_notes', manualWithdrawNotes.trim());
      if (manualWithdrawQrFile) fd.append('file', manualWithdrawQrFile);
      if (wallet?.wallet_account) fd.append('source', fundTargetPreference);
      const token = api.getToken();
      const res = await fetch('/api/v1/wallet/withdraw/manual/', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const raw = await res.text();
      let json: { detail?: unknown; message?: string } = {};
      try {
        json = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(raw.slice(0, 200) || `Request failed (${res.status})`);
      }
      if (!res.ok) {
        const d = json.detail;
        const msg =
          typeof d === 'string'
            ? d
            : Array.isArray(d)
              ? d.map((x: { msg?: string }) => x.msg).join(', ')
              : 'Withdrawal failed';
        throw new Error(msg);
      }
      toast.success(`Manual withdrawal of $${amt.toLocaleString()} submitted — pending approval`);
      void fetchData(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  const submitDeposit = async () => {
    if (demoFundingBlocked) {
      toast.error(DEMO_FUNDING_MSG);
      return;
    }
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (depositChannel === 'crypto') {
      // Crypto deposit flow temporarily unavailable — the wallet-
      // connect modal it called was removed in the wallet-integration
      // purge. Rebuild as a NOWPayments-hosted-invoice modal when
      // crypto deposits come back.
      void amt;
      void selectedCryptoDeposit;
      void CRYPTO_DEPOSIT_METHOD;
      toast.error('Crypto deposits are temporarily unavailable. Please use bank / UPI.');
      return;
    }

    if (!depositTxId.trim()) {
      toast.error('Enter your bank / UPI transaction or reference ID');
      return;
    }
    if (!depositProofFile) {
      toast.error('Upload a screenshot of your payment');
      return;
    }
    setDepositSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('amount', String(amt));
      fd.append('transaction_id', depositTxId.trim());
      fd.append('file', depositProofFile);
      if (wallet?.wallet_account) fd.append('target', fundTargetPreference);
      const token = api.getToken();
      const res = await fetch('/api/v1/wallet/deposit/manual', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
        credentials: 'include',
      });
      const raw = await res.text();
      let json: { detail?: unknown; message?: string } = {};
      try {
        json = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(raw.slice(0, 200) || `Request failed (${res.status})`);
      }
      if (!res.ok) {
        const d = json.detail;
        const msg =
          typeof d === 'string'
            ? d
            : Array.isArray(d)
              ? d.map((x: { msg?: string }) => x.msg).join(', ')
              : 'Deposit failed';
        throw new Error(msg);
      }
      toast.success(`Manual deposit of $${amt.toLocaleString()} submitted — pending approval`);
      void fetchData(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setDepositSubmitting(false);
    }
  };

  /**
   * Submit a transfer between two accounts. The backend only exposes
   * main↔trading transfers, so this resolves the picked source/destination
   * pair into one of those two endpoints. trading↔trading transfers aren't
   * supported on the backend yet — surfaced as an inline toast.
   */
  const submitTransfer = async () => {
    if (demoFundingBlocked) {
      toast.error(DEMO_FUNDING_MSG);
      return;
    }
    if (!transferSourceId || !transferDestinationId) {
      toast.error('Pick a source and destination account');
      return;
    }
    if (transferSourceId === transferDestinationId) {
      toast.error('Source and destination must be different');
      return;
    }
    const amt = parseFloat(transferAmount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    const srcIsMain = transferSourceId === MAIN_WALLET_OPTION_ID;
    const destIsMain = transferDestinationId === MAIN_WALLET_OPTION_ID;

    if (!srcIsMain && !destIsMain) {
      toast.error('Transfers between two trading accounts are not yet supported — route via main wallet.');
      return;
    }

    setTransferSubmitting(true);
    try {
      if (srcIsMain) {
        await api.post('/wallet/transfer-main-to-trading', {
          to_account_id: transferDestinationId,
          amount: amt,
        });
        const num = liveAccounts.find((a) => a.id === transferDestinationId)?.account_number ?? '';
        toast.success(`$${amt.toLocaleString()} sent to ${num || 'trading account'}`);
      } else {
        await api.post('/wallet/transfer-trading-to-main', {
          from_account_id: transferSourceId,
          amount: amt,
        });
        toast.success(`$${amt.toLocaleString()} moved to main wallet`);
      }
      setTransferAmount('');
      void fetchData(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Transfer failed');
    } finally {
      setTransferSubmitting(false);
    }
  };

  // Validation flags ------------------------------------------------------

  const depositAccount = useMemo(
    () => liveAccounts.find((a) => a.id === depositAccountId) ?? null,
    [liveAccounts, depositAccountId],
  );
  const depositMinDeposit = Number(depositAccount?.account_group?.minimum_deposit ?? 0);
  const depositAmountNumber = parseFloat(depositAmount);
  const depositAmountValid =
    !Number.isNaN(depositAmountNumber) &&
    depositAmountNumber > 0 &&
    (depositMinDeposit <= 0 || depositAmountNumber >= depositMinDeposit);
  const depositCanContinue =
    !demoFundingBlocked &&
    !depositSubmitting &&
    !!depositAccountId &&
    depositAmountValid;

  const withdrawAmountNumber = parseFloat(withdrawAmount);
  const withdrawAmountValid = !Number.isNaN(withdrawAmountNumber) && withdrawAmountNumber > 0;
  const withdrawAddrTrimmed = withdrawCryptoAddress.trim();
  const withdrawActiveNetwork =
    WITHDRAW_NETWORK_OPTIONS.find((o) => o.network === withdrawNetwork)
    ?? WITHDRAW_NETWORK_OPTIONS[0]!;
  const withdrawAddrValid =
    withdrawChannel !== 'crypto'
      ? true
      : withdrawAddrTrimmed.length > 0 && withdrawActiveNetwork.addressRegex.test(withdrawAddrTrimmed);
  const withdrawCanContinue =
    !demoFundingBlocked &&
    !withdrawSubmitting &&
    !!withdrawAccountId &&
    withdrawAmountValid &&
    withdrawAddrValid;

  const transferAmountNumber = parseFloat(transferAmount);
  const transferAmountValid = !Number.isNaN(transferAmountNumber) && transferAmountNumber > 0;
  const transferCanContinue =
    !demoFundingBlocked &&
    !transferSubmitting &&
    !!transferSourceId &&
    !!transferDestinationId &&
    transferSourceId !== transferDestinationId &&
    transferAmountValid;

  if (loading) {
    return (
      <DashboardShell mainClassName="flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="w-8 h-8 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#6B7280]">Loading wallet...</span>
        </div>
      </DashboardShell>
    );
  }

  if (isDemo) {
    return (
      <DashboardShell>
        <DemoLockGate
          feature="Deposits & Withdrawals"
          description="Funding is only available on real trading accounts. Register a live account to deposit, withdraw and transfer funds."
        >
          <></>
        </DemoLockGate>
      </DashboardShell>
    );
  }

  // ── Render -----------------------------------------------------------

  /** Top tab bar (underline style). */
  const renderTabBar = () => {
    const tabs: { id: FundsTab; label: string }[] = [
      { id: 'deposit', label: 'Deposit' },
      { id: 'withdrawal', label: 'Withdrawal' },
      { id: 'transfer', label: 'Transfer Between Accounts' },
      { id: 'history', label: 'Transaction History' },
    ];
    return (
      <div className="border-b border-[#E5E5E5]">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={clsx(
                  'relative -mb-px py-3 text-sm transition-colors whitespace-nowrap',
                  active
                    ? 'font-bold text-[#0A0A0A]'
                    : 'font-medium text-[#6B7280] hover:text-[#0A0A0A]',
                )}
              >
                {t.label}
                {active && (
                  <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#0A0A0A] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // -----------------------------------------------------------------
  // Tab bodies
  // -----------------------------------------------------------------

  const accountOptionsForFunding = liveAccounts.map((a) => ({
    id: a.id,
    label: `${a.account_group?.name || 'Standard'} · ${a.account_number || a.id.slice(0, 8)}`,
    sublabel: formatCurrency(Number(a.balance) || 0, a.currency || wallet?.currency || 'USD'),
  }));

  /** Voucher field — disabled placeholder. Backend rebate flow isn't
   *  surfaced to the trader UI yet, so this just renders a non-interactive
   *  shell to preserve the Vantage layout. */
  const renderVoucherField = () => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[#0A0A0A]">Voucher</label>
      <div
        className="flex items-center gap-2.5 w-full rounded-xl bg-[#F5F5F5] px-4 py-3.5 text-sm text-[#9CA3AF] cursor-not-allowed select-none"
        aria-disabled="true"
      >
        <Ticket className="w-4 h-4 shrink-0" />
        <span className="flex-1 truncate">No vouchers available</span>
        <ChevronDown className="w-4 h-4 shrink-0" />
      </div>
      <p className="text-xs text-[#6B7280] leading-relaxed">
        *Deposit rebate will be added to your account within 24 hours once deposit success.
      </p>
    </div>
  );

  const renderDepositTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      {/* LEFT — form */}
      <div className="lg:col-span-2 space-y-5">
        {/* Account */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#0A0A0A]">Account</label>
          <FundsDropdown
            value={depositAccountId}
            options={accountOptionsForFunding}
            placeholder="Select an account"
            onChange={(id) => {
              setDepositAccountId(id);
              setDepositAmount('');
            }}
            disabled={accountOptionsForFunding.length === 0}
          />
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#0A0A0A]">Amount</label>
          <input
            type="number"
            inputMode="decimal"
            min={depositMinDeposit > 0 ? depositMinDeposit : 0}
            step="0.01"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Enter an amount"
            className={clsx(
              'w-full rounded-xl bg-[#F5F5F5] px-4 py-3.5 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] outline-none transition-shadow',
              'focus:ring-2 focus:ring-[#E94E1B]/40',
            )}
          />
          {depositAmount && !depositAmountValid && depositMinDeposit > 0 && (
            <p className="text-xs text-red-600">
              Minimum deposit for this account is {formatCurrency(depositMinDeposit, depositAccount?.currency || wallet?.currency || 'USD')}.
            </p>
          )}
          {depositMinDeposit > 0 && depositAmountValid && (
            <p className="text-xs text-[#6B7280]">
              Minimum deposit: {formatCurrency(depositMinDeposit, depositAccount?.currency || wallet?.currency || 'USD')}
            </p>
          )}
        </div>

        {/* Voucher (placeholder) */}
        {renderVoucherField()}

        {/* Payment method chips — kept inline so legacy depositChannel
            branching keeps working without a follow-up modal. */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#0A0A0A]">Payment method</label>
          <div className="flex gap-2">
            {(
              [
                { id: 'crypto' as const, label: 'Crypto', sub: 'USDT / BTC / ETH' },
                { id: 'manual' as const, label: 'Bank / UPI', sub: 'Manual transfer' },
              ]
            ).map((c) => {
              const active = depositUiSection === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setDepositUiSection(c.id)}
                  className={clsx(
                    'flex-1 rounded-xl border px-4 py-3 text-left transition-colors',
                    active
                      ? 'border-[#0A0A0A] bg-white'
                      : 'border-transparent bg-[#F5F5F5] hover:border-[#E5E5E5]',
                  )}
                >
                  <div className={clsx('text-sm font-semibold', active ? 'text-[#0A0A0A]' : 'text-[#0A0A0A]')}>
                    {c.label}
                  </div>
                  <div className="text-xs text-[#6B7280] mt-0.5">{c.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Channel-specific extras ------------------------------ */}
        {depositUiSection === 'crypto' ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#0A0A0A]">Network</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'USDT_BSC', label: 'USDT BEP-20' },
                { id: 'USDT_ERC', label: 'USDT ERC-20' },
                { id: 'USDT_TRC', label: 'USDT TRC-20' },
              ].map((n) => {
                const active = selectedCryptoDeposit === n.id;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setSelectedCryptoDeposit(n.id)}
                    className={clsx(
                      'rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors',
                      active
                        ? 'border-[#0A0A0A] bg-white text-[#0A0A0A]'
                        : 'border-transparent bg-[#F5F5F5] text-[#6B7280] hover:border-[#E5E5E5]',
                    )}
                  >
                    {n.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0A0A0A]">Transaction / Reference ID</label>
              <input
                type="text"
                value={depositTxId}
                onChange={(e) => setDepositTxId(e.target.value)}
                placeholder="UPI ref or bank transfer ID"
                className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3.5 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#E94E1B]/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0A0A0A]">Payment proof</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setDepositProofFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3 text-sm text-[#0A0A0A] file:mr-3 file:rounded-lg file:border-0 file:bg-[#0A0A0A] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
              {manualBankInfo && (manualBankInfo.bank_name || manualBankInfo.upi_id) && (
                <div className="mt-2 rounded-xl bg-[#F5F5F5] px-4 py-3 text-xs text-[#6B7280] space-y-1">
                  {manualBankInfo.bank_name && (
                    <div>
                      <span className="text-[#0A0A0A] font-semibold">Bank:</span> {manualBankInfo.bank_name}
                    </div>
                  )}
                  {manualBankInfo.account_holder && (
                    <div>
                      <span className="text-[#0A0A0A] font-semibold">Holder:</span> {manualBankInfo.account_holder}
                    </div>
                  )}
                  {manualBankInfo.account_number && (
                    <div>
                      <span className="text-[#0A0A0A] font-semibold">A/C:</span> {manualBankInfo.account_number}
                    </div>
                  )}
                  {manualBankInfo.ifsc_code && (
                    <div>
                      <span className="text-[#0A0A0A] font-semibold">IFSC:</span> {manualBankInfo.ifsc_code}
                    </div>
                  )}
                  {manualBankInfo.upi_id && (
                    <div>
                      <span className="text-[#0A0A0A] font-semibold">UPI:</span> {manualBankInfo.upi_id}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Continue */}
        <ContinueButton
          disabled={!depositCanContinue}
          busy={depositSubmitting}
          onClick={() => void submitDeposit()}
          label="Continue"
        />
      </div>

      {/* RIGHT — stepper */}
      <Stepper
        steps={[
          {
            icon: <WalletIcon size={16} />,
            title: 'Deposit Funds',
            description:
              'Start by depositing the desired amount into your account to initiate the process.',
            state: 'current',
          },
          {
            icon: <CreditCard size={16} />,
            title: 'Select Deposit Method',
            description:
              'Choose the most convenient payment method from the available options for your deposit.',
            state: 'upcoming',
          },
        ]}
      />
    </div>
  );

  const renderWithdrawalTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      <div className="lg:col-span-2 space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#0A0A0A]">Account</label>
          <FundsDropdown
            value={withdrawAccountId}
            options={accountOptionsForFunding}
            placeholder="Select an account"
            onChange={(id) => {
              setWithdrawAccountId(id);
              setWithdrawAmount('');
            }}
            disabled={accountOptionsForFunding.length === 0}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#0A0A0A]">Amount</label>
            <button
              type="button"
              onClick={() => {
                const acc = liveAccounts.find((a) => a.id === withdrawAccountId);
                const bal = Number(acc?.balance ?? wallet?.main_wallet_balance ?? 0);
                setWithdrawAmount(String(Math.max(0, bal)));
              }}
              className="text-xs font-bold text-[#0A0A0A] hover:underline"
            >
              Max
            </button>
          </div>
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Enter an amount"
            className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3.5 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#E94E1B]/40"
          />
        </div>

        {/* Payment-method chips */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#0A0A0A]">Payout method</label>
          <div className="flex gap-2">
            {(
              [
                { id: 'crypto' as const, label: 'Crypto', sub: 'USDT on-chain' },
                { id: 'bank' as const, label: 'Bank / UPI', sub: 'Manual payout' },
              ]
            ).map((c) => {
              const active = withdrawUiSection === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setWithdrawUiSection(c.id)}
                  className={clsx(
                    'flex-1 rounded-xl border px-4 py-3 text-left transition-colors',
                    active
                      ? 'border-[#0A0A0A] bg-white'
                      : 'border-transparent bg-[#F5F5F5] hover:border-[#E5E5E5]',
                  )}
                >
                  <div className="text-sm font-semibold text-[#0A0A0A]">{c.label}</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">{c.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {withdrawUiSection === 'crypto' ? (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0A0A0A]">USDT Network</label>
              <div className="grid grid-cols-3 gap-2">
                {WITHDRAW_NETWORK_OPTIONS.map((opt) => {
                  const active = opt.network === withdrawNetwork;
                  return (
                    <button
                      key={opt.network}
                      type="button"
                      onClick={() => setWithdrawNetwork(opt.network)}
                      className={clsx(
                        'rounded-xl border px-3 py-2.5 text-left text-xs transition-colors',
                        active
                          ? 'border-[#0A0A0A] bg-white'
                          : 'border-transparent bg-[#F5F5F5] hover:border-[#E5E5E5]',
                      )}
                    >
                      <div className="font-semibold text-[#0A0A0A]">{opt.label}</div>
                      <div className="text-[11px] text-[#6B7280] mt-0.5">{opt.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-[#0A0A0A]">Your {withdrawActiveNetwork.label} address</label>
                {linkedWalletAddress && withdrawActiveNetwork.addressRegex.test(linkedWalletAddress) && (
                  <button
                    type="button"
                    onClick={() => setWithdrawCryptoAddress(linkedWalletAddress)}
                    className="text-xs font-bold text-[#0A0A0A] hover:underline"
                  >
                    Use linked wallet
                  </button>
                )}
              </div>
              <input
                type="text"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                value={withdrawCryptoAddress}
                onChange={(e) => setWithdrawCryptoAddress(e.target.value)}
                placeholder={withdrawActiveNetwork.addressHint}
                className={clsx(
                  'w-full rounded-xl bg-[#F5F5F5] px-4 py-3.5 text-sm font-mono text-[#0A0A0A] placeholder:text-[#9CA3AF] outline-none break-all',
                  withdrawAddrTrimmed && !withdrawAddrValid
                    ? 'ring-2 ring-red-500/60'
                    : 'focus:ring-2 focus:ring-[#E94E1B]/40',
                )}
              />
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {withdrawAddrTrimmed && !withdrawAddrValid
                  ? `That doesn't look like a valid ${withdrawActiveNetwork.label} address.`
                  : `Double-check the address — payouts on the wrong network can't be recovered. Processing time: up to 24h.`}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0A0A0A]">UPI ID</label>
              <input
                type="text"
                value={manualWithdrawUpi}
                onChange={(e) => setManualWithdrawUpi(e.target.value)}
                placeholder="yourname@upi"
                className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3.5 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#E94E1B]/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0A0A0A]">QR code (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setManualWithdrawQrFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3 text-sm text-[#0A0A0A] file:mr-3 file:rounded-lg file:border-0 file:bg-[#0A0A0A] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0A0A0A]">Notes (optional)</label>
              <input
                type="text"
                value={manualWithdrawNotes}
                onChange={(e) => setManualWithdrawNotes(e.target.value)}
                placeholder="Any context for finance"
                className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3.5 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#E94E1B]/40"
              />
            </div>
          </>
        )}

        <ContinueButton
          disabled={!withdrawCanContinue}
          busy={withdrawSubmitting}
          onClick={() => void submitWithdraw()}
          label={
            withdrawAmount
              ? `Continue — ${fmt(withdrawAmountNumber || 0)}`
              : 'Continue'
          }
        />
      </div>

      <Stepper
        steps={[
          {
            icon: <ArrowUpFromLine size={16} />,
            title: 'Withdrawal Request',
            description: 'Enter the amount and payout destination, then submit your request for review.',
            state: 'current',
          },
          {
            icon: <CheckCircle2 size={16} />,
            title: 'Funds Released',
            description: 'Finance approves the request and your funds are released to the chosen destination.',
            state: 'upcoming',
          },
        ]}
      />
    </div>
  );

  const renderTransferTab = () => {
    // Build the option list once — main wallet (or wallet account row, when
    // migrated) + every other live trading account.
    const sharedOptions = [
      ...(wallet?.wallet_account
        ? [] // wallet-bound users have their wallet listed as a normal row
        : [{
            id: MAIN_WALLET_OPTION_ID,
            label: 'Main Wallet',
            sublabel: formatCurrency(Number(wallet?.main_wallet_balance ?? 0), wallet?.currency || 'USD'),
          }]),
      ...liveAccounts.map((a) => ({
        id: a.id,
        label: `${a.account_group?.name || (a.is_wallet_account ? 'Wallet Account' : 'Standard')} · ${a.account_number || a.id.slice(0, 8)}`,
        sublabel: formatCurrency(Number(a.balance) || 0, a.currency || wallet?.currency || 'USD'),
      })),
    ];
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#0A0A0A]">From</label>
            <FundsDropdown
              value={transferSourceId}
              options={sharedOptions}
              placeholder="Select source account"
              onChange={setTransferSourceId}
              disabled={sharedOptions.length === 0}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#0A0A0A]">To</label>
            <FundsDropdown
              value={transferDestinationId}
              options={sharedOptions.filter((o) => o.id !== transferSourceId)}
              placeholder="Select destination account"
              onChange={setTransferDestinationId}
              disabled={sharedOptions.length === 0}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#0A0A0A]">Amount</label>
            <input
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Enter an amount"
              className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3.5 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#E94E1B]/40"
            />
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Transfers between accounts are instant. Trading-account ↔ trading-account routes via your main wallet automatically.
            </p>
          </div>

          <ContinueButton
            disabled={!transferCanContinue}
            busy={transferSubmitting}
            onClick={() => void submitTransfer()}
            label="Continue"
          />
        </div>

        <Stepper
          steps={[
            {
              icon: <WalletIcon size={16} />,
              title: 'Pick Source Account',
              description: 'Choose the account you want to move funds from.',
              state: 'current',
            },
            {
              icon: <ArrowLeftRight size={16} />,
              title: 'Pick Destination Account',
              description: 'Select where the funds should land and confirm the transfer.',
              state: 'upcoming',
            },
          ]}
        />
      </div>
    );
  };

  const renderHistoryTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0A0A0A]">Recent transactions</h2>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr] text-xs font-semibold uppercase tracking-wide text-[#6B7280] bg-[#F9FAFB] px-4 py-3 border-b border-[#E5E5E5]">
            <span>Type</span>
            <span>Method</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Status</span>
          </div>
          {historyLoading ? (
            <div className="px-4 py-10 text-center text-sm text-[#6B7280]">Loading…</div>
          ) : historyItems.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[#6B7280]">No transactions yet.</div>
          ) : (
            historyItems.slice(0, 25).map((it) => {
              const t = (it.type || '').toLowerCase();
              const status = (it.status || '').toLowerCase();
              const statusClass =
                status === 'completed' || status === 'approved'
                  ? 'text-emerald-600 bg-emerald-50'
                  : status === 'pending'
                    ? 'text-amber-600 bg-amber-50'
                    : status === 'failed' || status === 'rejected' || status === 'cancelled'
                      ? 'text-red-600 bg-red-50'
                      : 'text-[#6B7280] bg-[#F5F5F5]';
              return (
                <div
                  key={`${it.id}-${it.type}`}
                  className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center px-4 py-3 text-sm border-b border-[#F0F0F0] last:border-b-0"
                >
                  <div className="font-medium text-[#0A0A0A] capitalize truncate">{t || 'transaction'}</div>
                  <div className="text-[#6B7280] truncate">{it.method || '—'}</div>
                  <div className="font-mono tabular-nums text-right text-[#0A0A0A]">
                    {formatCurrency(Number(it.amount) || 0, it.currency || wallet?.currency || 'USD')}
                  </div>
                  <div className="flex justify-end">
                    <span className={clsx('rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize', statusClass)}>
                      {status || 'unknown'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right — info card */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-[#0A0A0A] text-white flex items-center justify-center">
              <HistoryIcon size={16} />
            </div>
            <h3 className="text-sm font-bold text-[#0A0A0A]">Wallet Snapshot</h3>
          </div>
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-[#6B7280]">Total deposits</dt>
              <dd className="font-mono tabular-nums font-semibold text-[#0A0A0A]">
                {fmt(wallet?.total_deposited ?? 0)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#6B7280]">Total withdrawals</dt>
              <dd className="font-mono tabular-nums font-semibold text-[#0A0A0A]">
                {fmt(wallet?.total_withdrawn ?? 0)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#6B7280]">Pending withdrawals</dt>
              <dd className="font-mono tabular-nums font-semibold text-[#0A0A0A]">
                {wallet?.pending_withdrawals ?? 0}
              </dd>
            </div>
          </dl>
        </div>
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[#F5F5F5] text-[#6B7280] flex items-center justify-center">
              <Hourglass size={16} />
            </div>
            <h3 className="text-sm font-bold text-[#0A0A0A]">Processing time</h3>
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Crypto withdrawals are reviewed by finance; most requests are processed within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardShell mainClassName="flex flex-col min-h-0 overflow-hidden p-0 bg-white">
      <div className="dashboard-main-scroll flex-1 min-h-0 min-w-0 overflow-y-auto bg-white">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 space-y-6">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">Funds</h1>
            <button
              type="button"
              onClick={() => void fetchData(true)}
              disabled={refreshing}
              className={clsx(
                'p-2 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] transition-all active:scale-95 shrink-0',
                refreshing && 'animate-spin cursor-not-allowed opacity-50',
              )}
              aria-label="Refresh wallet"
            >
              <RefreshCcw className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>

          {loadError && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {loadError}
            </div>
          )}

          {demoFundingBlocked && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-xs text-red-900">
              <p className="font-bold">Demo account — funding disabled</p>
              <p className="mt-1 leading-relaxed">{DEMO_FUNDING_MSG}</p>
            </div>
          )}

          {renderTabBar()}

          <div className="pt-2">
            {tab === 'deposit' && renderDepositTab()}
            {tab === 'withdrawal' && renderWithdrawalTab()}
            {tab === 'transfer' && renderTransferTab()}
            {tab === 'history' && renderHistoryTab()}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

// ---------------------------------------------------------------------------
// Local UI primitives — kept inside the file because they're tightly coupled
// to the Vantage-style Funds layout and aren't reused elsewhere yet.
// ---------------------------------------------------------------------------

/**
 * Controlled-menu dropdown mirroring the FilterDropdown pattern in
 * accounts/page.tsx. Rendered as a styled button + popover (NOT a native
 * <select>) so the visual treatment matches the rest of the Funds form.
 */
function FundsDropdown({
  value,
  options,
  onChange,
  placeholder,
  disabled,
}: {
  value: string | null;
  options: ReadonlyArray<{ id: string; label: string; sublabel?: string }>;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const selected = options.find((o) => o.id === value) ?? null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          'flex w-full items-center justify-between gap-2 rounded-xl bg-[#F5F5F5] px-4 py-3.5 text-left text-sm outline-none transition-shadow',
          'focus:ring-2 focus:ring-[#E94E1B]/40',
          disabled && 'opacity-60 cursor-not-allowed',
        )}
      >
        {selected ? (
          <span className="flex flex-col min-w-0">
            <span className="text-[#0A0A0A] font-medium truncate">{selected.label}</span>
            {selected.sublabel && (
              <span className="text-xs text-[#6B7280] font-mono tabular-nums truncate">{selected.sublabel}</span>
            )}
          </span>
        ) : (
          <span className="text-[#9CA3AF]">{placeholder}</span>
        )}
        <ChevronDown
          size={16}
          className={clsx('text-[#6B7280] transition-transform shrink-0', open && 'rotate-180')}
        />
      </button>
      {open && !disabled && options.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-[#E5E5E5] bg-white shadow-lg ring-1 ring-black/5"
        >
          {options.map((o) => {
            const sel = o.id === value;
            return (
              <li key={o.id} role="option" aria-selected={sel}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.id);
                    setOpen(false);
                  }}
                  className={clsx(
                    'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#F5F5F5]',
                    sel && 'bg-[#F5F5F5]',
                  )}
                >
                  <span className="flex flex-col min-w-0">
                    <span className={clsx('truncate', sel ? 'font-semibold text-[#0A0A0A]' : 'text-[#0A0A0A]')}>
                      {o.label}
                    </span>
                    {o.sublabel && (
                      <span className="text-xs text-[#6B7280] font-mono tabular-nums truncate">{o.sublabel}</span>
                    )}
                  </span>
                  {sel && <CheckCircle2 size={14} className="text-[#0A0A0A] shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Black pill Continue button used at the bottom of every Funds form. */
function ContinueButton({
  disabled,
  busy,
  onClick,
  label,
}: {
  disabled: boolean;
  busy: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'w-full rounded-full py-3.5 text-sm font-semibold transition-colors',
        disabled
          ? 'bg-[#E5E5E5] text-[#9CA3AF] cursor-not-allowed'
          : 'bg-[#0A0A0A] text-white hover:bg-black active:scale-[0.99]',
      )}
    >
      {busy ? 'Processing…' : label}
    </button>
  );
}

/**
 * Right-column stepper. Vertical line connects the two icon squares;
 * the current step is a filled black square, upcoming steps are hollow.
 */
function Stepper({
  steps,
}: {
  steps: ReadonlyArray<{
    icon: React.ReactNode;
    title: string;
    description: string;
    state: 'current' | 'upcoming' | 'done';
  }>;
}) {
  return (
    <div className="relative">
      <div className="absolute left-[15px] top-8 bottom-8 w-px bg-[#E5E5E5]" aria-hidden />
      <ul className="space-y-7 relative">
        {steps.map((s, i) => {
          const filled = s.state === 'current' || s.state === 'done';
          return (
            <li key={i} className="flex items-start gap-3.5">
              <div
                className={clsx(
                  'shrink-0 w-8 h-8 rounded-md flex items-center justify-center border-2',
                  filled
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                    : 'bg-white text-[#9CA3AF] border-[#E5E5E5]',
                )}
              >
                {s.icon}
              </div>
              <div className="min-w-0 pt-0.5">
                <h4 className={clsx('text-sm font-bold', filled ? 'text-[#0A0A0A]' : 'text-[#6B7280]')}>
                  {s.title}
                </h4>
                <p className="mt-1 text-xs text-[#6B7280] leading-relaxed">{s.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell mainClassName="flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="w-8 h-8 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[#6B7280]">Loading wallet…</span>
          </div>
        </DashboardShell>
      }
    >
      <WalletPageContent />
    </Suspense>
  );
}
