<script setup>
import { _t18 } from '@/utils/public'
import { computed } from 'vue'
import { useUserStore } from '@/store/user/index'
import { openCustomerService } from '@/utils/salesmartly'

const userStore = useUserStore()
const emits = defineEmits(['update:value'])
const props = defineProps({
  value: {
    type: Boolean,
    default: false
  },
  data: {
    type: Array,
    default: () => []
  }
})
const show = computed(() => props.value)
/**
 * 跳转客服页面
 * @param {*} href
 */
const toWin = (item) => {
  const href = typeof item === 'string' ? item : item?.url
  if (!href) return
  if (item?.callback) {
    item.callback()
    close()
    return
  }
  openCustomerService({ userInfo: userStore.userInfo, appEnv: __config._APP_ENV })
  close()
}
const close = () => {
  emits('update:value', false)
}
</script>
<template>
  <van-popup
    v-model:show="show"
    @close="close"
    position="bottom"
    round
    :overlay-style="{ background: 'rgba(5, 3, 12, 0.7)' }"
    class="gx-service-popup"
  >
    <div class="popup-content">
      <div class="title">
        <!-- 在线客服 -->
        {{ _t18('home_service') }}
      </div>
      <div class="scroll-container">
        <div class="item-list">
          <div class="item" v-for="(item, index) in data" :key="index" @click="toWin(item)">
            <image-load :filePath="item.imgUrl" class="img" alt="Customer Service" />
          </div>
        </div>
      </div>
      <div class="cancel" @click="close">
        <!-- 取消 -->
        {{ _t18('cancel') }}
      </div>
    </div>
  </van-popup>
</template>

<style lang="scss">
/* van-popup 默认 teleport 到 body，scoped 抓不住，用 className 全局兜底 */
.gx-service-popup.van-popup {
  width: 100%;
  background: #1a1626 !important;
  color: #f5f3f8;
  border-radius: 16px 16px 0 0 !important;
  padding: 20px 0 calc(10px + env(safe-area-inset-bottom, 0));
  box-shadow: 0 -12px 32px rgba(127, 43, 218, 0.18);

  .popup-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    text-align: center;
  }

  .scroll-container {
    margin: 20px 0;
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .item-list {
    padding: 0 20px;
    display: flex;
    gap: 20px;
  }

  .item {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(127, 43, 218, 0.25) 0%, rgba(30, 21, 48, 0.9) 100%);
    border: 1px solid rgba(160, 65, 237, 0.32);
    box-shadow: 0 4px 14px rgba(127, 43, 218, 0.22);
    transition: transform 0.18s ease, box-shadow 0.18s ease;

    &:active {
      transform: scale(0.96);
      box-shadow: 0 2px 8px rgba(127, 43, 218, 0.3);
    }

    .img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
  }

  .cancel {
    width: 100%;
    height: 50px;
    margin-top: 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.78);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &:active {
      color: rgb(196, 124, 255);
    }
  }
}
</style>
