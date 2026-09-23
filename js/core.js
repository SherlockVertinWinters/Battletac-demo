// ============================================================
// js/core.js — 游戏状态、单位类、六角数学、墙、地形、隐蔽、
//              崩溃、医疗、平台接管、胜负判定
// ============================================================

const game = {
  units: [], selected: null, turn: 'blue',
  round: 1, log: [], highlights: [], busy: false, over: false,
  playerSquadName: '', aiSquadName: '', playerCategory: '',
  playerSquad: null, aiSquad: null,
  initialCounts: { blue: 0, red: 0 },
  pendingAction: null,
  throwMode: false,
  callArmorMode: false,
  callArmorVehicle: null,
  groundFireMode: false,
  markMode: false,
  playerFactionColor: '#1e40af',
  aiFactionColor: '#991b1b',
  medicCall: { blue: { pending: false, turnsLeft: 0, done: false }, red: { pending: false, turnsLeft: 0, done: false } },
  sniperDetected: { blue: false, red: false },
  sniperInfo: { blue: { col: null, row: null }, red: { col: null, row: null } },
  droppedWeapons: [],
  marks: [],
  decoyTrust: { red: 1.0 },
  isTutorial: false,
  tutorialChapterId: null,
  tutorialVictory: null,
  tutorialVictoryAchieved: false,
  tutorialAllowBroken: false,
  mapCols: COLS_NORMAL, mapRows: ROWS_NORMAL,
  playerRvKey: 'M2HB',
  aiRvKey: 'M2HB',
  pendingStrikes: [],
  vehicleCooldowns: {
    blue: { 'BTR-82A': 0, 'MT-LBVM': 0, 'Stryker RV': 0, 'Stryker MGS': 0, 'ZSL-92': 0, 'ZSL-92A': 0, 'AAV7A1 (Mk19)': 0, 'AAV7A1 (M2HB)': 0 },
    red:  { 'BTR-82A': 0, 'MT-LBVM': 0, 'Stryker RV': 0, 'Stryker MGS': 0, 'ZSL-92': 0, 'ZSL-92A': 0, 'AAV7A1 (Mk19)': 0, 'AAV7A1 (M2HB)': 0 }
  }
};

const HEX_DIRS = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];

function offsetToAxial(col, row) { return { q: col, r: row - (col - (col & 1)) / 2 }; }
function axialToOffset(q, r) { return { col: q, row: r + (q - (q & 1)) / 2 }; }

function hexDistance(a, b) {
  const A = offsetToAxial(a.col, a.row);
  const B = offsetToAxial(b.col, b.row);
  return (Math.abs(A.q - B.q) + Math.abs(A.q + A.r - B.q - B.r) + Math.abs(A.r - B.r)) / 2;
}

function getAttackDir(target, attacker) {
  const A = offsetToAxial(target.col, target.row);
  const B = offsetToAxial(attacker.col, attacker.row);
  const dq = B.q - A.q, dr = B.r - A.r;
  let best = 0, bestDot = -Infinity;
  for (let i = 0; i < 6; i++) {
    const [dq0, dr0] = HEX_DIRS[i];
    const dot = dq * dq0 + dr * dr0;
    if (dot > bestDot) { bestDot = dot; best = i; }
  }
  return best;
}

function getHexDirection(from, to) {
  const A = offsetToAxial(from.col, from.row);
  const B = offsetToAxial(to.col, to.row);
  const dq = B.q - A.q, dr = B.r - A.r;
  let best = HEX_DIRS[0], bestDot = -Infinity;
  for (const [dq0, dr0] of HEX_DIRS) {
    const dot = dq * dq0 + dr * dr0;
    if (dot > bestDot) { bestDot = dot; best = [dq0, dr0]; }
  }
  return best;
}

const EDGE_WALL = new Set();
function addWall(col, row, dirIdx) {
  EDGE_WALL.add(`${col},${row},${dirIdx}`);
  const A = offsetToAxial(col, row);
  const [dq, dr] = HEX_DIRS[dirIdx];
  const nb = axialToOffset(A.q + dq, A.r + dr);
  if (nb.col >= 0 && nb.col < game.mapCols && nb.row >= 0 && nb.row < game.mapRows) {
    EDGE_WALL.add(`${nb.col},${nb.row},${(dirIdx + 3) % 6}`);
  }
}
function hasWallAt(col, row, dirIdx) { return EDGE_WALL.has(`${col},${row},${dirIdx}`); }
function unitHasAnyWall(u) {
  for (let i = 0; i < 6; i++) if (hasWallAt(u.col, u.row, i)) return true;
  return false;
}
function isExplosionBlocked(centerHex, targetUnit) {
  if (!targetUnit || !targetUnit.alive) return false;
  const dir = getAttackDir(targetUnit, centerHex);
  return hasWallAt(targetUnit.col, targetUnit.row, dir);
}
function clearWalls() { EDGE_WALL.clear(); }
function addWallDirs(col, row, dirs) { for (const d of dirs) addWall(col, row, d); }

const TERRAIN = [];
for (let c = 0; c < COLS_NORMAL; c++) {
  TERRAIN[c] = [];
  for (let r = 0; r < ROWS_NORMAL; r++) TERRAIN[c][r] = 0;
}
for (let c = 0; c < COLS_NORMAL; c++) {
  const rr = (c % 2 === 0) ? 10 : 9;
  TERRAIN[c][rr] = 1;
}

function setupNormalWalls() {
  clearWalls();
  addWallDirs(5, 3, [0, 1, 2]);
  addWallDirs(5, 4, [0, 1, 5]);
  addWallDirs(23, 4, [0, 1, 2]);
  addWallDirs(24, 4, [1, 2, 3]);
  addWallDirs(9, 8, [0, 1, 2, 3]);
  addWallDirs(9, 9, [0, 1, 5]);
  addWallDirs(10, 8, [1, 2]);
  addWallDirs(4, 14, [0, 1, 2]);
  addWallDirs(4, 15, [0, 1, 5]);
  addWallDirs(14, 16, [1, 2, 3]);
  addWallDirs(14, 17, [0, 1, 5]);
  addWallDirs(23, 12, [0, 1, 2]);
  addWallDirs(24, 12, [1, 2, 3]);
  addWallDirs(23, 13, [0, 1, 5]);
  addWallDirs(12, 5, [0, 1]);
  addWallDirs(17, 12, [4, 5]);
  addWallDirs(7, 11, [0, 1]);
}

function terrainName(t) { return ['空地','道路'][t] || '空地'; }

