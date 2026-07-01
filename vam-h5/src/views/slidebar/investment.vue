<!-- 团队招商 -->
<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { dispatchCustomEvent } from '@/utils'
import { _t18 } from '@/utils/public'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import heroBg from '@/assets/images/gxpex/partner/hero-bg.png'
import badgeIcon from '@/assets/images/gxpex/assets/icon-hg.png'
import labaIcon from '@/assets/images/gxpex/assets/icon-laba.png'
import tierBadge from '@/assets/images/gxpex/partner/tier-badge.png'
import iconInstitution from '@/assets/images/gxpex/partner/icon-institution.svg'
import iconReqTeam from '@/assets/images/gxpex/partner/icon-req-team.svg'
import iconReqQual from '@/assets/images/gxpex/partner/icon-req-qual.svg'
import iconReqGrowth from '@/assets/images/gxpex/partner/icon-req-growth.svg'
import iconReqCompliance from '@/assets/images/gxpex/partner/icon-req-compliance.svg'

const router = useRouter()
const { locale } = useI18n()

const rewardsRef = ref(null)

const partners = computed(() => {
  void locale.value
  return [
    _t18('investment_partner_1'),
    _t18('investment_partner_2'),
    _t18('investment_partner_3'),
    _t18('investment_partner_4')
  ]
})

const dynamics = [
  { name: 'l**', size: '5000' },
  { name: 'w**', size: '10000' },
  { name: 'a**', size: '8000' },
  { name: 'h**', size: '12000' },
  { name: 'k**', size: '6500' },
  { name: 'm**', size: '15000' },
  { name: 's**', size: '7200' },
  { name: 'r**', size: '9500' }
]
const dynamicsLoop = computed(() => [...dynamics, ...dynamics])

const requirements = computed(() => {
  void locale.value
  return [
    {
      title: _t18('investment_req_team_title'),
      desc: _t18('investment_req_team_desc'),
      icon: iconReqTeam
    },
    {
      title: _t18('investment_req_qual_title'),
      desc: _t18('investment_req_qual_desc'),
      icon: iconReqQual
    },
    {
      title: _t18('investment_req_growth_title'),
      desc: _t18('investment_req_growth_desc'),
      icon: iconReqGrowth
    },
    {
      title: _t18('investment_req_compliance_title'),
      desc: _t18('investment_req_compliance_desc'),
      icon: iconReqCompliance
    }
  ]
})

const tiers = computed(() => {
  void locale.value
  return [
    {
      level: _t18('investment_tier_junior'),
      people: '3,000',
      rate: '40%',
      bonus: _t18('investment_tier_junior_bonus')
    },
    {
      level: _t18('investment_tier_senior'),
      people: '30,000',
      rate: '50%',
      bonus: _t18('investment_tier_senior_bonus')
    },
    {
      level: _t18('investment_tier_super'),
      people: '100,000',
      rate: '60%',
      bonus: _t18('investment_tier_super_bonus')
    }
  ]
})

const processSteps = computed(() => {
  void locale.value
  return [
    {
      title: _t18('investment_step1_title'),
      desc: _t18('investment_step1_desc')
    },
    {
      title: _t18('investment_step2_title'),
      desc: _t18('investment_step2_desc')
    },
    {
      title: _t18('investment_step3_title'),
      desc: _t18('investment_step3_desc')
    },
    {
      title: _t18('investment_step4_title'),
      desc: _t18('investment_step4_desc')
    }
  ]
})

function stepNumber(index) {
  return `${String(index + 1).padStart(2, '0')}.`
}

function stepTitle(full) {
  return String(full || '').replace(/^\d+\.\s*/, '')
}

const handleApply = () => {
  dispatchCustomEvent('event_serviceChange')
}

