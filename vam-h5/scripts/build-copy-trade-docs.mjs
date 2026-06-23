import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
import id from '../src/plugin/i18n/copyTradeDocs/id.js'

const en = {
  intro: `Signal Introduction

Institutional automated trading signals are a trading system that combines market data analysis, intelligent strategy models, and automated trade execution. The system monitors in real time price movements, trading volume changes, market depth, and short-term trends of major digital assets such as BTC and ETH. Based on this analysis, the system automatically identifies short-term profit opportunities in the market and executes position opening, take profit, stop loss, and position closing according to the established strategy.

Institution Profile

MetaDomain Capital is a professional capital team focused on digital asset market research, strategy execution, and trading services. The institution primarily serves retail investors by providing intelligent trading strategies, institutional automated trading signals, and copy trading services. Through systematic trading models and automated execution mechanisms, MetaDomain Capital helps users participate more efficiently in trading major digital assets such as BTC, ETH, and other digital assets.

Strategy Advantages

Automated Trading

The system automatically identifies trading opportunities based on market movements and completes position opening, take profit, stop loss, and closing, reducing the need for continuous market monitoring and manual operational burden.

Data-Driven Strategy

The system comprehensively analyzes price trends, trading volume changes, market depth, and short-term trend signals to filter trading opportunities with higher execution value.

Strict Risk Management

Each transaction can be equipped with take profit, stop loss, position sizing, and risk control parameters to reduce the impact of market fluctuations on user funds.

Efficient Execution

When market conditions meet strategy requirements, the system can execute trades automatically, reducing hesitation, delays, and emotional decisions common in manual trading.

Adaptable to Various Market Conditions

Strategies can be applied in rising markets, sideways (consolidation) markets, and short-term correction scenarios, helping users adjust their trading approach to market conditions.

Risk Warning

Although institutional automated trading signals are supported by data analysis, strategy models, and automated execution mechanisms that can improve trading efficiency and help control risk, digital asset markets remain highly volatile and uncertain. Prices may change rapidly due to changes in market liquidity, sudden price movements, lack of market depth, network delays, or platform technical factors, which may result in transaction losses.

Investors using automated trading strategies should consider their risk tolerance, fund scale, and investment objectives. Position sizing, take profit targets, and stop loss limits should be set reasonably according to personal circumstances.

Automated trading systems are not risk-free investment instruments and do not guarantee fixed returns. All transaction results are influenced by market conditions. Therefore, investors are expected to participate rationally and make investment decisions carefully.`,

  agreement: `MetaDomain Capital Institutional Copy Trading Service User Agreement

I. Agreement Overview

This agreement is an explanatory document for users before participating in MetaDomain Capital institutional automated trading signals and copy trading services. Before using the related services, users must carefully read and fully understand this agreement, including but not limited to service descriptions, copy trading mechanisms, risk warnings, user responsibilities, and disclaimer clauses.

Once a user chooses to enable copy trading, connect a trading account, configure copy trading parameters, or participate in related transactions, they are deemed to have read, understood, and agreed to all contents of this agreement.

II. Service Description

MetaDomain Capital is a professional capital team focused on digital asset market research, strategy execution, and trading services. Its main services include market analysis, intelligent strategy signals, institutional automated trading signals, and copy trading assistance.

Institutional automated trading signals are based on real-time market data, price fluctuations, trading volume changes, short-term trends, and strategy model execution. The system identifies potential trading opportunities according to market conditions and opens positions, takes profit, stops loss, or closes positions when strategy conditions are met.

Users may choose to follow trading signals according to their own risk tolerance. Copy trading is an independent decision by the user, and all trading results are determined by market conditions.

III. Copy Trading Mechanism

After a user enables copy trading, the system executes related trading operations based on institutional strategy signals, including but not limited to:

Automatically identifying short-term trading opportunities;
Opening positions according to strategy conditions;
Setting or triggering take profit based on market changes;
Setting or triggering stop loss according to risk management requirements;
Closing positions when strategy targets or risk conditions are reached.

IV. User Authorization

By enabling copy trading, the user authorizes the system to execute trading operations based on institutional strategy signals, within the limits of trading permissions, fund amounts, and risk parameters set by the user.

Users must ensure the following:

They understand the basic rules of copy trading;
They are aware that trading may result in profits or losses;
They set trading positions according to their own fund conditions;
They set copy trading amounts, leverage, take profit, and stop loss;
They understand that market fluctuations may cause execution prices to differ from signal prices.

Users may adjust or disable copy trading at any time. After disabling, opened positions must still be monitored and managed by the user.

V. Risk Control

When executing strategies, MetaDomain Capital applies risk control mechanisms according to market conditions, including but not limited to:

Per-trade position control;
Take profit and stop loss settings;
Short-term volatility risk identification;
Abnormal market condition filtering;
Long/short direction strategy management;
Risk limits in case of consecutive losses.

However, all risk control measures cannot completely eliminate market risk. Digital asset markets are highly volatile, and losses may occur due to low liquidity, unexpected events, changes in market depth, network delays, or trading platform disruptions.

VI. Results

MetaDomain Capital automated trading signals and copy trading services aim to improve trading efficiency, reduce the pressure of manual market monitoring, and capture short-term opportunities through strategies.

The platform does not guarantee fixed profits, does not guarantee that every transaction will be profitable, and does not guarantee growth of user funds. Historical performance data or transaction examples are for reference only and do not guarantee future results.

All trading profits and losses are affected by market conditions, user fund size, position settings, trading parameters, and execution.

VII. User Responsibilities

Before participating in copy trading, users must assess their risk tolerance, fund conditions, and investment experience.

Users are responsible for:

Deciding whether to enable copy trading;
Setting fund amounts and position proportions reasonably;
Safeguarding accounts, passwords, verification codes, and other security information;
Not using borrowed funds, living expenses, or funds that cannot bear risk;
Regularly monitoring account positions, profit/loss, and market changes;
Fully bearing trading results and consequences of their own trading actions.

Losses caused by incorrect settings, account security issues, operational errors, or failure to monitor accounts are the user's responsibility.

VIII. Risk Warning

Digital asset trading is a high-risk investment, and market prices may fluctuate sharply in a short time. When following copy trading, users face risks including:

Capital loss;
Forced liquidation;
Slippage or execution delay;
Ineffective strategies;
Low liquidity;
Platform technical failures.

Users must fully understand: institutional automated trading signals are not risk-free instruments and are not capital-guaranteed investment products. Any trading strategy may incur losses under certain market conditions.

Participation in copy trading indicates that the user understands and is willing to bear related risks.

IX. Disclaimer

Market analysis, strategy signals, and copy trading services provided by MetaDomain Capital are for trading reference only and do not constitute binding investment advice, nor do they guarantee profits or capital protection.

Losses caused by market fluctuations, user account settings, platform rules, network delays, system maintenance, force majeure, or other factors beyond the institution's control are not the responsibility of MetaDomain Capital.

Users should assess risks independently, participate rationally, and set positions according to their own conditions.

X. Agreement Confirmation

By enabling copy trading services, users are deemed to have read, understood, and agreed to all contents of this agreement, and confirm:

They understand the risks of copy trading;
They know results are not fixed and losses are possible;
They agree that trading results are determined by market conditions;
They are willing to bear copy trading results themselves;
They participate according to their own funds and risk tolerance.

The contents of this agreement may be adjusted according to service rules and market conditions. Users should refer to the latest version displayed on the official page.`,

  risk: `Risk Disclosure Statement

Before using the automated trading signals and copy trading services provided by MetaDomain Capital, users must fully understand that digital asset trading carries a high level of risk. Market prices may change rapidly due to market fluctuations, liquidity changes, unexpected news, insufficient market depth, network delays, or platform technical factors, which may reduce profits or even cause fund losses.

Market analysis, strategy signals, and automated trading services provided by MetaDomain Capital serve only as reference and assistance for trading decisions. These services do not constitute capital protection guarantees, fixed profit guarantees, or binding investment advice. Any historical profit data, transaction examples, or past performance cannot guarantee future results.

After a user enables copy trading, the system executes transactions based on strategy signals within the limits of funds, position proportions, and risk management parameters set by the user. Actual execution prices and profit/loss results may differ due to market fluctuations, slippage, execution delays, leverage settings, or account parameter differences.

Users should consider their personal financial situation, risk tolerance, and trading experience before deciding to participate in copy trading. Users are also advised to set position size, take profit targets, and stop loss limits reasonably.

By using the related services, users are deemed to fully understand and be willing to bear all risks and consequences that may arise from digital asset trading and copy trading services.`
}