function getConcealment(u) {
  if (u.isObserver) return 0.85;
  if (u.role === 'marksman') return 0.85;
  if (u.isMG || u.role === 'mg') return 0.35;
  if (u.isRocket || u.team === 'rpg') return 0.50;
  return 0.60;
}
function getDetection(u) {
  if (u.isObserver) return 0.75;
  if (u.role === 'marksman') return 0.75;
  if (u.isMG || u.role === 'mg') return 0.40;
  if (u.isRocket || u.team === 'rpg') return 0.45;
  return 0.50;
}
function getMGSConeCells(vertexCol, vertexRow, side) {
  const A = offsetToAxial(vertexCol, vertexRow);
  const cells = [];
  const dir = side === 'blue' ? 1 : -1;
  for (let k = 0; k <= 2; k++) {
    for (let j = 0; j <= k; j++) {
      const aq = A.q + k * dir;
      const ar = A.r - j;
      const off = axialToOffset(aq, ar);
      if (off.col >= 0 && off.col < game.mapCols && off.row >= 0 && off.row < game.mapRows) {
        cells.push({ col: off.col, row: off.row, ring: k });
      }
    }
  }
  return cells;
}

class Unit {
  constructor(name, side, col, row, opts = {}) {
    this.name = name; this.side = side;
    this.col = col; this.row = row;
    this.hp = 100;
    this.sanMax = opts.sanMax || 60;
    this.san = this.sanMax;
    this.suppression = 0;
    this.moveRange = opts.moveRange || 3;
    this.accuracy = opts.accuracy || 0.55;
    this.damage = opts.damage || 30;
    this.isMG = opts.isMG || false;
    this.mgSpec = opts.mgSpec || 0;
    this.mgBase = opts.mgBase || 5;
    this.role = opts.role || 'rifle';
    this.team = opts.team || '';
    this.rank = opts.rank || '';
    this.weapon = opts.weapon || '';
    this.weaponClass = opts.weaponClass || '';
    this.ammoType = opts.ammo || '';
    this.magSize = opts.magSize || 30;
    this.magAmmo = this.magSize;
    this.spareMags = opts.spareMags !== undefined ? opts.spareMags : 5;
    this.fireMode = 'normal';
    if (this.role === 'marksman') this.fireMode = 'suppress';
    this.hasMoved = false;
    this.hasFired = false;
    this.alive = true;
    this.supplyBoxes = opts.supplyBoxes || 0;
    this.supplyBoxSize = opts.supplyBoxSize || 0;
    this.supplyBoxType = opts.supplyBoxType || '';
    this.supplyRange = opts.supplyRange || 1;
    this.supplyType = opts.supplyType || '';
    this.medSupplies = opts.medSupplies || 0;
    this.medRange = 1;
    this.hasTreated = false;
    this.firstAidKit = 1;
    this.stoppedBleeding = false;
    this.isReinforcement = opts.isReinforcement || false;
    this.crewRequired = opts.crewRequired || 1;
    this.suppressValue = opts.suppressValue || (this.isMG ? 5 : 3);
    this.marksmanSpec = opts.marksmanSpec || 0;
    this.hasPF89A = opts.hasPF89A || false;
    this.isAutoDMR = opts.isAutoDMR || false;
    this.isObserver = opts.isObserver || false;
    this.interruptedUntilRound = 0;
    this.grenades = opts.grenades || 0;
    this.shockRounds = 0;
    this.shockLevel = 0;
    this.isQJY88Operator = opts.isQJY88Operator || false;
    this.isOperatingQJY88 = false;
    this.isOperatingHeavy = false;
    this.ammoBallistics = opts.ammoBallistics || (
      this.ammoType.startsWith('5.8') ? '5.8x42' :
      this.ammoType.startsWith('5.56') ? '5.56x45' :
      this.ammoType.startsWith('5.45') ? '5.45x39' :
      this.ammoType.startsWith('7.62') ? '7.62x54R' :
      this.ammoType.startsWith('6.8') ? '6.8x51' :
      this.ammoType.startsWith('6.5') ? '6.5CM' :
      '5.8x42'
    );
    this.hasSecondaryWeapon = opts.hasSecondaryWeapon || false;
    this.secondaryWeapon = opts.secondaryWeapon || '';
    this.secondaryClass = opts.secondaryClass || '';
    this.secondaryDamage = opts.secondaryDamage || 0;
    this.secondaryMagSize = opts.secondaryMagSize || 0;
    this.secondaryMagAmmo = opts.secondaryMagAmmo || 0;
    this.secondarySpareMags = opts.secondarySpareMags || 0;
    this.secondaryAmmoType = opts.secondaryAmmoType || '';
    this.secondaryBallistics = opts.secondaryBallistics || '';
    this.currentWeapon = 'primary';
    this.isRocket = opts.isRocket || false;
    this.rocketAmmo = opts.rocketAmmo || 0;
    this.rpgCooldown = 0;
    this.carriesRPG = opts.carriesRPG || 0;
    this.carriesRPGTypes = opts.carriesRPGTypes || null;
    this.pf89aAmmo = opts.pf89aAmmo || (opts.hasPF89A ? 1 : 0);
    this.hasAT4CS = opts.hasAT4CS || false;
    this.at4csAmmo = opts.at4csAmmo || (opts.hasAT4CS ? 1 : 0);
    this.currentRocketType = opts.currentRocketType || null;
    this.rocketPool = opts.rocketPool || null;
    this.reloadingRocketType = opts.reloadingRocketType || null;
    this.armorVehicles = opts.armorVehicles || (opts.armorVehicle ? [opts.armorVehicle] : []);
    this.armorCalls = opts.armorCalls || {};
    this.armorCallMax = {};
    this.armorCallCount = {};
    for (const v of this.armorVehicles) {
      const defMax = ARMOR_SUPPORT[v] ? ARMOR_SUPPORT[v].callMax : 2;
      this.armorCallMax[v] = this.armorCalls[v] !== undefined ? this.armorCalls[v] : defMax;
      this.armorCallCount[v] = 0;
    }
    this.armorVehicle = this.armorVehicles[0] || 'BTR-82A';
    this.canCallArmor = this.armorVehicles.length > 0;
    this.resolvedArmorSupport = {};
    this.concealment = getConcealment(this);
    this.detection = getDetection(this);
    this.isConcealed = true;
    this.lastFiredAt = null;
    this.lastSeenAt = null;
    this.restConcealRounds = 0;
    this.moveHistory = [];
    this.markCharges = this.isObserver ? MARK_MAX_PER_OBSERVER : 0;
    this.isBroken = false;
    this.brokenAction = null;
    this.tutorialRole = opts.tutorialRole || null;
    this.attackMultiplier = opts.attackMultiplier || null;
    this.isDummy = this.tutorialRole === 'dummy';
    this.dmrLocked = false;
    this.dmrCooldown = 0;
    this.boltAction = opts.boltAction || false;
    this.boltCooldown = 0;
    if (this.role === 'marksman') {
      this.fireMode = this.boltAction ? 'snipe' : 'suppress';
    }
    this.shotCostNormal = opts.shotCostNormal !== undefined ? opts.shotCostNormal : (this.isMG ? 5 : 3);
    this.shotCostSuppress = opts.shotCostSuppress !== undefined ? opts.shotCostSuppress : (this.isMG ? 10 : 6);
    this.isConfigurable = opts.isConfigurable || false;
    this.configKey = opts.configKey || null;
  }
  get healthLevel() {
    if (this.hp >= 80) return 'V';
    if (this.hp >= 60) return 'IV';
    if (this.hp >= 40) return 'III';
    if (this.hp >= 20) return 'II';
    return 'I';
  }
  get healthLevelName() { return { V:'健康', IV:'轻伤', III:'中度伤', II:'重伤', I:'阵亡' }[this.healthLevel]; }
  get isWounded() { return this.hp < 80; }
  get isHeavyMG() { return this.isMG && this.mgBase >= HEAVY_MG_THRESHOLD; }
  get suppressionLevel() {
    const s = this.suppression;
    if (s < 10) return { level: 0, name: '无', accMod: 0, canFire: true, sanDrain: 0 };
    if (s < 25) return { level: 1, name: 'I', accMod: -0.10, canFire: true, sanDrain: 0 };
    if (s < 50) return { level: 2, name: 'II', accMod: -0.25, canFire: true, sanDrain: 0 };
    if (s < 80) return { level: 3, name: 'III', accMod: -0.50, canFire: false, sanDrain: 1 };
    if (s < 120) return { level: 4, name: 'IV', accMod: -0.70, canFire: false, sanDrain: 3 };
    return { level: 5, name: 'V', accMod: -0.90, canFire: false, sanDrain: 5 };
  }
  getCoverBonus(attacker) {
    let best = 1.0;
    if (attacker) {
      const dir = getAttackDir(this, attacker);
      if (hasWallAt(this.col, this.row, dir)) best = Math.min(best, 0.65);
    }
    if (TERRAIN[this.col] && TERRAIN[this.col][this.row] === 1) best = Math.min(best, 0.90);
    return best;
  }
  get effectiveMoveRange() {
    const t = TERRAIN[this.col] ? TERRAIN[this.col][this.row] : 0;
    let base = this.moveRange + (t === 1 ? 1 : 0);
    const lvl = this.healthLevel;
    if (lvl === 'IV') base = Math.max(1, base - 1);
    else if (lvl === 'III') base = Math.max(1, Math.floor(base / 2));
    else if (lvl === 'II') base = 1;
    if (this.shockLevel === 1) base = Math.max(1, Math.floor(base / 2));
    else if (this.shockLevel === 2) base = Math.max(1, Math.floor(base * 0.7));
    return base;
  }
  get shotCost() {
    if (this.role === 'marksman') {
      if (this.isAutoDMR) {
        if (this.fireMode === 'snipe') return 5;
        return 15;
      }
      if (this.fireMode === 'snipe') return 1;
      return 2;
    }
    if (this.fireMode === 'suppress') return this.shotCostSuppress;
    return this.shotCostNormal;
  }
  get activeWeaponData() {
    if (this.currentWeapon === 'secondary' && this.hasSecondaryWeapon) {
      return {
        name: this.secondaryWeapon, damage: this.secondaryDamage,
        magSize: this.secondaryMagSize, magAmmo: this.secondaryMagAmmo,
        spareMags: this.secondarySpareMags, ammoType: this.secondaryAmmoType,
        ballistics: this.secondaryBallistics || this.ammoBallistics, isSecondary: true
      };
    }
    return {
      name: this.weapon, damage: this.damage,
      magSize: this.magSize, magAmmo: this.magAmmo,
      spareMags: this.spareMags, ammoType: this.ammoType,
      ballistics: this.ammoBallistics, isSecondary: false
    };
  }
  get isOutOfAmmo() {
    if (this.currentWeapon === 'secondary' && this.hasSecondaryWeapon) {
      if (this.secondaryWeapon === 'PF89A') return this.pf89aAmmo <= 0;
      if (this.secondaryWeapon === 'PF97') return this.secondaryMagAmmo <= 0;
      if (this.secondaryWeapon === 'AT4CS HE') return this.at4csAmmo <= 0;
      return this.secondaryMagAmmo === 0 && this.secondarySpareMags === 0;
    }
    if (this.isRocket && this.currentWeapon === 'primary') {
      if (this.rocketAmmo > 0) return false;
      if (this.hasSecondaryWeapon && (this.secondaryMagAmmo > 0 || this.secondarySpareMags > 0)) return false;
      return true;
    }
    return this.magAmmo === 0 && this.spareMags === 0;
  }
  get canAct() { return this.healthLevel !== 'II'; }
  get canFire() {
    if (this.healthLevel === 'II') return false;
    if (this.shockLevel === 1) return false;
    if (this.isBroken) return false;
    if (this.role === 'marksman' && !this.isAutoDMR) {
      if (this.dmrLocked) return false;
      if (this.dmrCooldown > 0) return false;
    }
    if (this.boltAction && this.boltCooldown > 0) return false;
    return this.suppressionLevel.canFire;
  }
  get isCrewed() {
    if (this.crewRequired <= 1) return true;
    const crewCount = game.units.filter(o =>
      o.alive && o.side === this.side && o !== this &&
      (o.role === 'assist' || o.role === 'ammo') && o.team === 'mg' &&
      hexDistance({col:this.col, row:this.row}, {col:o.col, row:o.row}) <= 1
    ).length;
    return crewCount >= this.crewRequired - 1;
  }
}

