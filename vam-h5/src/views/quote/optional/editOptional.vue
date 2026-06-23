<template>
  <div class="edit-optional-page">
    <div class="bg-glow bg-glow--1" aria-hidden="true"></div>
    <div class="bg-glow bg-glow--2" aria-hidden="true"></div>

    <header class="edit-optional-header">
      <button type="button" class="edit-optional-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="edit-optional-header__back-icon" />
      </button>
      <h1 class="edit-optional-header__title">{{ _t18('quote_edit') }}</h1>
      <button type="button" class="edit-optional-header__action" @click="linkTo">
        {{ _t18('quote_add') }}
      </button>
    </header>

    <div class="currencyList">
      <van-checkbox-group v-model="checked" shape="square" @change="change" ref="checkboxGroup">
        <div
          v-for="(item, index) in currentCoinList"
          :key="item.coinKey || index"
          class="itemEvery"
        >
          <div class="item">
            <EditLeft :data="item" />
            <CurrentcyNumVue :data="item" />
            <van-checkbox :name="item.coinKey">
              <template #icon="props">
                <svg-load class="rightImg" :name="props.checked ? 'gou-x' : 'gou-w'" />
              </template>
            </van-checkbox>
          </div>
        </div>
      </van-checkbox-group>
    </div>

    <div class="placeholder"></div>

    <footer class="editCon">
      <button type="button" class="editCon__left" :class="{ 'is-active': showDel }" @click="delList">
        <svg-load :name="showDel ? 'sanchu16x18-x' : 'sanchu16x18-w'" class="chooseImg" />
        <span>{{ _t18('quote_del') }}</span>
      </button>
      <button type="button" class="editCon__right" @click="checkAll">
        <svg-load :name="allFlag ? 'gou-x' : 'gou-w'" class="chooseImg" />
        <span>{{ _t18('quote_all') }}</span>
      </button>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { showToast } from 'vant'
import { _t18, _back } from '@/utils/public'
import { toastApiMsg } from '@/utils/toastApiMsg'
import { useToast } from '@/hook/useToast'
import { useTradeStore } from '@/store/trade'
import { useMainStore } from '@/store/index.js'
import { getCollect, setCollectAdds, removeCollectRemoves } from '@/api/trade'
import EditLeft from '@/components/CurrencyList/editLeft.vue'
import CurrentcyNumVue from '../components/optional/currentcyNum.vue'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'

const { _toast } = useToast()

const mainStroe = useMainStore()
mainStroe.setTradeStatus(Number(-1))
const tradeStore = useTradeStore()

const allCoinList = computed(() => {
  const withComponent = (list, componentName) =>
    (list || []).map((item) => {
      const coin = item.coin
      const coinKey = `${coin}|${componentName}`
      return {
        ...item,
        componentName,
        coinKey
      }
    })

  return [
    ...withComponent(tradeStore.secondContractCoinList, 'SecondContract'),
    ...withComponent(tradeStore.spotCoinList, 'BBTrading'),
    ...withComponent(tradeStore.contractCoinList, 'Ustandard')
  ]
})

const currentCoinList = ref([])
const checked = ref([])
const checkboxGroup = ref(null)
const allFlag = ref(false)
const showDel = ref(false)
const collectList = ref([])
const addList = ref([])
const ids = ref('')

const getCollectList = async () => {
  const res = await getCollect()
  if (res.code === 200 || res.code === '200') {
    collectList.value = Array.isArray(res.data) ? res.data : []

    collectList.value = collectList.value.map((i) => ({
      ...i,
      coinKey: i.coinKey || `${i.coin}|${i.component_name || i.componentName || ''}`
    }))

    const collectKeySet = new Set(collectList.value.map((i) => i.coinKey))

    const temp = []
    currentCoinList.value.forEach((item) => {
      if (collectKeySet.has(item.coinKey)) temp.push(item.coinKey)
    })
    checked.value = temp
  }
}

