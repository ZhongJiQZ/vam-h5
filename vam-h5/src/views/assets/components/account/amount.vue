<template>
  <div class="userAmount">
    <div>
      <!-- 账户余额 -->
      <p>{{ t18Type(type) }}{{ _t18('asset_account', ['ebc']) }}(USDT)</p>
      <svg-load :name="showicon" class="yanjin" @click="handleYanjin"></svg-load>
      <svg-load name="refresh" class="shuaxin" @click="handleShuaxin"></svg-load>
    </div>
    <p class="userInfo fw-num">{{ _numberWithCommas(amount) }}</p>
  </div>
  <div class="currencyAbout">
    <div v-for="(item, index) in currencyAbout.filter((items) => {
      return items.isShow
    })" :key="index" @click="toRecharge(item.url)">
      <img v-if="item.img" :src="item.img" class="currencyIcon" alt="" />
      <svg-load v-else :name="item.icon" class="currencyIcon"></svg-load>
      <p>{{ item.title }}</p>
    </div>
  </div>
</template>

<script setup>
import { dispatchCustomEvent } from '@/utils'
import { _t18, _toView } from '@/utils/public'
import { DIFF_RECHARGE_COSTORM } from '@/config/index'
import imgRecharge from '@/assets/images/assets/recharge.png'
import imgWithdraw from '@/assets/images/assets/withdraw.png'
import imgSwap from '@/assets/images/assets/swap.png'
import imgTransfer from '@/assets/images/assets/transfer.png'
const props = defineProps({
  data: {
    type: Object
  },
  amount: {
    type: String
  },
  coin: {
    type: String,
    default: 'USDT'
  },
  type: {
    type: String
  },
  showicon: {
    type: String
  }
})

const emit = defineEmits(['handleYanjin', 'handleShuaxin'])
const handleYanjin = () => {
  emit('handleYanjin')
}
const handleShuaxin = () => {
  emit('handleShuaxin')
}

const currencyAbout = computed(() => {
  let list = []

  if (props.type == 'plat') {
    list = [
      {
        img: imgRecharge,
        title: _t18('asset_recharge', ['latcoin']),
        url: '/recharge',
        isShow: true
      }, //充币
      {
        img: imgWithdraw,
        title: _t18('asset_withdraw', ['latcoin']),
        url: '/withdraw',
        isShow: true
      }, //提币
      { img: imgSwap, title: _t18('asset_swap'), url: '/swap', isShow: true }, //闪兑
      // { icon: 'daikuai', title: _t18('asset_loan'), url: '/loan', isShow: false }, //助力贷
      { img: imgTransfer, title: _t18('asset_transfer'), url: '/transfer', isShow: true } //划转
    ]
  } else {
    list = [
      { img: imgTransfer, title: _t18('asset_transfer'), url: '/transfer', isShow: true },
    ]
  }
  return list
})
/**
 * 点击快捷充币
 */
const toRecharge = (url) => {
  if (DIFF_RECHARGE_COSTORM.includes(__config._APP_ENV) && url == '/recharge') {
    dispatchCustomEvent('event_serviceChange')
  } else {
    _toView(url)
  }
}
const t18Type = (type) => {
  if (type == 'plat') {
    return _t18('asset_platform');
  } else if (type == 'finance') {
    return _t18('asset_finance');
  } else if (type == 'contract') {
    return _t18('asset_contarct');
  }
  return type;
}
</script>

<style lang="scss" scoped>
* {
  font-size: 14px;
  color: var(--ex-default-font-color);
}

.userAmount {
  // margin-top: 61px;
  padding: 30px 15px;
  // border-bottom: 1px solid var(--ex-border-color);
  display: flex;
  flex-direction: column;

  div {
    display: flex;
    align-items: center;
    margin-bottom: 25px;

    .yanjin {
      font-size: 14px;
      margin-left: 15px;
      margin-right: 15px;
    }

    .shuaxin {
      font-size: 12px;
    }

    p {
      font-size: 14px;
      color: var(--ex-passive-font-color);
    }
  }

  &>p {
    font-size: 30px;
  }
}

.currencyAbout {
  padding: 0 5px 20px;
  display: flex;
  text-align: center;

  &>div {
    width: 25%;
  }

  .currencyIcon {
    width: 40px;
    height: 40px;
    margin: 0 auto 10px;
    display: block;
    object-fit: contain;
  }
}
</style>