function exposeUnit(u, recordLast) {
  if (!u || !u.alive) return;
  if (u.isDummy) return;
  if (recordLast !== false && u.hasFired) u.lastFiredAt = { col: u.col, row: u.row };
  if (!u.isConcealed) return;
  u.isConcealed = false;
  u.lastSeenAt = { col: u.col, row: u.row };
  u.restConcealRounds = 0;
}
function canReconceal(u) {
  if (!u.alive) return false;
  if (u.shockRounds > 0) return false;
  if (u.suppressionLevel.level >= 3) return false;
  if (u.isBroken) return false;
  return true;
}
function tryReconceal(u) {
  if (!canReconceal(u)) { u.restConcealRounds = 0; return; }
  const terr = TERRAIN[u.col] ? TERRAIN[u.col][u.row] : 0;
  const hasWall = unitHasAnyWall(u);
  if (hasWall) {
    if (!u.isConcealed) { u.isConcealed = true; if (u.lastFiredAt && u.lastFiredAt.col === u.col && u.lastFiredAt.row === u.row) u.lastFiredAt = null; }
    u.restConcealRounds = 0; return;
  }
  if (terr === 1) {
    u.restConcealRounds++;
    if (u.restConcealRounds >= 1 && !u.isConcealed) { u.isConcealed = true; if (u.lastFiredAt && u.lastFiredAt.col === u.col && u.lastFiredAt.row === u.row) u.lastFiredAt = null; }
    return;
  }
  u.restConcealRounds = 0;
}
function checkConcealment() {
  const units = game.units.filter(u => u.alive);
  for (const target of units) {
    if (!target.isConcealed) continue;
    if (target.isBroken) continue;
    if (target.isDummy) continue;
    let maxDetect = 0;
    for (const e of units) {
      if (e.side === target.side) continue;
      if (!e.alive) continue;
      const d = hexDistance({col:target.col,row:target.row}, {col:e.col,row:e.row});
      if (d > 12) continue;
      let distFactor;
      if (d <= 2) distFactor = 1.0;
      else if (d <= 5) distFactor = 0.75;
      else if (d <= 8) distFactor = 0.45;
      else if (d <= 12) distFactor = 0.2;
      else distFactor = 0.05;
      const dc = e.detection * (1 - target.concealment) * distFactor;
      if (dc > maxDetect) maxDetect = dc;
    }
    if (Math.random() < maxDetect) {
      target.isConcealed = false;
      target.lastSeenAt = { col: target.col, row: target.row };
      target.restConcealRounds = 0;
    }
  }
}
function checkDMRLock() {
  for (const u of game.units) {
    if (!u.alive) continue;
    if (u.role !== 'marksman' || u.isAutoDMR) continue;
    if (u.dmrCooldown > 0) u.dmrCooldown--;
    if (!u.dmrLocked) continue;
    const effConceal = u.concealment * DMR_LOCK_CONCEAL_MULT;
    let maxDetect = 0;
    for (const e of game.units) {
      if (!e.alive || e.side === u.side) continue;
      const d = hexDistance({col:u.col,row:u.row}, {col:e.col,row:e.row});
      if (d > 12) continue;
      let distFactor;
      if (d <= 2) distFactor = 1.0;
      else if (d <= 5) distFactor = 0.75;
      else if (d <= 8) distFactor = 0.45;
      else if (d <= 12) distFactor = 0.2;
      else distFactor = 0.05;
      const dc = e.detection * (1 - effConceal) * distFactor;
      if (dc > maxDetect) maxDetect = dc;
    }
    if (Math.random() >= maxDetect) {
      u.dmrLocked = false;
      const sideLabel = u.side === 'blue' ? '蓝方' : '红方';
      log(`<span style="color:#22c55e;">◈ ${sideLabel} ${u.name} 已脱离锁定</span>`);
    }
  }
}

