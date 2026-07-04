<template>
  <div class="add-optional-page">
    <div class="bg-glow bg-glow--1" aria-hidden="true"></div>
    <div class="bg-glow bg-glow--2" aria-hidden="true"></div>

    <header class="add-optional-header">
      <button type="button" class="add-optional-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="add-optional-header__back-icon" />
      </button>
      <h1 class="add-optional-header__title">{{ _t18('quote_addOwn') }}</h1>
    </header>

    <div class="search">
      <img :src="iconSearch" alt="" class="searchImg" />
      <div class="contain">
        <input
          type="text"
          v-model.trim="searchValue"
          class="inputSearch"
          :placeholder="_t18('quote_search')"
          @input="overBtn"
        />
        <button type="button" class="over" @click="overBtn">{{ _t18('quote_finish') }}</button>
      </div>
    </div>

    <div class="currencyList">
      <div
        v-for="(item, index) in currentCoinList"
        :key="item.coinKey || index"
        class="itemEvery"
        @click="linkTo(item)"
      >
        <div class="item">
          <LeftItem :data="item" />
          <CurrentcyNumVue :data="item" />
          <button
            type="button"
            class="collect-btn"
            aria-label="toggle collect"
            @click.stop="handelCollect(item)"
          >
            <svg-load
              :name="item.isCollect === 1 ? 'tianjia18x16-x' : 'tianjia18x16-w'"
              class="rightImg"
            />
          </button>
        </div>
      </div>
    </div>

    <van-overlay :show="show" z-index="100" :custom-style="{ background: 'rgba(0, 0, 0, .6)' }">
      <div class="loading-wrap">
        <van-loading vertical color="rgb(160, 65, 237)">{{ _t18('loading') }}...</van-loading>
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { setCollect, removeCollect } from '@/api/trade'
import { toastApiMsg } from '@/utils/toastApiMsg'
import LeftItem from '@/components/CurrencyList/left.vue'
import CurrentcyNumVue from '../components/optional/currentcyNum.vue'
import { filterKeyWord } from '@/utils/filters'
import { useTradeStore } from '@/store/trade'
import { _t18, _back } from '@/utils/public'
import { useMainStore } from '@/store/index.js'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconSearch from '@/assets/images/gxpex/quote/icon-search.svg'

const show = ref(false)
const tradeStore = useTradeStore()
const mainStroe = useMainStore()
const $router = useRouter()

const allCoinList = computed(() => {
  return (tradeStore.contractCoinList || []).map((item) => ({
    ...item,
    componentName: 'Ustandard',
    coinKey: `${item.coin}|Ustandard`
  }))
})

const searchValue = ref('')
const currentCoinList = ref([])

const overBtn = () => {
  const list = filterKeyWord(allCoinList.value, searchValue.value) || []
  currentCoinList.value = list.map((x) => ({
    ...x,
    coinKey: x.coinKey || `${x.coin}|${x.componentName}`
  }))
}

onMounted(() => {
  currentCoinList.value = allCoinList.value
})

mainStroe.setTradeStatus(Number(-1))

const linkTo = (item) => {
  $router.push({
    path: '/trade',
    query: {
      symbol: item.coin,
      componentName: 'Ustandard'
    }
  })
}

const handelCollect = (item) => {
  show.value = true

  const params = {
    coin: item?.coin,
    componentName: item?.componentName,
    coinKey: item?.coinKey
  }

  if (item.isCollect === 2) {
    params.icon = item?.logo
    setCollect(params).then((res) => {
      if (res.code == '200') {
        tradeStore.getCoinList()
        setTimeout(() => {
          show.value = false
        }, 500)
      } else {
        show.value = false
        toastApiMsg(res.msg)
      }
    })
  } else {
    removeCollect(params).then((res) => {
      if (res.code == '200') {
        tradeStore.getCoinList()
        setTimeout(() => {
          show.value = false
        }, 500)
      } else {
        show.value = false
        toastApiMsg(res.msg)
      }
    })
  }
}

watch(
  allCoinList,
  (list) => {
    const filtered = filterKeyWord(list, searchValue.value) || []
    currentCoinList.value = filtered.map((x) => ({
      ...x,
      coinKey: x.coinKey || `${x.coin}|${x.componentName}`
    }))
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.add-optional-page {
  position: relative;
  min-height: 100vh;
  background: #111111;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
  overflow-x: hidden;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #a642ec 0%, #802bda 60%, transparent 100%);
  filter: blur(60px);
  opacity: 0.18;
  pointer-events: none;
  z-index: 0;

  &--1 {
    top: -80px;
    right: -60px;
    width: 260px;
    height: 260px;
  }

  &--2 {
    top: 200px;
    left: -90px;
    width: 240px;
    height: 240px;
  }
}

.add-optional-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.add-optional-header__back {
  position: absolute;
  left: 12px;
  top: calc(14px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.add-optional-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.add-optional-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.search {
  position: relative;
  z-index: 2;
  margin: 12px 15px 16px;
  height: 40px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  padding: 0 14px;
  align-items: center;

  .searchImg {
    width: 16px;
    height: 16px;
    margin-right: 10px;
    opacity: 0.55;
    flex-shrink: 0;
  }

  .contain {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    min-width: 0;

    .inputSearch {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      color: #fff;
      font-size: 13px;
    }

    .inputSearch::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .over {
      margin-left: 8px;
      padding: 0;
      border: none;
      background: transparent;
      color: rgb(196, 124, 255);
      font-size: 14px;
      font-weight: 500;
      flex-shrink: 0;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
  }
}

.currencyList {
  position: relative;
  z-index: 1;
  padding: 0 12px;

  .itemEvery {
    margin-bottom: 12px;
    padding: 14px 16px;
    background: #221c31;
    border-radius: 12px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    .item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .collect-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      margin-left: 4px;
      border: none;
      background: transparent;
      flex-shrink: 0;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .rightImg {
      width: 16px;
      height: 16px;
    }
  }
}

.currencyList :deep(.left) {
  flex: 1;
  min-width: 0;

  .leftImg {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: contain;
    background: rgba(255, 255, 255, 0.08);
  }

  .itemTitle .itemTitleTop {
    font-size: 14px;
    color: #fff;
    font-weight: 500;
  }
}

.currencyList :deep(.numList) {
  flex-shrink: 0;
  min-width: 72px;

  .numTop {
    font-size: 14px;
    color: #fff;
    font-weight: 500;
  }

  .numBot {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);

    &.rise {
      color: #2ebd85;
    }

    &.fall {
      color: #f6465d;
    }
  }
}

.loading-wrap {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
