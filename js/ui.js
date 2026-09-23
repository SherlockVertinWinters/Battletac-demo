// ============================================================
// js/ui.js — 单位信息面板、教程、班组选择、战斗初始化、
//            DLC 加载、返回主菜单
// ============================================================

function updateUnitInfo() {
  const el = document.getElementById('unitInfo');
  const u = game.selected;
  if (!u || !u.alive) { game.selected = null; el.innerHTML = '点击己方单位选择'; return; }
  const sup = u.suppressionLevel;
  const terr = terrainName(TERRAIN[u.col] ? TERRAIN[u.col][u.row] : 0);
  let wallCount = 0;
  for (let i = 0; i < 6; i++) if (hasWallAt(u.col, u.row, i)) wallCount++;
  let coverTxt = '无';
  if (wallCount > 0) coverTxt = `矮墙 ×${wallCount}（仅挡特定方向）`;
  else if (TERRAIN[u.col] && TERRAIN[u.col][u.row] === 1) coverTxt = '道路（最低掩体）';
  const moveBonus = (TERRAIN[u.col] && TERRAIN[u.col][u.row] === 1) ? ' +1' : '';
  const hl = u.healthLevel;
  const hlBadge = `<span class="health-badge hl-${hl.toLowerCase()}">${hl}级 · ${u.healthLevelName}</span>`;
  let supplyHTML = '';
  if (u.role === 'ammo' && !u.isOperatingQJY88) supplyHTML = `<div class="supply-line"><span>补给箱</span><span class="val ${u.supplyBoxes > 0 ? 'ammo-ok' : 'ammo-warn'}">×${u.supplyBoxes} · ${u.supplyBoxType || '—'}</span></div>`;
  let crewHTML = '';
  if (u.crewRequired > 1) {
    const crewed = u.isCrewed;
    crewHTML = `<div class="crew-line ${crewed ? 'active' : 'warn'}"><span>操作组</span><span class="val">${crewed ? '就绪' : '缺员'}</span></div>`;
  }
  let medHTML = '';
  if (u.role === 'medic') medHTML = `<div class="med-line"><span>医疗物资</span><span class="val ${u.medSupplies > 0 ? 'ammo-ok' : 'ammo-warn'}">×${u.medSupplies}</span></div>`;
  else medHTML = `<div class="med-line"><span>单兵急救包</span><span class="val ${u.firstAidKit > 0 ? 'ammo-ok' : 'ammo-warn'}">×${u.firstAidKit} ${u.stoppedBleeding ? '（已止血）' : ''}</span></div>`;
  let pairHTML = '';
  const pb = getPairBonus(u);
  if (u.team === 'mg' && (u.role === 'mg' || u.role === 'assist')) {
    if (pb > 0) pairHTML = `<div class="pair-line">✦ 协作：与${u.role==='mg'?'副射手':'机枪手'}相邻（命中提升）</div>`;
    else pairHTML = `<div style="font-size:11px;color:#94a3b8;margin-top:4px;">与${u.role==='mg'?'副射手':'机枪手'}相邻可触发【协作】</div>`;
  }
  let shockHTML = '';
  if (u.shockRounds > 0) { const desc = u.shockLevel === 1 ? '重度弹震：禁止射击，移动减半' : '轻度弹震：命中-40%'; shockHTML = `<div class="shock-line">⚠ 弹震中（剩余 ${u.shockRounds} 回合）：${desc}</div>`; }
  let brokenHTML = '';
  if (u.isBroken) brokenHTML = `<div class="broken-line">⚠ 崩溃中：由 AI 接管行动，需要友军/医疗兵/指挥员在 2 格内才能恢复</div>`;
  let dmrHTML = '';
  if (u.role === 'marksman' && !u.isAutoDMR && u.dmrLocked) dmrHTML = `<div class="broken-line">⚠ 被锁定：无法射击</div>`;
  let operatingHTML = '';
  if (u.isOperatingHeavy) operatingHTML = `<div class="platform-line">▢ 正在操作 ${u.weapon}</div>`;
  let rocketPoolHTML = '';
  if (u.isRocket && u.rocketPool) {
    const poolStr = Object.entries(u.rocketPool).map(([k,v]) => `${k} ×${v}`).join(' | ');
    const reloadStr = u.rpgCooldown > 0 ? `（装填中：${u.reloadingRocketType}，剩 ${u.rpgCooldown}）` : '';
    rocketPoolHTML = `<div class="platform-line">▢ 弹药池：${poolStr} ${reloadStr}</div>`;
  }
  let armorCallHTML = '';
  if (u.canCallArmor) {
    for (const v of u.armorVehicles) {
      const remain = u.armorCallMax[v] - u.armorCallCount[v];
      const cd = game.vehicleCooldowns[u.side][v] || 0;
      if (cd > 0) armorCallHTML += `<div class="platform-line">▢ ${v}：冷却中</div>`;
      else if (remain > 0) armorCallHTML += `<div class="platform-line">▢ ${v}：可用</div>`;
      else armorCallHTML += `<div class="platform-line">▢ ${v}：已用尽</div>`;
    }
  }
  let concealHTML = '';
  if (u.side === 'blue' && !game.isTutorial) {
    const state = u.isConcealed ? '隐蔽中' : '已暴露';
    const color = u.isConcealed ? '#67e8f9' : '#f87171';
    concealHTML = `<div class="conceal-line">◌ 状态：<span style="color:${color};font-weight:700;">${state}</span>`;
    if (u.lastFiredAt) concealHTML += ` · 上次开火 (${u.lastFiredAt.col},${u.lastFiredAt.row})`;
    concealHTML += `</div>`;
    if (u.isObserver && u.markCharges > 0) concealHTML += `<div class="conceal-line">◎ 标记可用</div>`;
  }
  const wd = u.activeWeaponData;
  const totalAmmo = wd.magAmmo + wd.spareMags * wd.magSize;
  const ammoClass = u.isOutOfAmmo ? 'ammo-warn' : (totalAmmo < wd.magSize * 2 ? 'ammo-warn' : 'ammo-ok');
  const ammoHTML = `<div class="ammo-line"><span>弹匣${wd.isSecondary ? '（副）' : ''}</span><span class="val ${ammoClass}">${wd.magAmmo} / ${wd.magSize} · 备用×${wd.spareMags}</span></div>`;
  const grenadeHTML = `<div class="grenade-line"><span>手雷</span><span class="val ${u.grenades > 0 ? 'ammo-ok' : 'ammo-warn'}">×${u.grenades}</span></div>`;
  const canShoot = u.canFire && !u.isOutOfAmmo;
  let weaponSwitchHTML = '';
  if (u.side === 'blue' && u.hasSecondaryWeapon) {
    if (u.currentWeapon === 'primary') {
      const secLabel = u.secondaryWeapon + (u.secondaryWeapon === 'PF89A' ? ` ×${u.pf89aAmmo}` : u.secondaryWeapon === 'AT4CS HE' ? ` ×${u.at4csAmmo}` : '');
      weaponSwitchHTML = `<button id="switchWeaponBtn" style="width:100%;margin-top:6px;background:#475569;padding:6px;font-size:11px;">切换至 ${secLabel}</button>`;
    } else {
      const priLabel = u.isRocket ? `${u.weapon} ×${u.rocketAmmo}` : u.weapon;
      weaponSwitchHTML = `<button id="switchWeaponBtn" style="width:100%;margin-top:6px;background:#a16207;padding:6px;font-size:11px;">切换至 ${priLabel}</button>`;
    }
  }
  let modeBtns = '';
  if (u.side === 'blue' && u.shockLevel !== 1 && !u.isBroken && !(u.isRocket && u.currentWeapon === 'primary') && !(u.hasSecondaryWeapon && u.currentWeapon === 'secondary')) {
    if (u.role === 'marksman') {
      if (u.isAutoDMR) modeBtns = `<div class="mode-btns"><button class="mode-btn ${u.fireMode === 'suppress' ? 'active' : ''}" data-mode="suppress">持续压制</button><button class="mode-btn ${u.fireMode === 'snipe' ? 'active' : ''}" data-mode="snipe">精确打击</button></div>`;
      else modeBtns = `<div class="mode-btns"><button class="mode-btn ${u.fireMode === 'suppress' ? 'active' : ''}" data-mode="suppress">压制射击</button><button class="mode-btn ${u.fireMode === 'snipe' ? 'active' : ''}" data-mode="snipe">狙击</button></div>`;
    } else {
      modeBtns = `<div class="mode-btns"><button class="mode-btn ${u.fireMode === 'normal' ? 'active' : ''}" data-mode="normal">短点射</button><button class="mode-btn ${u.fireMode === 'suppress' ? 'active' : ''}" data-mode="suppress">压制射击</button></div>`;
    }
  }
  const treatBtn = (u.side === 'blue' && u.role === 'medic' && u.medSupplies > 0 && !u.hasTreated) ? `<button id="treatBtn" style="width:100%;margin-top:6px;background:#22c55e;">选择治疗目标</button>` : '';
  const grenadeBtn = (u.side === 'blue' && u.grenades > 0 && !u.hasFired && u.shockLevel !== 1 && !u.isBroken) ? `<button id="grenadeBtn" class="grenade-btn ${game.throwMode ? 'active' : ''}">${game.throwMode ? '取消投掷' : '投掷手雷'}</button>` : '';
  const canGroundFire = u.side === 'blue' && !u.hasFired && u.shockLevel !== 1 && !u.isOutOfAmmo && u.canFire && !u.isBroken && !(u.isRocket && u.currentWeapon === 'primary') && !(u.hasSecondaryWeapon && u.currentWeapon === 'secondary' && (u.secondaryWeapon === 'PF97' || u.secondaryWeapon === 'AT4CS HE'));
  const groundBtn = canGroundFire ? `<button id="groundFireBtn" class="ground-btn ${game.groundFireMode ? 'active' : ''}">${game.groundFireMode ? '取消强制攻击' : '强制攻击'}</button>` : '';
  const markBtn = (u.side === 'blue' && u.isObserver && u.markCharges > 0 && !u.hasFired && u.shockLevel !== 1 && !u.isBroken) ? `<button id="markBtn" class="mark-btn ${game.markMode ? 'active' : ''}">${game.markMode ? '取消标记' : '◎ 标记目标'}</button>` : '';
  let takeoverBtn = '';
  if (u.side === 'blue' && !u.isOperatingHeavy && !u.hasMoved && !u.hasFired && !u.isBroken) {
    const platforms = game.droppedWeapons.filter(p => p.available && p.side === u.side);
    for (const p of platforms) { if (canTakeOverPlatform(u, p)) { takeoverBtn = `<button id="takeoverBtn" class="takeover-btn">▢ 接管 ${p.weapon}</button>`; break; } }
  }
  let armorBtnsHTML = '';
  if (u.side === 'blue' && u.canCallArmor && !u.isBroken) {
    for (const v of u.armorVehicles) {
      const remain = u.armorCallMax[v] - u.armorCallCount[v];
      const cd = game.vehicleCooldowns[u.side][v] || 0;
      if (cd > 0) armorBtnsHTML += `<button class="armor-btn" disabled>▢ ${v}（冷却）</button>`;
      else if (remain > 0 && !u.hasFired) {
        const active = game.callArmorMode && game.callArmorVehicle === v;
        armorBtnsHTML += `<button class="armor-btn armor-call ${active ? 'active' : ''}" data-vehicle="${v}">${active ? '取消' : `▢ 呼叫 ${v}`}</button>`;
      } else if (remain === 0) armorBtnsHTML += `<button class="armor-btn" disabled>${v} 已用尽</button>`;
    }
  }
  let rocketResupplyBtn = '';
  if (u.side === 'blue' && u.isRocket && u.rocketAmmo === 0) {
    const helper = game.units.find(o => o.alive && o.side === u.side && o.team === 'rpg' && o !== u && (o.carriesRPG > 0 || o.carriesRPGTypes) && hexDistance({col:u.col,row:u.row}, {col:o.col,row:o.row}) <= 1);
    if (helper) rocketResupplyBtn = `<button id="rocketResupplyBtn" style="width:100%;margin-top:6px;background:#22c55e;padding:6px;font-size:11px;">从 ${helper.name} 补充火箭弹</button>`;
  }
  el.innerHTML = `
    <div><span class="hl">${u.name}</span> (${u.side === 'blue' ? '蓝方' : '红方'}) ${hlBadge}</div>
    <div style="margin:4px 0;font-size:11px;color:#fbbf24;">${u.rank || ''}${u.isReinforcement ? ' · 增援' : ''}</div>
    ${(() => {
      if (u.currentWeapon === 'secondary' && u.hasSecondaryWeapon) return `<div class="weapon-box"><div><div class="wname">${u.secondaryWeapon}</div><div class="wammo">${u.secondaryAmmoType} · 伤害 ${u.secondaryDamage}</div><div class="wclass">${u.secondaryClass}</div></div></div>`;
      if (u.isRocket && u.currentWeapon === 'primary') {
        const cdTxt = u.rpgCooldown > 0 ? ` · 装填 ${u.rpgCooldown} 回合` : '';
        const typeStr = u.currentRocketType ? ` [${u.currentRocketType}]` : '';
        return `<div class="weapon-box"><div><div class="wname">${u.weapon}${typeStr}</div><div class="wammo">${u.ammoType} · 伤害 ${u.damage} · 剩余 ×${u.rocketAmmo}${cdTxt}</div><div class="wclass">${u.weaponClass}</div></div></div>`;
      }
      return `<div class="weapon-box"><div><div class="wname">${u.weapon}</div><div class="wammo">${u.ammoType} · 伤害 ${u.damage}</div>${u.weaponClass ? `<div class="wclass">${u.weaponClass}</div>` : ''}</div></div>`;
    })()}
    ${ammoHTML}${grenadeHTML}
    ${supplyHTML}${crewHTML}${medHTML}${pairHTML}${shockHTML}${brokenHTML}${dmrHTML}${operatingHTML}${rocketPoolHTML}${armorCallHTML}${concealHTML}
    ${weaponSwitchHTML}${modeBtns}${treatBtn}${grenadeBtn}${groundBtn}${markBtn}${takeoverBtn}${armorBtnsHTML}${rocketResupplyBtn}
    <div style="margin-top:6px;"><span>健康值:</span> ${Math.round(u.hp)} / 100</div>
    <div><span>压制:</span> ${sup.name === '无' ? '无' : sup.name + ' 级'}</div>
    <div><span>地形:</span> ${terr} ${coverTxt !== '无' ? '| ' + coverTxt : ''}</div>
    <div><span>可射击:</span> ${canShoot ? '是' : '否'}</div>
    <div><span>移动:</span> ${u.hasMoved ? '已移动' : '未移动'} | 射程 ${u.effectiveMoveRange}${moveBonus}</div>
    <div><span>射击:</span> ${u.hasFired ? '已射击' : '未射击'}</div>
  `;
  document.querySelectorAll('.mode-btn').forEach(btn => { btn.onclick = () => { if (game.selected && game.selected.side === 'blue') { game.selected.fireMode = btn.dataset.mode; updateUnitInfo(); } }; });
  document.querySelectorAll('.armor-call').forEach(btn => {
    btn.onclick = () => {
      const v = btn.dataset.vehicle;
      if (game.callArmorMode && game.callArmorVehicle === v) { game.callArmorMode = false; game.callArmorVehicle = null; }
      else { game.callArmorMode = true; game.callArmorVehicle = v; game.throwMode = false; game.pendingAction = null; game.groundFireMode = false; game.markMode = false; }
      updateUnitInfo(); render();
    };
  });
  const tb = document.getElementById('treatBtn');
  if (tb) tb.onclick = () => { game.pendingAction = 'treat'; game.throwMode = false; game.callArmorMode = false; game.callArmorVehicle = null; game.groundFireMode = false; game.markMode = false; log(`${u.name} 请点击相邻的己方伤员`); updateHighlights(); render(); };
  const gb = document.getElementById('grenadeBtn');
  if (gb) gb.onclick = () => { game.throwMode = !game.throwMode; game.pendingAction = null; game.callArmorMode = false; game.callArmorVehicle = null; game.groundFireMode = false; game.markMode = false; updateUnitInfo(); render(); };
  const gfb = document.getElementById('groundFireBtn');
  if (gfb) gfb.onclick = () => { game.groundFireMode = !game.groundFireMode; game.throwMode = false; game.callArmorMode = false; game.callArmorVehicle = null; game.pendingAction = null; game.markMode = false; updateUnitInfo(); render(); };
  const mb = document.getElementById('markBtn');
  if (mb) mb.onclick = () => { game.markMode = !game.markMode; game.throwMode = false; game.callArmorMode = false; game.callArmorVehicle = null; game.groundFireMode = false; game.pendingAction = null; updateUnitInfo(); render(); };
  const to = document.getElementById('takeoverBtn');
  if (to) to.onclick = () => {
    const platforms = game.droppedWeapons.filter(p => p.available && p.side === u.side);
    for (const p of platforms) { if (canTakeOverPlatform(u, p)) { takeOverPlatform(u, p); game.selected = null; game.highlights = []; render(); return; } }
  };
  const rb = document.getElementById('rocketResupplyBtn');
  if (rb) rb.onclick = () => { tryRocketResupply(game.selected); updateUnitInfo(); render(); };
  const sw = document.getElementById('switchWeaponBtn');
  if (sw) sw.onclick = () => { if (game.selected && game.selected.side === 'blue') { game.selected.currentWeapon = game.selected.currentWeapon === 'primary' ? 'secondary' : 'primary'; updateUnitInfo(); } };
}

