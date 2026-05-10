import { getCoinListApi, getMt5Amount } from '@/api/trade';
import { socketDict } from '@/config/dict';
import { _div, _sub, _mul, priceFormat, _toFixed } from '@/util/utildecimal';
import { _coinWebSocket } from '@/socket/index'
import PubSub from 'pubsub-js'

/** 订阅 token，重复 getCoinList 时先取消 */
let detailSubToken = null

/** 涨跌幅百分比（已乘 100）：带符号 priceChangePercent + 绝对值 change */
function normalizeSignedPercent(n) {
  if (isNaN(n)) {
    return null
  }
  const absN = Math.abs(n)
  let priceChangePercent
  if (absN === 0) {
    priceChangePercent = _toFixed(0, 2)
  } else if (absN < 0.01) {
    priceChangePercent = n < 0 ? '-0.01' : '0.01'
  } else {
    priceChangePercent = _toFixed(n, 2)
  }
  const change = absN === 0 ? _toFixed(0, 2) : absN < 0.01 ? '0.01' : _toFixed(absN, 2)
  return { priceChangePercent, change }
}

/** 后端 changeRate24h 已是百分比数值（例如 1.23 表示 1.23%） */
function formatFromChangeRate24h(changeRate24h) {
  if (changeRate24h === undefined || changeRate24h === null || changeRate24h === '') {
    return null
  }
  const raw = Number(changeRate24h)
  if (isNaN(raw)) {
    return null
  }
  const n = raw
  return normalizeSignedPercent(n)
}

