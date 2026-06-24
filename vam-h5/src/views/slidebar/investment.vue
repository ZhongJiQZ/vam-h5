<!-- 团队招商 -->
<template>
    <div class="investment-page">
        <DarkHeaderBar
            class="investment-header"
            :title="_t18('investment')"
            :border_bottom="true"
            bg-color="#f9f7f2"
        />
        <div class="investment-body">
            <!-- Hero --> 
            <section class="hero">
                <div class="hero-badge">
                    <span class="hero-badge__icon">🏆</span>
                    <span>{{ _t18('investment_badge') }}</span>
                </div>
                <h1 class="hero-title">
                    {{ _t18('investment_hero_title_line1') }}<br />{{ _t18('investment_hero_title_line2') }}
                </h1>
                <p class="hero-desc">{{ _t18('investment_hero_desc') }}</p>
                <div class="hero-actions">
                    <button type="button" class="btn-primary" @click="handleApply">{{ _t18('investment_apply_btn') }}</button>
                    <button type="button" class="btn-outline" @click="scrollToRewards">
                        {{ _t18('investment_view_rewards') }}
                        <span class="btn-outline__arrow" :class="{ open: showRewards }">∨</span>
                    </button>
                </div>
            </section>

            <!-- 保证金滚动动态 -->
            <section class="section section-deposit">
                <div class="section-head">
                    <h2 class="section-title">{{ _t18('investment_deposit_scroll_title') }}</h2>
                    <span class="live-badge"><i class="live-dot" />{{ _t18('investment_live') }}</span>
                </div>
                <div class="deposit-marquee">
                    <div class="deposit-marquee__track">
                        <div v-for="(text, index) in depositScrollItems" :key="`a-${index}`" class="deposit-marquee__item">
                            <span class="deposit-marquee__icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                                </svg>
                            </span>
                            <span class="deposit-marquee__text">{{ text }}</span>
                        </div>
                        <div v-for="(text, index) in depositScrollItems" :key="`b-${index}`" class="deposit-marquee__item" aria-hidden="true">
                            <span class="deposit-marquee__icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                                </svg>
                            </span>
                            <span class="deposit-marquee__text">{{ text }}</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 平台实力背书 -->
            <section class="section section-strength">
                <h2 class="section-title">{{ _t18('investment_strength_title') }}</h2>
                <div class="strength-stats">
                    <div class="strength-stat">
                        <p class="strength-stat__value">{{ _t18('investment_stat_users_value') }}</p>
                        <p class="strength-stat__label">{{ _t18('investment_stat_users_label') }}</p>
                    </div>
                    <div class="strength-stat">
                        <p class="strength-stat__value">{{ _t18('investment_stat_countries_value') }}</p>
                        <p class="strength-stat__label">{{ _t18('investment_stat_countries_label') }}</p>
                    </div>
                </div>
                <div class="strength-paras">
                    <p v-for="(para, index) in strengthParas" :key="index" class="strength-para">{{ para }}</p>
                </div>
            </section>

            <!-- 合作机构 -->
            <section class="section section1">
                <h2 class="section-title">{{ _t18('investment_partners_title') }}</h2>
                <div class="partner-tags">
                    <span v-for="item in partners" :key="item" class="partner-tag">
                        <i class="partner-tag__check" />
                        {{ item }}
                    </span>
                </div>
            </section>

            <!-- 团队权益 -->
            <section class="section section-benefits">
                <h2 class="section-title">{{ _t18('investment_benefits_title') }}</h2>
                <p class="benefits-intro">{{ _t18('investment_benefits_intro') }}</p>
                <div class="benefits-grid">
                    <div v-for="(item, index) in teamBenefits" :key="index" class="benefit-item">
                        <i class="benefit-item__check" />
                        <span>{{ item }}</span>
                    </div>
                </div>
            </section>

            <!-- 入驻要求 -->
            <section class="section section3">
                <h2 class="section-title">{{ _t18('investment_requirements_title') }}</h2>
                <div class="requirements-grid">
                    <div v-for="item in requirements" :key="item.title" class="requirement-card">
                        <span class="requirement-card__icon" v-html="item.icon" />
                        <p class="requirement-card__title">{{ item.title }}</p>
                        <p class="requirement-card__desc">{{ item.desc }}</p>
                    </div>
                </div>
            </section>

            <!-- 阶梯奖励 -->
            <section id="rewards" class="section section4" ref="rewardsRef">
                <h2 class="section-title">{{ _t18('investment_tiers_title') }}</h2>
                <div class="tier-list">
                    <div v-for="tier in tiers" :key="tier.level" class="tier-card"
                        :class="{ 'tier-card--hot': tier.hot }">
                        <span v-if="tier.hot" class="tier-hot">{{ _t18('investment_hot') }}</span>
                        <div class="tier-card__left">
                            <p class="tier-card__label" :class="{ accent: tier.hot }">
                                <i v-if="tier.hot" class="tier-star">★</i>
                                {{ tier.level }}
                            </p>
                            <p class="tier-card__people">{{ tier.people }} {{ _t18('investment_tier_people_unit') }}</p>
                        </div>
                        <div class="tier-card__right">
                            <p class="tier-card__rate">{{ tier.rate }}</p>
                            <p class="tier-card__bonus" :class="{ accent: tier.hot }">{{ tier.bonus }}</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 入驻流程 -->
            <section class="section section5">
                <h2 class="section-title">{{ _t18('investment_process_title') }}</h2>
                <div class="process-list">
                    <div v-for="(step, index) in processSteps" :key="index" class="process-item">
                        <div class="process-content">
                            <h3 class="process-title">{{ step.title }}</h3>
                            <p class="process-desc">{{ step.desc }}</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 成功案例 -->
            <section class="section section-case">
                <h2 class="section-title">{{ _t18('investment_case_title') }}</h2>
                <div class="case-card">
                    <h3 class="case-card__name">{{ _t18('investment_case_horizon_name') }}</h3>
                    <div class="case-card__rows">
                        <p>{{ _t18('investment_case_horizon_size') }}</p>
                        <p>{{ _t18('investment_case_horizon_date') }}</p>
                        <p class="case-card__rate">{{ _t18('investment_case_horizon_rate') }}</p>
                    </div>
                </div>
            </section>

            <!-- 底部 CTA -->
            <section class="cta-card section6">
                <h2 class="cta-title">{{ _t18('investment_cta_title') }}</h2>
                <p class="cta-desc">{{ _t18('investment_cta_desc') }}</p>
                <button type="button" class="btn-cta" @click="handleApply">{{ _t18('investment_apply_btn') }}</button>
            </section>

            <!-- 常见问题 -->
            <section class="section section-faq">
                <h2 class="section-title">{{ _t18('investment_faq_title') }}</h2>
                <div class="faq-list">
                    <div v-for="(item, index) in faqItems" :key="index" class="faq-item">
                        <p class="faq-item__q">{{ item.q }}</p>
                        <p class="faq-item__a">{{ item.a }}</p>
                    </div>
                </div>
            </section>

            <!-- 风险与合规声明 -->
            <section class="section section-risk">
                <h2 class="section-title">{{ _t18('investment_risk_title') }}</h2>
                <p class="risk-desc">{{ _t18('investment_risk_desc') }}</p>
            </section>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { dispatchCustomEvent } from '@/utils'
