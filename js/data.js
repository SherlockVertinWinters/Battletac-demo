// ============================================================
// js/data.js — 全局常量、弹道、载具、DMR、类别、DLC 注册表
// ============================================================

const DEATH_THRESHOLD = 20;
const TUTORIAL_HP_FLOOR = 40;
const BLIND_FIRE_RANGE = 16;
const HEAVY_MG_THRESHOLD = 7;
const HEAVY_MG_PENETRATE_RANGE = 2;
const HEAVY_MG_PENETRATE_DMG = 0.6;
const AUTO_DMR_SUSTAINED_SUPPRESS = 55;
const GRENADE_THROW_RANGE = 8;
const GRENADE_KILL_RADIUS = 2;
const GRENADE_SHOCK_RADIUS = 5;
const PF97_MAX_RANGE = 8;
const AT4_MAX_RANGE = 7;
const ROCKET_MAX_RANGE = 12;
const CONCEALED_HIT_MOD = 0.40;
const MARK_RANGE = 10;
const MARK_DURATION = 2;
const MARK_MAX_PER_OBSERVER = 3;
const MGS_CONE_MAX_RANGE = 6;
const MGS_VOLLEY = 2;
const BROKEN_THRESHOLD = 0.35;
const BROKEN_RECOVER_FRIEND = 2;
const BROKEN_RECOVER_MEDIC = 4;
const DMR_LOCK_CONCEAL_MULT = 0.3;
const ARMOR_DELAY = 1;
const ARMOR_COOLDOWN = 2;
const SUPPRESSED_HIT_BONUS = 0.15;

const COLS_NORMAL = 30, ROWS_NORMAL = 20;
const COLS_TUTORIAL = 18, ROWS_TUTORIAL = 14;

const BALLISTICS = {
  '5.8x42':   { close: 1.0,  mid: 0.8,  far: 0.6,  extreme: 0.4, hitBonus: { close: 0, mid: 0, far: 0, extreme: 0 } },
  '5.56x45':  { close: 1.1,  mid: 0.8,  far: 0.5,  extreme: 0.3, hitBonus: { close: 0, mid: 0, far: 0, extreme: 0 } },
  '5.45x39':  { close: 0.95, mid: 0.85, far: 0.55, extreme: 0.35, hitBonus: { close: 0.05, mid: 0.08, far: 0.03, extreme: 0 } },
  '7.62x54R': { close: 0.95, mid: 0.90, far: 0.80, extreme: 0.65, hitBonus: { close: 0, mid: 0, far: 0, extreme: 0 } },
  '7.62x51':  { close: 0.95, mid: 0.88, far: 0.78, extreme: 0.62, hitBonus: { close: 0, mid: 0, far: 0, extreme: 0 } },
  '6.8x51':   { close: 0.95, mid: 0.82, far: 0.65, extreme: 0.45, hitBonus: { close: 0, mid: 0, far: 0, extreme: 0 } },
  '6.5CM':    { close: 0.95, mid: 0.92, far: 0.85, extreme: 0.72, hitBonus: { close: 0, mid: 0, far: 0, extreme: 0 } }
};

