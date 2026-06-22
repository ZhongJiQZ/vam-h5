<template>
  <div class="bankItem">
    <ul class="bank-content">
      <li v-for="item in props.bankList" :key="item.id" @click="change(item)">
        <div class="bank-card-head">
          <div class="bank-brand">
            <img :src="logoG" alt="" class="bank-brand__img" />
          </div>
          <div class="badge">{{ item.coin || 'BANK' }}</div>
          <div class="normal">
            <svg class="bianji" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
        </div>
        <p class="bank-type">{{ item.bankName }}<span class="scl" v-if="item.coin">（{{ item.coin }}）</span></p>
        <p class="name">{{ item.userName }}</p>
        <p class="bankNumber fw-num">{{ formatCardNo(item.cardNumber) }}</p>
        <p v-if="item.bankAddress" class="bank">{{ item.bankAddress }}</p>
        <p v-if="item.bankBranch" class="bank">{{ item.bankBranch }}</p>
      </li>
    </ul>
  </div>
</template>
<script setup>
import {useRouter} from 'vue-router'
import {_t18} from "@/utils/public";
import logoG from '@/assets/images/gxpex/login/logo-g.png'

const router = useRouter()

const props = defineProps({
  bankList: {
    type: Array,
    default: []
  }
})

const change = (item) => {
  router.push({
    path: '/edit-bank',
    query: {data: encodeURI(JSON.stringify(item))}
  })
}

const formatCardNo = (val) => {
  const s = String(val || '')
  if (s.length <= 8) return s
  return `${s.slice(0, 4)}  ****  ****  ${s.slice(-4)}`
}

const bankInitial = (name) => {
  const s = String(name || '').trim()
  if (!s) return 'B'
  return s.charAt(0).toUpperCase()
}
</script>
<style lang="scss" scoped>
.bank-content {
  margin-top: 0;
  list-style: none;
  padding: 0;

  li {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 18px 18px 20px;
    margin-top: 14px;
    /* GXPEX 紫渐变卡 — 跟 myInvestment hero / investment hero 同源 */
    background:
      radial-gradient(120% 110% at 100% 0%, rgba(160, 65, 237, 0.32) 0%, rgba(160, 65, 237, 0) 60%),
      linear-gradient(150deg, rgba(60, 26, 110, 0.7) 0%, rgba(30, 21, 48, 0.95) 60%);
    border: 1px solid rgba(160, 65, 237, 0.32);
    border-radius: 18px;
    box-shadow: 0 12px 32px rgba(127, 43, 218, 0.22);
    overflow: hidden;
    animation: card-enter 260ms ease both;
    cursor: pointer;

    &:nth-child(1) {
      margin-top: 0;
    }

    /* 右上小光斑装饰 */
    &::after {
      content: '';
      position: absolute;
      top: -36px;
      right: -36px;
      width: 140px;
      height: 140px;
      background: radial-gradient(circle, rgba(196, 124, 255, 0.22) 0%, rgba(196, 124, 255, 0) 70%);
      pointer-events: none;
    }

    .bank-card-head {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;

      .bank-brand {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .bank-brand__img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .badge {
        font-size: 11px;
        color: #fff;
        background: rgba(160, 65, 237, 0.32);
        border: 1px solid rgba(160, 65, 237, 0.5);
        border-radius: 999px;
        padding: 3px 12px;
        font-weight: 600;
        letter-spacing: 0.04em;
      }

      .normal {
        margin-left: auto;
      }
    }

    .bank-type {
      position: relative;
      z-index: 1;
      font-size: 16px;
      font-weight: 700;
      color: #fff;
      margin: 0;

      .scl {
        color: rgba(255, 255, 255, 0.55);
        padding-left: 5px;
        font-size: 13px;
        font-weight: 400;
      }
    }

    .name {
      position: relative;
      z-index: 1;
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
      padding-top: 8px;
      margin: 0;
    }

    .bankNumber {
      position: relative;
      z-index: 1;
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      padding-top: 14px;
      letter-spacing: 2px;
      margin: 0;
    }

    .bank {
      position: relative;
      z-index: 1;
      margin: 8px 0 0;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.55);
    }
  }

  .normal {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 999px;
    background: rgba(160, 65, 237, 0.18);
    border: 1px solid rgba(160, 65, 237, 0.45);
    transition: transform 0.16s ease, background-color 0.16s ease;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .bianji {
    font-size: 14px;
    width: 14px;
    height: 14px;
    color: rgb(196, 124, 255);
    padding: 0;
    background: transparent;
    border-radius: 0;
  }

  .normal:active {
    transform: scale(0.94);
    background: rgba(160, 65, 237, 0.32);
  }
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
