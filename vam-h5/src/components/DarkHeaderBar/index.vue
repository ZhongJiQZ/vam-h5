<template>
  <div v-if="topHeight" class="placeholder" />
  <van-sticky>
    <header
      class="dark-header"
      :class="{ border_bottom }"
      :style="{ backgroundColor: bgColor }"
    >
      <div class="left">
        <button
          v-if="showBack"
          type="button"
          class="icon-btn"
          aria-label="back"
          @click="onBack"
        >
          <img :src="backIcon" alt="" class="icon-img" />
        </button>
        <div v-if="title" class="title">{{ title }}</div>
        <slot name="title" />
      </div>
      <div class="right">
        <button
          v-if="right === 'service'"
          type="button"
          class="icon-btn"
          aria-label="service"
          @click="onService"
        >
          <img :src="serviceIcon" alt="" class="icon-img icon-img--service" />
        </button>
        <slot name="right" />
      </div>
    </header>
  </van-sticky>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { dispatchCustomEvent } from '@/utils'
import { _back } from '@/utils/public'
import backIcon from '@/assets/images/back.png'
import serviceIcon from '@/assets/images/service.png'

const router = useRouter()

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  backTo: {
    type: String,
    default: ''
  },
  backwardNum: {
    type: Number,
    default: -1
  },
  showBack: {
    type: Boolean,
    default: true
  },
  /** 右侧区域：传 `service` 显示客服图标，其它或不传则不显示 */
  right: {
    type: String,
    default: ''
  },
  topHeight: {
    type: Boolean,
    default: true
  },
  border_bottom: {
    type: Boolean,
    default: false
  },
  bgColor: {
    type: String,
    default: '#05101a'
  }
})

const emit = defineEmits(['service'])

const onBack = () => {
  if (props.backTo) {
    router.push(props.backTo)
  } else if (props.backwardNum !== -1) {
    router.go(props.backwardNum)
  } else {
    _back()
  }
}

const onService = () => {
  emit('service')
  dispatchCustomEvent('event_serviceChange')
}
</script>

<style lang="scss" scoped>
.placeholder {
  width: 100%;
  height: calc(60px + constant(safe-area-inset-top));
  height: calc(60px + env(safe-area-inset-top, 0px));
}

.dark-header.border_bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.dark-header {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top, 0px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: var(--ex-max-width);
  margin: 0 auto;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  padding-left: 15px;
  padding-right: 15px;
  padding-bottom: 0;
  box-sizing: border-box;

  .left {
    display: flex;
    align-items: center;
    min-width: 0;
    flex: 1;
    gap: 12px;
  }

  .title {
    font-size: 16px;
    font-weight: 500;
    color: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
    gap: 8px;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    margin: -8px;
    border: none;
    background: transparent;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .icon-img {
    display: block;
    width: 22px;
    height: 22px;
    object-fit: contain;
  }

  .icon-img--service {
    width: 28px;
    height: 28px;
  }
}
</style>