const ARMOR_SUPPORT = {
  'BTR-82A': {
    name: 'BTR-82A', weapon: '2A72 30mm 机炮',
    shots: 10, hitChance: 0.22, dmgPerHit: 68,
    suppressionKill: 60, suppressionShock: 20,
    applyShock: true, callMax: 2, blastRadius: 1, shockRadius: 2
  },
  'MT-LBVM': {
    name: 'MT-LBVM', weapon: 'NSVK 12.7mm 重机枪',
    shots: 12, hitChance: 0.23, dmgPerHit: 64,
    suppressionKill: 80, suppressionPenetrate: 40,
    applyShock: false, callMax: 3, isPenetrating: true,
    penetrateRange: 2, penetrateDamageMult: 0.6
  },
  'Stryker RV': {
    name: 'Stryker RV', weapon: 'M2HB 12.7mm 重机枪',
    shots: 12, hitChance: 0.25, dmgPerHit: 65,
    suppressionKill: 50, suppressionPenetrate: 25,
    applyShock: false, callMax: 3, isPenetrating: true,
    penetrateRange: 2, penetrateDamageMult: 0.6
  },
  'Stryker MGS': {
    name: 'Stryker MGS', weapon: 'M68A2 105mm M1040 榴霰弹',
    isMGS: true, coneMaxRange: MGS_CONE_MAX_RANGE, volley: MGS_VOLLEY,
    dmgByRing: [40, 28, 18], variance: 0.15, ignoreCover: true, callMax: 2
  },
  'ZSL-92': {
    name: 'ZSL-92', weapon: 'ZPT-90 25mm 机炮',
    shots: 12, hitChance: 0.23, dmgPerHit: 66,
    suppressionKill: 55, suppressionShock: 20,
    applyShock: true, callMax: 3, blastRadius: 1, shockRadius: 2
  }
};

const VEHICLE_CONFIGS = {
  'Stryker RV': {
    label: 'Stryker RV 武器站',
    options: {
      'M2HB': {
        label: 'M2HB 12.7mm 重机枪',
        weapon: 'M2HB 12.7mm 重机枪',
        shots: 12, hitChance: 0.25, dmgPerHit: 65,
        suppressionKill: 50, suppressionPenetrate: 25,
        applyShock: false, callMax: 3, isPenetrating: true,
        penetrateRange: 2, penetrateDamageMult: 0.6
      },
      'Mk19': {
        label: 'Mk19 40mm 自动榴弹发射器',
        weapon: 'Mk19 40mm 自动榴弹发射器',
        shots: 10, hitChance: 0.20, dmgPerHit: 66,
        suppressionKill: 60, suppressionShock: 25,
        applyShock: true, callMax: 3, blastRadius: 2, shockRadius: 3,
        isPenetrating: false
      }
    }
  }
};

const DMR_CONFIGS = {
  dmr: {
    label: '精确射手武器选择',
    options: {
      'spear': {
        label: 'SPEAR DMR（6.5 Creedmoor）',
        weapon: 'SPEAR DMR', weaponClass: '半自动精确射手步枪',
        ammo: '6.5mm', ammoBallistics: '6.5CM',
        accuracy: 0.85, damage: 34,
        magSize: 20, spareMags: 5,
        marksmanSpec: 2, suppressValue: 5,
        shotCostSnipe: 1, shotCostSuppress: 2
      },
      'm110a1': {
        label: 'M110A1 SDM-R（7.62 NATO）',
        weapon: 'M110A1', weaponClass: '半自动精确射手步枪',
        ammo: '7.62mm', ammoBallistics: '7.62x51',
        accuracy: 0.80, damage: 58,
        magSize: 20, spareMags: 5,
        marksmanSpec: 2, suppressValue: 5,
        shotCostSnipe: 1, shotCostSuppress: 2
      }
    }
  }
};

const CATEGORIES = {
  regular: { name: '常规步兵班' },
  marine:  { name: '海军陆战队' },
  armored: { name: '装甲步兵班' }
};

// 医疗兵后备模板（正常流程用 buildMedicTemplate 按班组动态生成）
const MEDIC_TEMPLATES = {
  blue: { name: '卫生员', rank: '下士', role: 'medic', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 65, accuracy: 0.50, moveRange: 3, magSize: 30, spareMags: 3, medSupplies: 5, damage: 30, grenades: 2 },
  red:  { name: '医护兵', rank: '专业军士 E-4', role: 'medic', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.50, moveRange: 3, magSize: 30, spareMags: 5, medSupplies: 7, damage: 26, grenades: 2 }
};

// ============ DLC 注册表 ============
// 每个 dlc/*.js 文件把自己注册到这里，但不会自动合并到 SQUADS
// 密码正确时 unlockAllDLCs() 才把它们合并进 SQUADS
const DLC_REGISTRY = {};
let DLC_UNLOCKED = false;
const DLC_PASSWORD = 'battletac2026';