const change = (e) => {
  const arr = Array.isArray(e) ? e : Object.values(e)

  showDel.value = arr.length > 0

  const mapKeyToItem = new Map(currentCoinList.value.map((i) => [i.coinKey, i]))
  addList.value = arr
    .map((key) => {
      const itm = mapKeyToItem.get(key)
      if (!itm) return null
      return {
        coin: itm.coin,
        icon: itm.logo,
        componentName: itm.componentName,
        coinKey: itm.coinKey
      }
    })
    .filter(Boolean)

  const mapKeyToCollectId = new Map(collectList.value.map((i) => [i.coinKey, i.id]))
  const idArr = arr.map((key) => mapKeyToCollectId.get(key)).filter(Boolean)
  ids.value = idArr.join(',')

  allFlag.value = currentCoinList.value.length > 0 && arr.length === currentCoinList.value.length
}

const checkAll = () => {
  allFlag.value = !allFlag.value
  checkboxGroup.value?.toggleAll(allFlag.value)
}

const linkTo = () => {
  setCollectAdds(addList.value).then((res) => {
    if (res.code === 200 || res.code === '200') {
      _toast('quote_addSuccess')
      getCollectList()
      tradeStore.getCoinList()
    } else {
      toastApiMsg(res.msg)
      getCollectList()
    }
  })
}

const delSubmitting = ref(false)

const delList = () => {
  if (!showDel.value) return
  if (delSubmitting.value) return
  if (!ids.value) {
    showToast(_t18('quote_del') + ' ' + _t18('fail'))
    return
  }

  delSubmitting.value = true
  removeCollectRemoves(ids.value)
    .then((res) => {
      if (res.code === 200 || res.code === '200') {
        _toast('quote_addSuccess')
        getCollectList()
        tradeStore.getCoinList()
      } else {
        toastApiMsg(res.msg)
        getCollectList()
      }
    })
    .finally(() => {
      delSubmitting.value = false
    })
}

onMounted(async () => {
  currentCoinList.value = allCoinList.value
  await getCollectList()
})

watch(
  allCoinList,
  async (list) => {
    currentCoinList.value = list
    await getCollectList()
  },
  { immediate: false }
)
</script>

<style lang="scss" scoped>
.edit-optional-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #111111;
  color: #f5f3f8;
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

.edit-optional-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.edit-optional-header__back {
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

.edit-optional-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.edit-optional-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.edit-optional-header__action {
  position: absolute;
  right: 14px;
  top: calc(14px + env(safe-area-inset-top));
  padding: 4px 0;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: rgb(196, 124, 255);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.currencyList {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 12px 12px 0;
  overflow: auto;

  .itemEvery {
    margin-bottom: 12px;
    padding: 14px 16px;
    background: #221c31;
    border-radius: 12px;

    .item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    :deep(.van-checkbox) {
      flex-shrink: 0;
      padding: 2px 0;
    }

    :deep(.van-checkbox__icon) {
      height: auto;
      line-height: 1;
    }

    .rightImg {
      width: 18px;
      height: 18px;
    }
  }
}

.currencyList :deep(.editLeft) {
  flex: 1;
  min-width: 0;

  .leftImg {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: contain;
    background: rgba(255, 255, 255, 0.08);
  }

  .leftNames {
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

.placeholder {
  height: calc(72px + env(safe-area-inset-bottom, 0));
  flex-shrink: 0;
}

.editCon {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
  max-width: var(--ex-max-width);
  margin: 0 auto;
  background: #1a1325;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  min-height: 64px;
  padding: 0 15px calc(10px + env(safe-area-inset-bottom, 0));
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  box-sizing: border-box;
}

.editCon__left,
.editCon__right {
  display: flex;
  align-items: center;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.editCon__left {
  color: rgba(255, 255, 255, 0.45);

  &.is-active {
    color: rgb(196, 124, 255);
  }

  .chooseImg {
    width: 16px;
    height: 18px;
    margin-right: 10px;
  }
}

.editCon__right {
  color: #fff;

  .chooseImg {
    width: 18px;
    height: 18px;
    margin-right: 12px;
  }
}
</style>
