import request from "@/router/axios";

export const giftClaimFeed = (data = {}) =>
  request({
    url: "/api/giftCertificate/claimFeed",
    method: "post",
    data,
  });

export const giftBatchList = (data = {}) =>
  request({
    url: "/api/giftCertificate/list",
    method: "post",
    data,
  });

export const giftMyCodes = (data = {}) =>
  request({
    url: "/api/giftCertificate/myCodes",
    method: "post",
    data,
  });

export const giftClaim = (data) =>
  request({
    url: "/api/giftCertificate/claim",
    method: "post",
    data,
  });

export const giftAllocate = (data) =>
  request({
    url: "/api/giftCertificate/allocate",
    method: "post",
    data,
  });

export const giftProgress = (data) =>
  request({
    url: "/api/giftCertificate/progress",
    method: "post",
    data,
  });