const zh = {
  intro: `信号介绍

机构自动交易信号是一种结合市场数据分析、智能策略模型与自动交易执行的交易系统。系统实时监控 BTC、ETH 等主要数字资产的价格走势、成交量变化、市场深度及短期趋势。基于上述分析，系统会自动识别市场中的短期盈利机会，并按照既定策略执行开仓、止盈、止损及平仓流程。

机构简介

MetaDomain Capital 是一支专注于数字资产市场研究、策略执行与交易服务的专业资本团队。机构主要面向零售投资者，提供智能交易策略、机构自动交易信号及跟单交易服务。通过系统化交易模型与自动执行机制，MetaDomain Capital 帮助用户更高效地参与 BTC、ETH 及其他主要数字资产的交易。

策略优势

自动交易

系统根据行情走势自动识别交易机会，并完成开仓、止盈、止损及平仓，减少持续盯盘需求，降低人工操作负担。

数据驱动策略

系统综合分析价格趋势、成交量变化、市场深度及短期趋势信号，筛选更具执行价值的交易机会。

严格风控机制

每笔交易可配置止盈、止损、仓位比例及风险控制参数，以降低市场波动对用户资金的影响。

高效执行

当市场条件满足策略要求时，系统可自动执行交易，减少人工交易中常见的犹豫、延迟与情绪化决策。

适应多种行情

策略可应用于上涨、横盘（震荡整理）及短期回调等行情，帮助用户根据市场情况调整交易方式。

风险提示

尽管机构自动交易信号依托数据分析、策略模型及自动执行机制，有助于提升交易效率并辅助风险控制，但数字资产市场仍具有较高波动性与不确定性。价格可能因市场流动性变化、价格剧烈波动、市场深度不足、网络延迟或平台技术因素而快速变化，从而导致交易亏损。

使用自动交易策略的投资者应结合自身风险承受能力、资金规模及投资目标进行考量。仓位大小、止盈目标及止损限制应合理设置，并符合个人实际情况。

自动交易系统并非无风险投资工具，也不保证固定收益。所有交易结果均受市场条件影响。因此，投资者应理性参与，谨慎作出投资决策。`,

  agreement: `MetaDomain Capital 机构跟单服务用户协议

一、协议说明

本协议是用户在参与 MetaDomain Capital 机构自动交易信号及跟单交易服务前的说明文件。使用相关服务前，用户须仔细阅读并充分理解本协议全部内容，包括但不限于服务说明、跟单机制、风险提示、用户责任及免责条款。

用户一旦选择开启跟单、绑定交易账户、设置跟单参数或参与相关交易，即视为已阅读、理解并同意本协议全部内容。

二、服务说明

MetaDomain Capital 是专注于数字资产市场研究、策略执行及交易服务的专业资本团队。主要服务包括市场分析、智能策略信号、机构自动交易信号及跟单辅助。

机构自动交易信号基于实时市场数据、价格波动、成交量变化、短期趋势及策略模型运行。系统将根据市场情况识别潜在交易机会，并在满足策略条件时进行开仓、止盈、止损或平仓。

用户可根据自身风险承受能力选择是否跟随交易信号。跟单行为为用户自主决定，所有交易结果由市场情况决定。

三、跟单机制

用户开启跟单后，系统将基于机构策略信号执行相关交易操作，包括但不限于：

自动识别短期交易机会；
按策略条件开仓；
根据市场变化设置或触发止盈；
按风险管理要求设置或触发止损；
在达到策略目标或风险条件时平仓。

四、用户授权说明

开启跟单功能即表示用户授权系统在其设定的交易权限、资金额度及风险参数范围内，基于机构策略信号执行交易操作。

用户须确保：

已了解跟单基本规则；
知晓交易可能产生盈利或亏损；
根据自身资金情况设置交易仓位；
设置跟单资金、杠杆、止盈及止损；
知晓市场波动可能导致成交价与信号价存在差异。

用户可随时调整或关闭跟单。关闭后，已开仓位仍须由用户自行关注与管理。

五、风控说明

MetaDomain Capital 在执行策略时将根据市场情况采取风控措施，包括但不限于：

单笔仓位控制；
止盈止损设置；
短期波动风险识别；
异常行情过滤；
多空方向策略管理；
连续亏损时的风险限制。

但任何风控措施均无法完全消除市场风险。数字资产市场波动剧烈，可能因流动性不足、突发事件、市场深度变化、网络延迟或交易平台故障而产生亏损。

六、收益说明

MetaDomain Capital 提供的自动交易信号及跟单服务旨在提升交易效率、减轻人工盯盘压力，并通过策略捕捉短期机会。

平台不保证固定盈利，不保证每笔交易盈利，也不保证用户资金增长。历史业绩数据或交易示例仅供参考，不构成对未来结果的保证。

所有交易盈亏受市场情况、用户资金规模、仓位设置、交易参数及执行情况影响。

七、用户责任

参与跟单前，用户应评估自身风险承受能力、资金状况及投资经验。

用户须负责：

自行决定是否开启跟单；
合理设置资金额度及仓位比例；
妥善保管账户、密码、验证码及其他安全信息；
不得使用借贷资金、生活必需资金或无法承担风险的资金；
定期关注账户持仓、盈亏及市场变化；
自行承担交易结果及交易行为后果。

因设置不当、账户安全问题、操作失误或未关注账户而产生的损失，由用户自行承担。

八、风险提示

数字资产交易属于高风险投资，市场价格可能在短时间内剧烈波动。跟单时用户可能面临以下风险：

本金亏损；
强制平仓；
滑点或执行延迟；
策略失效；
流动性不足；
平台技术故障。

用户须充分理解：机构自动交易信号并非无风险工具，亦非保本投资产品。任何交易策略在特定市场条件下均可能产生亏损。

参与跟单即表示用户理解并愿意承担相关风险。

九、免责声明

MetaDomain Capital 提供的市场分析、策略信号及跟单服务仅供交易参考，不构成具有约束力的投资建议，亦不保证盈利或本金安全。

因市场波动、用户账户设置、平台规则、网络延迟、系统维护、不可抗力或机构无法控制的其他因素导致的损失，MetaDomain Capital 不承担责任。

用户应独立评估风险，理性参与，并根据自身情况设置仓位。

十、协议确认

开启跟单服务即视为用户已阅读、理解并同意本协议全部内容，并确认：

理解跟单存在风险；
知晓收益不固定且可能亏损；
同意交易结果由市场情况决定；
愿意自行承担跟单交易结果；
在自身资金及风险承受能力范围内参与。

本协议内容可根据服务规则及市场情况调整，用户应以官方页面展示的最新版本为准。`,

  risk: `风险揭示书

在使用 MetaDomain Capital 提供的自动交易信号及跟单交易服务前，用户须充分理解：数字资产交易具有较高风险。市场价格可能因行情波动、流动性变化、突发消息、市场深度不足、网络延迟或平台技术因素而快速变化，从而导致收益减少甚至资金亏损。

MetaDomain Capital 提供的市场分析、策略信号及自动交易服务仅作为交易决策的参考与辅助，不构成本金保障、固定收益保证或具有约束力的投资建议。任何历史收益数据、交易示例或过往业绩均不能作为对未来结果的保证。

用户开启跟单后，系统将在用户设定的资金额度、仓位比例及风险管理参数范围内，基于策略信号执行交易。实际成交价格及盈亏结果可能因市场波动、滑点、执行延迟、杠杆设置或账户参数差异而有所不同。

用户在决定参与跟单前，应综合考虑自身财务状况、风险承受能力及交易经验，并建议合理设置仓位大小、止盈目标及止损限制。

使用相关服务即视为用户已充分理解并愿意承担数字资产交易及跟单服务可能产生的全部风险与后果。`
}

