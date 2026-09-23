// ============================================================
// js/data-tutorial.js — 教程章节与练习场景
// ============================================================

const TUTORIAL_CHAPTERS = [
  { id: 'basics', title: '基础战斗', hasScenario: true, content: `
    <h4>▍选中单位</h4><p>点击己方任意单位 → 侧栏显示武器、弹药、状态。</p>
    <h4>▍移动</h4><p>选中后地图出现<b>蓝色高亮格</b>，点任一格即移动到该格，本回合不能再动。</p>
    <h4>▍射击</h4><p>选中后点击射程内的敌人 → 按当前射击模式自动开火。</p>
    <h4>▍结束回合</h4><p>所有单位行动完毕，点侧栏下方"<b>结束回合</b>"交给 AI。</p>
    <h4>▍三条状态条</h4><p>每个单位底部有三条细横条：<b>血量</b>、<b>压制值</b>、<b>士气</b>。</p>
  ` },
  { id: 'suppress', title: '火力压制', hasScenario: true, content: `
    <h4>▍什么是压制</h4><p>被连续射击会累积<b>压制值</b>。共 5 级：</p>
    <table><tr><th>等级</th><th>效果</th></tr>
    <tr><td>无~II</td><td>命中下降，仍可开火</td></tr>
    <tr><td>III</td><td>无法开火，命中 -50%</td></tr>
    <tr><td>IV</td><td>无法开火，命中 -70%，每回合扣 SAN</td></tr>
    <tr><td>V</td><td>无法开火，命中 -90%，大幅扣 SAN</td></tr></table>
    <h4>▍怎么压制敌人</h4><p>切换"<b>压制射击</b>"模式。命中率只有 60%，但压制值翻倍。机枪类效率最高。</p>
    <h4>▍被压制了怎么办</h4><ul><li>进掩体或退到射程外</li><li>每回合结束压制自动 -8</li><li>被压到 III 级以上会掉 SAN</li></ul>
  ` },
  { id: 'grenades', title: '投掷物', hasScenario: true, content: `
    <h4>▍投掷手雷</h4><p>选中带手雷的单位 → 点侧栏"<b>投掷手雷</b>"→ 点目标格。</p>
    <h4>▍偏移机制</h4>
    <table><tr><th>概率</th><th>偏移</th></tr>
    <tr><td>50%</td><td>正中</td></tr>
    <tr><td>30%</td><td>偏 1 格</td></tr>
    <tr><td>15%</td><td>偏 2 格</td></tr>
    <tr><td>5%</td><td>偏 3 格</td></tr></table>
    <h4>▍伤害与弹震</h4><ul><li><b>0~2 格</b>：吃伤害</li><li><b>3~5 格</b>：只吃弹震</li><li><b>矮墙方向减伤</b></li></ul>
    <h4>▍友伤惩罚</h4><p>误伤友军 → 投掷者 SAN -5；误杀 → SAN -10。</p>
  ` },
  { id: 'cover', title: '掩体与方向', hasScenario: true, content: `
    <h4>▍掩体的作用</h4><p>掩体不是"减伤光环"，而是<b>按方向</b>挡住来自特定方位的攻击。</p>
    <ul><li><b>矮墙</b> — 只挡住你面对的那一面</li><li><b>道路</b> — 全线轻微掩体</li><li><b>空地</b> — 无掩体</li></ul>
    <p>⚠ 敌人绕到你侧后，矮墙就挡不住了。</p>
    <h4>▍掩体与隐蔽</h4>
    <table><tr><th>位置</th><th>恢复隐蔽</th></tr>
<tr><td>矮墙边</td><td>立刻恢复</td></tr>
<tr><td>道路</td><td>一回合不行动</td></tr>
<tr><td>空地</td><td><b>无法恢复</b></td></tr></table>
<p style="color:#f87171;">⚠ 一旦在空地上暴露，必须移动到掩体才能重新隐蔽。</p>
    <h4>▍掩体对爆炸物</h4>
    <ul><li><b>手雷 / Mk19</b> — 矮墙削伤</li><li><b>RPG</b> — 矮墙削伤，且会被摧毁</li><li><b>PF97 / 69-1F / MGS</b> — 完全无视矮墙</li></ul>
  ` },
  { id: 'broken', title: '崩溃与士气', hasScenario: true, content: `
    <h4>▍什么是崩溃</h4><p>当 <b>SAN 低于最大值 35%</b> 时单位崩溃。</p>
    <h4>▍崩溃表现</h4><ul><li>单位顶部出现红色 <b>⚠</b> 标志，对双方常亮</li><li>玩家<b>无法控制</b>该单位，由 AI 决定行动</li><li>50% 溃逃 / 50% 僵住</li></ul>
    <h4>▍怎么恢复</h4>
    <table><tr><th>周围有</th><th>效果</th></tr>
    <tr><td>无友军</td><td>不恢复</td></tr>
    <tr><td>普通友军</td><td>每回合 +2 SAN</td></tr>
    <tr><td>医疗兵 / 班长 / 副班长</td><td>立即脱离崩溃</td></tr></table>
  ` },
  { id: 'fireModes', title: '特殊射击模式', hasScenario: true, content: `
    <h4>▍短点射（默认）</h4><p>标准命中率，标准伤害。适合常规交火。</p>
    <h4>▍压制射击</h4><p>命中率 ×0.6，但压制值翻倍。适合打机枪组和集群。</p>
    <h4>▍狙击 / 精确打击</h4><p>命中率 88%~92%，伤害 ×1.5。<b>近距离命中会大幅下降</b>。</p>
    <h4>▍狙击手暴露机制</h4><p>狙击命中 HP&lt;60 的敌人后会被锁定，<b>无法射击直到脱离锁定</b>。</p>
    <h4>▍持续压制（自动 DMR）</h4><p>压制值极高（+55）。适合 M38 DMR / QBU-191。</p>
  ` },
  { id: 'armor', title: '呼叫载具支援', hasScenario: true, content: `
    <h4>▍可用载具</h4>
    <table><tr><th>载具</th><th>特点</th></tr>
    <tr><td>BTR-82A</td><td>30mm 机炮，10 发，区域压制+弹震</td></tr>
    <tr><td>MT-LBVM</td><td>12.7mm 重机枪，12 发，贯穿 2 格，压制 IV</td></tr>
    <tr><td>Stryker RV</td><td>M2HB 或 Mk19 可选</td></tr>
    <tr><td>Stryker MGS</td><td>105mm 榴霰弹，三角形覆盖，无视掩体</td></tr>
    <tr><td>ZSL-92</td><td>25mm 机炮，12 发，区域压制+弹震</td></tr></table>
    <h4>▍Stryker RV 的两种武器站</h4>
    <ul><li><b>M2HB 12.7mm</b>：点杀型，贯穿 2 格</li><li><b>Mk19 40mm</b>：广域压制型（范围大、带弹震）</li></ul>
    <h4>▍火力延迟</h4><p>呼叫后<b>下一回合开始</b>落地。所有载具落地后有<b>冷却</b>。</p>
    <h4>▍标记引导</h4><p>观察手可标记暴露的敌人，AI 优先打击标记区域。</p>
  ` },
  { id: 'conceal', title: '隐蔽和侦查', hasScenario: true, content: `
    <h4>▍隐蔽状态</h4><ul><li>开局全部单位<b>隐蔽</b></li><li>隐蔽单位在敌人视角<b>不显示</b></li><li>开火/移动 ≥2 格/被命中/被压制到 III 级 → 暴露</li></ul>
    <h4>▍恢复隐蔽</h4>
    <table><tr><th>位置</th><th>恢复隐蔽</th></tr>
<tr><td>矮墙边</td><td>立刻恢复</td></tr>
<tr><td>道路</td><td>一回合不行动</td></tr>
<tr><td>空地</td><td><b>无法恢复</b></td></tr></table>
<p style="color:#f87171;">⚠ 一旦在空地上暴露，必须移动到掩体才能重新隐蔽。</p>
    <h4>▍假棋子</h4><p>开火后再隐蔽的单位，会在敌人视角留下淡色+问号的<b>假棋子</b>。</p>
    <h4>▍强制攻击</h4><p>选中单位后点<b>任意格子</b>开火，隐蔽目标命中率大幅下降。</p>
  ` },
  { id: 'rocket', title: '火箭筒 / RPG', hasScenario: true, content: `
    <h4>▍RPG-7V2</h4><ul><li>主武器，伤害 70，外圈 15 + 弹震</li><li>命中会<b>摧毁目标方向的矮墙</b></li><li>命中后冷却 3~4 回合</li></ul>
    <h4>▍PF98A</h4><p>PLA 120mm 复装火箭筒，伤害 85，副手携带 2 发 HEMP。</p>
    <h4>▍PF89A</h4><p>副武器，单发 60 伤害，只打一发。</p>
    <h4>▍PF97 云爆弹</h4><p>副武器，直击 55 + 溅射 25，<b>无视掩体</b>。<b>友军也会受到伤害</b>。</p>
    <h4>▍AT4CS HE</h4><p>副武器，伤害 65，射程 7 格硬上限。</p>
    <h4>▍69-1F 空爆弹</h4><p>PLA 06 装甲步兵班专用，可击穿掩体，中心 65 / 外圈 30。</p>
  ` },
  { id: 'lmg', title: '轻机枪', hasScenario: true, content: `
    <h4>▍常见型号</h4><ul><li>QJB95-1 / M249 SAW / M27 IAR / RPK-16 / PKP（无贯穿）</li><li>QJS-161（短管）— PLA 2025 空突班</li><li>M250 — 美军 2025 NGSW 班</li></ul>
    <h4>▍副射手协作</h4><p>机枪手和副射手相邻会触发<b>协作</b>，命中提升。</p>
  ` },
  { id: 'hmg', title: '重机枪', hasScenario: true, content: `
    <h4>▍QJY-88</h4><ul><li>5.8mm，伤害 45，200 发弹箱</li></ul>
    <h4>▍核心特性：贯穿</h4><p>重机枪开火时会<b>穿过主目标打击后方 2 格内的敌人</b>：主目标全额伤害，后方敌人 60% 伤害。</p>
    <h4>▍QJY-88 的特殊机制</h4><ul><li>需要 <b>2 人操作</b></li><li>射手阵亡后武器留在原地，副射手/弹药手可接管</li></ul>
  ` },
  { id: 'dmr', title: '精确射手 / 狙击手', hasScenario: true, content: `
    <h4>▍常见型号</h4><ul><li>QBU-88 / SVDM / M38 DMR / QBU-191</li><li>M110A1 SDM-R / SPEAR DMR（美军 2025）</li></ul>
    <h4>▍狙击模式</h4><p>半自动：命中率 88%~92%，伤害 ×1.5。<b>近距离命中大幅下降</b>（≤3 格 ×0.65）。</p>
    <p>自动 DMR：持续压制，压制 +55。</p>
    <h4>▍狙击手暴露机制</h4><ul><li>击中 HP&lt;60 的敌人后<b>被锁定</b>，无法射击</li><li>每回合走侦查判定，可能解锁</li><li>敌人会向狙击方向盲射</li></ul>
  ` },
  { id: 'gl', title: '榴弹发射器', hasScenario: false, content: `<p style="color:#64748b;font-style:italic;margin-top:40px;">本章内容将在后续版本补充。</p>` },
];