function resolvePendingStrikes() {
  const landing = game.pendingStrikes.filter(s => s.landRound <= game.round);
  game.pendingStrikes = game.pendingStrikes.filter(s => s.landRound > game.round);
  for (const s of landing) {
    log(`<span style="color:#a16207;font-weight:700;">【${s.vehicleName}】火力抵达 (${s.targetHex.col},${s.targetHex.row})</span>`);
    applyStrikeDamage(s);
    const cd = (s.payload && s.payload.cooldownOverride) || ARMOR_COOLDOWN;
    game.vehicleCooldowns[s.side][s.vehicleName] = cd;
  }
}

function applyStrikeDamage(strike) {
  const cfg = strike.payload;
  const targetHex = strike.targetHex;
  const callerSide = strike.side;
  const isPenetrating = cfg.isPenetrating === true;
  if (cfg.isMGS) {
    const coneCells = strike.coneCells || getMGSConeCells(targetHex.col, targetHex.row, callerSide);
    for (let v = 0; v < cfg.volley; v++) {
      for (const cell of coneCells) {
        const targets = game.units.filter(u => u.alive && u.side !== callerSide && u.col === cell.col && u.row === cell.row);
        for (const t of targets) {
          let dmg = cfg.dmgByRing[cell.ring];
          dmg *= 1 + (Math.random() * 2 - 1) * cfg.variance;
          t.hp -= dmg; t.stoppedBleeding = false; clampTutorialHP(t); exposeUnit(t, false);
          let sub = `<span style="color:#fca5a5;">${t.name} 被榴霰弹覆盖 -${Math.round(dmg)}HP</span>`;
          if (t.hp < DEATH_THRESHOLD) { onUnitDeath(t); sub += ` 阵亡！`; }
          log(sub);
        }
      }
    }
    return;
  }
  if (isPenetrating) {
    const dir = getHexDirection({col: strike.callerCol || targetHex.col, row: strike.callerRow || targetHex.row}, targetHex);
    let hits = 0;
    for (let i = 0; i < cfg.shots; i++) if (Math.random() < cfg.hitChance) hits++;
    const cells = [{ col: targetHex.col, row: targetHex.row, mult: 1.0, sup: cfg.suppressionKill }];
    const A = offsetToAxial(targetHex.col, targetHex.row);
    for (let step = 1; step <= (cfg.penetrateRange || 2); step++) {
      const nb = axialToOffset(A.q + dir[0] * step, A.r + dir[1] * step);
      if (nb.col < 0 || nb.col >= game.mapCols || nb.row < 0 || nb.row >= game.mapRows) break;
      cells.push({ col: nb.col, row: nb.row, mult: cfg.penetrateDamageMult, sup: cfg.suppressionPenetrate || cfg.suppressionKill });
    }
    for (const cell of cells) {
      const targets = game.units.filter(u => u.alive && u.side !== callerSide && u.col === cell.col && u.row === cell.row);
      for (const t of targets) {
        const dmg = hits * cfg.dmgPerHit * cell.mult;
        t.hp -= dmg; t.stoppedBleeding = false; clampTutorialHP(t); exposeUnit(t, false);
        t.suppression = Math.min(150, t.suppression + cell.sup);
        const newLv = t.suppressionLevel;
        if (newLv.level >= 3) t.san = Math.max(0, t.san - newLv.sanDrain);
        let sub = `<span style="color:#fca5a5;">${t.name} 被${cell.mult < 1 ? '贯穿' : '命中'} -${Math.round(dmg)}HP</span>`;
        if (t.hp < DEATH_THRESHOLD) { onUnitDeath(t); sub += ` 阵亡！`; }
        log(sub);
      }
    }
    return;
  }
  const blastR = cfg.blastRadius !== undefined ? cfg.blastRadius : 1;
  const shockR = cfg.shockRadius !== undefined ? cfg.shockRadius : 2;
  const killZone = [], shockZone = [];
  for (let c = 0; c < game.mapCols; c++) for (let r = 0; r < game.mapRows; r++) {
    const d = hexDistance({ col: c, row: r }, targetHex);
    if (d <= blastR) killZone.push({ col: c, row: r });
    else if (d === shockR) shockZone.push({ col: c, row: r });
  }
  const killTargets = game.units.filter(u => u.alive && u.side !== callerSide && killZone.some(h => h.col === u.col && h.row === u.row));
  const shockTargets = game.units.filter(u => u.alive && u.side !== callerSide && shockZone.some(h => h.col === u.col && h.row === u.row));
  let hits = 0;
  for (let i = 0; i < cfg.shots; i++) if (Math.random() < cfg.hitChance) hits++;
  if (killTargets.length > 0) {
    for (const t of killTargets) {
      t.suppression = Math.min(150, t.suppression + cfg.suppressionKill);
      exposeUnit(t, false);
      const newLv = t.suppressionLevel;
      if (newLv.level >= 3) t.san = Math.max(0, t.san - newLv.sanDrain);
    }
    const totalDmg = hits * cfg.dmgPerHit;
    const dmgPerTarget = totalDmg / killTargets.length;
    for (const t of killTargets) {
      t.hp -= dmgPerTarget; t.stoppedBleeding = false; clampTutorialHP(t);
      if (t.hp < DEATH_THRESHOLD) onUnitDeath(t);
    }
    log(`<span style="color:#a16207;">▢ 命中区：火力覆盖，区域内敌人受创</span>`);
  } else {
    log(`<span style="color:#a16207;">▢ 命中区：无敌人，火力落空</span>`);
  }
  if (shockTargets.length > 0) {
    for (const t of shockTargets) {
      const blocked = isExplosionBlocked(targetHex, t);
      let supMult = blocked ? 0.7 : 1.0;
      t.suppression = Math.min(150, t.suppression + cfg.suppressionShock * supMult);
      exposeUnit(t, false);
      if (cfg.applyShock) { t.shockRounds = 2; t.shockLevel = 1; t.san = Math.max(0, t.san - 5); }
      const newLv = t.suppressionLevel;
      if (newLv.level >= 3) t.san = Math.max(0, t.san - newLv.sanDrain);
    }
    log(`<span style="color:#fca5a5;">▢ ${cfg.applyShock ? '弹震区' : '贯穿区'}：${shockTargets.map(t => t.name).join('、')}</span>`);
  }
  checkVictory();
}

