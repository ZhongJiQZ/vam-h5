<template>
  <div class="bankItem">
    <ul class="bank-content">
      <li v-for="item in props.bankList" :key="item.id" @click="change(item)">
        <div class="bank-card-head">
          <div class="bank-brand">
            <span>{{ bankInitial(item.bankName) }}</span>
          </div>
          <div class="badge">{{ item.coin || 'BANK' }}</div>
          <div class="normal">
            <svg-load name="bianji" class="bianji"></svg-load>
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

  li {
    display: flex;
    flex-direction: column;
    padding: 14px 16px 18px;
    margin-top: 12px;
    background: radial-gradient(120% 160% at 0% 0%, #1f3554 0%, #162437 52%, #0f1a29 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    box-shadow: 0 8px 22px rgba(6, 16, 28, 0.22);
    animation: card-enter 260ms ease both;

    &:nth-child(1) {
      margin-top: 0;
    }

    .bank-card-head {
      display: flex;
      justify-content: space-between;
      height: 22px;
      align-items: center;
      margin-bottom: 8px;

      .bank-brand {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.18);
        border: 1px solid rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 13px;
        font-weight: 700;
        margin-right: 8px;
      }

      .badge {
        font-size: 11px;
        color: #c9d7e8;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 999px;
        padding: 3px 10px;
        font-weight: 600;
      }
    }

    .bank-type {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;

      .scl {
        color: #c5d1df;
        padding-left: 5px;
        font-size: 13px;
        font-weight: 400;
      }
    }

    .name {
      color: #d6e1ef;
      font-size: 13px;
      padding-top: 8px;
    }

    .bankNumber {
      font-size: 22px;
      font-weight: bold;
      color: #ffffff;
      padding-top: 12px;
      letter-spacing: 1.8px;
    }

    .bank {
      margin-top: 8px;
      font-size: 12px;
      color: #aebfd3;
    }
  }

  .bianji {
    font-size: 16px;
    color: #d9e4f1;
    background: rgba(255, 255, 255, 0.14);
    border-radius: 999px;
    padding: 8px;
    transition: transform 0.16s ease, background-color 0.16s ease;
  }

  .normal:active .bianji {
    transform: scale(0.94);
    background: rgba(255, 255, 255, 0.24);
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