// ============ 教程系统 ============
let currentTutorialChapter = 0;
let selectedSquadKey = null;
let selectedVehicleConfig = null;
let pendingVehicleSquad = null;
let selectedDMRConfig = null;
let pendingDMRSquad = null;

function renderTutorialNav() {
  const el = document.getElementById('tutNavList');
  el.innerHTML = '';
  TUTORIAL_CHAPTERS.forEach((ch, idx) => {
    const item = document.createElement('div');
    item.className = 'tut-nav-item' + (idx === currentTutorialChapter ? ' active' : '') + (!ch.hasScenario ? ' placeholder' : '');
    item.textContent = `${idx + 1}. ${ch.title}`;
    item.onclick = () => { currentTutorialChapter = idx; renderTutorialNav(); renderTutorialContent(); };
    el.appendChild(item);
  });
}
function renderTutorialContent() {
  const ch = TUTORIAL_CHAPTERS[currentTutorialChapter];
  const el = document.getElementById('tutContent');
  let html = `<h3>${ch.title}</h3>`;
  if (currentTutorialChapter === 0) {
    html += `<div class="welcome"><strong>指战员同志，欢迎来到《班战术兵棋》。</strong><br>本系统旨在为您提供我军和外军步兵班在交战时的模拟战场，锻炼您的指挥能力和战术规划。<br>左侧目录可切换章节，建议按顺序阅读。</div>`;
  }
  html += ch.content;
  el.innerHTML = html;
  document.getElementById('tutTryBtn').style.display = ch.hasScenario ? 'inline-block' : 'none';
}
function openTutorial() { document.getElementById('tutorial').classList.remove('hidden'); currentTutorialChapter = 0; renderTutorialNav(); renderTutorialContent(); }
function closeTutorial() { document.getElementById('tutorial').classList.add('hidden'); try { localStorage.setItem('bt_tutorial_seen', '1'); } catch (e) {} }

