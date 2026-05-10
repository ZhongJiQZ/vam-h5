<!-- 站内信弹窗 -->
<script setup>
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import { haveRead } from '@/api/info'
import { _t18 } from '@/utils/public'

const noRemind = ref(false)

const props = defineProps({
  data: {
    type: Array,
    default: []
  },
  show: {
    type: Boolean,
    default: false
  }
})
watch(
  () => props.show,
  (open) => {
    if (open) {
      noRemind.value = false
    }
  }
)
const emit = defineEmits(['closeBtn'])
const closeBtn = () => {
  emit('closeBtn')
  if (noRemind.value) {
    readMsgs()
  }
}
console.log(props.data)
const readMsgs = () => {
  // let str = ''
  // props.data.forEach((item, index) => {
  //   if (item.type == '1') {
  //     str += item.id + ','
  //   }
  // })
  let ids = props.data.map(item => item.id).join(',')
  let params = `ids=${ids}`
  // if (str.length > 0) {
    haveRead(params).then((res) => {
      if (res.code == '200') {
        showToast(res.msg)
      } else {
        showToast(res.msg)
      }
    })
  // }
}
</script>
<template>
  <div>
    <van-popup v-model:show="props.show" :close-on-click-overlay="false" close round>
      <div class="popup-box">
        <div class="head">
          <div class="title fw-bold">
            <!-- 通知 -->
            {{ _t18('notify') }}
          </div>
          <!-- type 2全站消息 1指定用户消息 -->
        </div>

        <div class="conn">
          <div v-for="item in data" :key="item.id">
            <div class="title fw-bold">{{ item.title }}</div>
            <div class="txt" v-html="item.content"></div>
          </div>
        </div>
        <div class="no-remind-row">
          <van-checkbox
            v-model="noRemind"
            class="no-remind-checkbox"
            shape="square"
            icon-size="18px"
          >
            {{ _t18('notify_no_remind') }}
          </van-checkbox>
        </div>
        <div class="btnBox" @click="closeBtn">
          <p class="fw-bold">{{ _t18('btnConfirm') }}</p>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<style lang="scss" scoped>
:deep(.van-popup) {
  background-color: var(--ex-home-notice-bgcolor);
}
.popup-box {
  width: 340px;
  font-size: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .head {
    position: relative;
    .title {
      text-align: center;
      padding: 20px 0;
      font-size: 20px;
    }
    .close {
      position: absolute;
      top: 20px;
      right: 15px;
      .guanbi {
        font-size: 20px;
      }
    }
  }
  .conn {
    flex: 1 1 auto;
    padding: 15px 15px 0;
    min-height: 200px;
    max-height: 50vh;
    overflow-y: auto;
    border-top: 1px solid var(--ex-border-color6);
    & > div {
      padding-bottom: 30px;
    }
    .title {
      font-size: 16px;
      margin-bottom: 10px;
    }
    .txt {
      word-break: break-all;
      line-height: 1.5;
      font-size: 14px;
    }
  }
  .no-remind-row {
    flex-shrink: 0;
    padding: 14px 15px 12px;
    border-top: 1px solid var(--ex-border-color6);

    :deep(.no-remind-checkbox.van-checkbox) {
      width: 100%;
      align-items: flex-start;
      --van-checkbox-size: 18px;
      --van-checkbox-checked-icon-color: var(--ex-primary-color);
      --van-checkbox-border-color: var(--ex-border-color6);
    }

    :deep(.no-remind-checkbox .van-checkbox__icon) {
      margin-top: 2px;
      flex-shrink: 0;
    }

    :deep(.no-remind-checkbox .van-checkbox__label) {
      margin-left: 10px;
      line-height: 20px;
      font-size: 14px;
      font-weight: normal;
      color: var(--ex-home-list-ftcolor);
    }
  }
  .btnBox {
    flex-shrink: 0;
    padding: 16px 20px;
    border-top: 1px solid var(--ex-border-color6);
    background-color: var(--ex-div-bgColor1);
    text-align: center;
    p {
      color: var(--ex-font-color);
      font-size: 16px;
    }
  }
}
</style>
