<!-- 充值申请 -->
<template>
  <div class="page-recharge-apply">
    <DarkHeaderBar
      :title="currentName"
      right="rechargeOrder"
      :border_bottom="true"
    />

    <div class="page-body">
      <div class="qr-section">
        <div
          class="qr-bg"
          :style="{ backgroundImage: `url(${rechargeApplyBg})` }"
          aria-hidden="true"
        />
        <div class="qr-frame">
          <QRCode :address="address"></QRCode>
        </div>
      </div>

      <div class="applyMes">
        <div class="address">
          <p class="top">{{ _t18('recharge_address', ['bitmake']) }}({{ route.query.type }})</p>
          <div class="bottom">
            <Copy :data="address" :fontSize="'16px'">
              <template #copyMsg>
                <span class="fw-num">{{ address }}</span>
              </template>
            </Copy>
          </div>
        </div>
        <template
          v-if="
            !['coinsexpto', 'rxce', 'gmtoin', 'aams', 'bitbyex', 'gmmoin'].includes(
              _getConfig('_APP_ENV')
            )
          "
        >
          <div class="num">
            <p class="top">{{ _t18('recharge_number', ['bitmake']) }}</p>
            <div class="bottom">
              <input
                v-model="num"
                type="number"
                class="ff-num"
                :placeholder="_t18('recharge_input')"
              />
            </div>
          </div>
          <div class="uploadImg">
            <p class="top">{{ _t18('recharge_imgUpload', ['bitmake']) }}</p>
            <van-uploader v-model="fileList" max-count="1" :after-read="afterRead">
              <div class="bottom">
                <image-load filePath="defi/delete.png" name="delete" class="img"></image-load>
              </div>
            </van-uploader>
          </div>
        </template>
      </div>

      <template v-if="['coinsexpto', 'rxce', 'bitbyex', 'gmmoin'].includes(_getConfig('_APP_ENV'))">
        <div class="btn-wrap">
          <div class="btn btn--primary" @click="_copy(address)">
            <p>{{ _t18('copy') }}</p>
          </div>
        </div>
        <div v-if="['bitbyex'].includes(_getConfig('_APP_ENV'))" class="tip-list">
          <div v-for="(item, index) in tipList2" :key="index" class="tip">
            {{ item.content }}
          </div>
        </div>
        <div v-else class="tip-list">
          <div v-for="(item, index) in tipList" :key="index" class="tip">
            {{ index + 1 }}.{{ item.content }}
          </div>
        </div>
      </template>
      <template v-else-if="['gmtoin'].includes(_getConfig('_APP_ENV'))">
        <div class="tip-list">
          <div class="tip">{{ _t18('account_balance_info') }}</div>
        </div>
      </template>
      <template v-else-if="['aams', 'gmmoin'].includes(_getConfig('_APP_ENV'))"></template>
      <template v-else>
        <div class="btn-wrap">
          <div class="btn btn--primary" @click="submit">
            <p>{{ _t18('recharge_require', ['bitmake']) }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { uploadImg } from '@/api/common/index.js'
import { rechargeSubmit } from '@/api/account.js'
import { _toView, _t18, _getConfig } from '@/utils/public'
import { priceFormat } from '@/utils/decimal'
import QRCode from '@/components/common/QRCode/index.vue'
import Copy from '@/components/common/Copy/index.vue'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import rechargeApplyBg from '@/assets/images/recharge-apply-bg.png'
import { showToast } from 'vant'
import { debounce } from 'lodash'
import { useToast } from '@/hook/useToast'
import { useCopy } from '@/hook/useCopy'
import { useRouter, useRoute } from 'vue-router'
import { useMainStore } from '@/store'
import { onMounted, reactive, computed, ref } from 'vue'

const { _toast } = useToast()
const { _copy } = useCopy()
const route = useRoute()
const router = useRouter()

const currentName = `${_t18('recharge', ['latcoin'])} ${route.query.type}`

const tipList = reactive([
  { content: _t18('recharge_tip1') },
  { content: _t18('recharge_tip2') },
  { content: _t18('recharge_tip3') },
  { content: _t18('recharge_tip4') }
])
const tipList2 = reactive([{ content: _t18('recharge_tip5') }])
const num = ref('')
const fileList = ref([])

const afterRead = (file) => {
  file.status = 'uploading'
  const formData = new FormData()
  formData.append('file', file.file)
  uploadImg(formData).then((res) => {
    res = res.data
    if (res.code == '200') {
      file.res = res.data.url
      file.status = 'success'
    } else {
      showToast(res.msg)
      fileList.value = []
    }
  })
}

const submit = debounce(() => {
  if (!['coinsexpto'].includes(__config._APP_ENV) && num.value == '') {
    _toast('recharge_num')
    return
  }
  let filePath = ''
  if (!['coinsexpto'].includes(__config._APP_ENV)) {
    if (fileList.value.length == 0) {
      _toast('recharge_img')
      return
    }
    const file = fileList.value[0] || {}
    filePath = file.res
    if (file.status != 'success') {
      _toast('recharge_img_load')
      return
    }
  }
  let params = {}
  if (!['coinsexpto'].includes(__config._APP_ENV)) {
    params = {
      amount: priceFormat(num.value),
      type: route.query.type,
      coin: route.query.coin,
      filePath: filePath || '',
      address: address.value
    }
  } else {
    params = {
      amount: 0,
      type: route.query.type,
      coin: route.query.coin,
      address: address.value
    }
  }

  rechargeSubmit(params).then((res) => {
    if (res.code == '200') {
      _toast('recharge_success')
      num.value = ''
      setTimeout(() => {
        _toView('/recharge-order')
      }, 500)
    } else {
      showToast(res.msg)
    }
  })
}, 500)

const mainStore = useMainStore()

const address = computed(() => {
  const rechargeObj = mainStore.getRechargeList.find((elem) => elem.coinName == route.query.type)
  return rechargeObj?.coinAddress ?? ''
})
</script>

<style lang="scss" scoped>
.page-recharge-apply {
  min-height: 100vh;
  background: #05101a;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.page-body {
  min-height: calc(100vh - 60px - constant(safe-area-inset-top));
  min-height: calc(100vh - 60px - env(safe-area-inset-top, 0px));
  background: #f0f2f5;
  border-radius: 16px 16px 0 0;
  padding-bottom: 28px;
  box-sizing: border-box;
}

.qr-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 16px 100px;
  overflow: hidden;
}

