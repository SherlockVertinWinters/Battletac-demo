// ============================================================
// dlc/tomorrows-front.js — 明日锋线：2025 现代化班组
// ============================================================

DLC_REGISTRY['tomorrows-front'] = {
  name: '明日锋线',
  description: '2025 现代化班组',
  squads: {
    us_ibct_2025: {
      name: '美军 IBCT 步枪班（2025，NGSW）', category: 'regular', era: 'late',
      faction: 'US', flagClass: 'flag-us',
      desc: '常规步兵班 · 9人制 · M7 + M250 + DMR（M110A1/SPEAR 可选）',
      hasDMRConfig: true,
      units: [
        { name: '班长', rank: '上士', role: 'leader', weapon: 'M7', weaponClass: '突击步枪', ammo: '6.8mm', ammoBallistics: '6.8x51', sanMax: 75, accuracy: 0.58, moveRange: 3, magSize: 20, spareMags: 7, damage: 38, shotCostNormal: 2, shotCostSuppress: 4, marksmanSpec: 1, grenades: 4 },
        { name: '火力组长A', rank: '下士', role: 'deputy', weapon: 'M7', weaponClass: '突击步枪', ammo: '6.8mm', ammoBallistics: '6.8x51', sanMax: 65, accuracy: 0.55, moveRange: 3, magSize: 20, spareMags: 7, damage: 38, shotCostNormal: 2, shotCostSuppress: 4, marksmanSpec: 1, grenades: 4 },
        { name: '自动步枪手', rank: '专业军士', role: 'mg', team: 'mg', weapon: 'M250', weaponClass: '班用机枪', ammo: '6.8mm', ammoBallistics: '6.8x51', sanMax: 65, accuracy: 0.50, moveRange: 2, magSize: 100, spareMags: 2, damage: 40, isMG: true, mgSpec: 3, mgBase: 6, shotCostNormal: 5, shotCostSuppress: 10, marksmanSpec: 1, supplyType: 'M250弹链', grenades: 0 },
        { name: '掷弹兵A', rank: '一等兵', role: 'rifle', weapon: 'M7', weaponClass: '突击步枪', ammo: '6.8mm', ammoBallistics: '6.8x51', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 20, spareMags: 7, damage: 38, shotCostNormal: 2, shotCostSuppress: 4, marksmanSpec: 1, grenades: 4 },
        { name: '步枪手A', rank: '一等兵', role: 'rifle', weapon: 'M7', weaponClass: '突击步枪', ammo: '6.8mm', ammoBallistics: '6.8x51', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 20, spareMags: 7, damage: 38, shotCostNormal: 2, shotCostSuppress: 4, marksmanSpec: 1, grenades: 4 },
        { name: '火力组长B', rank: '下士', role: 'deputy', weapon: 'M7', weaponClass: '突击步枪', ammo: '6.8mm', ammoBallistics: '6.8x51', sanMax: 65, accuracy: 0.55, moveRange: 3, magSize: 20, spareMags: 7, damage: 38, shotCostNormal: 2, shotCostSuppress: 4, marksmanSpec: 1, grenades: 4 },
        { name: '步枪手B', rank: '一等兵', role: 'rifle', weapon: 'M7', weaponClass: '突击步枪', ammo: '6.8mm', ammoBallistics: '6.8x51', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 20, spareMags: 7, damage: 38, shotCostNormal: 2, shotCostSuppress: 4, marksmanSpec: 1, grenades: 4, hasAT4CS: true, at4csAmmo: 1, hasSecondaryWeapon: true, secondaryWeapon: 'AT4CS HE', secondaryClass: '次抛高爆火箭筒', secondaryDamage: 65, secondaryMagSize: 1, secondaryMagAmmo: 1, secondarySpareMags: 0, secondaryAmmoType: '84mm', secondaryBallistics: '5.56x45' },
        { name: '精确射手', rank: '下士', role: 'marksman', isConfigurable: true, configKey: 'dmr', sanMax: 65, moveRange: 3, grenades: 2 },
        { name: '步枪手C', rank: '一等兵', role: 'rifle', weapon: 'M7', weaponClass: '突击步枪', ammo: '6.8mm', ammoBallistics: '6.8x51', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 20, spareMags: 7, damage: 38, shotCostNormal: 2, shotCostSuppress: 4, marksmanSpec: 1, grenades: 4, hasAT4CS: true, at4csAmmo: 1, hasSecondaryWeapon: true, secondaryWeapon: 'AT4CS HE', secondaryClass: '次抛高爆火箭筒', secondaryDamage: 65, secondaryMagSize: 1, secondaryMagAmmo: 1, secondarySpareMags: 0, secondaryAmmoType: '84mm', secondaryBallistics: '5.56x45' },
      ]
    },
    pla_airborne_2025: {
      name: 'PLAAF 空中突击班（2025）', category: 'regular', era: 'late',
      faction: 'PLA', flagClass: 'flag-pla',
      desc: '空突步兵班 · 9人制 · QBZ-191 + QJS-161 ×2 + QBU-191 + PF98A',
      units: [
        { name: '班长', rank: '二级上士', role: 'leader', weapon: 'QBZ-191', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 75, accuracy: 0.58, moveRange: 3, magSize: 30, spareMags: 7, damage: 32, shotCostNormal: 3, shotCostSuppress: 6, marksmanSpec: 1, grenades: 4 },
        { name: '副班长', rank: '中士', role: 'deputy', weapon: 'QBZ-191', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 70, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 32, shotCostNormal: 3, shotCostSuppress: 6, marksmanSpec: 1, grenades: 4 },
        { name: '机枪手A', rank: '下士', role: 'mg', team: 'mg', weapon: 'QJS-161', weaponClass: '班用机枪（短管）', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 65, accuracy: 0.52, moveRange: 2, magSize: 100, spareMags: 2, damage: 38, isMG: true, mgSpec: 3, mgBase: 4, shotCostNormal: 5, shotCostSuppress: 10, marksmanSpec: 1, supplyType: 'QJS-161弹链', grenades: 0 },
        { name: '机枪手B', rank: '下士', role: 'mg', team: 'mg', weapon: 'QJS-161', weaponClass: '班用机枪（短管）', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 65, accuracy: 0.52, moveRange: 2, magSize: 100, spareMags: 2, damage: 38, isMG: true, mgSpec: 3, mgBase: 4, shotCostNormal: 5, shotCostSuppress: 10, marksmanSpec: 1, supplyType: 'QJS-161弹链', grenades: 0 },
        { name: '精确射手', rank: '下士', role: 'marksman', weapon: 'QBU-191', weaponClass: '自动精确射手步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 65, accuracy: 0.80, moveRange: 3, magSize: 30, spareMags: 7, damage: 42, marksmanSpec: 2, suppressValue: 5, isAutoDMR: true, shotCostSnipe: 5, shotCostSuppress: 15, grenades: 2 },
        { name: '火箭筒射手', rank: '下士', role: 'rifle', team: 'rpg', weapon: 'PF98A', weaponClass: '复装火箭筒', ammo: 'HEMP', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.48, moveRange: 3, magSize: 1, spareMags: 0, damage: 85, isRocket: true, rocketAmmo: 2, hasSecondaryWeapon: true, secondaryWeapon: 'QBZ-191', secondaryClass: '突击步枪', secondaryDamage: 32, secondaryMagSize: 30, secondaryMagAmmo: 30, secondarySpareMags: 4, secondaryAmmoType: '5.8mm', secondaryBallistics: '5.8x42', marksmanSpec: 1, grenades: 2 },
        { name: '火箭筒副手', rank: '上等兵', role: 'assist', team: 'rpg', weapon: 'QBZ-191', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 58, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 4, damage: 32, carriesRPG: 2, shotCostNormal: 3, shotCostSuppress: 6, marksmanSpec: 1, grenades: 4 },
        { name: '步枪手A', rank: '上等兵', role: 'rifle', weapon: 'QBZ-191', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 32, shotCostNormal: 3, shotCostSuppress: 6, marksmanSpec: 1, grenades: 4 },
        { name: '步枪手B', rank: '上等兵', role: 'rifle', weapon: 'QBZ-191', weaponClass: '突击步枪', ammo: '5.8mm', ammoBallistics: '5.8x42', sanMax: 60, accuracy: 0.55, moveRange: 3, magSize: 30, spareMags: 7, damage: 32, shotCostNormal: 3, shotCostSuppress: 6, marksmanSpec: 1, grenades: 4 },
      ]
    }
  }
};