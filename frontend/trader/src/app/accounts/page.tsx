'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import {
  ChevronDown,
  Pencil,
  ArrowLeftRight,
  Trash2,
  Settings,
  LayoutGrid,
  List as ListIcon,
} from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';
import { useTradingStore, type TradingAccount, type AccountGroupInfo } from '@/stores/tradingStore';
import {
  getPersistedTradingAccountId,
  setPersistedTradingAccountId,
  tradingTerminalUrl,
} from '@/lib/tradingNav';
import Modal from '@/components/ui/Modal';
import AccountTypePickerModal from '@/components/accounts/AccountTypePickerModal';

const ALIAS_PREFIX = 'ptd-account-alias:';

interface AccountRow {
  id: string;
  account_number: string;
  balance: number;
  credit: number;
  equity: number;
  margin_used: number;
  free_margin: number;
  margin_level: number;
  leverage: number;
  currency: string;
  is_demo: boolean;
  is_wallet_account?: boolean;
  is_active?: boolean;
  account_group?: AccountGroupInfo | null;
  created_at?: string;
}

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);
}

function readAlias(id: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(`${ALIAS_PREFIX}${id}`) || '';
  } catch {
    return '';
  }
}

function writeAlias(id: string, value: string) {
  try {
    const v = value.trim();
    if (v) localStorage.setItem(`${ALIAS_PREFIX}${id}`, v);
    else localStorage.removeItem(`${ALIAS_PREFIX}${id}`);
  } catch {
    /* ignore */
  }
}

function toTradingAccount(row: AccountRow): TradingAccount {
  return {
    id: row.id,
    account_number: row.account_number,
    balance: row.balance,
    credit: row.credit,
    equity: row.equity,
    margin_used: row.margin_used,
    free_margin: row.free_margin,
    margin_level: row.margin_level,
    leverage: row.leverage,
    currency: row.currency,
    is_demo: row.is_demo,
    is_wallet_account: Boolean(row.is_wallet_account),
    account_group: row.account_group ?? null,
  };
}

type AccountKindFilter = 'live' | 'demo';
type ViewMode = 'grid' | 'list';