const scrollToRewards = () => {
  rewardsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="page page--partner">
    <section class="partner-hero">
      <img class="partner-hero__bg" :src="heroBg" alt="" aria-hidden="true" />
      <div class="partner-hero__shade" aria-hidden="true"></div>

      <header class="partner-header">
        <button type="button" class="partner-header__back" aria-label="back" @click="router.back()">
          <img :src="iconBack" alt="" class="partner-header__back-icon" />
        </button>
        <h1 class="partner-header__title">{{ _t18('investment') }}</h1>
        <span class="partner-header__spacer" aria-hidden="true"></span>
      </header>

      <div class="partner-hero__content">
        <div class="partner-hero__badge">
          <img class="partner-hero__badge-icon" :src="badgeIcon" alt="" aria-hidden="true" />
          <span>{{ _t18('investment_badge') }}</span>
        </div>
        <h2 class="partner-hero__title">
          {{ _t18('investment_hero_title_line1') }}<br />{{ _t18('investment_hero_title_line2') }}
        </h2>
        <p class="partner-hero__subtitle">{{ _t18('investment_hero_desc') }}</p>
        <div class="partner-hero__actions">
          <button type="button" class="partner-hero__btn partner-hero__btn--ghost" @click="scrollToRewards">
            {{ _t18('investment_view_rewards') }}
          </button>
          <button type="button" class="partner-hero__btn partner-hero__btn--primary" @click="handleApply">
            {{ _t18('investment_apply_btn') }}
          </button>
        </div>
      </div>
    </section>

    <main class="partner-main">
      <section class="partner-section partner-section--inst">
        <h2 class="partner-section__title">{{ _t18('investment_partners_title') }}</h2>
        <div class="partner-inst__scroll">
          <article v-for="item in partners" :key="item" class="partner-inst__card">
            <img :src="iconInstitution" alt="" class="partner-inst__icon" />
            <span class="partner-inst__name">{{ item }}</span>
          </article>
        </div>
      </section>

      <section class="partner-section partner-section--feed">
        <h2 class="partner-section__title">{{ _t18('investment_dynamics_title') }}</h2>
        <div class="partner-feed__viewport">
          <div class="partner-feed__track">
            <div v-for="(item, index) in dynamicsLoop" :key="index" class="partner-feed__item">
              <img :src="labaIcon" alt="" class="partner-feed__icon" aria-hidden="true" />
              <span class="partner-feed__message">
                {{ item.name }} {{ _t18('investment_dynamic_joined') }}
              </span>
              <span class="partner-feed__size">{{ item.size }}+</span>
            </div>
          </div>
        </div>
      </section>

      <section class="partner-section partner-section--req">
        <h2 class="partner-section__title">{{ _t18('investment_requirements_title') }}</h2>
        <div class="partner-req__list">
          <article v-for="item in requirements" :key="item.title" class="partner-req__card">
            <img :src="item.icon" alt="" class="partner-req__icon" />
            <div class="partner-req__body">
              <h3 class="partner-req__title">{{ item.title }}</h3>
              <p class="partner-req__desc">{{ item.desc }}</p>
            </div>
          </article>
        </div>
      </section>

      <section id="rewards" ref="rewardsRef" class="partner-section partner-section--tiers">
        <h2 class="partner-section__title">{{ _t18('investment_tiers_title') }}</h2>
        <div class="partner-tier__list">
          <article v-for="tier in tiers" :key="tier.level" class="partner-tier__card">
            <div class="partner-tier__badge">
              <img class="partner-tier__badge-img" :src="tierBadge" alt="" />
            </div>
            <div class="partner-tier__main">
              <div class="partner-tier__level">{{ tier.level }}</div>
              <div class="partner-tier__users">
                {{ tier.people }} {{ _t18('investment_tier_people_unit') }}
              </div>
            </div>
            <div class="partner-tier__rebate">
              <div class="partner-tier__rebate-label">{{ tier.bonus }}</div>
              <div class="partner-tier__rebate-value">{{ tier.rate }}</div>
            </div>
          </article>
        </div>
      </section>

      <section class="partner-section partner-section--process">
        <h2 class="partner-section__title">{{ _t18('investment_process_title') }}</h2>
        <div class="partner-step__list">
          <article v-for="(step, index) in processSteps" :key="index" class="partner-step">
            <div class="partner-step__content">
              <div class="partner-step__head">
                <span class="partner-step__num">{{ stepNumber(index) }}</span>
                <h3 class="partner-step__title">{{ stepTitle(step.title) }}</h3>
              </div>
              <p class="partner-step__desc">{{ step.desc }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="partner-cta">
        <div class="partner-cta__copy">
          <h2 class="partner-cta__title">{{ _t18('investment_cta_title') }}</h2>
          <p class="partner-cta__subtitle">{{ _t18('investment_cta_desc') }}</p>
        </div>
        <button type="button" class="partner-cta__btn" @click="handleApply">
          {{ _t18('investment_apply_btn') }}
        </button>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.page--partner {
  position: relative;
  min-height: 100vh;
  background: #111111;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
}

.partner-hero {
  position: relative;
  min-height: 469px;
  overflow: hidden;
}

.partner-hero__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.partner-hero__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(17, 17, 17, 0.15) 0%,
    rgba(17, 17, 17, 0.55) 45%,
    rgba(17, 17, 17, 0.92) 78%,
    #111111 100%
  );
}

.partner-header {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  min-height: 26px;
  padding: 0 12px;
}

