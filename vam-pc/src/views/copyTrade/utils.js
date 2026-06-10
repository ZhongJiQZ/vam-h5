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
  const strategy = item.strategy || {};
  const raw =
    params[key] != null
      ? params[key]
      : item[key] != null
        ? item[key]
        : strategy[key] != null
          ? strategy[key]
          : null;
  if (raw == null || raw === "") return null;
  return raw;
}

function formatStrategyExecuteTime(raw, dailyTimeEnabled, fmt = "YYYY-MM-DD HH:mm") {
  if (raw == null || raw === "") return "--";
  const s = String(raw);
  const useDaily =
    (dailyTimeEnabled === 1 || dailyTimeEnabled === true) &&
    (s.startsWith("2000-01-01") || s.includes("2000-01-01"));
  if (useDaily) {
    const d = dayjs(raw);
    return d.isValid() ? d.format("HH:mm") : "--";
  }
  const formatted = formatLocalTime(raw, fmt);
  return formatted !== "--" ? formatted : s;
}

/** 策略开始时间（毫秒时间戳 → 设备本地时间） */
export function formatCopyTradeStrategyStartTime(item, fmt = "YYYY-MM-DD HH:mm") {
  const ms = pickCopyTradeMillis(item, "strategyStartTimeMillis");
  if (ms != null) return formatLocalTime(ms, fmt);
  if (item && item.executeStartTime) {
    return formatStrategyExecuteTime(item.executeStartTime, item.dailyTimeEnabled, fmt);
  }
  const fallback = item && item.startTime ? item.startTime : item && item.cycleStartTime ? item.cycleStartTime : "";
  if (!fallback) return "--";
  const formatted = formatLocalTime(fallback, fmt);
  return formatted !== "--" ? formatted : fallback;
}

/** 策略结束时间（毫秒时间戳 → 设备本地时间） */
export function formatCopyTradeStrategyEndTime(item, fmt = "YYYY-MM-DD HH:mm") {
  const ms = pickCopyTradeMillis(item, "strategyEndTimeMillis");
  if (ms != null) return formatLocalTime(ms, fmt);
  if (item && item.executeEndTime) {
    return formatStrategyExecuteTime(item.executeEndTime, item.dailyTimeEnabled, fmt);
  }
  const fallback = item && item.endTime ? item.endTime : "";
  if (!fallback) return "--";
  const formatted = formatLocalTime(fallback, fmt);
  return formatted !== "--" ? formatted : fallback;
}

