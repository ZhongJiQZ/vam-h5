import dayjs from "dayjs";

export function symbolPair(symbol) {
  const s = String(symbol || "").toUpperCase();
  if (!s) return "--";
  return s.includes("/") ? s : `${s}/USDT`;
}

function toEpochMs(v) {
  if (v === null || v === undefined || v === "") return null;
  const s = typeof v === "string" ? v.trim() : v;
  if (typeof s === "string" && !/^\d+$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n < 1e12 ? n * 1000 : n;
}

function formatLocalTime(input, fmt = "YYYY-MM-DD HH:mm:ss") {
  if (input === null || input === undefined || input === "") return "--";
  const ms = toEpochMs(input);
  const parsed = ms != null ? ms : input;
  const d = dayjs(parsed);
  return d.isValid() ? d.format(fmt) : "--";
}

function pickCopyTradeMillis(item, key) {
  if (!item) return null;
  const params = item.params || {};
  const raw = params[key] != null ? params[key] : item[key];
  if (raw == null || raw === "") return null;
  return raw;
}

/** 策略开始时间（毫秒时间戳 → 设备本地时间） */
export function formatCopyTradeStrategyStartTime(item, fmt = "YYYY-MM-DD HH:mm:ss") {
  const ms = pickCopyTradeMillis(item, "strategyStartTimeMillis");
  if (ms != null) return formatLocalTime(ms, fmt);
  return item && item.startTime ? item.startTime : item && item.cycleStartTime ? item.cycleStartTime : "--";
}

/** 策略结束时间（毫秒时间戳 → 设备本地时间） */
export function formatCopyTradeStrategyEndTime(item, fmt = "YYYY-MM-DD HH:mm:ss") {
  const ms = pickCopyTradeMillis(item, "strategyEndTimeMillis");
  if (ms != null) return formatLocalTime(ms, fmt);
  return item && item.endTime ? item.endTime : "--";
}

/** 策略时间范围 */
export function formatCopyTradeStrategyTimeRange(item, fmt = "YYYY-MM-DD HH:mm:ss") {
  const start = formatCopyTradeStrategyStartTime(item, fmt);
  const end = formatCopyTradeStrategyEndTime(item, fmt);
  if (start === "--" && end === "--") return "--";
  if (start === "--") return end;
  if (end === "--") return start;
  return `${start} ~ ${end}`;
}

/** 跟单当前持仓币种：优先 params.runningSymbol */
export function copyTradeRunningSymbol(item) {
  if (!item) return "";
  const params = item.params || {};
  const raw =
    params.runningSymbol != null
      ? params.runningSymbol
      : params.activeSymbol != null
        ? params.activeSymbol
        : params.currentCoin != null
          ? params.currentCoin
          : item.runningSymbol != null
            ? item.runningSymbol
            : "";
  return String(raw || "").trim();
}

/** 当前持仓展示 */
export function copyTradePositionSymbol(item) {
  const running = copyTradeRunningSymbol(item);
  if (running) return running.toUpperCase();
  return "--";
}

export function normalizeInstitutionListResponse(res) {
  const d = res && res.data && res.data.data != null ? res.data.data : res && res.data;
  if (Array.isArray(d)) return { list: d, banner: "" };
  if (d && typeof d === "object") {
    const list = d.list || d.records || d.rows || d.data || [];
    return { list: Array.isArray(list) ? list : [], banner: d.banner || d.bannerUrl || "" };
  }
  return { list: [], banner: "" };
}

export function institutionRowId(item) {
  return item && (item.institutionId != null ? item.institutionId : item.id);
}

export function isInstitutionSubscribed(item) {
  return item && (item.subscribed === true || item.isSubscribed === true || item.subscribed === 1 || item.isSubscribed === 1);
}

export function institutionSubscriberCount(item) {
  const n = (item && (item.useCount ?? item.usePeopleCount ?? item.realUseCount ?? item.fakeUserCount)) || 0;
  const num = Number(n);
  return Number.isFinite(num) ? num : 0;
}

const SECRET_LOCK_PREFIX = "copy_trade_inst_lock_";
const SECRET_LOCK_MS = 60 * 60 * 1000;

export function isInstitutionSecretLocked(institutionId) {
  if (!institutionId) return false;
  try {
    const until = Number(localStorage.getItem(`${SECRET_LOCK_PREFIX}${institutionId}`));
    return Number.isFinite(until) && until > Date.now();
  } catch (e) {
    return false;
  }
}

export function setInstitutionSecretLock(institutionId, ms = SECRET_LOCK_MS) {
  if (!institutionId) return;
  try {
    localStorage.setItem(`${SECRET_LOCK_PREFIX}${institutionId}`, String(Date.now() + ms));
  } catch (e) {
    /* ignore */
  }
}

export function isSecretKeyLockMessage(msg) {
  const s = String(msg || "");
  return s.includes("1小时") || s.includes("1 小时") || s.includes("锁定");
}

export function patchInstitutionSubscribed(list, institutionId, patch = {}) {
  const id = String(institutionId);
  return list.map((item) => {
    if (String(institutionRowId(item)) !== id) return item;
    return {
      ...item,
      ...patch,
      subscribed: true,
      isSubscribed: true,
      subscribeText: patch.subscribeText || item.subscribeText || "已订阅",
    };
  });
}

/** 策略列表：是否已跟单（跟单中） */
export function isStrategyFollowing(item) {
  if (!item) return false;
  const status = Number(item.followStatus);
  if (status === 1) return true;
  const text = String(item.followStatusText || item.statusText || "");
  return /已跟单|跟单中/i.test(text);
}

function toCoinArray(maybeList) {
  if (Array.isArray(maybeList)) return maybeList;
  if (maybeList && typeof maybeList === "object") {
    return Object.entries(maybeList).map(([key, val]) => {
      if (val && typeof val === "object") return { symbol: key, ...val };
      return { symbol: key, rate: val };
    });
  }
  return [];
}

export function normalizeCoinPreference(raw) {
  if (!raw) return [];
  let list = [];
  if (Array.isArray(raw)) list = raw;
  else if (typeof raw === "object") {
    const coinRaw =
      raw.coinPreference || raw.coinPref || raw.coins || raw.coinList || raw.list || raw.data;
    if (Array.isArray(coinRaw)) list = coinRaw;
    else if (coinRaw && typeof coinRaw === "object") list = toCoinArray(coinRaw);
  }
  return list
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const rate = Number(row.rate ?? row.ratio ?? row.percent ?? row.percentage ?? 0);
      const count = Number(row.count ?? row.tradeCount ?? row.num ?? 0);
      const symbol = row.symbol || row.coin || row.coinName || row.name || "";
      if (!symbol && !rate && !count) return null;
      return {
        ...row,
        symbol: symbol || "--",
        rate: Number.isFinite(rate) ? rate : 0,
        count: Number.isFinite(count) ? count : 0,
        icon: row.icon || row.logo || "",
      };
    })
    .filter(Boolean);
}

