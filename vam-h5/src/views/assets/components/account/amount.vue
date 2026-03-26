<template>
  <div class="userAmount">
    <div class="balance-title-row">
      <p class="balance-title">
        {{ t18Type(type) }}{{ _t18('asset_account', ['ebc']) }}
      </p>
      <div v-if="type === 'plat'" class="header-shortcuts">
        <button
          v-for="(link, i) in headerLinks"
          :key="i"
          type="button"
          class="header-shortcut-btn"
          :aria-label="link.aria"
          @click="_toView(link.path)"
        >
          <img
            :src="isHeaderLinkActive(link.path) ? link.imgActive : link.img"
            alt=""
            class="header-shortcut-img"
          />
        </button>
      </div>
    </div>
    <div class="balance-value-row">
      <p class="userInfo fw-num">{{ _numberWithCommas(amount) }}</p>
      <span class="usdt-chip">USDT</span>
      <svg-load :name="showicon" class="yanjin" @click="handleYanjin"></svg-load>
      <svg-load name="refresh" class="shuaxin" @click="handleShuaxin"></svg-load>
    </div>
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
import imgQianbao from '@/assets/images/assets/qianbao.png'
import imgQianbaoX from '@/assets/images/assets/qianbao-x.png'
import imgWenhao from '@/assets/images/assets/wenhao.png'
import imgWenhaoX from '@/assets/images/assets/wenhao-x.png'
import imgLishi from '@/assets/images/assets/lishi.png'
import imgLishiX from '@/assets/images/assets/lishi-x.png'

const route = useRoute()

const headerLinks = [
  { path: '/myassets', aria: 'myassets', img: imgQianbao, imgActive: imgQianbaoX },
  { path: '/orderCenter', aria: 'orderCenter', img: imgWenhao, imgActive: imgWenhaoX },
  { path: '/assetRecord', aria: 'assetRecord', img: imgLishi, imgActive: imgLishiX },
]

const isHeaderLinkActive = (path) =>
  route.path === path || route.path.startsWith(`${path}/`)

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
  padding: 24px 15px 12px;
  display: flex;
  flex-direction: column;
}

.balance-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.balance-title {
  flex: 1;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #008710;
  line-height: 1.4;
}

.header-shortcuts {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.header-shortcut-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  flex-shrink: 0;
  cursor: pointer;
}

.header-shortcut-img {
  width: 24px;
  height: 24px;
  display: block;
  object-fit: contain;
}

.balance-value-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 10px;
}

.userInfo {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  color: var(--ex-default-font-color);
  line-height: 1.2;
}

.usdt-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  color: #7a8c99;
  background: #eefaf8;
  border-radius: 4px;
}

.yanjin {
  font-size: 16px;
  margin-left: auto;
  color: var(--ex-passive-font-color);
}

.shuaxin {
  font-size: 14px;
  color: var(--ex-passive-font-color);
}

.currencyAbout {
  margin: 0 15px 12px;
  padding: 10px 6px 12px;
  background: #eefaf8;
  border-radius: 10px;
  display: flex;
  text-align: center;

  & > div {
    width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  & > div > p {
    margin: 0;
    font-size: 12px;
    color: var(--ex-passive-font-color);
  }

  .currencyIcon {
    width: 32px;
    height: 32px;
    margin: 0 auto 6px;
    display: block;
    object-fit: contain;
  }
}
</style>