.partner-header__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-left: -9px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.partner-header__back-icon {
  display: block;
  width: 12px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

.partner-header__title {
  grid-column: 2;
  margin: 0;
  text-align: center;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
}

.partner-header__spacer {
  grid-column: 3;
  width: 40px;
  height: 40px;
}

.partner-hero__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 177px 12px 24px;
  padding: 20px 16px;
  border-radius: 18px;
  background: linear-gradient(160deg, rgba(127, 43, 218, 0.18) 0%, rgba(34, 28, 49, 0.45) 55%, rgba(17, 17, 17, 0.55) 100%);
  border: 1px solid rgba(160, 65, 237, 0.28);
  backdrop-filter: blur(22px) saturate(140%);
  -webkit-backdrop-filter: blur(22px) saturate(140%);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
}

.partner-hero__badge {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 6px;
  max-width: 100%;
  padding: 6px 14px 6px 10px;
  border-radius: 999px;
  background: rgba(127, 43, 218, 0.18);
  border: 1px solid rgba(160, 65, 237, 0.45);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-family: 'Roboto', sans-serif;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.92);
}

.partner-hero__badge-icon {
  display: block;
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}

.partner-hero__title {
  margin: 0;
  font-family: 'PingFang SC', sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
  background: linear-gradient(135deg, #ffffff 0%, #ffffff 45%, rgb(196, 124, 255) 78%, rgb(160, 65, 237) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.partner-hero__subtitle {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.75);
}

.partner-hero__actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.partner-hero__btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 999px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
}

.partner-hero__btn--ghost {
  border: 1px solid rgb(160, 65, 237);
  background: rgb(27, 27, 27);
  color: rgb(160, 65, 237);
}

.partner-hero__btn--primary {
  border: none;
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.35);
  color: #fff;
}

.partner-main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px 12px 0;
}

.partner-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.partner-section__title {
  margin: 0;
  padding: 0 2px;
  font-family: 'Roboto', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  color: #fff;
}

.partner-inst__scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 2px 2px 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.partner-inst__card {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
  min-height: 44px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgb(34, 28, 49);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.partner-inst__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: block;
  object-fit: contain;
}

.partner-inst__name {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.92);
  white-space: nowrap;
}

.partner-feed__viewport {
  position: relative;
  height: 132px;
  overflow: hidden;
  border-radius: 10px;
  background: rgb(34, 28, 49);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 4px 0;
  mask-image: linear-gradient(180deg, transparent 0, #000 16%, #000 84%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 16%, #000 84%, transparent 100%);
}

.partner-feed__track {
  display: flex;
  flex-direction: column;
  animation: partner-feed-scroll 18s linear infinite;
}

@keyframes partner-feed-scroll {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

.partner-feed__item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 8px 14px;
}

.partner-feed__icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: block;
  object-fit: contain;
}

.partner-feed__message {
  flex: 1;
  min-width: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.partner-feed__size {
  flex-shrink: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  color: rgb(160, 65, 237);
}

.partner-req__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.partner-req__card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: rgb(34, 28, 49);
}

.partner-req__icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: block;
  object-fit: contain;
}

.partner-req__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.partner-req__title {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
}

.partner-req__desc {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.65);
}

.partner-tier__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.partner-tier__card {
  display: grid;
  grid-template-columns: 43px 1fr auto;
  align-items: center;
  gap: 8px;
  min-height: 64px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgb(34, 28, 49);
}

.partner-tier__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 43px;
}

.partner-tier__badge-img {
  width: 43px;
  height: 43px;
  object-fit: contain;
  border-radius: 50%;
}

.partner-tier__main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.partner-tier__level {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
}

.partner-tier__users {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.65);
}

.partner-tier__rebate {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.partner-tier__rebate-label {
  font-family: 'Roboto', sans-serif;
  font-size: 11px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.65);
  text-align: right;
}

.partner-tier__rebate-value {
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  color: rgb(160, 65, 237);
}

.partner-step__list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 12px 16px 28px;
  border-radius: 12px;
  background: rgb(34, 28, 49);
}

.partner-step__list::before {
  content: '';
  position: absolute;
  left: 17px;
  top: 22px;
  bottom: 22px;
  width: 1px;
  background: rgb(158, 64, 235);
}

.partner-step {
  position: relative;
  display: flex;
  min-height: 45px;
}

.partner-step::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgb(160, 65, 237);
  box-shadow: 0 0 0 2px rgb(34, 28, 49);
}

.partner-step__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.partner-step__head {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 6px;
}

.partner-step__num {
  flex-shrink: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: rgb(160, 65, 237);
}

.partner-step__title {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: rgb(160, 65, 237);
}

.partner-step__desc {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.65);
}

.partner-cta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 4px;
  text-align: center;
}

.partner-cta__copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.partner-cta__title {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.partner-cta__subtitle {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.65);
  text-align: center;
}

.partner-cta__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 40px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.35);
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
  cursor: pointer;
}
</style>