const trade = {
    state: {
        /**
         * 币种价格列表（所有）
        */
        allCoinPriceInfo: {},
        /**
          秒合约 币种列表
        */
        secondContractCoinList: [],
        /**
          币币 币种列表
        */
        spotCoinList: [],
        /**
         U本位 币种列表
       */
        contractCoinList: [],
        /**
        * 当前币种
        */
        currentCoinList: [],
        /**
        * 24小时成交
        */
        klineTicker: {}
    },
    mutations: {
        // 相当于 Vue 3 中的 setKlineTicker
        SET_KLINE_TICKER(state, klineTicker) {
            Vue.set(state, 'klineTicker', klineTicker);
        },
        SET_CURRENT_COIN_LIST(state, { val, type }) {
            if (type === 'remove') {
                state.currentCoinList = state.currentCoinList.filter(elem => elem !== val);
            } else if (!state.currentCoinList.includes(val)) {
                state.currentCoinList.push(val);
            }
        },
        SET_COIN_LISTS(state, { key, list }) {
            // 这里直接设置key对应的状态为list，不需要使用Vue.set
            state[key] = list;
        },
        UPDATE_ALL_COIN_PRICE_INFO(state, tempAllCoinPriceInfo) {
            state.allCoinPriceInfo = { ...state.allCoinPriceInfo, ...tempAllCoinPriceInfo };
        },
        UPDATE_COIN_INFO(state, { symbol, tempObj }) {
            if (!state.allCoinPriceInfo[symbol]) {
                // 如果该币种还没有任何信息，则先初始化为一个空对象
                Vue.set(state.allCoinPriceInfo, symbol, {});
            }

            Object.keys(tempObj).forEach(key => {
                // 为symbol对应的对象中的每个键更新或设置新值
                Vue.set(state.allCoinPriceInfo[symbol], key, tempObj[key]);
            });
        },
    },
    actions: {
        async getCoinList({ state, commit }) {
            try {
                const res = await getCoinListApi();
                let keyMap = {
                    coinList: 'secondContractCoinList',
                    currencyList: 'spotCoinList',
                    contractList: 'contractCoinList'
                };
                let tempAllCoinPriceInfo = {};

                commit('SET_COIN_LISTS', { key: 'secondContractCoinList', list: [] });
                commit('SET_COIN_LISTS', { key: 'spotCoinList', list: [] });
                commit('SET_COIN_LISTS', { key: 'contractCoinList', list: [] });

                for (const key in keyMap) {

                    if (Object.prototype.hasOwnProperty.call(res.data.data, key)) {
                        const tempList = res.data.data[key];

                        const tempListArray = [];

                        tempList.forEach((elem) => {
                            elem.baseCoinUpperCase = elem.baseCoin.toUpperCase();
                            elem.coinUpperCase = elem.coin.toUpperCase();
                            elem.symbolUpperCase = elem.customizeFlag === 2 ? elem.showSymbol : elem.symbol.toUpperCase();
                            if (elem.market !== 'mt5') {
                                elem.coin = elem.coin.toLowerCase();
                            }
                            tempListArray.push(elem);

                            let change = '0.00';
                            let priceChangePercent = '0.00';
                            const fromApiRate = formatFromChangeRate24h(elem.changeRate24h)
                            if (fromApiRate != null) {
                                change = fromApiRate.change
                                priceChangePercent = fromApiRate.priceChangePercent
                            } else {
                                try {
                                    if (elem.amount > 0 && elem.open > 0) {
                                        const n = _mul(_div(_sub(elem.amount, elem.open), elem.open), 100)
                                        const norm = normalizeSignedPercent(n)
                                        if (norm) {
                                            change = norm.change
                                            priceChangePercent = norm.priceChangePercent
                                        }
                                    }
                                } catch (error) { }
                            }

                            tempAllCoinPriceInfo[elem.coin] = {
                                close: priceFormat(elem.amount),
                                openPrice: priceFormat(elem.open),
                                change,
                                priceChangePercent
                            };

                            if (elem.coinType === 3) {
                                const coinSym = elem.coin;
                                getMt5Amount(coinSym).then((apiRes) => {
                                    if (apiRes?.data?.code === '200' && state.allCoinPriceInfo[coinSym]) {
                                        commit('UPDATE_COIN_INFO', {
                                            symbol: coinSym,
                                            tempObj: { volume2: apiRes.data, volume24: apiRes.data },
                                        })
                                    }
                                });
                            }
                        });
                        commit('SET_COIN_LISTS', { key: keyMap[key], list: tempListArray });
                    }
                }
                commit('UPDATE_ALL_COIN_PRICE_INFO', tempAllCoinPriceInfo);


                if (!Object.keys(state.allCoinPriceInfo).length) {
                    return
                }

                _coinWebSocket.send({
                    op: socketDict.subscribe,
                    type: socketDict.DETAIL
                })

                if (detailSubToken != null) {
                    PubSub.unsubscribe(detailSubToken)
                    detailSubToken = null
                }

                detailSubToken = PubSub.subscribe(socketDict.DETAIL, (msgKey, data) => {
                    const symbol = data.symbol === 'XAU' ? 'xau' : data.symbol;
                    const tempData = data.data?.tick ?? data.data ?? {};

                    if (!state.allCoinPriceInfo[symbol]) {
                        return
                    }

                    const tempObj = {
                        open: priceFormat(tempData.open),
                        close: priceFormat(tempData.close),
                        low: tempData.low,
                        high: tempData.high,
                        volume: tempData.vol
                    };

                    if (state.allCoinPriceInfo[symbol].volume2) {
                        tempObj.volume = state.allCoinPriceInfo[symbol].volume2
                        tempObj.volume24 = state.allCoinPriceInfo[symbol].volume2
                    }

                    const existOpenPrice = state.allCoinPriceInfo[symbol].openPrice
                    if (!data.origin && (!existOpenPrice || Number(existOpenPrice) <= 0)) {
                        commit('UPDATE_COIN_INFO', { symbol, tempObj: { openPrice: tempObj.open } });
                    }

                    if (data.origin !== 'kline') {
                        tempObj.volume24 = tempData.vol
                        tempObj.high24 = tempData.high24h
                        tempObj.low24 = tempData.low24h
                    }

                    const info = state.allCoinPriceInfo[symbol]
                    const fromSocketRate = formatFromChangeRate24h(tempData.changeRate24h)
                    if (fromSocketRate) {
                        tempObj.priceChangePercent = fromSocketRate.priceChangePercent
                        tempObj.change = fromSocketRate.change
                    } else {
                        const openPriceFor24h = Number(info.openPrice) > 0 ? Number(info.openPrice) : Number(tempObj.open)

                        if (Number(tempObj.close) > 0 && openPriceFor24h > 0) {
                            const n = _mul(_div(_sub(tempObj.close, openPriceFor24h), openPriceFor24h), 100)
                            const norm = normalizeSignedPercent(n)
                            if (norm) {
                                tempObj.priceChangePercent = norm.priceChangePercent
                                tempObj.change = norm.change
                            }
                        }
                    }

                    commit('UPDATE_COIN_INFO', { symbol, tempObj })
                })
            } catch (error) {
                // 处理错误
            }
        }
    },
};

export default trade