export default function AccountsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setStoreAccounts = useTradingStore((s) => s.setAccounts);
  const setActiveAccount = useTradingStore((s) => s.setActiveAccount);
  const removeAccount = useTradingStore((s) => s.removeAccount);

  /* New filter state for the Vantage-style header row. */
  const [kindFilter, setKindFilter] = useState<AccountKindFilter>('live');
  const [groupFilter, setGroupFilter] = useState<string>('all'); // 'all' or AccountGroupInfo.id
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadGen = useRef(0);

  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [kycGateOpen, setKycGateOpen] = useState(false);
  const [demoUpgradeOpen, setDemoUpgradeOpen] = useState(false);
  /** After creating an account, open-account sets sessionStorage; expand that card on Accounts. */
  const [expandAccountId, setExpandAccountId] = useState<string | null>(null);

  const fetchAccounts = useCallback(async (signal?: AbortSignal, opts: { silent?: boolean } = {}) => {
    const id = ++loadGen.current;
    if (!opts.silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await api.get<any>('/accounts', undefined, { signal });
      if (id !== loadGen.current) return;
      const list: AccountRow[] = Array.isArray(res) ? res : (res?.items ?? []);
      setRows(list);
      const tradingList = list.map(toTradingAccount);
      setStoreAccounts(tradingList);
    } catch (e) {
      if (id !== loadGen.current) return;
      // Silent polls swallow errors so a transient blip doesn't surface
      // a toast every 2s; the initial-load handler still shows them.
      if (opts.silent) return;
      const msg = e instanceof Error ? e.message : 'Failed to load accounts';
      setError(msg);
      toast.error(msg);
    } finally {
      if (id === loadGen.current && !opts.silent) setLoading(false);
    }
  }, [setStoreAccounts]);

  useEffect(() => {
    document.documentElement.setAttribute('data-page', 'accounts');
    return () => {
      document.documentElement.removeAttribute('data-page');
    };
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    void fetchAccounts(ac.signal);
    return () => {
      ac.abort();
      loadGen.current += 1;
    };
  }, [fetchAccounts]);

  // Live equity / P&L polling. The backend recomputes equity on every
  // /accounts request using current Redis tick prices + open positions
  // (see account_service.list_accounts), so a 2 s poll keeps the P&L
  // column moving without any extra WebSocket plumbing. Polling pauses
  // while the tab is hidden so we don't burn requests for nothing.
  useEffect(() => {
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (typeof document !== 'undefined' && document.hidden) return;
      void fetchAccounts(undefined, { silent: true });
    };

    const interval = setInterval(tick, 2000);
    const onVisibility = () => {
      if (typeof document !== 'undefined' && !document.hidden) tick();
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility);
    }
    return () => {
      cancelled = true;
      clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility);
      }
    };
  }, [fetchAccounts]);

  useEffect(() => {
    if (loading || rows.length === 0) return;
    let id: string | null = null;
    try {
      id = sessionStorage.getItem('ptd-accounts-expand');
    } catch {
      /* ignore */
    }
    if (!id) return;
    if (!rows.some((r) => r.id === id)) return;
    setExpandAccountId(id);
    try {
      sessionStorage.removeItem('ptd-accounts-expand');
    } catch {
      /* ignore */
    }
  }, [loading, rows]);

  useEffect(() => {
    if (!expandAccountId) return;
    const el = document.getElementById(`account-card-${expandAccountId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [expandAccountId]);

  /* Show all active accounts. CF/IF (follower copy-trade / managed sub-accounts)
     render with "View Trades" instead of Trade — the copy engine places trades
     there automatically. Pool accounts (CT/PM/MM) shown for master funding.
     Inactive accounts are hidden via is_active (delete_master sets this false). */
  const visibleRows = useMemo(() => {
    if (user?.is_demo) return rows.filter((a) => a.is_demo);
    return rows.filter((a) => {
      if ((a as { is_active?: boolean }).is_active === false) return false;
      /* Live/Demo toggle from the new filter row. */
      if (kindFilter === 'live' && a.is_demo) return false;
      if (kindFilter === 'demo' && !a.is_demo) return false;
      /* Account-group filter — 'all' or a specific group id. */
      if (groupFilter !== 'all' && a.account_group?.id !== groupFilter) return false;
      return true;
    });
  }, [rows, user?.is_demo, kindFilter, groupFilter]);

  /* Distinct account groups present in the loaded data — drives the
     "All" dropdown. Only populated when group data is on the rows. */
  const availableGroups = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of rows) {
      const g = r.account_group;
      if (g && g.id && !seen.has(g.id)) seen.set(g.id, g.name || 'Standard');
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [rows]);

  /** Sync store + session before opening terminal (navigation via `<Link href>` so clicks always work). */
  const prepareTradeSession = (row: AccountRow) => {
    setActiveAccount(toTradingAccount(row));
    setPersistedTradingAccountId(row.id);
  };

  const handleAccountRemoved = (id: string) => {
    removeAccount(id);
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      setStoreAccounts(next.map(toTradingAccount));
      return next;
    });
    if (getPersistedTradingAccountId() === id) setPersistedTradingAccountId(null);
  };

  const newAccountCtaClass =
    'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border-2 border-[#E94E1B] text-[#E94E1B] text-sm font-bold hover:bg-[#E94E1B]/10 transition-colors shrink-0';

  /** Open the live account picker only if KYC is approved; otherwise show the KYC gate modal. */
  const handleOpenNewAccount = () => {
    const kyc = (user?.kyc_status || '').toLowerCase();
    const approved = kyc === 'approved' || kyc === 'verified';
    if (!approved) {
      setKycGateOpen(true);
      return;
    }
    setAccountPickerOpen(true);
  };

  return (
    <DashboardShell>
      <AccountTypePickerModal
        open={accountPickerOpen}
        onClose={() => setAccountPickerOpen(false)}
        onCreated={() => void fetchAccounts()}
      />
      <Modal
        open={kycGateOpen}
        onClose={() => setKycGateOpen(false)}
        title="Complete KYC to open a live account"
        width="md"
        className="border border-border-primary bg-bg-card shadow-2xl"
      >
        <div className="space-y-4 p-1">
          <p className="text-sm text-text-secondary leading-relaxed">
            Live trading accounts are only available after your identity verification is approved. Submit your KYC documents and wait for review to continue.
          </p>
          {(() => {
            const kyc = (user?.kyc_status || 'pending').toLowerCase();
            const label =
              kyc === 'pending' || !kyc
                ? 'Not started'
                : kyc === 'submitted' || kyc === 'under_review'
                  ? 'Under review'
                  : kyc === 'rejected' || kyc === 'failed'
                    ? 'Rejected — please resubmit'
                    : kyc;
            const color =
              kyc === 'rejected' || kyc === 'failed'
                ? 'text-sell bg-sell/10 border-sell/30'
                : kyc === 'submitted' || kyc === 'under_review'
                  ? 'text-warning bg-warning/10 border-warning/30'
                  : 'text-text-secondary bg-bg-tertiary border-border-primary';
            return (
              <div className={clsx('rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wider inline-flex', color)}>
                KYC status: {label}
              </div>
            );
          })()}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-border-primary">
            <button
              type="button"
              onClick={() => setKycGateOpen(false)}
              className="px-5 py-2.5 rounded-lg border border-border-primary bg-bg-card text-sm font-semibold text-text-primary hover:bg-bg-hover transition-colors"
            >
              Close
            </button>
            <Link
              href="/kyc"
              onClick={() => setKycGateOpen(false)}
              className="px-5 py-2.5 rounded-lg bg-[#E94E1B] text-white text-sm font-bold hover:bg-[#C73E11] transition-colors text-center"
            >
              Complete KYC
            </Link>
          </div>
        </div>
      </Modal>
      <Modal
        open={demoUpgradeOpen}
        onClose={() => setDemoUpgradeOpen(false)}
        title="Register a real account"
        width="md"
        className="border border-border-primary bg-bg-card shadow-2xl"
      >
        <div className="space-y-4 p-1">
          <p className="text-sm text-text-secondary leading-relaxed">
            Demo accounts are provisioned by our team and cannot add new trading accounts. To open additional accounts, please register a real account.
          </p>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-border-primary">
            <button
              type="button"
              onClick={() => setDemoUpgradeOpen(false)}
              className="px-5 py-2.5 rounded-lg border border-border-primary bg-bg-card text-sm font-semibold text-text-primary hover:bg-bg-hover transition-colors"
            >
              Close
            </button>
            <Link
              href="/auth/register"
              onClick={() => setDemoUpgradeOpen(false)}
              className="px-5 py-2.5 rounded-lg bg-[#E94E1B] text-white text-sm font-bold hover:bg-[#C73E11] transition-colors text-center"
            >
              Register Real Account
            </Link>
          </div>
        </div>
      </Modal>
      <div className="page-main w-full space-y-6">
        <div className="animate-wallet-fund-enter-lg">
          <div className="space-y-5">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Accounts</h1>

              {/* Filter / action bar */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Live / Demo selector */}
                <FilterDropdown
                  label={kindFilter === 'live' ? 'Live Account' : 'Demo Account'}
                  options={[
                    { id: 'live', label: 'Live Account' },
                    { id: 'demo', label: 'Demo Account' },
                  ]}
                  value={kindFilter}
                  onChange={(v) => setKindFilter(v as AccountKindFilter)}
                  disabled={Boolean(user?.is_demo)}
                />
                {/* Account-group dropdown — only functional when group data exists. */}
                <FilterDropdown
                  label={
                    groupFilter === 'all'
                      ? 'All'
                      : availableGroups.find((g) => g.id === groupFilter)?.name || 'All'
                  }
                  options={[
                    { id: 'all', label: 'All' },
                    ...availableGroups.map((g) => ({ id: g.id, label: g.name })),
                  ]}
                  value={groupFilter}
                  onChange={setGroupFilter}
                  title={availableGroups.length === 0 ? 'No account groups available' : undefined}
                />
                {/* Trading-platform filter — placeholder; SwissCresta has no MT4/MT5 split. */}
                <FilterDropdown
                  label="Trading Platforms"
                  options={[{ id: 'all', label: 'Trading Platforms' }]}
                  value="all"
                  onChange={() => {
                    /* no-op — kept as static UI for parity with the design */
                  }}
                  title="Trading platform filter is not applicable on SwissCresta"
                />

                <div className="flex-1" />

                {/* Open Account — solid black pill that opens AccountTypePickerModal */}
                {user?.is_demo ? (
                  <button
                    type="button"
                    onClick={() => setDemoUpgradeOpen(true)}
                    className="inline-flex items-center justify-center rounded-full bg-[#0A0A0A] px-5 py-2 text-sm font-semibold text-white hover:bg-black transition-colors"
                  >
                    Open Account
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenNewAccount}
                    className="inline-flex items-center justify-center rounded-full bg-[#0A0A0A] px-5 py-2 text-sm font-semibold text-white hover:bg-black transition-colors"
                  >
                    Open Account
                  </button>
                )}

                {/* Grid / List view toggle */}
                <div className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E5] bg-white p-1">
                  <button
                    type="button"
                    aria-label="Grid view"
                    onClick={() => setViewMode('grid')}
                    className={clsx(
                      'p-1.5 rounded-full transition-colors',
                      viewMode === 'grid'
                        ? 'bg-white text-[#0A0A0A] shadow-sm'
                        : 'text-[#9CA3AF] hover:text-[#0A0A0A]',
                    )}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="List view"
                    onClick={() => setViewMode('list')}
                    className={clsx(
                      'p-1.5 rounded-full transition-colors',
                      viewMode === 'list'
                        ? 'bg-white text-[#0A0A0A] shadow-sm'
                        : 'text-[#9CA3AF] hover:text-[#0A0A0A]',
                    )}
                  >
                    <ListIcon size={16} />
                  </button>
                </div>
              </div>

              {loading && (
                <div className="flex flex-col items-center gap-3 py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  <span className="text-sm text-text-secondary">Loading accounts…</span>
                </div>
              )}

              {!loading && error && (
                <div className="space-y-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-center">
                  <p className="text-sm text-red-400">{error}</p>
                  <Button variant="outline" size="sm" onClick={() => void fetchAccounts()}>
                    Retry
                  </Button>
                </div>
              )}

              {!loading && !error && visibleRows.length === 0 && (
                <div className="rounded-2xl border border-[#E5E5E5] bg-white p-8 text-center">
                  <p className="text-sm text-text-secondary">
                    {user?.is_demo
                      ? 'No demo trading account is linked yet.'
                      : 'You do not have a trading account yet. Use the "Open Account" button above to open one.'}
                  </p>
                </div>
              )}

              {!loading && !error && visibleRows.length > 0 && (
                <div
                  className={clsx(
                    'grid gap-5',
                    viewMode === 'grid'
                      ? 'grid-cols-1 md:grid-cols-2'
                      : 'grid-cols-1',
                  )}
                >
                  {visibleRows.map((row) => (
                    <AccountCard
                      key={row.id}
                      row={row}
                      onDeposit={() => router.push('/wallet')}
                      onTransfer={() => router.push('/wallet?tab=transfer')}
                      onTrade={() => {
                        prepareTradeSession(row);
                        router.push(tradingTerminalUrl(row.id, { view: 'chart' }));
                      }}
                      onRemoved={handleAccountRemoved}
                    />
                  ))}

                  {/* Join Copy Trading promo — full width across the grid */}
                  <JoinCopyTradingCard onStart={() => router.push('/social')} />
                </div>
              )}
            </div>
          </div>
      </div>
    </DashboardShell>
  );
}

/* ----------------------------------------------------------------------------
   Small white-pill filter dropdown used in the Accounts toolbar.
   Renders a native <select> overlaid on a styled button so the click target
   matches the rest of the bar but accessibility / keyboard nav stays intact.
   ------------------------------------------------------------------------ */
function FilterDropdown({
  label,
  options,
  value,
  onChange,
  disabled,
  title,
}: {
  label: string;
  options: ReadonlyArray<{ id: string; label: string }>;
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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

  return (
    <div ref={ref} className="relative inline-block" title={title}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          'inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-medium text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors',
          disabled && 'opacity-60 cursor-not-allowed hover:border-[#E5E5E5]',
        )}
      >
        <span>{label}</span>
        <ChevronDown size={14} className={clsx('text-[#6B7280] transition-transform', open && 'rotate-180')} />
      </button>
      {open && !disabled && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-50 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-lg ring-1 ring-black/5"
        >
          {options.map((o) => {
            const selected = o.id === value;
            return (
              <li key={o.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.id);
                    setOpen(false);
                  }}
                  className={clsx(
                    'block w-full px-4 py-2 text-left text-sm hover:bg-[#F5F5F5] transition-colors',
                    selected ? 'bg-[#F5F5F5] font-semibold text-[#0A0A0A]' : 'text-[#0A0A0A]',
                  )}
                >
                  {o.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Join Copy Trading promo card � spans both columns at md+.
   Click "Start Copying" ? routes to /social (where the copy-trading UI lives).
   The inline SVG line is intentionally minimal so it stays performant and
   doesn't pull in image assets.
   ------------------------------------------------------------------------ */
function JoinCopyTradingCard({ onStart }: { onStart: () => void }) {
  return (
    <div className="md:col-span-2 relative overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white p-6">
      <div className="relative z-[1] flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-md">
          <h3 className="text-lg font-bold tracking-tight text-[#0A0A0A]">Join Copy Trading</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">
            More than <span className="font-semibold text-emerald-600">50,000+ Copiers</span>
            <br />
            Trade like a master and earn by copying professional investors
          </p>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center justify-center rounded-full bg-[#0A0A0A] px-5 py-2 text-sm font-semibold text-white hover:bg-black transition-colors shrink-0"
        >
          Start Copying
        </button>
      </div>
      {/* Faded background trend graph � purely decorative */}
      <svg
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 opacity-30 md:block"
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="copy-trend-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,120 L40,110 L80,115 L120,90 L160,95 L200,70 L240,80 L280,55 L320,60 L360,35 L400,40 L400,160 L0,160 Z"
          fill="url(#copy-trend-fade)"
        />
        <path
          d="M0,120 L40,110 L80,115 L120,90 L160,95 L200,70 L240,80 L280,55 L320,60 L360,35 L400,40"
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   AccountCard � Vantage-style compact card.
   White outer surface, light-gray inner summary tile, "--" placeholder where
   the rich numeric panel used to live. Real balance / credit values are still
   passed through so we can render them in the subline when the data lands.
   ------------------------------------------------------------------------ */
function AccountCard({
  row,
  onDeposit,
  onTransfer,
  onTrade,
  onRemoved,
}: {
  row: AccountRow;
  onDeposit: () => void;
  onTransfer: () => void;
  onTrade: () => void;
  onRemoved: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [aliasDraft, setAliasDraft] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);

  /* Close the settings menu on outside-click. */
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  useEffect(() => {
    setAliasDraft(readAlias(row.id));
  }, [row.id]);

  const isActive = row.is_active !== false;
  const isManagedAccount = row.account_number.startsWith('IF') || row.account_number.startsWith('CF');
  const groupName = row.account_group?.name?.trim() || 'Standard';
  /* SwissCresta has a single server � Live for real, Demo for demo accounts. */
  const serverLabel = row.is_demo ? 'SwissCresta-Demo' : 'SwissCresta-Live';
  /* Platform badge. SwissCresta is a single internal platform; we show "MT5"
     to mirror the screenshot's visual rhythm. If the codebase later carries
     a real platform field, swap this for it. */
  const platformBadge = 'MT5';
  /* "V" mark � first letter of the group name (Vantage's avatar tile shows
     the broker initial). Falls back to "S" for SwissCresta. */
  const markChar = (groupName[0] || 'S').toUpperCase();

  const balance = Number.isFinite(row.balance) ? row.balance : 0;
  const credit = Number.isFinite(row.credit) ? row.credit : 0;
  const hasNumbers = balance > 0 || credit > 0;

  const confirmCloseAccount = async () => {
    setDeleting(true);
    try {
      await api.delete(`/accounts/${row.id}`);
      toast.success(row.is_demo ? 'Demo account removed.' : 'Account closed.');
      setCloseModal(false);
      onRemoved(row.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not close account');
    } finally {
      setDeleting(false);
    }
  };

  const saveAlias = () => {
    writeAlias(row.id, aliasDraft);
    setRenameOpen(false);
    toast.success('Label updated');
  };

  return (
    <div
      id={`account-card-${row.id}`}
      className="rounded-2xl border border-[#E5E5E5] bg-white p-5"
    >
      {/* Header � status pill + platform + account number + settings cog */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={clsx(
              'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
              isActive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-gray-100 text-gray-600',
            )}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-[#0A0A0A]">
            {platformBadge}
          </span>
          <span className="text-sm font-semibold tabular-nums text-[#0A0A0A]">
            {row.account_number}
          </span>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Account settings"
            className="rounded-full p-1.5 text-[#6B7280] hover:bg-gray-100 hover:text-[#0A0A0A] transition-colors"
          >
            <Settings size={18} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-[#E5E5E5] bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); setRenameOpen(true); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#0A0A0A] hover:bg-gray-50"
              >
                <Pencil size={14} />
                Rename label
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onTransfer(); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#0A0A0A] hover:bg-gray-50"
              >
                <ArrowLeftRight size={14} />
                Transfer funds
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); setCloseModal(true); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} />
                Close account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sub-header � group + server line */}
      <p className="mt-2 text-xs text-[#6B7280]">
        {groupName} STP <span className="mx-2 text-[#D1D5DB]">|</span> {serverLabel}
      </p>

      {/* Inner summary tile */}
      <div className="mt-4 rounded-xl bg-[#F5F5F5] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-base font-bold text-[#0A0A0A] ring-1 ring-[#E5E5E5]">
            {markChar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#0A0A0A]">
              {hasNumbers ? fmt(balance, row.currency) : '--'}
            </p>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              Credits: {hasNumbers ? fmt(credit, row.currency) : '-'}
              <span className="mx-2 text-[#D1D5DB]">|</span>
              Balance: {hasNumbers ? fmt(balance, row.currency) : '-'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onDeposit}
            className="inline-flex items-center justify-center rounded-full bg-[#0A0A0A] px-4 py-1.5 text-sm font-semibold text-white hover:bg-black transition-colors"
          >
            Deposit
          </button>
          <button
            type="button"
            onClick={onTrade}
            disabled={isManagedAccount}
            title={isManagedAccount ? 'Managed account � trades are placed by the master' : undefined}
            className="inline-flex items-center justify-center rounded-full border border-[#E5E5E5] px-4 py-1.5 text-sm font-semibold text-[#0A0A0A] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trade
          </button>
        </div>
      </div>

      {/* Close-account confirmation */}
      <Modal open={closeModal} onClose={() => !deleting && setCloseModal(false)} title="Close account">
        <div className="p-4 space-y-4">
          <p className="text-sm text-text-secondary">
            Close account <span className="font-mono font-semibold">{row.account_number}</span>?
          </p>
          <ul className="text-xs text-text-tertiary space-y-1 pl-4 list-disc">
            <li>Any open positions will close at their open price (zero P&amp;L).</li>
            <li>Pending orders will be cancelled.</li>
            {balance > 0 ? (
              <li>
                <span className="text-text-secondary font-semibold">{fmt(balance, row.currency)}</span> will transfer to your main wallet.
              </li>
            ) : null}
          </ul>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" disabled={deleting} onClick={() => setCloseModal(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting}
              onClick={() => void confirmCloseAccount()}
            >
              {deleting ? 'Closing�' : 'Close account'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rename-label modal */}
      <Modal open={renameOpen} onClose={() => setRenameOpen(false)} title="Rename account label">
        <div className="p-4 space-y-4">
          <p className="text-sm text-text-secondary">
            Set a friendly label for account{' '}
            <span className="font-mono font-semibold">{row.account_number}</span>. Labels are stored
            locally on this device.
          </p>
          <input
            value={aliasDraft}
            onChange={(e) => setAliasDraft(e.target.value)}
            placeholder="e.g. Main trading"
            className="w-full rounded-xl border border-border-primary bg-bg-input px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent/40"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={saveAlias}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