export function getActiveSubCount(item) {
  if (!item) return 0;
  const raw = item.activeSubCount != null ? item.activeSubCount : item.params && item.params.activeSubCount;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function hasActiveSubCountCondition(item) {
  return getActiveSubCount(item) > 0;
}

export function formatActiveSubCountCondition(item, translate) {
  const n = getActiveSubCount(item);
  if (n <= 0) return "";
  const text = typeof translate === "function" ? translate("pc_copy_trade_active_sub_count_gt") : "";
  if (!text || text === "pc_copy_trade_active_sub_count_gt") {
    return `下级跟单人数＞${n}`;
  }
  return text.replace("{n}", String(n));
}

/** 策略收益率区间 */
export function formatStrategyProfitRateRange(item) {
  if (!item) return "--";
  const min = item.profitRateMin != null ? item.profitRateMin : item.profitRate;
  const max = item.profitRateMax != null ? item.profitRateMax : item.profitRate;
  const minN = Number(min);
  const maxN = Number(max);
  const fmt = (n) => (Number.isFinite(n) ? `${n.toFixed(2)}%` : "--");
  if (!Number.isFinite(minN) && !Number.isFinite(maxN)) return "--";
  if (!Number.isFinite(minN)) return fmt(maxN);
  if (!Number.isFinite(maxN)) return fmt(minN);
  if (minN === maxN) return fmt(minN);
  return `${minN.toFixed(2)}% ~ ${maxN.toFixed(2)}%`;
}

/** 加入时间（毫秒时间戳 / ISO → 设备本地时间） */
export function formatCopyTradeJoinTime(item, fmt = "YYYY-MM-DD HH:mm") {
  if (!item) return "--";
  const params = item.params || {};
  const ms = params.joinTimeMillis != null ? params.joinTimeMillis : item.joinTimeMillis;
  if (ms != null) return formatLocalTime(ms, fmt);
  const fallback =
    item && item.joinTime
      ? item.joinTime
      : params.joinTime
        ? params.joinTime
        : item && item.startTime
          ? item.startTime
          : "";
  if (!fallback) return "--";
  const formatted = formatLocalTime(fallback, fmt);
  return formatted !== "--" ? formatted : fallback;
}

/** 跟单详情接口响应归一化 */
export function normalizeCopyTradeDetailResponse(res) {
  const payload = res && res.data && res.data.data != null ? res.data.data : res && res.data;
  if (!payload || typeof payload !== "object") {
    return { meta: {}, orders: [] };
  }

  if (payload.id != null && !payload.order && !payload.orderList) {
    return { meta: {}, orders: [{ ...payload, records: payload.records || [] }] };
  }

  if (payload.order) {
    const strategy = payload.strategy || {};
    const institution = payload.institution || {};
    const records = Array.isArray(payload.records)
      ? payload.records
      : Array.isArray(payload.order.records)
        ? payload.order.records
        : [];
    const order = {
      ...payload.order,
      records,
      strategy,
      institution,
      strategyName: payload.order.strategyName || strategy.strategyName,
      strategyId: payload.order.strategyId != null ? payload.order.strategyId : strategy.strategyId,
      icon: payload.order.icon || institution.logo,
      institutionName: institution.institutionName,
      institutionId: institution.institutionId,
      strategyStartTimeMillis:
        strategy.strategyStartTimeMillis != null
          ? strategy.strategyStartTimeMillis
          : payload.order.strategyStartTimeMillis,
      strategyEndTimeMillis:
        strategy.strategyEndTimeMillis != null
          ? strategy.strategyEndTimeMillis
          : payload.order.strategyEndTimeMillis,
    };
    return {
      meta: {
        strategyId: strategy.strategyId,
        strategyName: strategy.strategyName,
        recordsStatusFilter: payload.status,
        recordsStatusFilterText: payload.statusText,
        institution,
        strategy,
      },
      orders: [order],
    };
  }

  const orders = [];
  const seen = new Set();
  const pushOrder = (item) => {
    if (!item || item.id == null || seen.has(item.id)) return;
    seen.add(item.id);
    orders.push({ ...item, records: item.records || [] });
  };
  pushOrder(payload.order);
  (payload.orderList || []).forEach(pushOrder);
  return {
    meta: {
      strategyId: payload.strategyId,
      strategyName: payload.strategyName,
      statusFilter: payload.statusFilter,
      statusFilterText: payload.statusFilterText,
      anchorOrderId: payload.anchorOrderId,
      total: payload.total,
    },
    orders,
  };
}

/** 策略时间范围 */
export function formatCopyTradeStrategyTimeRange(item, fmt = "YYYY-MM-DD HH:mm") {
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
          : params.symbol != null
            ? params.symbol
            : item.runningSymbol != null
              ? item.runningSymbol
              : item.symbol != null
                ? item.symbol
                : item.strategy && item.strategy.symbol != null
                  ? item.strategy.symbol
                  : "";
  return String(raw || "").trim();
}

function copyTradeHasRecordSymbol(item) {
  const records = item && item.records;
  if (!Array.isArray(records) || !records.length) return false;
  return records.some((rec) => {
    const sym = (rec && (rec.symbol || rec.coin || rec.coinSymbol || rec.symbolName)) || "";
    return sym && !isWaitBuyPositionStatus(String(sym).trim());
  });
}

function isWaitBuyPositionStatus(text) {
  const s = String(text || "").trim();
  return /^等待买入$/i.test(s) || /^wait(ing)?\s*(to\s*)?buy$/i.test(s);
}

function formatWaitBuyPosition(translate) {
  if (typeof translate === "function") {
    const msg = translate("pc_copy_trade_wait_institution_buy");
    if (msg && msg !== "pc_copy_trade_wait_institution_buy") return msg;
  }
  return "等待机构买入";
}

/** 进行中且尚无成交时展示等待买入 */
export function copyTradeShouldShowWaitBuy(item) {
  if (!item || item.status === 1) return false;
  const running = copyTradeRunningSymbol(item);
  if (running && !isWaitBuyPositionStatus(running)) return false;
  if (copyTradeHasRecordSymbol(item)) return false;
  const params = item.params || {};
  if (params.activeSymbolKey === "copy.trade.symbol.wait_buy") return true;
  return copyTradeTradeCount(item) <= 0;
}

/** 当前持仓展示（等待买入 → 等待机构买入） */
export function copyTradePositionSymbol(item, translate) {
  if (copyTradeShouldShowWaitBuy(item)) {
    return formatWaitBuyPosition(translate);
  }
  const running = copyTradeRunningSymbol(item);
  if (!running) return "--";
  const trimmed = String(running).trim();
  if (isWaitBuyPositionStatus(trimmed)) {
    return formatWaitBuyPosition(translate);
  }
  if (/[\u4e00-\u9fff]/.test(trimmed)) return trimmed;
  return trimmed.toUpperCase();
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

/** 策略列表：是否已跟单（等待启动 / 跟单中，followStatus 3/4） */
export function isStrategyFollowing(item) {
  if (!item) return false;
  const status = Number(item.followStatus);
  if (status === 3 || status === 4) return true;
  const text = String(item.followStatusText || item.statusText || "");
  return /跟单中|等待启动|已跟单/i.test(text);
}

function getStrategyStartMillis(item) {
  if (!item) return null;
  const ms = pickCopyTradeMillis(item, "strategyStartTimeMillis");
  if (ms != null) return ms;
  const raw = item.startTime || item.cycleStartTime || item.executeStartTime;
  if (raw == null || raw === "") return null;
  const ts = Date.parse(String(raw).replace(/-/g, "/"));
  return Number.isFinite(ts) ? ts : null;
}

/** 策略列表：暂未开始 */
export function isStrategyNotStarted(item) {
  if (!item) return false;
  const status = Number(item.followStatus);
  if (status === 0) return true;
  const text = String(item.followStatusText || item.statusText || "");
  if (/暂未开始|未开启|等待开启|尚未开始|not started|not open/i.test(text)) return true;
  if (item.canJoin !== false) return false;
  const startMs = getStrategyStartMillis(item);
  return startMs != null && startMs > Date.now();
}

/** 策略不可加入时的提示文案 */
export function getStrategyJoinBlockMessage(item, translate) {
  const t = typeof translate === "function" ? translate : () => "";
  if (isStrategyNotStarted(item)) {
    const msg = t("pc_copy_trade_strategy_not_started");
    return msg && msg !== "pc_copy_trade_strategy_not_started" ? msg : "暂未开启策略，请等待";
  }
  const fromApi = String((item && item.followStatusText) || (item && item.statusText) || "").trim();
  if (fromApi) return fromApi;
  const fallback = t("pc_copy_trade_unjoinable");
  return fallback && fallback !== "pc_copy_trade_unjoinable" ? fallback : "当前不可加入";
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