function tickVehicleCooldowns() {
  for (const side of ['blue', 'red']) {
    for (const v in game.vehicleCooldowns[side]) {
      if (game.vehicleCooldowns[side][v] > 0) game.vehicleCooldowns[side][v]--;
    }
  }
}

function checkBroken() {
  for (const u of game.units) {
    if (!u.alive) continue;
    if (game.isTutorial && u.side === 'blue' && !game.tutorialAllowBroken) { u.isBroken = false; continue; }
    const wasBroken = u.isBroken;
    const ratio = u.san / u.sanMax;
    u.isBroken = ratio < BROKEN_THRESHOLD;
    if (u.isBroken && !wasBroken) {
      log(`<span style="color:#dc2626;font-weight:700;">${u.name}：陷入崩溃！</span>`);
      u.isConcealed = false;
    }
  }
}

function processBrokenTurn(side) {
  for (const u of game.units) {
    if (!u.alive || u.side !== side || !u.isBroken) continue;
    if (u.hasMoved && u.hasFired) continue;
    const roll = Math.random();
    if (roll < 0.5) {
      const enemies = game.units.filter(e => e.alive && e.side !== u.side);
      if (enemies.length === 0) continue;
      let nearest = enemies[0], bestD = hexDistance({col:u.col,row:u.row}, {col:enemies[0].col,row:enemies[0].row});
      for (const e of enemies) {
        const d = hexDistance({col:u.col,row:u.row}, {col:e.col,row:e.row});
        if (d < bestD) { bestD = d; nearest = e; }
      }
      const awayGoal = { col: Math.max(0, Math.min(game.mapCols-1, u.col + Math.sign(u.col - nearest.col))), row: Math.max(0, Math.min(game.mapRows-1, u.row + Math.sign(u.row - nearest.row))) };
      for (let step = 0; step < 2; step++) {
        const st = findBestAdjacentStep(u, awayGoal);
        if (st) { u.col = st.col; u.row = st.row; }
      }
      u.hasMoved = true; u.hasFired = true; exposeUnit(u, false);
      log(`<span style="color:#dc2626;">${u.name} 溃逃</span>`);
    } else {
      u.hasMoved = true; u.hasFired = true;
      log(`<span style="color:#dc2626;">${u.name} 僵住</span>`);
    }
  }
}

function recoverBrokenUnits() {
  for (const u of game.units) {
    if (!u.alive || !u.isBroken) continue;
    const friends = game.units.filter(o => o.alive && o.side === u.side && o !== u && hexDistance({col:u.col,row:u.row}, {col:o.col,row:o.row}) <= BROKEN_RECOVER_FRIEND);
    if (friends.length === 0) continue;
    const hasLeaderMedic = friends.some(o => o.role === 'leader' || o.role === 'deputy' || o.role === 'medic');
    if (hasLeaderMedic) { u.san = Math.max(u.san, u.sanMax * BROKEN_THRESHOLD + 1); u.isBroken = false; }
    else u.san = Math.min(u.sanMax, u.san + 2);
  }
  for (const u of game.units) {
    if (!u.alive || u.isBroken) continue;
    const hasLeaderMedic = game.units.some(o => o.alive && o.side === u.side && o !== u && (o.role === 'leader' || o.role === 'deputy' || o.role === 'medic') && hexDistance({col:u.col,row:u.row}, {col:o.col,row:o.row}) <= BROKEN_RECOVER_FRIEND);
    if (hasLeaderMedic) u.san = Math.min(u.sanMax, u.san + BROKEN_RECOVER_MEDIC);
  }
}