function startTutorialBattle() {
  const ch = TUTORIAL_CHAPTERS[currentTutorialChapter];
  if (!ch.hasScenario) return;
  const scenario = TUTORIAL_SCENARIOS[ch.id];
  if (!scenario) { alert('本课暂无练习场景'); return; }
  document.getElementById('tutorial').classList.add('hidden');
  document.getElementById('setup').classList.add('hidden');
  document.getElementById('vehicleSetup').classList.add('hidden');
  game.isTutorial = true;
  game.tutorialChapterId = ch.id;
  game.tutorialVictory = scenario.victory.type;
  game.tutorialVictoryAchieved = false;
  game.tutorialAllowBroken = scenario.allowBroken === true;
  game.playerSquad = null;
  game.aiSquad = null;
  game.mapCols = scenario.mapCols || COLS_TUTORIAL;
  game.mapRows = scenario.mapRows || ROWS_TUTORIAL;
  clearWalls();
  if (scenario.walls) for (const w of scenario.walls) addWallDirs(w.col, w.row, w.dirs);
  game.units = [];
  for (const u of scenario.blue) game.units.push(new Unit(u.name, 'blue', u.col, u.row, u));
  for (const u of scenario.red) game.units.push(new Unit(u.name, 'red', u.col, u.row, u));
  if (scenario.initialSAN) {
    for (const key in scenario.initialSAN) {
      if (key.startsWith('blue')) {
        const idx = parseInt(key.substring(4));
        const blueUnits = game.units.filter(u => u.side === 'blue');
        if (blueUnits[idx]) blueUnits[idx].san = scenario.initialSAN[key];
      }
    }
  }
  game.selected = null; game.turn = 'blue'; game.round = 1;
  game.log = []; game.highlights = []; game.busy = false; game.over = false;
  game.pendingAction = null; game.throwMode = false; game.callArmorMode = false;
  game.callArmorVehicle = null; game.groundFireMode = false; game.markMode = false;
  game.droppedWeapons = []; game.marks = []; game.decoyTrust = { red: 1.0 };
  game.pendingStrikes = [];
  game.vehicleCooldowns = { blue: { 'BTR-82A': 0, 'MT-LBVM': 0, 'Stryker RV': 0, 'Stryker MGS': 0, 'ZSL-92': 0 }, red: { 'BTR-82A': 0, 'MT-LBVM': 0, 'Stryker RV': 0, 'Stryker MGS': 0, 'ZSL-92': 0 } };
  game.playerFactionColor = '#1e40af';
  game.aiFactionColor = '#991b1b';
  game.medicCall = { blue: { pending: false, turnsLeft: 0, done: false }, red: { pending: false, turnsLeft: 0, done: false } };
  game.sniperDetected = { blue: false, red: false };
  game.sniperInfo = { blue: { col: null, row: null }, red: { col: null, row: null } };
  game.initialCounts = { blue: scenario.blue.length, red: scenario.red.length };
  game._tutInitRedCount = scenario.red.length;
  game._tutPenetrateHits = 0;
  game._tutSnipeKillDone = false;
  game._tutSnipeKillRound = 0;
  game._tutSawBroken = false;
  game._tutArmorHits = 0;
  let hintEl = document.querySelector('.tutorial-battle-hint');
  if (!hintEl) { hintEl = document.createElement('div'); hintEl.className = 'tutorial-battle-hint'; document.body.appendChild(hintEl); }
  hintEl.textContent = `📖 ${scenario.hint}`;
  hintEl.style.display = 'block';
  document.getElementById('tutBackToMenu').classList.remove('hidden');
  render();
  log(`=== 教程战斗：${ch.title} ===`);
  log(`目标：${scenario.hint}`);
  log(`⚠ 教程模式：己方单位不会阵亡`);
}