.qr-bg {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(100%, 360px);
  height: 220px;
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: contain;
  pointer-events: none;
  z-index: 0;
}

.qr-frame {
  position: relative;
  z-index: 1;
  display: inline-block;
  padding: 8px;
  border: 2px solid #17ac74;
  border-radius: 10px;
  background: #fff;
  box-sizing: content-box;
}

.page-recharge-apply :deep(.qr-frame .box .erweima) {
  border-color: transparent;
}

.applyMes {
  margin: -64px 15px 0;
  position: relative;
  z-index: 2;
  background: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  & > div {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .top {
    font-size: 13px;
    color: #969799;
    margin: 0 0 10px;
    line-height: 1.4;
  }

  .address .bottom {
    word-break: break-all;
    font-size: 15px;
    color: #323233;
  }

  .num .bottom {
    border: 1px solid #ebedf0;
    padding: 12px;
    border-radius: 8px;
    background: #fff;

    input {
      width: 100%;
      border: none;
      font-size: 15px;
      color: #323233;
      background: transparent;
      outline: none;
    }

    input::placeholder {
      color: #c8c9cc;
      font-size: 14px;
    }
  }

  .uploadImg {
    .van-uploader {
      width: 100%;

      :deep(.van-uploader__input-wrapper) {
        width: 100%;
      }
    }

    .bottom {
      border: 1px solid #ebedf0;
      padding: 40px 0;
      text-align: center;
      border-radius: 8px;
      background: #fafafa;

      .img {
        font-size: 36px;
      }
    }
  }
}

.btn-wrap {
  padding: 20px 15px 0;
}

.btn {
  p {
    margin: 0;
    text-align: center;
    padding: 14px 0;
    font-size: 16px;
    border-radius: 999px;
  }

  &--primary p {
    color: #fff;
    background: #05101a;
    font-weight: 500;
  }
}

.tip-list {
  padding: 16px 15px 0;
  font-size: 14px;
  color: #646566;
  line-height: 1.5;

  .tip {
    margin-bottom: 12px;
  }
}
</style>