const s2tMap = {
  说明: '說明', 机构: '機構', 风险: '風險', 协议: '協議', 用户: '用戶', 投资: '投資',
  数字: '數字', 资产: '資產', 执行: '執行', 开仓: '開倉', 平仓: '平倉', 亏损: '虧損',
  利润: '利潤', 设置: '設置', 账户: '賬戶', 保证: '保證', 承担: '承擔', 阅读: '閱讀',
  参与: '參與', 盈亏: '盈虧', 绑定: '綁定', 须: '須', 触发: '觸發', 识别: '識別',
  过滤: '過濾', 连续: '連續', 减轻: '減輕', 捕获: '捕捉', 示例: '範例', 过往: '過往',
  业绩: '業績', 规模: '規模', 验证码: '驗證碼', 借贷: '借貸', 关注: '關注', 强制: '強制',
  延迟: '延遲', 失效: '失效', 流动性: '流動性', 故障: '故障', 约束: '約束', 独立: '獨立',
  维护: '維護', 调整: '調整', 官方: '官方', 展示: '展示', 版本: '版本', 揭示: '揭示',
  信号: '信號', 自动: '自動', 系统: '系統', 监控: '監控', 走势: '走勢', 成交量: '成交量',
  深度: '深度', 趋势: '趨勢', 盈利: '盈利', 止损: '止損', 止盈: '止盈', 团队: '團隊',
  研究: '研究', 服务: '服務', 面向: '面向', 零售: '零售', 投资者: '投資者', 智能: '智能',
  跟单: '跟單', 交易: '交易', 帮助: '幫助', 高效: '高效', 优势: '優勢', 行情: '行情',
  机会: '機會', 完成: '完成', 持续: '持續', 盯盘: '盯盤', 需求: '需求', 降低: '降低',
  人工: '人工', 操作: '操作', 负担: '負擔', 驱动: '驅動', 综合: '綜合', 分析: '分析',
  筛选: '篩選', 价值: '價值', 严格: '嚴格', 机制: '機制', 每笔: '每筆', 配置: '配置',
  仓位: '倉位', 比例: '比例', 波动: '波動', 影响: '影響', 资金: '資金', 高效: '高效',
  满足: '滿足', 要求: '要求', 常见: '常見', 犹豫: '猶豫', 情绪化: '情緒化', 决策: '決策',
  适应: '適應', 多种: '多種', 上涨: '上漲', 横盘: '橫盤', 震荡: '震盪', 整理: '整理',
  回调: '回調', 情况: '情況', 方式: '方式', 提示: '提示', 尽管: '儘管', 依托: '依託',
  数据: '數據', 模型: '模型', 有助于: '有助於', 提升: '提升', 效率: '效率', 辅助: '輔助',
  控制: '控制', 仍具: '仍具', 较高: '較高', 不确定性: '不確定性', 可能: '可能',
  流动性: '流動性', 变化: '變化', 剧烈: '劇烈', 不足: '不足', 网络: '網絡', 技术: '技術',
  因素: '因素', 快速: '快速', 导致: '導致', 使用: '使用', 策略: '策略', 应结合: '應結合',
  承受: '承受', 能力: '能力', 目标: '目標', 进行: '進行', 考量: '考量', 大小: '大小',
  限制: '限制', 合理: '合理', 符合: '符合', 个人: '個人', 实际: '實際', 并非: '並非',
  无风险: '無風險', 工具: '工具', 也不: '也不', 固定: '固定', 收益: '收益', 所有: '所有',
  结果: '結果', 均受: '均受', 条件: '條件', 因此: '因此', 理性: '理性', 谨慎: '謹慎',
  作出: '作出', 专业: '專業', 资本: '資本', 专注: '專注', 市场: '市場', 包括: '包括',
  潜在: '潛在', 行为: '行為', 自主: '自主', 决定: '決定', 开启: '開啟', 基于: '基於',
  相关: '相關', 限于: '限於', 额度: '額度', 参数: '參數', 范围内: '範圍內', 确保: '確保',
  了解: '了解', 基本: '基本', 规则: '規則', 知晓: '知曉', 产生: '產生', 自身: '自身',
  杠杆: '槓桿', 成交价: '成交價', 差异: '差異', 随时: '隨時', 关闭: '關閉', 已开: '已開',
  仍须: '仍須', 自行: '自行', 管理: '管理', 采取: '採取', 措施: '措施', 单笔: '單筆',
  异常: '異常', 多空: '多空', 方向: '方向', 任何: '任何', 无法: '無法', 完全: '完全',
  消除: '消除', 剧烈: '劇烈', 突发事件: '突發事件', 平台: '平台', 故障: '故障', 产生: '產生',
  旨在: '旨在', 压力: '壓力', 捕捉: '捕捉', 短期: '短期', 不保证: '不保證', 每笔: '每筆',
  增长: '增長', 历史: '歷史', 仅供: '僅供', 参考: '參考', 构成: '構成', 对未来: '對未來',
  评估: '評估', 状况: '狀況', 经验: '經驗', 负责: '負責', 是否: '是否', 妥善: '妥善',
  保管: '保管', 密码: '密碼', 不得: '不得', 生活: '生活', 必需: '必需', 无法: '無法',
  定期: '定期', 持仓: '持倉', 后果: '後果', 不当: '不當', 安全: '安全', 失误: '失誤',
  未关注: '未關注', 属于: '屬於', 高风险: '高風險', 短时间内: '短時間內', 面临: '面臨',
  以下: '以下', 本金: '本金', 滑点: '滑點', 充分: '充分', 理解: '理解', 保本: '保本',
  产品: '產品', 特定: '特定', 下均: '下均', 愿意: '願意', 免责: '免責', 声明: '聲明',
  仅供: '僅供', 具有: '具有', 约束力: '約束力', 建议: '建議', 亦不: '亦不', 本金: '本金',
  因市场: '因市場', 规则: '規則', 不可抗力: '不可抗力', 无法控制: '無法控制', 其他: '其他',
  导致: '導致', 损失: '損失', 责任: '責任', 确认: '確認', 视为: '視為', 已阅读: '已閱讀',
  知晓: '知曉', 不固定: '不固定', 同意: '同意', 愿意: '願意', 范围内: '範圍內', 可根据: '可根據',
  规则: '規則', 应以: '應以', 页面: '頁面', 最新: '最新', 为准: '為準', 在使用: '在使用',
  提供: '提供', 前: '前', 充分理解: '充分理解', 具有: '具有', 较高: '較高', 突发: '突發',
  消息: '消息', 从而: '從而', 减少: '減少', 甚至: '甚至', 仅作为: '僅作為', 辅助: '輔助',
  决策: '決策', 保障: '保障', 固定收益: '固定收益', 任何: '任何', 不能: '不能', 作为: '作為',
  未来: '未來', 将在: '將在', 设定: '設定', 管理: '管理', 实际: '實際', 成交: '成交',
  价格: '價格', 及: '及', 可能因: '可能因', 有所不同: '有所不同', 决定: '決定', 综合: '綜合',
  考虑: '考慮', 财务: '財務', 状况: '狀況', 建议: '建議', 视为: '視為', 已充分: '已充分',
  愿意: '願意', 承担: '承擔', 可能产生: '可能產生', 全部: '全部', 与: '與', 后果: '後果'
}