function markTarget(observer, targetUnit) {
  if (!observer.alive || !observer.isObserver) return false;
  if (observer.markCharges <= 0) return false;
  if (observer.hasFired) return false;
  if (observer.shockRounds > 0) return false;
  if (!targetUnit || !targetUnit.alive) return false;
  if (targetUnit.side === observer.side) return false;
  if (targetUnit.isConcealed && !targetUnit.isDummy) return false;
  const d = hexDistance({col:observer.col,row:observer.row}, {col:targetUnit.col,row:targetUnit.row});
  if (d > MARK_RANGE) return false;
  observer.markCharges--; observer.hasFired = true; exposeUnit(observer);
  game.marks.push({ col: targetUnit.col, row: targetUnit.row, side: observer.side, expiresRound: game.round + MARK_DURATION, targetName: targetUnit.name });
  const sideLabel = observer.side === 'blue' ? '蓝方' : '红方';
  log(`<span style="color:#0891b2;">◎ 【标记】</span>${sideLabel} ${observer.name} 标记了 ${targetUnit.name} 所在区域`);
  return true;
}
function isInAnyMark(col, row, side) {
  for (const m of game.marks) {
    if (m.side !== side) continue;
    if (m.expiresRound < game.round) continue;
    const d = hexDistance({col,row}, {col:m.col,row:m.row});
    if (d <= 1) return m;
  }
  return null;
}

function clampTutorialHP(u) {
  if (game.isTutorial && u.side === 'blue' && u.alive && u.hp < TUTORIAL_HP_FLOOR) u.hp = TUTORIAL_HP_FLOOR;
}

function buildMedicTemplate(squad, side) {
  if (!squad) return MEDIC_TEMPLATES[side];
  const candidates = squad.units.filter(u => {
    if (u.isRocket || u.isMG) return false;
    if (u.role !== 'rifle' && u.role !== 'deputy' && u.role !== 'leader') return false;
    if ((u.magSize || 30) < 20) return false;
    return true;
  });
  const base =
    candidates.find(u => u.role === 'rifle') ||
    candidates.find(u => u.role === 'deputy') ||
    candidates.find(u => u.role === 'leader') ||
    squad.units[0];
  const magSize = base.magSize || 30;
  const spareAmmo = (base.spareMags || 0) * magSize;
  const newSpareMags = Math.floor(Math.max(0, spareAmmo - 60) / magSize);
  return {
    name: side === 'blue' ? '卫生员' : '医护兵',
    rank: side === 'blue' ? '下士' : '专业军士 E-4',
    role: 'medic',
    weapon: base.weapon, weaponClass: base.weaponClass,
    ammo: base.ammo, ammoBallistics: base.ammoBallistics,
    sanMax: base.sanMax || 60, accuracy: base.accuracy || 0.55,
    moveRange: base.moveRange || 3,
    magSize: magSize, spareMags: newSpareMags,
    medSupplies: 5, damage: base.damage || 28, grenades: 2,
    shotCostNormal: base.shotCostNormal, shotCostSuppress: base.shotCostSuppress
  };
}

function findSpawnHex(side) {
  const edgeCols = side === 'blue' ? [0, 1, 2] : [game.mapCols-1, game.mapCols-2, game.mapCols-3];
  for (const c of edgeCols) for (let r = 0; r < game.mapRows; r++) {
    if (!game.units.some(u => u.alive && u.col === c && u.row === r) && TERRAIN[c][r] !== 1) return { col: c, row: r };
  }
  return { col: side === 'blue' ? 0 : game.mapCols - 1, row: 10 };
}
function spawnMedic(side) {
  const squad = side === 'blue' ? game.playerSquad : game.aiSquad;
  const data = buildMedicTemplate(squad, side);
  const pos = findSpawnHex(side);
  game.units.push(new Unit(data.name, side, pos.col, pos.row, { ...data, isReinforcement: true }));
  log(`<span style="color:#22c55e;">【${side === 'blue' ? '蓝方' : '红方'}】${data.name} 已抵达战场！</span>`);
}
function checkMedicCall(side) {
  if (game.isTutorial) return;
  const call = game.medicCall[side];
  if (call.done) return;
  if (call.pending) {
    call.turnsLeft--;
    if (call.turnsLeft <= 0) { spawnMedic(side); call.pending = false; call.done = true; }
    return;
  }
  const hasCritical = game.units.some(u => u.alive && u.side === side && u.role !== 'medic' && (u.healthLevel === 'III' || u.healthLevel === 'II'));
  if (hasCritical) { call.pending = true; call.turnsLeft = 1; }
}
function removeExhaustedMedics() {
  game.units = game.units.filter(u => {
    if (u.alive && u.role === 'medic' && u.medSupplies <= 0) {
      if (game.selected === u) { game.selected = null; game.highlights = []; game.pendingAction = null; }
      return false;
    }
    return true;
  });
}

