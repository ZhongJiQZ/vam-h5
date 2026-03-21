/**
 * 未登录 可访问
 */
export const noLoginRouterList = [
  //'/',
  // '/home', // home
  '/sign-in', 
  '/sign-up', //  
  '/forgot-password', // 
  //'/no-wallet', // no wallet
  //'/app-download', //
  // '/quote', //market
  '/language-selection', //multi language
  // '/help', //help
  // '/term-service', //service
  // '/aboutus',
  // '/service', //customer service
  // '/broadcastDetails', // broadcast
  '/termsOfuse',
  '/privacyPolicy'
]

/**
 * 登录后
 */
export const hasLoginRouterList = [
  '/recharge', 
  '/withdraw',
  '/swap', // 兑换
  '/plug', // 推广中心
  '/myassets', // 资产
  '/financial', // 理财
  '/loan', // 助力贷
  '/trade', // 交易
  '/certification-primary', //初级认证
  '/certification-advanced', //高级认证
  '/bind-card', //绑定银行卡
  '/fund-password', //设置资金密码
  '/change-password', //修改登录密码
  '/email-authentication', //邮箱认证
  '/defi', //defi挖矿
  '/pledge', //质押挖矿
  '/addAddress' // 新增钱包地址
]
