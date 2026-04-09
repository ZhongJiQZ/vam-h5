/**
 * 礼券 / 体验券活动
 */
import { post } from '@/utils/request'

/** 全局最近领码动态（滚动展示） */
export const giftClaimFeed = (data = {}) => post('/api/giftCertificate/claimFeed', data)

/** 礼券活动批次列表 */
export const giftBatchList = (data = {}) => post('/api/giftCertificate/list', data)

/** 当前用户已领取的兑换码列表 */
export const giftMyCodes = (data = {}) => post('/api/giftCertificate/myCodes', data)

/** 持码兑换 */
export const giftClaim = (data) => post('/api/giftCertificate/claim', data)

/** 达标用户领一条码（里程碑） */
export const giftAllocate = (data) => post('/api/giftCertificate/allocate', data)

/** 充值进度（需 batchId） */
export const giftProgress = (data) => post('/api/giftCertificate/progress', data)
