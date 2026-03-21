 
<template>
  <div class="columnFlex">
    <!-- 编辑自选 -->
    <HeaderBar :currentName="_t18('quote_edit')" :cuttentRight="cuttentRight" @linkTo="linkTo" />
    <div class="currencyList">
      <van-checkbox-group v-model="checked" shape="square" @change="change" ref="checkboxGroup">
        <div class="itemEvery" v-for="(item, index) in currentCoinList" :key="index">
          <div class="item">
            <EditLeft :data="item"></EditLeft>
            <CurrentcyNumVue :data="item"></CurrentcyNumVue>
            <!-- <van-checkbox :name="`{id:${item.id},coin:${item.coin},icon:${item.logo}}`"> -->
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
    <div class="editCon">
      <div class="left" @click="delList">
        <svg-load :name="showDel ? 'sanchu16x18-x' : 'sanchu16x18-w'" class="chooseImg"></svg-load>
        <!-- 删除 -->
        <div :style="{ color: showDel ? '#17ac74' : '#bcbcbc', marginLeft: '10px' }">{{ _t18('quote_del') }}</div>
      </div>
      <div class="right">
        <svg-load
          :name="allFlag ? 'gou-x' : 'gou-w'"
          class="chooseImg"
          @click="checkAll"
        ></svg-load>
        <!-- <svg-load :name="allFlag?'gou-x':'gou-w'" class="chooseImg" @click="toggleAll"></svg-load> -->
        <!-- 全选 -->
        <div>{{ _t18('quote_all') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { showToast } from 'vant'
import { _t18 } from '@/utils/public'
import { useToast } from '@/hook/useToast'
import { useTradeStore } from '@/store/trade'
import { useMainStore } from '@/store/index.js'
import { getCollect, setCollectAdds, removeCollectRemoves } from '@/api/trade'

import HeaderBar from '@/components/HeaderBar/index.vue'
import EditLeft from '@/components/CurrencyList/editLeft.vue'
import CurrentcyNumVue from '../components/optional/currentcyNum.vue'

const { _toast } = useToast()

// header 右侧按钮
const cuttentRight = {
  name: _t18('quote_add') // 添加
}

// store
const mainStroe = useMainStore()
mainStroe.setTradeStatus(Number(-1))
const tradeStore = useTradeStore()

// ✅ 所有币种（秒合约 + 现货 + 合约）并带来源 componentName
const allCoinList = computed(() => {
  const withComponent = (list, componentName) =>
    (list || []).map(item => {
      const coin = item.coin
      const coinKey = `${coin}|${componentName}`
      return {
        ...item,
        componentName,
        coinKey,
      }
    })

  return [
    ...withComponent(tradeStore.secondContractCoinList, 'SecondContract'),
    ...withComponent(tradeStore.spotCoinList, 'BBTrading'),
    ...withComponent(tradeStore.contractCoinList, 'Ustandard'),
  ]
})


// 页面币种（你如果后面要搜索，就在这里覆盖成 filterKeyWord 后的结果）
const currentCoinList = ref([])

// 复选框
const checked = ref([])              // ['BTC', 'ETH'...]
const checkboxGroup = ref(null)
const allFlag = ref(false)

// 删除按钮是否可用
const showDel = ref(false)

// 后端收藏列表（getCollect 返回）
const collectList = ref([])

// ✅ 提交新增：[{coin, icon}]
const addList = ref([])

// ✅ 删除用：'1,2,3'
const ids = ref('')

// -------- 获取收藏并设置默认勾选 --------
const getCollectList = async () => {
  const res = await getCollect()
  if (res.code === 200 || res.code === '200') {
    collectList.value = Array.isArray(res.data) ? res.data : []

    // 兼容：如果后端没回 coinKey，就前端拼一个
    collectList.value = collectList.value.map(i => ({
      ...i,
      coinKey: i.coinKey || `${i.coin}|${i.component_name || i.componentName || ''}`,
    }))

    const collectKeySet = new Set(collectList.value.map(i => i.coinKey))

    const temp = []
    currentCoinList.value.forEach((item) => {
      if (collectKeySet.has(item.coinKey)) temp.push(item.coinKey)
    })
    checked.value = temp
  }
}


// -------- checkbox 变化：同步 addList / ids / showDel / allFlag --------
const change = (e) => {
  const arr = Array.isArray(e) ? e : Object.values(e) // arr = ['btc|SecondContract', ...]

  showDel.value = arr.length > 0

  // 1) addList：coinKey -> coin/icon/componentName
  const mapKeyToItem = new Map(currentCoinList.value.map(i => [i.coinKey, i]))
  addList.value = arr
    .map((key) => {
      const itm = mapKeyToItem.get(key)
      if (!itm) return null
      return {
        coin: itm.coin,
        icon: itm.logo,
        componentName: itm.componentName,
        coinKey: itm.coinKey,
      }
    })
    .filter(Boolean)

  // 2) ids：coinKey -> collect表 id
  const mapKeyToCollectId = new Map(collectList.value.map(i => [i.coinKey, i.id]))
  const idArr = arr.map(key => mapKeyToCollectId.get(key)).filter(Boolean)
  ids.value = idArr.join(',')

  // 3) 全选状态
  allFlag.value = currentCoinList.value.length > 0 && arr.length === currentCoinList.value.length
}


// -------- 全选/反选 --------
const checkAll = () => {
  allFlag.value = !allFlag.value
  checkboxGroup.value?.toggleAll(allFlag.value)
}

// -------- header 点击：提交新增 --------
const linkTo = () => {
  setCollectAdds(addList.value).then((res) => {
    if (res.code === 200 || res.code === '200') {
      _toast('quote_addSuccess')
      getCollectList()
      tradeStore.getCoinList()
    } else {
      showToast(res.msg)
      getCollectList()
    }
  })
}

// -------- 删除 --------
const delList = () => {
  // 没勾选 / 没有可删除 id 就不请求
  if (!showDel.value) return
  if (!ids.value) {
    // 说明你勾选的 coin 并不是后端收藏表里已有的记录（或 collectList 还没拉到）
    showToast(_t18('quote_del') + ' ' + _t18('fail') )
    return
  }

  removeCollectRemoves(ids.value).then((res) => {
    if (res.code === 200 || res.code === '200') {
      _toast('quote_addSuccess')
      getCollectList()
      tradeStore.getCoinList()
    } else {
      showToast(res.msg)
      getCollectList()
    }
  })
}

// -------- 生命周期 --------
onMounted(async () => {
  currentCoinList.value = allCoinList.value
  await getCollectList()
})

// ✅ 如果币种列表异步更新（getCoinList 后），自动刷新 currentCoinList & 默认勾选
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
.currencyList {
  flex: 1;
  padding: 20px 15px 0;
  .itemEvery {
    padding-bottom: 30px;
    .item {
      display: flex;
      align-items: center;
      .van-checkbox {
        padding: 2px 0;
      }
      .rightImg {
        margin-left: 10px;
        width: 18px;
        height: 18px;
      }
    }
  }
}
.search {
  margin: 20px 15px;
  height: 50px;
  background: var(--ex-default-background-color);
  border-radius: 25px;
  border: 1px solid var(--ex-border-color);
  display: flex;
  padding: 0 20px;
  align-items: center;
  justify-content: space-between;
  .searchImg {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
  .contain {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: var(--ex-font-color6);
    .inputSearch {
      flex: 1;
    }
    input::-webkit-input-placeholder {
      color: var(--ex-font-color5);
    }
    input::-moz-input-placeholder {
      color: var(--ex-font-color5);
    }
    input::-ms-input-placeholder {
      color: var(--ex-font-color5);
    }
    .over {
      margin-left: 5px;
      color: var(--ex-font-color9);
    }
  }
}
.placeholder {
  height: 65px;
}
.editCon {
  position: fixed;
  width: 100%;
  background-color: var(--ex-default-background-color);
  bottom: 0;
  z-index: 9;
  border-top: 1px solid var(--ex-border-color);
  height: 64px;
  display: flex;
  padding: 0 15px;
  align-items: center;
  font-size: 14px;
  justify-content: space-between;
  .left {
    display: flex;
    align-items: center;
    color: var(--ex-font-color9);
    .delectImg {
      width: 16px;
      height: 18px;
      margin-right: 10px;
    }
  }
  .right {
    display: flex;
    align-items: center;
    color: var(--ex-default-font-color);
    .chooseImg {
      width: 18px;
      height: 18px;
      margin-right: 12px;
    }
  }
}
</style>