function toTraditional(text) {
  let out = text
  const keys = Object.keys(s2tMap).sort((a, b) => b.length - a.length)
  for (const k of keys) out = out.split(k).join(s2tMap[k])
  return out
}

const tw = {
  intro: toTraditional(zh.intro),
  agreement: toTraditional(zh.agreement),
  risk: toTraditional(zh.risk)
}

const outDir = path.join(root, 'src/plugin/i18n/copyTradeDocs')
fs.mkdirSync(outDir, { recursive: true })

function writeLang(name, data) {
  fs.writeFileSync(path.join(outDir, `${name}.js`), `export default ${JSON.stringify(data, null, 2)}\n`)
}

for (const [name, data] of Object.entries({ id, en, zh, tw })) writeLang(name, data)

const indexJs = `import id from './id.js'
import en from './en.js'
import zh from './zh.js'
import tw from './tw.js'

const PACKS = { id, en, zh, tw }

export function resolveCopyTradeDocLocale(locale) {
  const raw = String(locale || 'en')
  if (PACKS[raw]) return raw
  const short = raw.split('-')[0]
  if (PACKS[short]) return short
  return 'en'
}

export function getCopyTradeDocTexts(locale) {
  const key = resolveCopyTradeDocLocale(locale)
  return PACKS[key] || PACKS.en
}

export function getCopyTradeDocMessages(locale) {
  const texts = getCopyTradeDocTexts(locale)
  return {
    copy_trade_intro_doc_content: texts.intro,
    copy_trade_agreement_doc_content: texts.agreement,
    copy_trade_risk_doc_content: texts.risk
  }
}
`

fs.writeFileSync(path.join(outDir, 'index.js'), indexJs)
console.log('copyTradeDocs generated')
