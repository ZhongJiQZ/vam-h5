import request from "@/router/axios";

export const getCopyTradeConfig = () =>
  request({
    url: "/api/copyTrade/config",
    method: "post",
  });

export const getCopyTradeStrategyList = () =>
  request({
    url: "/api/copyTrade/strategyList",
    method: "post",
  });

export const submitCopyTrade = (data) =>
  request({
    url: "/api/copyTrade/submit",
    method: "post",
    data,
  });

export const exitCopyTrade = (data) =>
  request({
    url: "/api/copyTrade/exit",
    method: "post",
    data,
  });

export const getCopyTradeList = ({ pageNum = 1, pageSize = 10, status } = {}) => {
  const statusQuery = status === undefined || status === null ? "" : `&status=${status}`;
  return request({
    url: `/api/copyTrade/list?pageNum=${pageNum}&pageSize=${pageSize}${statusQuery}`,
    method: "post",
  });
};

export const getCopyTradeDetail = (id) =>
  request({
    url: `/api/copyTrade/detail/${id}`,
    method: "post",
  });