function exitTutorialBattle() {
  const hintEl = document.querySelector('.tutorial-battle-hint');
  if (hintEl) hintEl.style.display = 'none';
  document.getElementById('tutBackToMenu').classList.add('hidden');
  document.getElementById('victoryModal').classList.add('hidden');
  document.getElementById('tutorial').classList.remove('hidden');
  game.isTutorial = false;
  game.units = [];
  game.over = false; game.busy = false;
  game.mapCols = COLS_NORMAL; game.mapRows = ROWS_NORMAL;
  setupNormalWalls();
  render();
}

// ============ 班组选择 ============
function renderSquadList() {
  const el = document.getElementById('squadList');
  el.innerHTML = '';
  for (const catKey in CATEGORIES) {
    const cat = CATEGORIES[catKey];
    const title = document.createElement('div');
    title.className = 'category-title';
    title.textContent = cat.name;
    el.appendChild(title);
    for (const key in SQUADS) {
      const sq = SQUADS[key];
      if (sq.category !== catKey) continue;
      const card = document.createElement('div');
      card.className = 'squad-card';
      card.dataset.key = key;
      const unitBrief = sq.units.map(u => u.name).join('、');
      card.innerHTML = `
        <div class="sname"><span class="flag ${sq.flagClass}">${sq.faction}</span>${sq.name}</div>
        <div class="sdesc">${sq.desc}</div>
        <div class="sunits">${unitBrief}</div>
      `;
      card.addEventListener('click', () => {
        document.querySelectorAll('.squad-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedSquadKey = key;
        const btn = document.getElementById('startBtn');
        btn.disabled = false;
        btn.textContent = `开始战斗（${sq.name}）`;
      });
      el.appendChild(card);
    }
  }
}

function pickAIOpponent(playerKey) {
  const player = SQUADS[playerKey];
  const others = Object.keys(SQUADS).filter(k => k !== playerKey);
  let pool = others.filter(k => SQUADS[k].category === player.category && SQUADS[k].era === player.era);
  if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
  pool = others.filter(k => SQUADS[k].category === player.category);
  if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
  return others[Math.floor(Math.random() * others.length)];
}

function startBattle() {
  if (!selectedSquadKey) return;
  const playerSquad = SQUADS[selectedSquadKey];
  if (playerSquad.hasDMRConfig) {
    pendingDMRSquad = selectedSquadKey;
    const cfg = DMR_CONFIGS.dmr;
    const title = document.getElementById('vehicleSetupTitle');
    title.textContent = '选择精确射手武器';
    const opts = document.getElementById('vehicleOptions');
    opts.innerHTML = '';
    for (const optKey in cfg.options) {
      const opt = cfg.options[optKey];
      const btn = document.createElement('button');
      btn.className = 'vehicle-opt-btn';
      btn.dataset.key = optKey;
      btn.style.cssText = 'padding:16px;text-align:left;background:#0f172a;border:2px solid #334155;';
      btn.innerHTML = `<div style="font-size:15px;font-weight:700;color:#fbbf24;">${opt.label}</div><div style="font-size:12px;color:#94a3b8;margin-top:6px;">伤害 ${opt.damage} · 精度 ${opt.accuracy}</div>`;
      btn.onclick = () => {
        document.querySelectorAll('.vehicle-opt-btn').forEach(b => b.style.borderColor = '#334155');
        btn.style.borderColor = '#fbbf24';
        selectedDMRConfig = optKey;
      };
      opts.appendChild(btn);
    }
    selectedDMRConfig = 'spear';
    document.getElementById('vehicleSetup').classList.remove('hidden');
    return;
  }
  if (playerSquad.hasVehicleConfig) {
    pendingVehicleSquad = selectedSquadKey;
    const title = document.getElementById('vehicleSetupTitle');
    title.textContent = '选择载具配置';
    const cfg = VEHICLE_CONFIGS[playerSquad.hasVehicleConfig];
    const opts = document.getElementById('vehicleOptions');
    opts.innerHTML = '';
    for (const optKey in cfg.options) {
      const opt = cfg.options[optKey];
      const btn = document.createElement('button');
      btn.className = 'vehicle-opt-btn';
      btn.dataset.key = optKey;
      btn.style.cssText = 'padding:16px;text-align:left;background:#0f172a;border:2px solid #334155;';
      btn.innerHTML = `<div style="font-size:15px;font-weight:700;color:#fbbf24;">${opt.label}</div><div style="font-size:12px;color:#94a3b8;margin-top:6px;">${opt.shots} 发 · ${opt.hitChance * 100}% · ${opt.dmgPerHit} 伤害</div>`;
      btn.onclick = () => {
        document.querySelectorAll('.vehicle-opt-btn').forEach(b => b.style.borderColor = '#334155');
        btn.style.borderColor = '#fbbf24';
        selectedVehicleConfig = optKey;
      };
      opts.appendChild(btn);
    }
    selectedVehicleConfig = null;
    document.getElementById('vehicleSetup').classList.remove('hidden');
    return;
  }
  launchBattle(playerSquad, null, null);
}

function launchBattle(playerSquad, rvChoice, dmrChoice) {
  const aiKey = pickAIOpponent(selectedSquadKey);
  const aiSquad = SQUADS[aiKey];
  document.getElementById('setup').classList.add('hidden');
  initGame(playerSquad, aiSquad, rvChoice, dmrChoice);
}

const BLUE_POS = [
  [4,12],[5,12],[3,12],[3,13],[4,13],
  [2,12],[2,13],[5,13],[4,14],[3,14],
  [6,12],[6,13],[5,14]
];
const RED_POS = [
  [26,7],[25,7],[27,7],[25,8],[27,8],
  [26,8],[26,9],[25,9],[27,9],
  [24,7],[28,7],[26,6],[26,10]
];

function generateAIPositions(count) {
  const positions = [];
  const MIN_DIST = 3;
  const COLS_MIN = 23, COLS_MAX = 29;
  const ROWS_MIN = 3,  ROWS_MAX = 17;
  let guard = 0;
  while (positions.length < count && guard < 800) {
    guard++;
    const c = COLS_MIN + Math.floor(Math.random() * (COLS_MAX - COLS_MIN + 1));
    const r = ROWS_MIN + Math.floor(Math.random() * (ROWS_MAX - ROWS_MIN + 1));
    if (TERRAIN[c] && TERRAIN[c][r] === 1) continue;
    if (positions.some(p => hexDistance({col:c,row:r}, {col:p[0],row:p[1]}) < MIN_DIST)) continue;
    positions.push([c, r]);
  }
  while (positions.length < count) positions.push([26, 8 + positions.length]);
  return positions;
}

function initGame(playerSquad, aiSquad, rvChoice, dmrChoice) {
  game.playerSquad = playerSquad;
  game.aiSquad = aiSquad;
  const playerRvKey = rvChoice || 'M2HB';
  const aiRvKey = Math.random() < 0.5 ? 'M2HB' : 'Mk19';
  game.playerRvKey = playerRvKey;
  game.aiRvKey = aiRvKey;
  game.mapCols = COLS_NORMAL; game.mapRows = ROWS_NORMAL;
  setupNormalWalls();
  game.units = [
    ...buildUnitsFromSquad(playerSquad, 'blue', BLUE_POS, playerRvKey, dmrChoice || 'spear'),
    ...buildUnitsFromSquad(aiSquad, 'red', generateAIPositions(aiSquad.units.length), aiRvKey, 'spear'),
  ];
  game.initialCounts = { blue: playerSquad.units.length, red: aiSquad.units.length };
  game.selected = null; game.turn = 'blue'; game.round = 1;
  game.log = []; game.highlights = []; game.busy = false; game.over = false;
  game.pendingAction = null; game.throwMode = false; game.callArmorMode = false;
  game.callArmorVehicle = null; game.groundFireMode = false; game.markMode = false;
  game.playerFactionColor = playerSquad.factionColor || '#1e40af';
  game.aiFactionColor = aiSquad.factionColor || '#991b1b';
  game.medicCall = { blue: { pending: false, turnsLeft: 0, done: false }, red: { pending: false, turnsLeft: 0, done: false } };
  game.sniperDetected = { blue: false, red: false };
  game.sniperInfo = { blue: { col: null, row: null }, red: { col: null, row: null } };
  game.droppedWeapons = []; game.marks = [];
  game.decoyTrust = { red: 1.0 };
  game.isTutorial = false; game.tutorialChapterId = null;
  game.pendingStrikes = [];
  game.vehicleCooldowns = { blue: { 'BTR-82A': 0, 'MT-LBVM': 0, 'Stryker RV': 0, 'Stryker MGS': 0, 'ZSL-92': 0 }, red: { 'BTR-82A': 0, 'MT-LBVM': 0, 'Stryker RV': 0, 'Stryker MGS': 0, 'ZSL-92': 0 } };
  game.playerSquadName = playerSquad.name;
  game.aiSquadName = aiSquad.name;
  game.playerCategory = playerSquad.category;
  log('=== 战斗开始 ===');
  log(`蓝方：${playerSquad.name}`);
  log(`红方：${aiSquad.name}`);
  render();
}

function buildUnitsFromSquad(squad, side, positions, rvKey, dmrChoice) {
  return squad.units.map((u, i) => {
    const pos = positions[i] || [side === 'blue' ? 3 + i % 5 : 26 - i % 5, 12 + Math.floor(i / 5)];
    const opts = { ...u };
    if (u.isConfigurable && u.configKey === 'dmr' && DMR_CONFIGS.dmr.options[dmrChoice]) {
      const dc = DMR_CONFIGS.dmr.options[dmrChoice];
      delete opts.isConfigurable; delete opts.configKey;
      Object.assign(opts, {
        weapon: dc.weapon, weaponClass: dc.weaponClass,
        ammo: dc.ammo, ammoBallistics: dc.ammoBallistics,
        accuracy: dc.accuracy, damage: dc.damage,
        magSize: dc.magSize, spareMags: dc.spareMags,
        marksmanSpec: dc.marksmanSpec, suppressValue: dc.suppressValue,
        shotCostSnipe: dc.shotCostSnipe, shotCostSuppress: dc.shotCostSuppress
      });
    }
    const unit = new Unit(u.name, side, pos[0], pos[1], opts);
    if (rvKey && VEHICLE_CONFIGS['Stryker RV'].options[rvKey] && unit.armorVehicles.includes('Stryker RV')) {
      const base = ARMOR_SUPPORT['Stryker RV'];
      const opt = VEHICLE_CONFIGS['Stryker RV'].options[rvKey];
      unit.resolvedArmorSupport = unit.resolvedArmorSupport || {};
      unit.resolvedArmorSupport['Stryker RV'] = Object.assign({}, base, opt);
    }
    return unit;
  });
}

function backToMenu() {
  game.units = []; game.selected = null; game.turn = 'blue'; game.round = 1;
  game.log = []; game.highlights = []; game.busy = false; game.over = false;
  game.pendingAction = null; game.throwMode = false; game.callArmorMode = false;
  game.callArmorVehicle = null; game.groundFireMode = false; game.markMode = false;
  game.droppedWeapons = []; game.marks = []; game.pendingStrikes = [];
  game.decoyTrust = { red: 1.0 };
  game.isTutorial = false; game.tutorialChapterId = null;
  game.playerSquad = null;
  game.aiSquad = null;
  game.mapCols = COLS_NORMAL; game.mapRows = ROWS_NORMAL;
  setupNormalWalls();
  document.getElementById('logContent').innerHTML = '';
  document.getElementById('unitInfo').innerHTML = '点击己方单位选择';
  document.getElementById('statusInfo').innerHTML = '无待命增援';
  selectedSquadKey = null;
  selectedVehicleConfig = null; selectedDMRConfig = null;
  document.querySelectorAll('.squad-card').forEach(c => c.classList.remove('selected'));
  const btn = document.getElementById('startBtn');
  btn.disabled = true; btn.textContent = '请先选择一个班组';
  document.getElementById('setup').classList.remove('hidden');
  document.getElementById('tutorial').classList.add('hidden');
  document.getElementById('vehicleSetup').classList.add('hidden');
  document.getElementById('victoryModal').classList.add('hidden');
  document.getElementById('tutBackToMenu').classList.add('hidden');
  const hintEl = document.querySelector('.tutorial-battle-hint');
  if (hintEl) hintEl.style.display = 'none';
  render();
}

// ============ DLC 加载 ============
function updateDLCBtn() {
  const btn = document.getElementById('dlcBtn');
  if (!btn) return;
  if (DLC_UNLOCKED) {
    btn.textContent = '✓ DLC 已解锁';
    btn.classList.add('unlocked');
    btn.disabled = true;
  } else {
    btn.textContent = '🔓 加载 DLC';
    btn.classList.remove('unlocked');
    btn.disabled = false;
  }
}
function updateDLCListUI() {
  const el = document.getElementById('dlcList');
  if (!el) return;
  let html = '';
  for (const id in DLC_REGISTRY) {
    const dlc = DLC_REGISTRY[id];
    const status = DLC_UNLOCKED ? '<span class="ok">✓ 已解锁</span>' : '<span class="no">🔒 未解锁</span>';
    html += `<div class="dlc-item"><strong>${dlc.name}</strong> — ${dlc.description} ${status}</div>`;
  }
  el.innerHTML = html || '<div style="color:#64748b;">暂无可加载 DLC</div>';
}
function showDLCModal() {
  document.getElementById('dlcModal').classList.remove('hidden');
  document.getElementById('dlcInput').value = '';
  document.getElementById('dlcErr').textContent = '';
  document.getElementById('dlcErr').style.color = '#f87171';
  updateDLCListUI();
  setTimeout(() => document.getElementById('dlcInput').focus(), 100);
}
function hideDLCModal() {
  document.getElementById('dlcModal').classList.add('hidden');
}
function unlockAllDLCs() {
  for (const dlcId in DLC_REGISTRY) {
    const dlc = DLC_REGISTRY[dlcId];
    for (const key in dlc.squads) {
      SQUADS[key] = dlc.squads[key];
    }
  }
  DLC_UNLOCKED = true;
  try { localStorage.setItem('bt_dlc_unlocked', '1'); } catch (e) {}
  renderSquadList();
  updateDLCBtn();
  updateDLCListUI();
  log(`<span style="color:#4ade80;font-weight:700;">✓ 已解锁全部 DLC</span>`);
}
function tryUnlockDLC() {
  const val = document.getElementById('dlcInput').value.trim();
  if (val === DLC_PASSWORD) {
    unlockAllDLCs();
    document.getElementById('dlcErr').style.color = '#4ade80';
    document.getElementById('dlcErr').textContent = '✓ 解锁成功！';
    setTimeout(() => { hideDLCModal(); }, 1200);
  } else {
    document.getElementById('dlcErr').style.color = '#f87171';
    document.getElementById('dlcErr').textContent = '密码错误';
  }
}