function getPairBonus(unit) {
  if (!unit || !unit.alive) return 0;
  if (unit.role === 'mg' && unit.mgSpec > 0) {
    const assist = game.units.find(o => o.alive && o.side === unit.side && o.role === 'assist' && o.team === 'mg' && hexDistance({col:unit.col, row:unit.row}, {col:o.col, row:o.row}) <= 1);
    return assist ? 0.10 : 0;
  }
  if (unit.role === 'assist' && unit.team === 'mg') {
    const mg = game.units.find(o => o.alive && o.side === unit.side && o.role === 'mg' && hexDistance({col:unit.col, row:unit.row}, {col:o.col, row:o.row}) <= 1);
    return mg ? 0.10 : 0;
  }
  return 0;
}
function getCrewPenalty(unit) {
  if (!unit || !unit.alive) return 0;
  if (unit.crewRequired <= 1) return 0;
  if (unit.isCrewed) return 0;
  return -0.30;
}
function findNearestCover(from) {
  let best = null, bestD = Infinity;
  for (let c = 0; c < game.mapCols; c++) for (let r = 0; r < game.mapRows; r++) {
    let hasAny = false;
    for (let i = 0; i < 6; i++) if (hasWallAt(c, r, i)) { hasAny = true; break; }
    if (!hasAny) continue;
    const d = hexDistance({col:from.col, row:from.row}, {col:c, row:r});
    if (d < bestD) {
      const occ = game.units.some(o => o.alive && o.col === c && o.row === r);
      if (!occ || (c === from.col && r === from.row)) { bestD = d; best = { col: c, row: r }; }
    }
  }
  return best;
}
function findBestAdjacentStep(u, goal) {
  const A = offsetToAxial(u.col, u.row);
  let best = null;
  let bestD = hexDistance({ col: u.col, row: u.row }, goal);
  for (const [dq, dr] of HEX_DIRS) {
    const nb = axialToOffset(A.q + dq, A.r + dr);
    if (nb.col < 0 || nb.col >= game.mapCols || nb.row < 0 || nb.row >= game.mapRows) continue;
    if (game.units.some(o => o.alive && o.col === nb.col && o.row === nb.row)) continue;
    const d = hexDistance({ col: nb.col, row: nb.row }, goal);
    if (d < bestD) { bestD = d; best = nb; }
  }
  return best;
}
function predictTargetHex(targetUnit) {
  if (!targetUnit || !targetUnit.moveHistory || targetUnit.moveHistory.length < 2) return { col: targetUnit.col, row: targetUnit.row };
  const prev = targetUnit.moveHistory[0];
  const cur = targetUnit.moveHistory[1];
  const dx = cur.col - prev.col;
  const dy = cur.row - prev.row;
  if (dx === 0 && dy === 0) return { col: targetUnit.col, row: targetUnit.row };
  const px = targetUnit.col + dx;
  const py = targetUnit.row + dy;
  return { col: Math.max(0, Math.min(game.mapCols-1, px)), row: Math.max(0, Math.min(game.mapRows-1, py)) };
}
function aiBlindFireAtSniper(u) {
  if (!u.alive || !u.canFire || u.hasFired || u.isOutOfAmmo) return false;
  if (!game.sniperDetected.red) return false;
  if (game.round <= u.interruptedUntilRound) return false;
  const sniper = game.sniperInfo.red;
  if (sniper.col === null || sniper.row === null) return false;
  const d = hexDistance({col:u.col, row:u.row}, {col:sniper.col, row:sniper.row});
  if (d > BLIND_FIRE_RANGE) return false;
  const cost = u.isMG ? 5 : 3;
  if (u.magAmmo < cost) { if (u.spareMags > 0) { u.spareMags--; u.magAmmo = u.magSize; } else return false; }
  u.magAmmo -= cost; u.hasFired = true; exposeUnit(u);
  const hit = Math.random() < 0.05;
  if (hit) {
    const sniperUnit = game.units.find(o => o.alive && o.side === 'blue' && o.role === 'marksman' && o.col === sniper.col && o.row === sniper.row);
    if (sniperUnit) {
      let dmg = u.damage * 0.5;
      if (u.attackMultiplier) dmg *= u.attackMultiplier.dmg;
      sniperUnit.hp -= dmg; sniperUnit.stoppedBleeding = false; clampTutorialHP(sniperUnit); exposeUnit(sniperUnit, false);
      if (sniperUnit.hp < DEATH_THRESHOLD) { onUnitDeath(sniperUnit); log(`<span style="color:#f87171;">盲射击毙狙击手！</span>`); }
    }
  }
  return true;
}

function onUnitDeath(u) {
  if (!u.alive) return;
  if (game.isTutorial && u.side === 'blue') { u.hp = TUTORIAL_HP_FLOOR; return; }
  if (u.isQJY88Operator || u.weapon === 'QJY-88') {
    game.droppedWeapons.push({
      col: u.col, row: u.row, side: u.side, available: true,
      weapon: 'QJY-88', weaponClass: '通用机枪（三脚架）', ammoType: '5.8mm',
      damage: 45, magSize: 200, magAmmo: u.magAmmo, spareMags: u.spareMags,
      isMG: true, mgBase: 7,
      type: 'qjy88'
    });
    log(`<span style="color:#f59e0b;font-weight:700;">▢ ${u.name} 阵亡，QJY-88 留在原地</span>`);
  } else if (u.isMG && u.magSize >= 50) {
    game.droppedWeapons.push({
      col: u.col, row: u.row, side: u.side, available: true,
      weapon: u.weapon, weaponClass: u.weaponClass, ammoType: u.ammoType,
      damage: u.damage, magSize: u.magSize, magAmmo: u.magAmmo, spareMags: u.spareMags,
      isMG: true, mgBase: u.mgBase,
      type: 'mg'
    });
    log(`<span style="color:#f59e0b;font-weight:700;">▢ ${u.name} 阵亡，${u.weapon} 留在原地</span>`);
  } else if (u.isRocket) {
    game.droppedWeapons.push({
      col: u.col, row: u.row, side: u.side, available: true,
      weapon: u.weapon, weaponClass: u.weaponClass, ammoType: u.ammoType,
      damage: u.damage, magSize: u.magSize, magAmmo: u.magAmmo, spareMags: u.spareMags,
      isRocket: true, rocketAmmo: u.rocketAmmo,
      currentRocketType: u.currentRocketType,
      rocketPool: u.rocketPool ? JSON.parse(JSON.stringify(u.rocketPool)) : null,
      type: 'rocket'
    });
    log(`<span style="color:#f59e0b;font-weight:700;">▢ ${u.name} 阵亡，${u.weapon} 留在原地</span>`);
  }
  u.alive = false; u.hp = 0;
  u.hasMoved = true; u.hasFired = true;
  u.suppression = 0; u.fireMode = 'normal';
  if (game.selected === u) { game.selected = null; game.highlights = []; game.pendingAction = null; game.throwMode = false; game.callArmorMode = false; game.groundFireMode = false; game.markMode = false; }
}

function canTakeOverPlatform(unit, platform) {
  if (!unit.alive || !platform.available) return false;
  if (unit.side !== platform.side) return false;
  if (unit.hasMoved || unit.hasFired) return false;
  if (unit.isOperatingHeavy) return false;
  const d = hexDistance({col:unit.col,row:unit.row}, {col:platform.col,row:platform.row});
  if (d > 1) return false;
  if (platform.type === 'qjy88' || platform.type === 'mg') {
    return unit.team === 'mg' && (unit.role === 'assist' || unit.role === 'ammo');
  }
  if (platform.type === 'rocket') {
    return unit.team === 'rpg' && (unit.role === 'assist' || unit.role === 'ammo');
  }
  return false;
}
function takeOverPlatform(unit, platform) {
  if (!canTakeOverPlatform(unit, platform)) return false;
  unit.weapon = platform.weapon; unit.weaponClass = platform.weaponClass;
  unit.ammoType = platform.ammoType; unit.damage = platform.damage;
  unit.magSize = platform.magSize; unit.magAmmo = platform.magAmmo;
  unit.spareMags = platform.spareMags;
  if (platform.isMG) { unit.isMG = true; unit.mgBase = platform.mgBase; }
  if (platform.isRocket) {
    unit.isRocket = true; unit.rocketAmmo = platform.rocketAmmo;
    unit.currentRocketType = platform.currentRocketType;
    unit.rocketPool = platform.rocketPool;
    unit.rpgCooldown = 4;
  }
  unit.isOperatingHeavy = true;
  unit.hasMoved = true; unit.hasFired = true;
  unit.concealment = getConcealment(unit);
  platform.available = false; exposeUnit(unit);
  log(`<span style="color:#f59e0b;font-weight:700;">▢ ${unit.name} 接管 ${platform.weapon}</span>`);
  return true;
}

