import { defineStore } from 'pinia'
import { getCoinListApi, getMt5Amount } from '@/api/trade/index.js'
import { socketDict } from '@/config/dict'
import { _div, _sub, _mul, priceFormat, _toFixed } from '@/utils/decimal'
import { _coinWebSocket } from '@/plugin/socket/index'
// ⚠️ 确保你项目里有 PubSub 引入
//  import PubSub from 'pubsub-js'

export const useTradeStore = defineStore('trade', {
  state: () => ({
    allCoinPriceInfo: {},          // ✅ 不要 reactive({})
    secondContractCoinList: [],    // ✅ 不要 reactive([])
    spotCoinList: [],
    contractCoinList: [],
    currentCoinList: [],
    klineTicker: {},

    // ✅ 单独存订阅 token，避免和登录 token 冲突
    detailSubToken: null
  }),

  actions: {
    setKlineTicker(klineTicker) {
      this.klineTicker = klineTicker
    },

    setCurrentCoinList(val, type) {
      if (!val) return
      if (type === 'remove') {
        this.currentCoinList = this.currentCoinList.filter((elem) => elem !== val)
      } else if (!this.currentCoinList.includes(val)) {
        this.currentCoinList.push(val)
      }
    },

    async getCoinList() {
      const res = await getCoinListApi()

      // ✅ 清空列表（一次就够了）
      this.secondContractCoinList.splice(0)
      this.spotCoinList.splice(0)
      this.contractCoinList.splice(0)

      const keyMap = {
        coinList: 'secondContractCoinList',
        currencyList: 'spotCoinList',
        contractList: 'contractCoinList'
      }

      const tempAllCoinPriceInfo = {}

      for (const key in keyMap) {
        const list = Array.isArray(res?.data?.[key]) ? res.data[key] : []
        list.forEach((elem) => {
          elem.baseCoinUpperCase = elem.baseCoin?.toLocaleUpperCase?.() || ''
          elem.coinUpperCase = elem.coin?.toLocaleUpperCase?.() || ''
          elem.symbolUpperCase =
            elem.customizeFlag === 2 ? elem.showSymbol : (elem.symbol?.toLocaleUpperCase?.() || '')

          if (elem.market !== 'mt5' && elem.coin) {
            elem.coin = elem.coin.toLocaleLowerCase()
          }

          this[keyMap[key]].push(elem)

          let change = '0.00'
          try {
            if (elem.amount > 0 && elem.open > 0) {
              change = _toFixed(
                Math.abs(_mul(_div(_sub(elem.amount, elem.open), elem.open), 100)),
                2
              )
            }
          } catch (e) {}

          tempAllCoinPriceInfo[elem.coin] = {
            close: priceFormat(elem.amount),
            openPrice: priceFormat(elem.open), // ✅ 24h open（或初始 open）
            change,
            priceChangePercent: change
          }
        })
      }

      // ✅ 合并进 state
      Object.assign(this.allCoinPriceInfo, tempAllCoinPriceInfo);

      // ✅ MT5 volume2：异步回来要直接写 state
      [...this.secondContractCoinList, ...this.spotCoinList, ...this.contractCoinList].forEach((elem) => {
        if (elem.coinType === 3) {
          const coin = elem.coin
          getMt5Amount(coin).then((r) => {
            if (r?.code == '200' && this.allCoinPriceInfo[coin]) {
              this.allCoinPriceInfo[coin].volume2 = r.data
              // 顺便给 volume24
              this.allCoinPriceInfo[coin].volume24 = r.data
            }
          })
        }
      })

      if (!Object.keys(this.allCoinPriceInfo).length) return

      _coinWebSocket.send({ op: socketDict.subscribe, type: socketDict.DETAIL })

      // ✅ 取消旧订阅
      if (this.detailSubToken) {
        PubSub.unsubscribe(this.detailSubToken)
        this.detailSubToken = null
      }

      this.detailSubToken = PubSub.subscribe(socketDict.DETAIL, (key, data) => {
        const symbol = (data.symbol === 'XAU') ? 'xau' : data.symbol
        const tempData = data?.data?.tick || data?.data || {}

        if (!this.allCoinPriceInfo[symbol]) return

        // ✅ 统一构造
        const tempObj = {
          open: priceFormat(tempData.open),
          close: priceFormat(tempData.close),
          low: tempData.low,
          high: tempData.high,
          volume: tempData.vol
        }

        // ✅ MT5 volume2 覆盖
        if (this.allCoinPriceInfo[symbol]?.volume2) {
          tempObj.volume = this.allCoinPriceInfo[symbol].volume2
          tempObj.volume24 = this.allCoinPriceInfo[symbol].volume2
        }

        // ✅ 当天开盘价：判断 store 里的 openPrice（不是 tempObj.openPrice）
        const existOpenPrice = this.allCoinPriceInfo[symbol]?.openPrice
        if (!data.origin && (!existOpenPrice || Number(existOpenPrice) <= 0)) {
          this.allCoinPriceInfo[symbol].openPrice = tempObj.open
        }

        // ✅ 非 kline 的 detail：只更新 24h 高低量，不要每次覆盖 openPrice
        if (data.origin !== 'kline') {
          tempObj.volume24 = tempData.vol
          tempObj.high24 = tempData.high
          tempObj.low24 = tempData.low
        }

        // ✅ 写回 allCoinPriceInfo
        // 注意：你原来用 abs，涨跌方向会丢；如果你 UI 需要方向，去掉 abs
        const info = this.allCoinPriceInfo[symbol]
        const openPriceFor24h = Number(info.openPrice) > 0 ? Number(info.openPrice) : Number(tempObj.open)

        if (Number(tempObj.close) > 0 && openPriceFor24h > 0) {
          const priceChangePercent = _toFixed(
            Math.abs(_mul(_div(_sub(tempObj.close, openPriceFor24h), openPriceFor24h), 100)),
            2
          )
          tempObj.priceChangePercent = Math.abs(priceChangePercent) < 0.01 ? '0.01' : priceChangePercent
        }

        if (Number(tempObj.close) > 0 && Number(tempObj.open) > 0) {
          const tempChange = _toFixed(
            Math.abs(_mul(_div(_sub(tempObj.close, tempObj.open), tempObj.open), 100)),
            2
          )
          tempObj.change = Math.abs(tempChange) < 0.01 ? '0.01' : tempChange
        }

        for (const k in tempObj) info[k] = tempObj[k]
      })
    }
  }
})
