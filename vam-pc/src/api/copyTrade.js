import request from "@/router/axios";

const get = (url) =>
  request({
    url,
    method: "get",
  });

const post = (url, data) =>
  request({
    url,
    method: "post",
    data: data || {},
  });

export const getCopyTradeConfig = () => post("/api/copyTrade/config");

export const getCopyTradeStrategyList = (data) => post("/api/copyTrade/strategyList", data);

export const getCopyTradeInstitutionStrategyList = (data) =>
  post("/api/copyTrade/institutionStrategyList", data);

export const getCopyTradeStrategyDetail = (data) => post("/api/copyTrade/strategyDetail", data);

export const getCopyTradeDocuments = (data) => post("/api/copyTrade/documents", data);

export const submitCopyTrade = (data) => post("/api/copyTrade/submit", data);

export const exitCopyTrade = (data) => post("/api/copyTrade/exit", data);

export const appendCopyTrade = (data) => post("/api/copyTrade/append", data);

export const getCopyTradeList = (params = {}) => post("/api/copyTrade/list", params);

export const getCopyTradeDetail = (id, status = 0) =>
  get(`/api/copyTrade/detail/${id}?status=${Number(status)}`);

export const getCopyTradeInstitutionList = (data) =>
  post("/api/copyTrade/institutionList", data);

export const getCopyTradeInstitutionDetail = (data) =>
  post("/api/copyTrade/institutionDetail", data);

export const subscribeCopyTradeInstitution = (data) =>
  post("/api/copyTrade/institutionSubscribe", data);

export const getCopyTradeInstitutionPerformance = (data) =>
  post("/api/copyTrade/institutionPerformance", data);

export const getCopyTradeInstitutionDailyChart = (data) =>
  post("/api/copyTrade/institutionDailyChart", data);

export const getCopyTradeInstitutionWeeklyChart = (data) =>
  post("/api/copyTrade/institutionWeeklyChart", data);

export const getCopyTradeMyPerformance = (data) => post("/api/copyTrade/myPerformance", data);

export const getCopyTradeMyDailyChart = (data) => post("/api/copyTrade/myDailyChart", data);

export const getCopyTradeMyWeeklyChart = (data) => post("/api/copyTrade/myWeeklyChart", data);

export const getCopyTradeInstitutionCoinPreference = (data) =>
  post("/api/copyTrade/institutionCoinPreference", data);

export const getCopyTradeMyCoinPreference = (data) =>
  post("/api/copyTrade/myCoinPreference", data);