import { _t18 } from '@/utils/public'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'

const { locale } = useI18n()

const showRewards = ref(false)
const rewardsRef = ref(null)

const depositScrollItems = computed(() => {
    void locale.value
    return [
        _t18('investment_deposit_scroll_1'),
        _t18('investment_deposit_scroll_2'),
        _t18('investment_deposit_scroll_3'),
        _t18('investment_deposit_scroll_4'),
        _t18('investment_deposit_scroll_5'),
        _t18('investment_deposit_scroll_6')
    ]
})

const strengthParas = computed(() => {
    void locale.value
    return [
        _t18('investment_strength_p1'),
        _t18('investment_strength_p2'),
        _t18('investment_strength_p3'),
        _t18('investment_strength_p4')
    ]
})

const teamBenefits = computed(() => {
    void locale.value
    return [
        _t18('investment_benefit_1'),
        _t18('investment_benefit_2'),
        _t18('investment_benefit_3'),
        _t18('investment_benefit_4'),
        _t18('investment_benefit_5'),
        _t18('investment_benefit_6'),
        _t18('investment_benefit_7'),
        _t18('investment_benefit_8'),
        _t18('investment_benefit_9')
    ]
})

const faqItems = computed(() => {
    void locale.value
    return [
        { q: _t18('investment_faq_q1'), a: _t18('investment_faq_a1') },
        { q: _t18('investment_faq_q2'), a: _t18('investment_faq_a2') },
        { q: _t18('investment_faq_q3'), a: _t18('investment_faq_a3') },
        { q: _t18('investment_faq_q4'), a: _t18('investment_faq_a4') }
    ]
})

