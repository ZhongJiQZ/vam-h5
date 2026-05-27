export default [
  {
    path: '/copy-trade',
    name: 'CopyTrade',
    component: () => import('@/views/copyTrade/index.vue')
  },
  {
    path: '/copy-trade/submit',
    name: 'CopyTradeSubmit',
    component: () => import('@/views/copyTrade/submit.vue')
  },
  {
    path: '/copy-trade/my',
    name: 'MyCopyTrade',
    component: () => import('@/views/copyTrade/my.vue')
  },
  {
    path: '/copy-trade/detail',
    name: 'CopyTradeDetail',
    component: () => import('@/views/copyTrade/detail.vue')
  }
]
