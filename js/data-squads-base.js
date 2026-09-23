// ============================================================
// js/data-squads-base.js — 本体班组（3 个早期常规步兵班）
// ============================================================

const SQUADS = {
  pla_moto_2010: {
    name: 'PLA 摩步班（2010）', category: 'regular', era: 'early',
    faction: 'PLA', flagClass: 'flag-pla',
    desc: '常规步兵班 · 10人制 · QBZ95-1 + QJB95-1 + PF89A + PF97',
    units: [
      { name: '班长',   rank: '二级上士', role: 'leader', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 75, accuracy: 0.60, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 4 },
      { name: '副班长', rank: '中士',     role: 'deputy', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 70, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 4 },
      { name: '机枪手', rank: '下士',     role: 'mg',     team: 'mg', weapon: 'QJB95-1', weaponClass: '班用机枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 65, accuracy: 0.55, moveRange: 2, isMG: true, mgSpec: 3, damage: 40, magSize: 75, spareMags: 1, supplyType: 'QJB95-1弹鼓', grenades: 0 },
      { name: '副射手', rank: '上等兵',   role: 'assist', team: 'mg', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, mgSpec: 2, grenades: 4 },
      { name: '弹药手', rank: '上等兵',   role: 'ammo',   team: 'mg', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.50, moveRange: 2, magSize: 30, spareMags: 2, damage: 30, supplyBoxes: 1, supplyBoxSize: 75, supplyBoxType: 'QJB95-1弹鼓', supplyRange: 1, grenades: 4 },
      { name: '步枪手A', rank: '上等兵',  role: 'rifle',  weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 4 },
      { name: '步枪手B', rank: '上等兵',  role: 'rifle',  weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 4 },
      { name: '步枪手C', rank: '上等兵',  role: 'rifle',  weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 4 },
      { name: '步枪手D', rank: '上等兵',  role: 'rifle',  weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 4,
        hasPF89A: true, pf89aAmmo: 1, hasSecondaryWeapon: true, secondaryWeapon: 'PF89A', secondaryClass: '次抛火箭筒', secondaryDamage: 60, secondaryMagSize: 1, secondaryMagAmmo: 1, secondarySpareMags: 0, secondaryAmmoType: '80mm', secondaryBallistics: '5.8x42' },
      { name: '步枪手E', rank: '上等兵',  role: 'rifle',  weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 4,
        hasSecondaryWeapon: true, secondaryWeapon: 'PF97', secondaryClass: '单兵云爆弹', secondaryDamage: 55, secondaryMagSize: 1, secondaryMagAmmo: 1, secondarySpareMags: 0, secondaryAmmoType: '云爆弹', secondaryBallistics: '5.8x42' },
    ]
  },
  us_ibct: {
    name: '美军 IBCT 步枪班（2011）', category: 'regular', era: 'early',
    faction: 'US', flagClass: 'flag-us',
    desc: '常规步兵班 · 10人制 · M4A1 + M249 SAW',
    units: [
      { name: '班长',       rank: '上士 E-6', role: 'leader', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 75, accuracy: 0.60, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, grenades: 4 },
      { name: '火力组长A',  rank: '下士 E-4', role: 'deputy', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, grenades: 4 },
      { name: '火力组长B',  rank: '下士 E-4', role: 'deputy', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, grenades: 4 },
      { name: '自动步枪手A', rank: '专业军士 E-4', role: 'mg', team: 'mg', weapon: 'M249 SAW', weaponClass: '班用机枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.55, moveRange: 2, isMG: true, mgSpec: 3, damage: 34, magSize: 200, spareMags: 0, supplyType: 'M249弹药箱', grenades: 0 },
      { name: '自动步枪手B', rank: '专业军士 E-4', role: 'mg', team: 'mg', weapon: 'M249 SAW', weaponClass: '班用机枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.55, moveRange: 2, isMG: true, mgSpec: 3, damage: 34, magSize: 200, spareMags: 0, supplyType: 'M249弹药箱', grenades: 0 },
      { name: '弹药手A',    rank: '一等兵 E-3', role: 'ammo', team: 'mg', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 55, accuracy: 0.50, moveRange: 2, magSize: 30, spareMags: 3, damage: 26, supplyBoxes: 1, supplyBoxSize: 200, supplyBoxType: 'M249弹药箱', supplyRange: 1, grenades: 4 },
      { name: '弹药手B',    rank: '一等兵 E-3', role: 'ammo', team: 'mg', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 55, accuracy: 0.50, moveRange: 2, magSize: 30, spareMags: 3, damage: 26, supplyBoxes: 1, supplyBoxSize: 200, supplyBoxType: 'M249弹药箱', supplyRange: 1, grenades: 4 },
      { name: '步枪手A',    rank: '一等兵 E-3', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, grenades: 4 },
      { name: '步枪手B',    rank: '一等兵 E-3', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, grenades: 4 },
      { name: '步枪手C',    rank: '一等兵 E-3', role: 'rifle', weapon: 'M4A1', weaponClass: '卡宾枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, grenades: 4 },
    ]
  },
  ru_mountain_2009: {
    name: '山地步兵班（2009）', category: 'regular', era: 'early',
    faction: 'RU', flagClass: 'flag-ru', factionColor: '#3f6212',
    desc: '常规步兵班 · 7人制 · AK-74M + PKP Pecheneg，配属 MT-LBVM',
    units: [
      { name: '班长',       rank: '陆军上士', role: 'leader', weapon: 'AK-74M', weaponClass: '突击步枪', ammo: '5.45mm', ammoBallistics: '5.45x39', sanMax: 75, accuracy: 0.58, moveRange: 3, magSize: 30, spareMags: 6, damage: 28, grenades: 4, armorVehicles: ['MT-LBVM'], armorCalls: { 'MT-LBVM': 2 } },
      { name: '高级步枪手', rank: '陆军中士', role: 'deputy', weapon: 'AK-74M', weaponClass: '突击步枪', ammo: '5.45mm', ammoBallistics: '5.45x39', sanMax: 70, accuracy: 0.58, moveRange: 3, magSize: 30, spareMags: 6, damage: 28, grenades: 4, armorVehicles: ['MT-LBVM'], armorCalls: { 'MT-LBVM': 2 } },
      { name: '机枪手',     rank: '陆军下士', role: 'mg', team: 'mg', weapon: 'PKP Pecheneg', weaponClass: '通用机枪', ammo: '7.62mm', ammoBallistics: '7.62x54R', sanMax: 65, accuracy: 0.55, moveRange: 2, isMG: true, mgSpec: 3, mgBase: 6, damage: 60, magSize: 200, spareMags: 1, supplyType: 'PKP弹箱', grenades: 0 },
      { name: '榴弹手',     rank: '陆军下士', role: 'rifle', team: 'rpg', weapon: 'RPG-7V2', weaponClass: '复装火箭筒', ammo: 'OG-7V', ammoBallistics: '5.45x39', sanMax: 60, accuracy: 0.50, moveRange: 3, magSize: 1, spareMags: 0, damage: 70, isRocket: true, rocketAmmo: 2, hasSecondaryWeapon: true, secondaryWeapon: 'AK-74M', secondaryClass: '突击步枪', secondaryDamage: 28, secondaryMagSize: 30, secondaryMagAmmo: 30, secondarySpareMags: 4, secondaryAmmoType: '5.45mm', secondaryBallistics: '5.45x39', grenades: 2 },
      { name: '榴弹手助理', rank: '陆军上等兵', role: 'assist', team: 'rpg', weapon: 'AK-74M', weaponClass: '突击步枪', ammo: '5.45mm', ammoBallistics: '5.45x39', sanMax: 58, accuracy: 0.58, moveRange: 3, magSize: 30, spareMags: 4, damage: 28, carriesRPG: 3, grenades: 4 },
      { name: '步枪手',     rank: '陆军上等兵', role: 'rifle', weapon: 'AK-74M', weaponClass: '突击步枪', ammo: '5.45mm', ammoBallistics: '5.45x39', sanMax: 60, accuracy: 0.58, moveRange: 3, magSize: 30, spareMags: 6, damage: 28, grenades: 4 },
      { name: 'PKP 副射手', rank: '陆军上等兵', role: 'assist', team: 'mg', weapon: 'AK-74M', weaponClass: '突击步枪', ammo: '5.45mm', ammoBallistics: '5.45x39', sanMax: 60, accuracy: 0.58, moveRange: 3, magSize: 30, spareMags: 4, damage: 28, mgSpec: 2, grenades: 4 },
    ]
  },
};