const partners = computed(() => {
    void locale.value
    return [
        _t18('investment_partner_1'),
        _t18('investment_partner_2'),
        _t18('investment_partner_3'),
        _t18('investment_partner_4')
    ]
})

const ICON_TEAM = `<svg viewBox="0 0 24 24" fill="none"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/></svg>`
const ICON_QUAL = `<svg viewBox="0 0 24 24" fill="none"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/></svg>`
const ICON_GROWTH = `<svg viewBox="0 0 24 24" fill="none"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" fill="currentColor"/></svg>`
const ICON_COMPLIANCE = `<svg viewBox="0 0 24 24" fill="none"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/></svg>`

const requirements = computed(() => {
    void locale.value
    return [
        {
            title: _t18('investment_req_team_title'),
            desc: _t18('investment_req_team_desc'),
            icon: ICON_TEAM
        },
        {
            title: _t18('investment_req_qual_title'),
            desc: _t18('investment_req_qual_desc'),
            icon: ICON_QUAL
        },
        {
            title: _t18('investment_req_growth_title'),
            desc: _t18('investment_req_growth_desc'),
            icon: ICON_GROWTH
        },
        {
            title: _t18('investment_req_compliance_title'),
            desc: _t18('investment_req_compliance_desc'),
            icon: ICON_COMPLIANCE
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
            bonus: _t18('investment_tier_junior_bonus'),
            hot: false
        },
        {
            level: _t18('investment_tier_senior'),
            people: '10,000',
            rate: '50%',
            bonus: _t18('investment_tier_senior_bonus'),
            hot: true
        },
        {
            level: _t18('investment_tier_super'),
            people: '30,000',
            rate: '60%',
            bonus: _t18('investment_tier_super_bonus'),
            hot: false
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

const handleApply = () => {
    dispatchCustomEvent('event_serviceChange')
}

const scrollToRewards = () => {
    showRewards.value = !showRewards.value
    rewardsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style lang="scss" scoped>
$bg: #f9f7f2;
$teal: #17ac74;
$teal-light: linear-gradient(135deg, #cdf4e6 0%, #fff 100%);
$dark: #0d1f1b;
$text: #241818;
$text-muted: #888;
$card-grey: #f2f1ed;

.investment-page {
    min-height: 100vh;
}

:deep(.investment-header.dark-header) {
    background-color: $bg !important;
    border-bottom: 1px solid #ebe8e0 !important;

    .left {
        filter: none;
    }

    .title {
        color: $text;
        font-weight: 600;
    }

    .icon-img {
        filter: none;
    }
}

.investment-body {
    padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px));
}

/* Hero */
.hero {
    background: linear-gradient(135deg, #cdf4e6 0%, #fff 100%);
    padding: 24px 20px 28px;
    border-radius: 0 0 24px 24px;
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px solid $teal;
    border-radius: 20px;
    font-size: 11px;
    color: $teal;
    margin-bottom: 16px;

    &__icon {
        font-size: 12px;
    }
}

.hero-title {
    margin: 0 0 12px;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.35;
    color: $text;
}

.hero-desc {
    margin: 0 0 20px;
    font-size: 13px;
    line-height: 1.6;
    color: $text-muted;
}

.hero-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.btn-primary {
    width: 100%;
    height: 48px;
    border: none;
    border-radius: 12px;
    background: $dark;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}

.btn-outline {
    width: 100%;
    height: 48px;
    border: 1px solid $teal;
    border-radius: 12px;
    background: #fff;
    color: $teal;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    -webkit-tap-highlight-color: transparent;

    &__arrow {
        display: inline-block;
        transition: transform 0.2s;

        &.open {
            transform: rotate(180deg);
        }
    }
}

/* Sections */
.section {
    padding: 20px;
}

.section1 {
    background: #fcf9f2;
}

.section2 {
    background: #f6f3ee;
}

.section-deposit {
    background: #f6f3ee;
}

.section-strength {
    background: #fcf9f2;
}

.section-benefits {
    background: #f6f3ee;
}

.section-case {
    background: #fcf9f2;
}

.section-faq {
    background: #fcf9f2;
    padding-top: 8px;
}

.section-risk {
    background: #f6f3ee;
    padding-bottom: 32px;
}

.section3 {
    background: #fcf9f2;
}

.section4 {
    background: #f6f3ee;
}

.section-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.section-title {
    margin: 0 0 12px;
    font-size: 17px;
    font-weight: 700;
    color: $text;
}

.section-head .section-title {
    margin-bottom: 0;
}

/* Partners */
.partner-tags {
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 4px;

    &::-webkit-scrollbar {
        display: none;
    }
}

.partner-tag {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: 1px solid #e5e3dd;
    border-radius: 20px;
    background: #fff;
    font-size: 12px;
    color: $text;

    &__check {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: $teal-light;
        position: relative;

        &::after {
            content: '';
            position: absolute;
            left: 4px;
            top: 2px;
            width: 4px;
            height: 7px;
            border: solid $teal;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }
    }
}

/* Deposit marquee */
.deposit-marquee {
    height: 168px;
    overflow: hidden;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    position: relative;

    &::before,
    &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        height: 20px;
        z-index: 1;
        pointer-events: none;
    }

    &::before {
        top: 0;
        background: linear-gradient(to bottom, #fff, transparent);
    }

    &::after {
        bottom: 0;
        background: linear-gradient(to top, #fff, transparent);
    }
}

.deposit-marquee__track {
    display: flex;
    flex-direction: column;
    animation: deposit-scroll 28s linear infinite;
}

.deposit-marquee__item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid #f5f3ee;
    flex-shrink: 0;
}

.deposit-marquee__icon {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: $teal-light;
    color: $teal;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
        width: 16px;
        height: 16px;
    }
}

.deposit-marquee__text {
    font-size: 13px;
    line-height: 1.55;
    color: $text;
}

@keyframes deposit-scroll {
    0% {
        transform: translateY(0);
    }
    100% {
        transform: translateY(-50%);
    }
}

/* Platform strength */
.strength-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
}

.strength-stat {
    background: #fff;
    border-radius: 12px;
    padding: 16px 12px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    &__value {
        margin: 0 0 6px;
        font-size: 24px;
        font-weight: 700;
        color: $teal;
    }

    &__label {
        margin: 0;
        font-size: 12px;
        color: $text-muted;
    }
}

.strength-paras {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.strength-para {
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    color: $text-muted;
}

/* Team benefits */
.benefits-intro {
    margin: -4px 0 14px;
    font-size: 13px;
    color: $text-muted;
}

.benefits-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.benefit-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: #fff;
    border-radius: 10px;
    padding: 12px 10px;
    font-size: 12px;
    line-height: 1.45;
    color: $text;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

    &__check {
        flex-shrink: 0;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: $teal-light;
        position: relative;
        margin-top: 1px;

        &::after {
            content: '';
            position: absolute;
            left: 4px;
            top: 2px;
            width: 4px;
            height: 7px;
            border: solid $teal;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }
    }
}

/* Success case */
.case-card {
    background: #fff;
    border-radius: 14px;
    padding: 18px 16px;
    border: 1px solid rgba($teal, 0.2);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    &__name {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 700;
        color: $text;
    }

    &__rows p {
        margin: 0 0 8px;
        font-size: 13px;
        line-height: 1.5;
        color: $text-muted;

        &:last-child {
            margin-bottom: 0;
        }
    }

    &__rate {
        color: $teal !important;
        font-weight: 600;
    }
}

/* FAQ */
.faq-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.faq-item {
    background: #fff;
    border-radius: 12px;
    padding: 14px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

    &__q {
        margin: 0 0 8px;
        font-size: 14px;
        font-weight: 600;
        color: $text;
    }

    &__a {
        margin: 0;
        font-size: 13px;
        line-height: 1.6;
        color: $text-muted;
    }
}

/* Risk */
.risk-desc {
    margin: 0;
    font-size: 12px;
    line-height: 1.75;
    color: $text-muted;
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

/* Live dynamics */
.live-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    background: #ffe8e8;
    color: #e85d5d;
    font-size: 10px;
    font-weight: 700;
    border-radius: 10px;
}

.live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #e85d5d;
    animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.4;
    }
}

.dynamics-card {
    background: #fff;
    border-radius: 14px;
    padding: 4px 0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.dynamics-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;

    &+& {
        border-top: 1px solid #f5f3ee;
    }

    &__icon {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: $teal-light;
        color: $teal;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
            width: 18px;
            height: 18px;
        }
    }

    &__text {
        margin: 0;
        font-size: 13px;
        color: $text-muted;
        line-height: 1.5;
    }

    &__name {
        color: $text;
        font-weight: 500;
    }

    &__num {
        color: $teal;
        font-weight: 600;
    }
}

