// ============================================================
// dlc/breaking-waves.js — 破浪利刃：海军陆战队班组
// ============================================================

DLC_REGISTRY['breaking-waves'] = {
  name: '破浪利刃',
  description: '海军陆战队班组',
  squads: {
    planmc_infantry: {
      name: 'PLANMC 步兵班（重机枪加强，2013）', category: 'marine', era: 'early',
      faction: 'PLA', flagClass: 'flag-pla',
      desc: '海军陆战队 · 10人制 · QJY-88三脚架 + QBU-88精确射手',
      units: [
        { name: '班长',       rank: '二级上士', role: 'leader',  weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 75, accuracy: 0.60, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 4 },
        { name: '副班长',     rank: '中士',     role: 'deputy',  weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 70, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, grenades: 4 },
        { name: '机枪射手',   rank: '中士',     role: 'mg',      team: 'mg', weapon: 'QJY-88', weaponClass: '通用机枪（三脚架）', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 65, accuracy: 0.55, moveRange: 2, isMG: true, mgSpec: 3, mgBase: 7, damage: 45, magSize: 200, spareMags: 0, supplyType: 'QJY-88弹箱', crewRequired: 2, grenades: 0, isQJY88Operator: true },
        { name: '机枪副射手', rank: '下士',     role: 'assist',  team: 'mg', weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 62, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, mgSpec: 2, grenades: 4 },
        { name: '机枪弹药手', rank: '下士',     role: 'ammo',    team: 'mg', weapon: 'QBZ95B-1', weaponClass: '短突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.50, moveRange: 3, magSize: 30, spareMags: 1, damage: 28, supplyBoxes: 2, supplyBoxSize: 150, supplyBoxType: 'QJY-88弹箱', supplyRange: 1, grenades: 4 },
        { name: '步枪手A',    rank: '上等兵',   role: 'rifle',   weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, hasPF89A: true, pf89aAmmo: 1, hasSecondaryWeapon: true, secondaryWeapon: 'PF89A', secondaryClass: '次抛火箭筒', secondaryDamage: 60, secondaryMagSize: 1, secondaryMagAmmo: 1, secondarySpareMags: 0, secondaryAmmoType: '80mm', secondaryBallistics: '5.8x42', grenades: 4 },
        { name: '步枪手B',    rank: '上等兵',   role: 'rifle',   weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, hasPF89A: true, pf89aAmmo: 1, hasSecondaryWeapon: true, secondaryWeapon: 'PF89A', secondaryClass: '次抛火箭筒', secondaryDamage: 60, secondaryMagSize: 1, secondaryMagAmmo: 1, secondarySpareMags: 0, secondaryAmmoType: '80mm', secondaryBallistics: '5.8x42', grenades: 4 },
        { name: '步枪手C',    rank: '上等兵',   role: 'rifle',   weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, hasPF89A: true, pf89aAmmo: 1, hasSecondaryWeapon: true, secondaryWeapon: 'PF89A', secondaryClass: '次抛火箭筒', secondaryDamage: 60, secondaryMagSize: 1, secondaryMagAmmo: 1, secondarySpareMags: 0, secondaryAmmoType: '80mm', secondaryBallistics: '5.8x42', grenades: 4 },
        { name: '步枪手D',    rank: '上等兵',   role: 'rifle',   weapon: 'QBZ95-1', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 30, hasPF89A: true, pf89aAmmo: 1, hasSecondaryWeapon: true, secondaryWeapon: 'PF89A', secondaryClass: '次抛火箭筒', secondaryDamage: 60, secondaryMagSize: 1, secondaryMagAmmo: 1, secondarySpareMags: 0, secondaryAmmoType: '80mm', secondaryBallistics: '5.8x42', grenades: 4 },
        { name: '精确射手',   rank: '下士',     role: 'marksman', weapon: 'QBU-88', weaponClass: '半自动精确射手步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 65, accuracy: 0.80, moveRange: 3, magSize: 10, spareMags: 6, damage: 45, marksmanSpec: 2, suppressValue: 5, grenades: 2 },
      ]
    },
    usmc_rifle: {
      name: 'USMC 步枪班（2015）', category: 'marine', era: 'early',
      faction: 'US', flagClass: 'flag-us',
      desc: '海军陆战队 · 13人制 · M16A4 + M27 IAR + M38 DMR',
      units: [
        { name: '班长',       rank: '上士', role: 'leader', weapon: 'M16A4', weaponClass: '突击步枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 75, accuracy: 0.60, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, suppressValue: 2, grenades: 4 },
        { name: '火力组长A',  rank: '下士', role: 'deputy', weapon: 'M16A4', weaponClass: '突击步枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, suppressValue: 2, grenades: 4 },
        { name: '火力组长B',  rank: '下士', role: 'deputy', weapon: 'M16A4', weaponClass: '突击步枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, suppressValue: 2, grenades: 4 },
        { name: '火力组长C',  rank: '下士', role: 'deputy', weapon: 'M16A4', weaponClass: '突击步枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, suppressValue: 2, grenades: 4 },
        { name: '自动步枪手A', rank: '专业军士', role: 'mg', team: 'mg', weapon: 'M27 IAR', weaponClass: '班用机枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.58, moveRange: 3, isMG: true, mgSpec: 2, damage: 34, magSize: 30, spareMags: 7, supplyType: 'M27弹匣', grenades: 0 },
        { name: '自动步枪手B', rank: '专业军士', role: 'mg', team: 'mg', weapon: 'M27 IAR', weaponClass: '班用机枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.58, moveRange: 3, isMG: true, mgSpec: 2, damage: 34, magSize: 30, spareMags: 7, supplyType: 'M27弹匣', grenades: 0 },
        { name: '自动步枪手C', rank: '专业军士', role: 'mg', team: 'mg', weapon: 'M27 IAR', weaponClass: '班用机枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.58, moveRange: 3, isMG: true, mgSpec: 2, damage: 34, magSize: 30, spareMags: 7, supplyType: 'M27弹匣', grenades: 0 },
        { name: '精确射手',   rank: '下士', role: 'marksman', weapon: 'M38 DMR', weaponClass: '自动精确射手步枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.80, moveRange: 3, magSize: 30, spareMags: 7, damage: 38, marksmanSpec: 2, suppressValue: 5, isAutoDMR: true, grenades: 2 },
        { name: '弹药手A',    rank: '一等兵', role: 'ammo', team: 'mg', weapon: 'M16A4', weaponClass: '突击步枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 55, accuracy: 0.50, moveRange: 2, magSize: 30, spareMags: 5, damage: 26, suppressValue: 2, supplyBoxes: 1, supplyBoxSize: 30, supplyBoxType: 'M27弹匣', supplyRange: 1, grenades: 4 },
        { name: '弹药手B',    rank: '一等兵', role: 'ammo', team: 'mg', weapon: 'M16A4', weaponClass: '突击步枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 55, accuracy: 0.50, moveRange: 2, magSize: 30, spareMags: 5, damage: 26, suppressValue: 2, supplyBoxes: 1, supplyBoxSize: 30, supplyBoxType: 'M27弹匣', supplyRange: 1, grenades: 4 },
        { name: '弹药手C',    rank: '一等兵', role: 'ammo', team: 'mg', weapon: 'M16A4', weaponClass: '突击步枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 55, accuracy: 0.50, moveRange: 2, magSize: 30, spareMags: 5, damage: 26, suppressValue: 2, supplyBoxes: 1, supplyBoxSize: 30, supplyBoxType: 'M27弹匣', supplyRange: 1, grenades: 4 },
        { name: '步枪手A',    rank: '一等兵', role: 'rifle', weapon: 'M16A4', weaponClass: '突击步枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, suppressValue: 2, grenades: 4 },
        { name: '步枪手B',    rank: '一等兵', role: 'rifle', weapon: 'M16A4', weaponClass: '突击步枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 26, suppressValue: 2, grenades: 4 },
      ]
    },
    ru_naval_infantry: {
      name: '俄军海军步兵班（2019，BTR-82A）', category: 'marine', era: 'mid',
      faction: 'RU', flagClass: 'flag-ru', factionColor: '#3f6212',
      desc: '海军陆战队 · 7人制 · AK-12 + RPK-16 + SVDM，配属 BTR-82A',
      units: [
        { name: '班长',       rank: '海军上士', role: 'leader', weapon: 'AK-12', weaponClass: '突击步枪', ammo: '5.45mm', ammoBallistics: '5.45x39', sanMax: 75, accuracy: 0.60, moveRange: 3, magSize: 30, spareMags: 6, damage: 28, grenades: 4, armorVehicles: ['BTR-82A'] },
        { name: '机枪手',     rank: '海军下士', role: 'mg', team: 'mg', weapon: 'RPK-16(短枪管)', weaponClass: '班用机枪', ammo: '5.45mm', ammoBallistics: '5.45x39', sanMax: 65, accuracy: 0.55, moveRange: 2, isMG: true, mgSpec: 3, mgBase: 4, damage: 36, magSize: 95, spareMags: 1, supplyType: 'RPK-16弹鼓', grenades: 0 },
        { name: '榴弹手',     rank: '海军下士', role: 'rifle', team: 'rpg', weapon: 'RPG-7V2', weaponClass: '复装火箭筒', ammo: 'OG-7V', ammoBallistics: '5.45x39', sanMax: 60, accuracy: 0.50, moveRange: 3, magSize: 1, spareMags: 0, damage: 70, isRocket: true, rocketAmmo: 2, hasSecondaryWeapon: true, secondaryWeapon: 'AK-12', secondaryClass: '突击步枪', secondaryDamage: 28, secondaryMagSize: 30, secondaryMagAmmo: 30, secondarySpareMags: 3, secondaryAmmoType: '5.45mm', secondaryBallistics: '5.45x39', grenades: 2 },
        { name: '榴弹手助理', rank: '海军上等水手', role: 'assist', team: 'rpg', weapon: 'AK-12', weaponClass: '突击步枪', ammo: '5.45mm', ammoBallistics: '5.45x39', sanMax: 58, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 3, damage: 28, carriesRPG: 3, grenades: 4 },
        { name: '步枪手',     rank: '海军上等水手', role: 'rifle', weapon: 'AK-12', weaponClass: '突击步枪', ammo: '5.45mm', ammoBallistics: '5.45x39', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 6, damage: 28, grenades: 4 },
        { name: '精确射手',   rank: '海军准尉', role: 'marksman', weapon: 'SVDM', weaponClass: '半自动精确射手步枪', ammo: '7.62mm', ammoBallistics: '7.62x54R', sanMax: 68, accuracy: 0.82, moveRange: 3, magSize: 10, spareMags: 4, damage: 62, marksmanSpec: 3, suppressValue: 5, grenades: 2 },
        { name: '观察手',     rank: '海军大士', role: 'deputy', isObserver: true, weapon: 'AK-12(3×光学)', weaponClass: '突击步枪（光学）', ammo: '5.45mm', ammoBallistics: '5.45x39', sanMax: 65, accuracy: 0.62, moveRange: 3, magSize: 30, spareMags: 5, damage: 28, marksmanSpec: 1, armorVehicles: ['BTR-82A'], grenades: 4 },
      ]
    }
  }
};