export function buildInstitutionChartPayload(institutionId, range) {
  const id = institutionId != null && institutionId !== "" ? institutionId : undefined;
  return { institutionId: id, id, range: range || "7d" };
}

/** 进行中跟单盈亏：netProfit */
export function copyTradeNetProfit(item) {
  if (!item) return 0;
  const params = item.params || {};
  const raw = params.netProfit != null ? params.netProfit : item.netProfit;
  if (raw == null || raw === "") return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** 跟单交易次数：winCount + loseCount */
export function copyTradeTradeCount(item) {
  if (!item) return 0;
  const params = item.params || {};
  const hasWinLose =
    params.winCount != null ||
    params.loseCount != null ||
    item.winCount != null ||
    item.loseCount != null;
  if (hasWinLose) {
    const win = Number(params.winCount != null ? params.winCount : item.winCount != null ? item.winCount : 0);
    const lose = Number(params.loseCount != null ? params.loseCount : item.loseCount != null ? item.loseCount : 0);
    return (Number.isFinite(win) ? win : 0) + (Number.isFinite(lose) ? lose : 0);
  }
  const fallback = params.tradeCount != null ? params.tradeCount : item.tradeCount;
  return fallback != null && fallback !== "" ? Number(fallback) || 0 : 0;
}

/** 跟单盈亏率 %：netProfit / amount * 100 */
export function copyTradePnlRate(item) {
  const amount = Number(item && item.amount != null ? item.amount : 0);
  const profit = copyTradeNetProfit(item);
  if (!amount) return "0.00";
  return ((profit / amount) * 100).toFixed(2);
}

const MIN_AMOUNT_KEYS = [
  "minAmount",
  "minCopyAmount",
  "copyMinAmount",
  "amountMin",
  "minFollowAmount",
  "followMinAmount",
  "copyAmountMin",
  "minInvestAmount",
];
const MAX_AMOUNT_KEYS = [
  "maxAmount",
  "maxCopyAmount",
  "copyMaxAmount",
  "amountMax",
  "maxFollowAmount",
  "followMaxAmount",
  "copyAmountMax",
  "maxInvestAmount",
];

function pickAmountField(src, keys) {
  if (!src || typeof src !== "object") return null;
  for (let i = 0; i < keys.length; i++) {
    const val = src[keys[i]];
    if (val != null && val !== "") {
      const n = Number(val);
      return Number.isFinite(n) ? n : val;
    }
  }
  return null;
}

export function normalizeStrategyAmountRange(raw) {
  if (!raw || typeof raw !== "object") return { minAmount: null, maxAmount: null };
  const nested = raw.strategy || raw.detail || raw.limit || raw.amountLimit || raw.rule || {};
  const src = Object.assign({}, nested, raw);
  return {
    minAmount: pickAmountField(src, MIN_AMOUNT_KEYS),
    maxAmount: pickAmountField(src, MAX_AMOUNT_KEYS),
  };
}

export function normalizeStrategyDetail(raw) {
  if (!raw || typeof raw !== "object") return {};
  const limits = normalizeStrategyAmountRange(raw);
  return Object.assign({}, raw, limits);
}

export function resolveStrategyAmountRange(strategy, institution) {
  strategy = strategy || {};
  institution = institution || {};
  const fromStrategy = normalizeStrategyAmountRange(strategy);
  const fromInstitution = normalizeStrategyAmountRange(institution);
  return {
    minAmount: fromStrategy.minAmount != null ? fromStrategy.minAmount : fromInstitution.minAmount,
    maxAmount: fromStrategy.maxAmount != null ? fromStrategy.maxAmount : fromInstitution.maxAmount,
  };
}

export function parseCopyTradeStrategyQuery(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(String(raw)));
  } catch (e) {
    try {
      return JSON.parse(decodeURI(String(raw)));
    } catch (e2) {
      return null;
    }
  }
}

export function formatAmountRangeText(minAmount, maxAmount, fallback) {
  fallback = fallback || "--";
  const fmt = (v) => {
    if (v == null || v === "") return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(2) : String(v);
  };
  return `${fmt(minAmount)} ~ ${fmt(maxAmount)} USDT`;
}