const TUTORIAL_SCENARIOS = {
  basics: {
    hint: '点击己方步枪手选中 → 移动 → 点击敌人射击 → 击杀全部敌人',
    mapCols: 18, mapRows: 14, allowBroken: false,
    blue: [
      { name: '步枪手A', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, grenades: 4, col: 3, row: 6 },
      { name: '步枪手B', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, grenades: 4, col: 3, row: 8 },
    ],
    red: [
      { name: '靶标A', tutorialRole: 'dummy', role: 'rifle', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 0, col: 14, row: 6 },
      { name: '靶标B', tutorialRole: 'dummy', role: 'rifle', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 0, col: 14, row: 8 },
    ],
    victory: { type: 'eliminateAll' }
  },
  suppress: {
    hint: '选中机枪手 → 切换"压制射击" → 打任一靶标直到压制 III 级',
    mapCols: 18, mapRows: 14, allowBroken: false,
    blue: [
      { name: '机枪手', role: 'mg', team: 'mg', weapon: 'M249 SAW', weaponClass: '班用机枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.55, moveRange: 2, magSize: 200, spareMags: 0, damage: 34, isMG: true, mgSpec: 3, grenades: 0, col: 3, row: 7 },
      { name: '弹药手', role: 'ammo', team: 'mg', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 55, accuracy: 0.50, moveRange: 2, magSize: 30, spareMags: 3, damage: 26, supplyBoxes: 1, supplyBoxSize: 200, supplyBoxType: 'M249弹药箱', supplyRange: 1, grenades: 4, col: 4, row: 7 },
    ],
    red: [
      { name: '靶标A', tutorialRole: 'dummy', role: 'rifle', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 0, col: 13, row: 6 },
      { name: '靶标B', tutorialRole: 'dummy', role: 'rifle', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 0, col: 13, row: 7 },
      { name: '靶标C', tutorialRole: 'dummy', role: 'rifle', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 0, col: 13, row: 8 },
    ],
    victory: { type: 'suppressLevel3' }
  },
  grenades: {
    hint: '选中带手雷的步枪手 → 投掷手雷 → 命中矮墙后的靶标',
    mapCols: 18, mapRows: 14, allowBroken: false,
    blue: [
      { name: '步枪手A', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, grenades: 4, col: 3, row: 7 },
      { name: '步枪手B', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, grenades: 4, col: 3, row: 8 },
    ],
    red: [
      { name: '靶标A', tutorialRole: 'dummy', role: 'rifle', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 0, col: 11, row: 7 },
      { name: '靶标B', tutorialRole: 'dummy', role: 'rifle', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 0, col: 11, row: 8 },
    ],
    walls: [{ col: 10, row: 7, dirs: [3] }, { col: 10, row: 8, dirs: [3] }],
    victory: { type: 'grenadeKill' }
  },
  cover: {
    hint: '蓝方躲在矮墙后 → 敌人从正面进攻 → 击杀敌人',
    mapCols: 18, mapRows: 14, allowBroken: false,
    blue: [
      { name: '步枪手A', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, grenades: 4, col: 5, row: 7 },
      { name: '步枪手B', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, grenades: 4, col: 5, row: 8 },
    ],
    red: [
      { name: '进攻兵', tutorialRole: 'aggressive', attackMultiplier: { acc: 0.3, dmg: 0.15, suppress: 0.4 },
        role: 'rifle', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 0, col: 13, row: 7 },
    ],
    walls: [
      { col: 6, row: 7, dirs: [0, 5] },
      { col: 6, row: 8, dirs: [0, 5] },
    ],
    victory: { type: 'eliminateAll' }
  },
  broken: {
    hint: '敌机枪手会压制你 → 让步兵崩溃 → 让医疗兵靠近 → 恢复',
    mapCols: 18, mapRows: 14, allowBroken: true,
    blue: [
      { name: '步兵', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, grenades: 4, col: 3, row: 7 },
      { name: '医疗兵', role: 'medic', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.50, moveRange: 3, magSize: 30, spareMags: 5, medSupplies: 7, damage: 26, grenades: 2, col: 5, row: 7 },
    ],
    red: [
      { name: '敌机枪手', tutorialRole: 'aggressive',
        attackMultiplier: { acc: 0.4, dmg: 0.2, suppress: 1.5 },
        role: 'mg', team: 'mg', weapon: 'M249 SAW', weaponClass: '班用机枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.55, moveRange: 2, magSize: 200, spareMags: 0, damage: 34, isMG: true, mgSpec: 3, grenades: 0, col: 12, row: 7 },
    ],
    initialSAN: { blue0: 22 },
    victory: { type: 'crashAndRecover' }
  },
  fireModes: {
    hint: '选中精确射手 → 切换"狙击"模式 → 击杀 1 个靶标',
    mapCols: 18, mapRows: 14, allowBroken: false,
    blue: [
      { name: '精确射手', role: 'marksman', weapon: 'QBU-88', weaponClass: '半自动精确射手步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 65, accuracy: 0.80, moveRange: 3, magSize: 10, spareMags: 6, damage: 45, marksmanSpec: 2, suppressValue: 5, grenades: 2, col: 3, row: 7 },
    ],
    red: [
      { name: '靶标A', tutorialRole: 'dummy', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 26, grenades: 0, col: 14, row: 6 },
      { name: '靶标B', tutorialRole: 'dummy', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 26, grenades: 0, col: 14, row: 8 },
    ],
    victory: { type: 'snipeKill' }
  },
  armor: {
    hint: '选中侦查组长 → 呼叫 Stryker RV 或 MGS → 命中至少 2 个靶标',
    mapCols: 18, mapRows: 14, allowBroken: false,
    blue: [
      { name: '侦查组长', role: 'leader', isObserver: true, weapon: 'M4A1(4×光学)', weaponClass: '突击步枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 75, accuracy: 0.58, moveRange: 3, magSize: 30, spareMags: 6, damage: 26, grenades: 4, armorVehicles: ['Stryker RV', 'Stryker MGS'], armorCalls: { 'Stryker RV': 2, 'Stryker MGS': 1 }, col: 3, row: 7 },
    ],
    red: [
      { name: '靶标A', tutorialRole: 'dummy', role: 'rifle', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 0, col: 12, row: 6 },
      { name: '靶标B', tutorialRole: 'dummy', role: 'rifle', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 0, col: 12, row: 7 },
      { name: '靶标C', tutorialRole: 'dummy', role: 'rifle', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 0, col: 12, row: 8 },
    ],
    walls: [{ col: 12, row: 6, dirs: [3] }, { col: 12, row: 7, dirs: [3] }, { col: 12, row: 8, dirs: [3] }],
    victory: { type: 'armorHit2' }
  },
  conceal: {
    hint: '保持隐蔽 → 移动或开火会暴露 → 击杀 1 个靶标',
    mapCols: 18, mapRows: 14, allowBroken: false,
    blue: [
      { name: '观察手', role: 'deputy', isObserver: true, weapon: 'M4A1(4×光学)', weaponClass: '突击步枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.62, moveRange: 3, magSize: 30, spareMags: 5, damage: 26, grenades: 4, col: 3, row: 6 },
      { name: '侦察兵A', role: 'rifle', isObserver: true, weapon: 'M4A1(4×光学)', weaponClass: '突击步枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.58, moveRange: 3, magSize: 30, spareMags: 6, damage: 26, grenades: 4, col: 3, row: 7 },
      { name: '侦察兵B', role: 'rifle', isObserver: true, weapon: 'M4A1(4×光学)', weaponClass: '突击步枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.58, moveRange: 3, magSize: 30, spareMags: 6, damage: 26, grenades: 4, col: 3, row: 8 },
    ],
    red: [
      { name: '靶标A', tutorialRole: 'dummy', role: 'rifle', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 0, col: 13, row: 6 },
      { name: '巡逻兵', tutorialRole: 'aggressive', attackMultiplier: { acc: 0.3, dmg: 0.3, suppress: 0.5 },
        role: 'rifle', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 0, col: 13, row: 8 },
    ],
    victory: { type: 'stealthKill' }
  },
  rocket: {
    hint: '选中 RPG 射手 → 用 RPG 摧毁矮墙并击杀后面的机枪靶',
    mapCols: 18, mapRows: 14, allowBroken: false,
    blue: [
      { name: '榴弹手', role: 'rifle', team: 'rpg', weapon: 'RPG-7V2', weaponClass: '复装火箭筒', ammo: 'OG-7V', ammoBallistics: '5.45x39', sanMax: 60, accuracy: 0.50, moveRange: 3, magSize: 1, spareMags: 0, damage: 70, isRocket: true, rocketAmmo: 2, hasSecondaryWeapon: true, secondaryWeapon: 'AK-12', secondaryClass: '突击步枪', secondaryDamage: 28, secondaryMagSize: 30, secondaryMagAmmo: 30, secondarySpareMags: 3, secondaryAmmoType: '5.45mm', secondaryBallistics: '5.45x39', grenades: 2, col: 3, row: 7 },
      { name: '助理', role: 'assist', team: 'rpg', weapon: 'AK-12', weaponClass: '突击步枪', ammo: '5.45mm', ammoBallistics: '5.45x39', sanMax: 58, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 3, damage: 28, carriesRPG: 3, grenades: 4, col: 4, row: 7 },
    ],
    red: [
      { name: '机枪靶', tutorialRole: 'dummy', role: 'mg', team: 'mg', weapon: 'M249 SAW', weaponClass: '班用机枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.55, moveRange: 2, magSize: 200, spareMags: 0, damage: 34, isMG: true, mgSpec: 3, grenades: 0, col: 11, row: 7 },
    ],
    walls: [{ col: 10, row: 7, dirs: [3] }],
    victory: { type: 'destroyWallKill' }
  },
  lmg: {
    hint: '让机枪手和副射手相邻 → 击杀 2 个靶标',
    mapCols: 18, mapRows: 14, allowBroken: false,
    blue: [
      { name: '机枪手', role: 'mg', team: 'mg', weapon: 'M249 SAW', weaponClass: '班用机枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.55, moveRange: 2, magSize: 200, spareMags: 0, damage: 34, isMG: true, mgSpec: 3, grenades: 0, col: 3, row: 7 },
      { name: '副射手', role: 'assist', team: 'mg', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 26, mgSpec: 2, grenades: 4, col: 4, row: 7 },
    ],
    red: [
      { name: '靶标A', tutorialRole: 'dummy', role: 'rifle', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 0, col: 13, row: 6 },
      { name: '靶标B', tutorialRole: 'dummy', role: 'rifle', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 0, col: 13, row: 8 },
    ],
    victory: { type: 'mgKill2' }
  },
  hmg: {
    hint: '把敌人排成一列 → 用 QJY-88 一次贯穿命中 2 个靶标',
    mapCols: 18, mapRows: 14, allowBroken: false,
    blue: [
      { name: '机枪射手', role: 'mg', team: 'mg', weapon: 'QJY-88', weaponClass: '通用机枪（三脚架）', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 65, accuracy: 0.55, moveRange: 2, isMG: true, mgSpec: 3, mgBase: 7, damage: 45, magSize: 200, spareMags: 0, crewRequired: 2, grenades: 0, isQJY88Operator: true, col: 3, row: 7 },
      { name: '副射手', role: 'assist', team: 'mg', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 62, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, mgSpec: 2, grenades: 4, col: 4, row: 7 },
    ],
    red: [
      { name: '靶标A', tutorialRole: 'dummy', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 26, grenades: 0, col: 10, row: 7 },
      { name: '靶标B', tutorialRole: 'dummy', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 26, grenades: 0, col: 11, row: 7 },
      { name: '靶标C', tutorialRole: 'dummy', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 26, grenades: 0, col: 13, row: 5 },
    ],
    victory: { type: 'penetrateHit2' }
  },
  dmr: {
    hint: '切换狙击模式击杀靶标 → 然后承受巡逻兵反击 2 回合',
    mapCols: 18, mapRows: 14, allowBroken: false,
    blue: [
      { name: '精确射手', role: 'marksman', weapon: 'SVDM', weaponClass: '半自动精确射手步枪', ammo: '7.62mm', ammoBallistics: '7.62x54R', sanMax: 68, accuracy: 0.82, moveRange: 3, magSize: 10, spareMags: 4, damage: 62, marksmanSpec: 3, suppressValue: 5, grenades: 2, col: 3, row: 7 },
    ],
    red: [
      { name: '靶标A', tutorialRole: 'dummy', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, grenades: 0, col: 13, row: 7 },
      { name: '巡逻兵', tutorialRole: 'aggressive', attackMultiplier: { acc: 0.3, dmg: 0.3, suppress: 0.5 },
        role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, grenades: 0, col: 14, row: 6 },
    ],
    walls: [{ col: 12, row: 7, dirs: [3] }],
    victory: { type: 'snipeAndSurvive' }
  }
};