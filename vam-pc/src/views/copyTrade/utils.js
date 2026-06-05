export function symbolPair(symbol) {
  const s = String(symbol || "").toUpperCase();
  if (!s) return "--";
  return s.includes("/") ? s : `${s}/USDT`;
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