/* Requirements */
.requirements-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.requirement-card {
    background: $card-grey;
    border-radius: 12px;
    padding: 16px 12px;

    &__icon {
        display: flex;
        width: 28px;
        height: 28px;
        color: $teal;
        margin-bottom: 10px;

        :deep(svg) {
            width: 28px;
            height: 28px;
        }
    }

    &__title {
        margin: 0 0 6px;
        font-size: 14px;
        font-weight: 600;
        color: $text;
    }

    &__desc {
        margin: 0;
        font-size: 11px;
        line-height: 1.5;
        color: $text-muted;
    }
}

/* Tiers */
.tier-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.tier-card {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-radius: 14px;
    padding: 18px 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    &--hot {
        border: 1.5px solid $teal;
        background: $teal-light;
    }

    &__left {
        flex: 1;
    }

    &__label {
        margin: 0 0 6px;
        font-size: 12px;
        color: $text-muted;

        &.accent {
            color: $teal;
            display: flex;
            align-items: center;
            gap: 4px;
        }
    }

    &__people {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: $text;
    }

    &__right {
        text-align: right;
    }

    &__rate {
        margin: 0 0 4px;
        font-size: 22px;
        font-weight: 700;
        color: $teal;
    }

    &__bonus {
        margin: 0;
        font-size: 11px;
        color: $text-muted;

        &.accent {
            color: $teal;
        }
    }
}

.tier-hot {
    position: absolute;
    top: -1px;
    right: 16px;
    padding: 2px 10px;
    background: #ff5e5e;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    border-radius: 0 0 8px 8px;
}

.tier-star {
    font-style: normal;
    font-size: 11px;
}

/* Process */
.process-list {
    margin-left: 6px;
    padding-left: 18px;
    border-left: 3px solid $teal;
}

.process-item {
    padding-bottom: 24px;

    &:last-child {
        padding-bottom: 0;
    }
}

.process-content {
    padding-top: 0;
}

.process-title {
    margin: 0 0 8px;
    font-size: 15px;
    font-weight: 700;
    color: $text;
}

.process-desc {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: $text-muted;
}

/* CTA */
.cta-card {
    margin: 32px 20px 0;
    padding: 28px 20px;
    background: $dark;
    border-radius: 16px;
    text-align: center;
}

.cta-title {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
}

.cta-desc {
    margin: 0 0 20px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.65);
}

.btn-cta {
    width: 100%;
    height: 48px;
    border: none;
    border-radius: 24px;
    background: $teal;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}
</style>
