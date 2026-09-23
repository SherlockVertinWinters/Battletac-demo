// ============================================================
// dlc/iron-spearhead.js — 铁甲矛头：装甲步兵班组
// ============================================================

DLC_REGISTRY['iron-spearhead'] = {
  name: '铁甲矛头',
  description: '装甲步兵班组',
  squads: {
    us_sbct_cav_2005: {
      name: 'SBCT 骑兵侦察小组（2005）', category: 'armored', era: 'early',
      faction: 'US', flagClass: 'flag-us',
      desc: '装甲侦察 · 4人下车组 · M4A1(4×) + AT4CS，配属 Stryker RV + Stryker MGS',
      hasVehicleConfig: 'Stryker RV',
      units: [
        { name: '侦查组长',   rank: '上士', role: 'leader', isObserver: true, weapon: 'M4A1(4×光学)', weaponClass: '突击步枪（光学）', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 75, accuracy: 0.58, moveRange: 3, magSize: 30, spareMags: 6, damage: 26, marksmanSpec: 1, grenades: 4, armorVehicles: ['Stryker RV', 'Stryker MGS'], armorCalls: { 'Stryker RV': 2, 'Stryker MGS': 1 } },
        { name: '自动步枪手', rank: '专业军士', role: 'mg', team: 'mg', weapon: 'M249 SAW', weaponClass: '班用机枪', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 65, accuracy: 0.55, moveRange: 2, isMG: true, mgSpec: 3, damage: 34, magSize: 200, spareMags: 0, supplyType: 'M249弹药箱', grenades: 0 },
        { name: '侦查兵A',    rank: '一等兵', role: 'rifle', isObserver: true, weapon: 'M4A1(4×光学)', weaponClass: '突击步枪（光学）', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.58, moveRange: 3, magSize: 30, spareMags: 6, damage: 26, grenades: 4, armorVehicles: ['Stryker RV'], armorCalls: { 'Stryker RV': 1 }, hasAT4CS: true, at4csAmmo: 1, hasSecondaryWeapon: true, secondaryWeapon: 'AT4CS HE', secondaryClass: '次抛高爆火箭筒', secondaryDamage: 65, secondaryMagSize: 1, secondaryMagAmmo: 1, secondarySpareMags: 0, secondaryAmmoType: '84mm', secondaryBallistics: '5.56x45' },
        { name: '侦查兵B',    rank: '一等兵', role: 'rifle', isObserver: true, weapon: 'M4A1(4×光学)', weaponClass: '突击步枪（光学）', ammo: '5.56mm', ammoBallistics: '5.56x45', sanMax: 60, accuracy: 0.58, moveRange: 3, magSize: 30, spareMags: 6, damage: 26, grenades: 4, armorVehicles: ['Stryker RV'], armorCalls: { 'Stryker RV': 1 }, hasAT4CS: true, at4csAmmo: 1, hasSecondaryWeapon: true, secondaryWeapon: 'AT4CS HE', secondaryClass: '次抛高爆火箭筒', secondaryDamage: 65, secondaryMagSize: 1, secondaryMagAmmo: 1, secondarySpareMags: 0, secondaryAmmoType: '84mm', secondaryBallistics: '5.56x45' },
      ]
    },
    pla_armored_2006: {
      name: 'PLA 装甲步兵班（2006，ZSL-92）', category: 'armored', era: 'early',
      faction: 'PLA', flagClass: 'flag-pla',
      desc: '装甲步兵 · 6人下车组 · QBZ95 + QBB95 + 69-1，配属 ZSL-92',
      units: [
        { name: '班长',   rank: '二级上士', role: 'leader', weapon: 'QBZ95', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 75, accuracy: 0.58, moveRange: 3, magSize: 30, spareMags: 5, damage: 28, grenades: 4, armorVehicles: ['ZSL-92'], armorCalls: { 'ZSL-92': 3 } },
        { name: '机枪手', rank: '中士', role: 'mg', team: 'mg', weapon: 'QBB95', weaponClass: '班用机枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 65, accuracy: 0.55, moveRange: 2, isMG: true, mgSpec: 3, mgBase: 5, damage: 36, magSize: 75, spareMags: 2, supplyType: 'QBB95弹鼓', grenades: 0 },
        { name: '机枪副射手', rank: '下士', role: 'assist', team: 'mg', weapon: 'QBZ95', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 28, mgSpec: 2, grenades: 4 },
        { name: '火箭筒手', rank: '下士', role: 'rifle', team: 'rpg', weapon: '69-1式火箭筒', weaponClass: '复装火箭筒', ammo: 'OG-7V', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.48, moveRange: 3, magSize: 1, spareMags: 0, damage: 70, isRocket: true, rocketAmmo: 1, currentRocketType: 'OG-7V', rocketPool: { 'OG-7V': 4, '69-1F': 2 }, reloadingRocketType: 'OG-7V', hasSecondaryWeapon: true, secondaryWeapon: 'QBZ95', secondaryClass: '突击步枪', secondaryDamage: 28, secondaryMagSize: 30, secondaryMagAmmo: 30, secondarySpareMags: 4, secondaryAmmoType: '5.8mm', secondaryBallistics: '5.8x42', grenades: 2 },
        { name: '火箭筒副手', rank: '上等兵', role: 'assist', team: 'rpg', weapon: 'QBZ95', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 58, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 3, damage: 28, carriesRPG: 3, carriesRPGTypes: { 'OG-7V': 2, '69-1F': 1 }, grenades: 4 },
        { name: '步枪手', rank: '上等兵', role: 'rifle', weapon: 'QBZ95', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 5, damage: 28, grenades: 4 },
      ]
    }
  }
};