<template>
  <div class="withdraw-list">
    <p class="section-title">{{ _t18('coinList') }}</p>
    <div class="list">
      <div
        v-for="(item, index) in props.data"
        :key="index"
        class="list-row"
        role="button"
        tabindex="0"
        @click="toClick(item)"
      >
        <div class="left">
          <svg-load :name="item.icon" class="coin"></svg-load>
          <span class="coin-name">{{ item.title }}</span>
        </div>
        <van-icon name="arrow" class="chevron" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { _t18 } from '@/utils/public'
import { useToast } from '@/hook/useToast'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'

const { _toast } = useToast()
const router = useRouter()
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const flag = ref(true)
const userStore = useUserStore()
userStore.getUserInfo()
const { userInfo } = storeToRefs(userStore)
const primaryAuth = ref(userInfo.value.detail?.auditStatusPrimary)

const needPrimary = (item) => {
  if (primaryAuth.value !== '1') {
    _toast('please_primary')
    setTimeout(() => {
      router.push('/certification-primary')
    }, 800)
  } else {
    flag.value = true
  }
}

const toClick = (item) => {
  if (item.type == 1) {
    if (['paxpay'].includes(__config._APP_ENV)) {
      flag.value = false
      needPrimary(item)
    } else {
      flag.value = true
    }
    if (flag.value) {
      let params = ``
      if (item.fee && item.fee > 0) {
        params = `type=${item.card || item.title}&icon=${item.icon}&ratio=${item.ratio}&fee=${item.fee}`
      } else {
        params = `type=${item.card || item.title}&icon=${item.icon}&ratio=${item.ratio}`
      }
      setTimeout(() => {
        router.push(`/withdraw-apply?${params}`)
      }, 200)
    }
  } else if (item.type == 2) {
    if (['paxpay'].includes(__config._APP_ENV)) {
      needPrimary(item)
    } else {
      flag.value = true
    }
    if (flag.value) {
      router.push(`/withdraw-apply?type=银行卡&icon=${item.icon}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.withdraw-list {
  padding: 0;
}

.section-title {
  font-size: 14px;
  color: #969799;
  margin: 0 0 16px;
  text-align: left;
  line-height: 1.4;
}

.list-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  min-height: 52px;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.left {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
}

.coin {
  flex-shrink: 0;
  font-size: 32px;
  margin-right: 14px;
}

.coin-name {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  flex-shrink: 0;
  color: #c8c9cc;
  font-size: 16px;
  margin-left: 8px;
}
</style>