function onSniperKill(targetSide, sniperUnit) {
  if (targetSide === 'blue') game.sniperInfo.blue = { col: sniperUnit.col, row: sniperUnit.row };
  else game.sniperInfo.red = { col: sniperUnit.col, row: sniperUnit.row };
  if (game.sniperDetected[targetSide]) return;
  game.sniperDetected[targetSide] = true;
  if (targetSide === 'blue') log(`<span style="color:#f87171;font-weight:700;">⚠ 发现敌人狙击手！</span>`);
  else log(`<span style="color:#fbbf24;">红方已察觉我方狙击手</span>`);
}

function endGame(winner, reason) {
  log(`=== ${winner}！${reason} ===`);
  game.over = true; game.busy = true;
  game.selected = null; game.highlights = [];
  document.getElementById('endTurn').disabled = true;
}
function calcAttrition(side) {
  const initial = game.initialCounts[side];
  if (initial === 0) return 0;
  const alive = game.units.filter(u => u.alive && u.side === side && u.role !== 'medic').length;
  return (initial - alive) / initial;
}
function isSideExhausted(side) {
  const alive = game.units.filter(u => u.alive && u.side === side && u.role !== 'medic');
  if (alive.length === 0) return false;
  return alive.every(u => u.isOutOfAmmo);
}
function checkVictory() {
  if (game.over) return true;
  if (game.isTutorial) { checkTutorialVictory(); return game.over; }
  const blues = game.units.filter(u => u.alive && u.side === 'blue' && u.role !== 'medic');
  const reds = game.units.filter(u => u.alive && u.side === 'red' && u.role !== 'medic');
  if (reds.length === 0 && blues.length > 0) { endGame('蓝方获胜', '红方全灭'); return true; }
  if (blues.length === 0 && reds.length > 0) { endGame('红方获胜', '蓝方全灭'); return true; }
  if (blues.length === 0 && reds.length === 0) { endGame('平局', '双方全灭'); return true; }
  const blueExhausted = isSideExhausted('blue');
  const redExhausted = isSideExhausted('red');
  if (blueExhausted || redExhausted) {
    const blueRate = calcAttrition('blue');
    const redRate = calcAttrition('red');
    if (blueRate > redRate) endGame('红方获胜', '蓝方被击溃');
    else if (redRate > blueRate) endGame('蓝方获胜', '红方被击溃');
    else endGame('平局', '双方阵亡率相同');
    return true;
  }
  return false;
}
function checkTutorialVictory() {
  if (game.tutorialVictoryAchieved) return;
  if (!game.tutorialChapterId) return;
  let achieved = false;
  let msg = '你已完成本课目标。';
  const blues = game.units.filter(u => u.alive && u.side === 'blue');
  const reds = game.units.filter(u => u.alive && u.side === 'red');
  switch (game.tutorialVictory) {
    case 'eliminateAll': achieved = reds.length === 0; break;
    case 'suppressLevel3': achieved = reds.some(r => r.suppressionLevel.level >= 3); msg = '成功压制敌人到 III 级。'; break;
    case 'grenadeKill': achieved = reds.length < game._tutInitRedCount; msg = '已成功用投掷物击杀敌人。'; break;
    case 'crashAndRecover': achieved = game._tutSawBroken && blues.some(b => !b.isBroken && b.san > b.sanMax * BROKEN_THRESHOLD); msg = '崩溃单位已恢复。'; break;
    case 'snipeKill': achieved = reds.length < game._tutInitRedCount; msg = '狙击击杀成功。'; break;
    case 'armorHit2': achieved = game._tutArmorHits >= 2 || reds.some(r => r.hp < 100); msg = '载具支援命中目标。'; break;
    case 'stealthKill': achieved = reds.length < game._tutInitRedCount; msg = '隐蔽击杀成功。'; break;
    case 'destroyWallKill': achieved = reds.length === 0; msg = '矮墙已被摧毁，敌人已消灭。'; break;
    case 'mgKill2': achieved = (game._tutInitRedCount - reds.length) >= 2; msg = '机枪协作击杀 2 人完成。'; break;
    case 'penetrateHit2': achieved = game._tutPenetrateHits >= 2; msg = '贯穿命中 2 人完成。'; break;
    case 'snipeAndSurvive': achieved = game._tutSnipeKillDone && game.round >= game._tutSnipeKillRound + 2; msg = '狙击击杀并存活 2 回合完成。'; break;
  }
  if (achieved) {
    game.tutorialVictoryAchieved = true;
    document.getElementById('victoryMsg').textContent = msg;
    document.getElementById('victoryModal').classList.remove('hidden');
  }
}

function tryResupply(mg) {
  if (!mg.alive || !mg.isMG || !mg.isOutOfAmmo) return false;
  const handlers = game.units.filter(u => u.alive && u.side === mg.side && u.role === 'ammo' && u.team === 'mg' && u.supplyBoxes > 0 && !u.isOperatingQJY88);
  for (const h of handlers) {
    const d = hexDistance({ col: mg.col, row: mg.row }, { col: h.col, row: h.row });
    if (d <= h.supplyRange) {
      h.supplyBoxes--; mg.spareMags += 1; mg.magAmmo = mg.magSize;
      log(`<span style="color:#22c55e;">${h.name} 为 ${mg.name} 补充弹药</span>`);
      return true;
    }
  }
  return false;
}

function canTreat(medic, target) {
  if (!medic.alive || medic.role !== 'medic' || medic.medSupplies <= 0) return false;
  if (!target.alive || target.side !== medic.side || target === medic) return false;
  if (target.healthLevel === 'V' || target.healthLevel === 'I') return false;
  return hexDistance({ col: medic.col, row: medic.row }, { col: target.col, row: target.row }) <= medic.medRange;
}
function performTreat(medic, target) {
  if (!medic.alive || !target.alive) return false;
  const lvl = target.healthLevel;
  let msg = `${medic.name} 治疗 ${target.name}：`;
  if (lvl === 'II') { medic.medSupplies--; target.hp = 40; target.stoppedBleeding = true; msg += `II → III`; }
  else if (lvl === 'III') { target.stoppedBleeding = true; msg += `III级止血`; }
  else if (lvl === 'IV') { target.hp = 80; target.stoppedBleeding = true; msg += `IV → V`; }
  medic.hasTreated = true; medic.hasFired = true;
  log(`<span style="color:#22c55e;">${msg}</span>`);
  return true;
}

function log(msg) {
  game.log.push(`[R${game.round}] ${msg}`);
  if (game.log.length > 150) game.log.shift();
  document.getElementById('logContent').innerHTML = game.log.slice().reverse().map(m => `<div>${m}</div>`).join('');
}