<template>
  <div class="header">
    <div class="bgImg" v-if="finaImg">
      <image-load :filePath="finaImg" class="img" />
    </div>
    <div class="nav-card">
    <div class="navigationList">
      <div
        class="item"
        v-for="item in listNav"
        :key="item.clickName"
        @click="$router.push(item.clickName)"
      >
        <img :src="item.img" class="itemImg" alt="" />
        <div class="itemName">{{ item.name }}</div>
      </div>
    </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { _t18 } from '@/utils/public'
import { publiceNotice } from '@/api/common/index'
import imgValueAdded from '@/assets/images/financial/增值收益.png'
import imgNormalProduct from '@/assets/images/financial/普通产品.png'
import imgMyInvestment from '@/assets/images/financial/我的投资.png'
// 增值收益 会员专区 普通产品 我的投资
const listNav = computed(() => {
  return [
    {
      img: imgValueAdded,
      name: _t18(`value_added _income`),
      clickName: '/addIncome'
    },
    // {
    //   icon: 'huiyuan',
    //   name: _t18(`members_only`),
    //   clickName: '/membersOnly'
    // },
    {
      img: imgNormalProduct,
      name: _t18(`normal_product`),
      clickName: '/generalMerchandise'
    },
    {
      img: imgMyInvestment,
      name: _t18(`my_invest`),
      clickName: '/myInvestment'
    }
  ]
})
const finaImg = ref('')
onMounted(async () => {
  try {
    const res = await publiceNotice('ACTIVITY_NOTICE', 'FINANCE_ACTIVITY ')
    if (res.code === 200) {
      finaImg.value = res.data[0].imgUrl
    }
  } catch (error) {}
})
</script>
<style lang="scss" scoped>
.header {
  padding: 12px 15px 0;
  .bgImg {
    margin: 0 0 12px;
    height: 173px;
    border-radius: 12px;
    overflow: hidden;
    .img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .nav-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(1, 14, 26, 0.06);
    padding: 4px 0 16px;
  }
  .navigationList {
    padding: 16px 12px 0;
    display: flex;
    justify-content: space-between;
    .item {
      flex: 1;
      text-align: center;
      align-items: center;
      font-size: 12px;
      color: #111;
      justify-content: center;
      padding: 0 5px;
      .itemImg {
        width: 40px;
        height: 40px;
        margin-bottom: 10px;
      }
      .itemName {
        text-align: center;
        word-wrap: break-word;
      }
    }
  }
}
</style>
