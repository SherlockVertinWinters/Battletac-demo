// ============================================================
// js/combat.js — 手雷、火箭筒、载具呼叫、射击结算
// ============================================================

function throwGrenade(thrower, targetHex) {
  if (thrower.grenades <= 0) return;
  if (thrower.hasFired) return;
  thrower.grenades--; thrower.hasFired = true; exposeUnit(thrower);
  const roll = Math.random();
  let offset = 0;
  if (roll < 0.50) offset = 0;
  else if (roll < 0.80) offset = 1;
  else if (roll < 0.95) offset = 2;
  else offset = 3;
  let actualHex = { col: targetHex.col, row: targetHex.row };
  if (offset > 0) {
    const dir = HEX_DIRS[Math.floor(Math.random() * HEX_DIRS.length)];
    const A = offsetToAxial(targetHex.col, targetHex.row);
    const newPos = axialToOffset(A.q + dir[0] * offset, A.r + dir[1] * offset);
    if (newPos.col >= 0 && newPos.col < game.mapCols && newPos.row >= 0 && newPos.row < game.mapRows) actualHex = newPos;
  }
  const offsetTxt = offset === 0 ? '正中目标' : `偏离 ${offset} 格`;
  log(`<span style="color:#ef4444;">【手雷】</span>${thrower.name} 投掷手雷 → (${actualHex.col},${actualHex.row}) [${offsetTxt}]`);
  for (const u of game.units) {
    if (!u.alive) continue;
    const d = hexDistance({col:u.col, row:u.row}, actualHex);
    if (d > GRENADE_SHOCK_RADIUS) continue;
    const isFriendly = u.side === thrower.side;
    const blocked = isExplosionBlocked(actualHex, u);
    if (d <= GRENADE_KILL_RADIUS) {
      let baseDmg;
      if (d === 0) baseDmg = 50 + Math.random() * 30;
      else if (d === 1) baseDmg = 30 + Math.random() * 20;
      else baseDmg = 15 + Math.random() * 15;
      const dmg = baseDmg * (blocked ? 0.6 : 1.0);
      u.hp -= dmg; u.stoppedBleeding = false; clampTutorialHP(u); exposeUnit(u, false);
      let dmgMsg = isFriendly ? `<span style="color:#ef4444;font-weight:700;">⚠ 友军 ${u.name} 被炸 -${Math.round(dmg)}HP` : `<span style="color:#f87171;">${u.name} 被炸 -${Math.round(dmg)}HP`;
      if (blocked) dmgMsg += `（矮墙削伤）`;
      if (u.hp < DEATH_THRESHOLD) {
        onUnitDeath(u); dmgMsg += `，阵亡！`;
        if (isFriendly && thrower.alive) {
          let sanPenalty = 10;
          if (u.role === 'leader' || u.role === 'deputy') sanPenalty += 10;
          thrower.san = Math.max(0, thrower.san - sanPenalty);
          dmgMsg += `<br>${thrower.name} 误杀战友，SAN-${sanPenalty}`;
        }
      } else {
        dmgMsg += ` (${u.healthLevel}级)`;
        if (isFriendly && thrower.alive) { thrower.san = Math.max(0, thrower.san - 5); dmgMsg += `<br>${thrower.name} 误伤战友，SAN-5`; }
      }
      dmgMsg += `</span>`; log(dmgMsg);
    } else {
      u.shockRounds = 2; u.shockLevel = 1; u.san = Math.max(0, u.san - 5); exposeUnit(u, false);
      log(`${u.name} 被弹震（2回合，SAN-5）`);
    }
  }
  checkVictory();
}

function firePF97(attacker, target) {
  if (!attacker || !target || !attacker.alive || !target.alive) return;
  if (attacker.currentWeapon !== 'secondary' || attacker.secondaryWeapon !== 'PF97') return;
  if (attacker.secondaryMagAmmo <= 0) { attacker.hasSecondaryWeapon = false; attacker.currentWeapon = 'primary'; return; }
  const dist = hexDistance({ col: attacker.col, row: attacker.row }, { col: target.col, row: target.row });
  if (dist > PF97_MAX_RANGE) { log(`${attacker.name} 距目标过远，PF97 无法发射`); return; }
  attacker.secondaryMagAmmo--; attacker.hasFired = true; exposeUnit(attacker);
  const distMod = dist <= 4 ? 1.0 : 0.75;
  let acc = 0.60 * distMod * (1 + attacker.suppressionLevel.accMod);
  if (attacker.healthLevel === 'IV') acc *= 0.8;
  else if (attacker.healthLevel === 'III') acc *= 0.5;
  if (attacker.shockLevel === 2) acc *= 0.6;
  acc = Math.max(0.05, Math.min(0.95, acc));
  const hit = Math.random() < acc;
  let msg = `<span style="color:#f97316;">【PF97 云爆弹】</span>${attacker.name} → ${target.name} `;
  if (!hit) {
    msg += `未命中`; log(msg);
    if (attacker.secondaryMagAmmo <= 0) { attacker.hasSecondaryWeapon = false; attacker.currentWeapon = 'primary'; }
    checkVictory(); return;
  }
  msg += `直击！`; log(msg);
  for (const u of game.units) {
    if (!u.alive) continue;
    const d = hexDistance({ col: u.col, row: u.row }, { col: target.col, row: target.row });
    if (d > 2) continue;
    const isFriendly = u.side === attacker.side;
    const supVal = d === 0 ? 30 : (d === 1 ? 15 : 10);
    u.shockRounds = 2; u.shockLevel = 1; u.san = Math.max(0, u.san - 5);
    u.suppression = Math.min(150, u.suppression + supVal);
    exposeUnit(u, false);
    const newLv = u.suppressionLevel;
    if (newLv.level >= 3) u.san = Math.max(0, u.san - newLv.sanDrain);
    if (isFriendly) {
      if (d <= 1) {
        const dmg = (d === 0 ? 55 : 25) * 0.5;
        u.hp -= dmg; u.stoppedBleeding = false; clampTutorialHP(u);
        let sub = `<span style="color:#fca5a5;">⚠ 友军 ${u.name} 被云爆波及 -${Math.round(dmg)}HP</span>`;
        if (u.hp < DEATH_THRESHOLD) { onUnitDeath(u); sub += ` 阵亡！`; }
        log(sub);
      }
      continue;
    }
    if (d <= 1) {
      const dmg = d === 0 ? 55 : 25;
      u.hp -= dmg; u.stoppedBleeding = false; clampTutorialHP(u);
      let sub = `${u.name} 被云爆${d === 0 ? '直击' : '波及'} -${dmg}HP`;
      if (u.hp < DEATH_THRESHOLD) { onUnitDeath(u); sub += ` 阵亡！`; }
      log(`<span style="color:#fca5a5;">${sub}</span>`);
    }
  }
  if (attacker.secondaryMagAmmo <= 0) { attacker.hasSecondaryWeapon = false; attacker.currentWeapon = 'primary'; }
  checkVictory();
}

function fireAT4CS(attacker, target) {
  if (!attacker || !target || !attacker.alive || !target.alive) return;
  if (attacker.currentWeapon !== 'secondary' || attacker.secondaryWeapon !== 'AT4CS HE') return;
  if (attacker.at4csAmmo <= 0) { attacker.hasSecondaryWeapon = false; attacker.currentWeapon = 'primary'; return; }
  const dist = hexDistance({ col: attacker.col, row: attacker.row }, { col: target.col, row: target.row });
  if (dist > AT4_MAX_RANGE) { log(`${attacker.name} 距目标过远，AT4CS 无法发射`); return; }
  attacker.at4csAmmo--; attacker.hasFired = true; exposeUnit(attacker);
  const distMod = dist <= 3 ? 1.0 : 0.8;
  let acc = 0.55 * distMod * (1 + attacker.suppressionLevel.accMod);
  if (attacker.healthLevel === 'IV') acc *= 0.8;
  else if (attacker.healthLevel === 'III') acc *= 0.5;
  if (attacker.shockLevel === 2) acc *= 0.6;
  acc = Math.max(0.05, Math.min(0.95, acc));
  const hit = Math.random() < acc;
  let msg = `<span style="color:#d97706;">【AT4CS HE】</span>${attacker.name} → ${target.name} `;
  if (!hit) {
    msg += `未命中`; log(msg);
    if (attacker.at4csAmmo <= 0) { attacker.hasSecondaryWeapon = false; attacker.currentWeapon = 'primary'; }
    checkVictory(); return;
  }
  target.hp -= 65; target.stoppedBleeding = false; clampTutorialHP(target); exposeUnit(target, false);
  target.shockRounds = 2; target.shockLevel = 1; target.san = Math.max(0, target.san - 5);
  target.suppression = Math.min(150, target.suppression + 20);
  msg += `直击 -65HP｜弹震 2 回合｜压制+20`;
  if (target.hp < DEATH_THRESHOLD) { onUnitDeath(target); msg += ` 阵亡！`; }
  log(msg);
  const A = offsetToAxial(target.col, target.row);
  for (const [dq, dr] of HEX_DIRS) {
    const nb = axialToOffset(A.q + dq, A.r + dr);
    if (nb.col < 0 || nb.col >= game.mapCols || nb.row < 0 || nb.row >= game.mapRows) continue;
    const splash = game.units.find(o => o.alive && o.side !== attacker.side && o.col === nb.col && o.row === nb.row);
    if (!splash) continue;
    splash.shockRounds = 2; splash.shockLevel = 1; splash.san = Math.max(0, splash.san - 5);
    splash.suppression = Math.min(150, splash.suppression + 20);
    exposeUnit(splash, false);
  }
  if (attacker.at4csAmmo <= 0) { attacker.hasSecondaryWeapon = false; attacker.currentWeapon = 'primary'; }
  checkVictory();
}

function fireRocket(attacker, target) {
  if (!attacker || !target || !attacker.alive || !target.alive) return;
  if (attacker.rpgCooldown > 0) { log(`${attacker.name} 火箭筒装填中（剩余 ${attacker.rpgCooldown} 回合）`); return; }
  let rocketName, rocketDamage, isHE;
  if (attacker.currentWeapon === 'secondary' && attacker.secondaryWeapon === 'PF89A') {
    if (attacker.pf89aAmmo <= 0) { attacker.currentWeapon = 'primary'; return; }
    attacker.pf89aAmmo--; rocketName = 'PF89A'; rocketDamage = attacker.secondaryDamage; isHE = false;
  } else {
    if (attacker.rocketAmmo <= 0) { attacker.currentWeapon = 'primary'; return; }
    attacker.rocketAmmo--;
    rocketName = attacker.currentRocketType || attacker.weapon;
    rocketDamage = attacker.damage;
    isHE = true;
  }
  const dist = hexDistance({ col: attacker.col, row: attacker.row }, { col: target.col, row: target.row });
  const distMod = dist <= 5 ? 1.0 : dist <= 10 ? 0.85 : 0.7;
  let acc = attacker.accuracy * distMod * (1 + attacker.suppressionLevel.accMod);
  acc = Math.max(0.10, Math.min(0.85, acc));
  const hit = Math.random() < acc;
  const is69F = rocketName === '69-1F';
  let msg = `<span style="color:#a16207;">【${rocketName}】</span>${attacker.name} → ${target.name} (距离${dist}) `;
  if (hit) {
    target.hp -= rocketDamage; target.stoppedBleeding = false; clampTutorialHP(target); exposeUnit(target, false);
    if (target.hp < DEATH_THRESHOLD) { onUnitDeath(target); msg += `直击，击毙！`; }
    else msg += `直击 -${rocketDamage}HP`;
    if (!is69F) {
      const dir = getAttackDir(target, attacker);
      const wallKey = `${target.col},${target.row},${dir}`;
      if (EDGE_WALL.has(wallKey)) {
        EDGE_WALL.delete(wallKey);
        const A = offsetToAxial(target.col, target.row);
        const [dq, dr] = HEX_DIRS[dir];
        const nb = axialToOffset(A.q + dq, A.r + dr);
        if (nb.col >= 0 && nb.col < game.mapCols && nb.row >= 0 && nb.row < game.mapRows) EDGE_WALL.delete(`${nb.col},${nb.row},${(dir + 3) % 6}`);
        msg += ` · 掩体被摧毁`;
      }
    }
  } else msg += `未命中`;
  log(msg);
  if (is69F && hit) {
    const A = offsetToAxial(target.col, target.row);
    for (const [dq, dr] of HEX_DIRS) {
      const nb = axialToOffset(A.q + dq, A.r + dr);
      if (nb.col < 0 || nb.col >= game.mapCols || nb.row < 0 || nb.row >= game.mapRows) continue;
      const splash = game.units.find(o => o.alive && o.side !== attacker.side && o.col === nb.col && o.row === nb.row);
      if (!splash) continue;
      const dmg = 30 * (1 + (Math.random() * 2 - 1) * 0.15);
      splash.hp -= dmg; splash.stoppedBleeding = false; clampTutorialHP(splash); exposeUnit(splash, false);
      let sub = `<span style="color:#fca5a5;">${splash.name} 被空爆波及 -${Math.round(dmg)}HP</span>`;
      if (splash.hp < DEATH_THRESHOLD) { onUnitDeath(splash); sub += ` 阵亡！`; }
      log(sub);
    }
  } else if (isHE && hit) {
    const A = offsetToAxial(target.col, target.row);
    for (const [dq, dr] of HEX_DIRS) {
      const nb = axialToOffset(A.q + dq, A.r + dr);
      if (nb.col < 0 || nb.col >= game.mapCols || nb.row < 0 || nb.row >= game.mapRows) continue;
      const splash = game.units.find(o => o.alive && o.side !== attacker.side && o.col === nb.col && o.row === nb.row);
      if (!splash) continue;
      const blocked = isExplosionBlocked({col:target.col,row:target.row}, splash);
      splash.hp -= 15; splash.stoppedBleeding = false; clampTutorialHP(splash);
      splash.shockRounds = 2; splash.shockLevel = 1; splash.san = Math.max(0, splash.san - 5);
      splash.suppression = Math.min(150, splash.suppression + (blocked ? 14 : 20));
      exposeUnit(splash, false);
      if (splash.hp < DEATH_THRESHOLD) onUnitDeath(splash);
    }
  }
  if (rocketName === 'PF89A') {
    attacker.hasSecondaryWeapon = false; attacker.currentWeapon = 'primary';
  } else {
    const hasAssistant = game.units.some(o => o.alive && o.side === attacker.side && o.team === 'rpg' && o !== attacker && (o.carriesRPG > 0 || o.carriesRPGTypes) && hexDistance({ col: attacker.col, row: attacker.row }, { col: o.col, row: o.row }) <= 1);
    attacker.rpgCooldown = hasAssistant ? 3 : 4;
    attacker.rocketAmmo = 0;
  }
  attacker.hasFired = true; exposeUnit(attacker);
  checkVictory();
}

function callArmorSupport(caller, vehicleName, targetHex) {
  if (!caller.alive) return false;
  if (!caller.armorVehicles.includes(vehicleName)) return false;
  if (caller.armorCallCount[vehicleName] >= caller.armorCallMax[vehicleName]) return false;
  if (game.vehicleCooldowns[caller.side][vehicleName] > 0) return false;
  if (game.pendingStrikes.some(s => s.side === caller.side && s.vehicleName === vehicleName)) {
    log(`<span style="color:#f87171;">${vehicleName} 火力已在途，无法重复呼叫</span>`);
    return false;
  }
  if (vehicleName.startsWith('AAV7A1')) {
    const aavInFlight = game.pendingStrikes.filter(s => s.side === caller.side && s.vehicleName.startsWith('AAV7A1')).length;
    if (aavInFlight >= 2) {
      log(`<span style="color:#f87171;">AAV7A1 火力已在途（${aavInFlight}/2），无法重复呼叫</span>`);
      return false;
    }
  }
  const cfg = (caller.resolvedArmorSupport && caller.resolvedArmorSupport[vehicleName]) || ARMOR_SUPPORT[vehicleName] || ARMOR_SUPPORT['BTR-82A'];
  caller.armorCallCount[vehicleName]++; caller.hasFired = true; exposeUnit(caller);
  const strike = {
    side: caller.side, vehicleName,
    targetHex: { col: targetHex.col, row: targetHex.row },
    callerName: caller.name, callerCol: caller.col, callerRow: caller.row,
    landRound: game.round + ARMOR_DELAY,
    payload: JSON.parse(JSON.stringify(cfg))
  };
  if (cfg.isMGS) {
    const vertexDist = hexDistance({col:caller.col,row:caller.row}, targetHex);
    if (vertexDist > MGS_CONE_MAX_RANGE) {
      caller.armorCallCount[vehicleName]--; caller.hasFired = false; return false;
    }
    strike.coneCells = getMGSConeCells(targetHex.col, targetHex.row, caller.side);
  }
  game.pendingStrikes.push(strike);
  const sideLabel = caller.side === 'blue' ? '蓝方' : '红方';
  log(`<span style="color:#a16207;">【呼叫】</span>${sideLabel} ${caller.name} 请求 ${vehicleName} 火力 → (${targetHex.col},${targetHex.row})，预计下回合抵达`);
  checkVictory();
  return true;
}

function tryRocketResupply(shooter) {
  if (!shooter.alive || !shooter.isRocket) return false;
  if (shooter.rocketAmmo > 0) return false;
  const helpers = game.units.filter(u =>
    u.alive && u.side === shooter.side && u.team === 'rpg' && u !== shooter &&
    (u.carriesRPG > 0 || u.carriesRPGTypes) &&
    hexDistance({col:u.col,row:u.row}, {col:shooter.col,row:shooter.row}) <= 1
  );
  for (const h of helpers) {
    if (h.carriesRPGTypes) {
      const wantType = shooter.reloadingRocketType || 'OG-7V';
      if (h.carriesRPGTypes[wantType] > 0) {
        h.carriesRPGTypes[wantType]--;
        shooter.rocketAmmo += 1;
        shooter.currentRocketType = wantType;
        if (shooter.rocketPool && typeof shooter.rocketPool === 'object') {
          shooter.rocketPool[wantType] = (shooter.rocketPool[wantType] || 0) + 1;
        }
        log(`<span style="color:#22c55e;">${h.name} 为 ${shooter.name} 补充 ${wantType}</span>`);
        return true;
      } else if (h.carriesRPGTypes['OG-7V'] > 0) {
        h.carriesRPGTypes['OG-7V']--;
        shooter.rocketAmmo += 1;
        shooter.currentRocketType = 'OG-7V';
        if (shooter.rocketPool && typeof shooter.rocketPool === 'object') {
          shooter.rocketPool['OG-7V'] = (shooter.rocketPool['OG-7V'] || 0) + 1;
        }
        log(`<span style="color:#22c55e;">${h.name} 无 ${wantType}，补给 OG-7V</span>`);
        return true;
      }
    } else if (h.carriesRPG > 0) {
      h.carriesRPG--; shooter.rocketAmmo += 1;
      log(`<span style="color:#22c55e;">${h.name} 为 ${shooter.name} 补充火箭弹</span>`);
      return true;
    }
  }
  return false;
}

function resolveGroundFire(attacker, targetHex) {
  if (!attacker || !attacker.alive) return;
  if (attacker.isRocket && attacker.currentWeapon === 'primary') { log(`${attacker.name} 的火箭筒无法强制攻击空地`); return; }
  if (attacker.hasSecondaryWeapon && attacker.currentWeapon === 'secondary' && (attacker.secondaryWeapon === 'PF97' || attacker.secondaryWeapon === 'AT4CS HE')) { log(`${attacker.name} 的 ${attacker.secondaryWeapon} 无法强制攻击空地`); return; }
  const wd = attacker.activeWeaponData;
  const isSecondary = wd.isSecondary;
  const cost = attacker.shotCost;
  if (wd.magAmmo < cost) {
    if (wd.spareMags > 0) {
      if (isSecondary) { attacker.secondarySpareMags--; attacker.secondaryMagAmmo = wd.magSize; }
      else { attacker.spareMags--; attacker.magAmmo = wd.magSize; }
    } else {
      log(`${attacker.name} 弹药耗尽`); attacker.hasFired = true; exposeUnit(attacker); return;
    }
  } else {
    if (isSecondary) attacker.secondaryMagAmmo -= cost;
    else attacker.magAmmo -= cost;
  }
  attacker.hasFired = true; exposeUnit(attacker);
  const targetInHex = game.units.find(u => u.alive && u.col === targetHex.col && u.row === targetHex.row && u.side !== attacker.side);
  if (!targetInHex) {
    log(`<span style="color:#7c3aed;">【强制攻击】</span>${attacker.name} → (${targetHex.col},${targetHex.row})（空地，弹药-${cost}）`);
    checkVictory(); return;
  }
  let concealMod = (targetInHex.isConcealed && !targetInHex.isDummy) ? CONCEALED_HIT_MOD : 1.0;
  const dist = hexDistance({ col: attacker.col, row: attacker.row }, { col: targetInHex.col, row: targetInHex.row });
  const attSup = attacker.suppressionLevel;
  const ammoKey = wd.ballistics || '5.8x42';
  const bal = BALLISTICS[ammoKey] || BALLISTICS['5.8x42'];
  let distMod;
  if (dist <= 3) distMod = bal.close;
  else if (dist <= 6) distMod = bal.mid;
  else if (dist <= 10) distMod = bal.far;
  else distMod = bal.extreme;
  let acc = attacker.accuracy * distMod * (1 + attSup.accMod);
  if (attacker.healthLevel === 'IV') acc *= 0.8;
  else if (attacker.healthLevel === 'III') acc *= 0.5;
  if (attacker.shockLevel === 2) acc *= 0.6;
  acc += getPairBonus(attacker);
  acc += getCrewPenalty(attacker);
  acc = Math.max(0.05, Math.min(0.95, acc));
  acc *= concealMod;
  const hit = Math.random() < acc;
  let msg = `<span style="color:#7c3aed;">【强制攻击】</span>${attacker.name} → (${targetHex.col},${targetHex.row}) `;
  if (targetInHex.isConcealed && !targetInHex.isDummy) msg += `[隐蔽目标] `;
  if (hit) {
    let dmg = wd.damage * (0.7 + Math.random() * 0.6);
    targetInHex.hp -= dmg; targetInHex.stoppedBleeding = false; clampTutorialHP(targetInHex); exposeUnit(targetInHex, false);
    if (targetInHex.hp < DEATH_THRESHOLD) { onUnitDeath(targetInHex); msg += `命中，击毙！`; }
    else msg += `命中 -${Math.round(dmg)}HP`;
  } else msg += `未命中`;
  log(msg);
  if (targetInHex.alive && (!targetInHex.isConcealed || targetInHex.isDummy)) targetInHex.interruptedUntilRound = game.round + 1;
  checkVictory();
}

function resolveShoot(attacker, target) {
  if (!attacker || !target || !attacker.alive || !target.alive) return;
  if (attacker.isRocket && attacker.currentWeapon === 'primary') return fireRocket(attacker, target);
  if (attacker.hasSecondaryWeapon && attacker.secondaryWeapon === 'PF89A' && attacker.currentWeapon === 'secondary') return fireRocket(attacker, target);
  if (attacker.hasSecondaryWeapon && attacker.secondaryWeapon === 'PF97' && attacker.currentWeapon === 'secondary') return firePF97(attacker, target);
  if (attacker.hasSecondaryWeapon && attacker.secondaryWeapon === 'AT4CS HE' && attacker.currentWeapon === 'secondary') return fireAT4CS(attacker, target);
  const wd = attacker.activeWeaponData;
  const isSecondary = wd.isSecondary;
  const cost = attacker.shotCost;
  if (wd.magAmmo < cost) {
    if (wd.spareMags > 0) {
      if (isSecondary) { attacker.secondarySpareMags--; attacker.secondaryMagAmmo = wd.magSize; }
      else { attacker.spareMags--; attacker.magAmmo = wd.magSize; }
      log(`${attacker.name} 换弹`); attacker.hasFired = true; exposeUnit(attacker); return;
    } else {
      if (tryResupply(attacker)) { attacker.hasFired = true; exposeUnit(attacker); return; }
      log(`${attacker.name} 弹药耗尽`); attacker.hasFired = true; exposeUnit(attacker); return;
    }
  }
  if (isSecondary) attacker.secondaryMagAmmo -= cost;
  else attacker.magAmmo -= cost;
  attacker.hasFired = true; exposeUnit(attacker);

  const isSnipe = attacker.fireMode === 'snipe';
  const isSuppress = attacker.fireMode === 'suppress';
  const isAutoDMR = attacker.isAutoDMR;
  const dist = hexDistance({ col: attacker.col, row: attacker.row }, { col: target.col, row: target.row });
  const attSup = attacker.suppressionLevel;
  const ammoKey = wd.ballistics || '5.8x42';
  const bal = BALLISTICS[ammoKey] || BALLISTICS['5.8x42'];
  let distMod, hitBonus;
  if (dist <= 3) { distMod = bal.close; hitBonus = bal.hitBonus.close; }
  else if (dist <= 6) { distMod = bal.mid; hitBonus = bal.hitBonus.mid; }
  else if (dist <= 10) { distMod = bal.far; hitBonus = bal.hitBonus.far; }
  else { distMod = bal.extreme; hitBonus = bal.hitBonus.extreme; }

  let acc;
  if (isSnipe) {
    if (isAutoDMR) acc = 0.88;
    else if (ammoKey === '7.62x54R' || ammoKey === '7.62x51') acc = 0.92;
    else acc = 0.9;
    if (ammoKey === '7.62x54R' || ammoKey === '7.62x51') {
      if (dist > 10) acc *= 0.9;
      else if (dist > 6) acc *= 0.95;
    }
    if (!isAutoDMR) {
      if (dist <= 3) acc *= 0.65;
      else if (dist <= 6) acc *= 0.85;
    }
    if (attacker.healthLevel === 'IV') acc *= 0.8;
    else if (attacker.healthLevel === 'III') acc *= 0.5;
  } else {
    acc = attacker.accuracy * distMod * (1 + attSup.accMod);
    if (isSuppress) acc *= 0.6;
    if (isSuppress && wd.name === 'SVDM') acc *= 0.75;
    if (attacker.healthLevel === 'IV') acc *= 0.8;
    else if (attacker.healthLevel === 'III') acc *= 0.5;
    if (attacker.shockLevel === 2) acc *= 0.6;
    acc += getPairBonus(attacker);
    acc += getCrewPenalty(attacker);
    if (attacker.marksmanSpec > 0) acc += attacker.marksmanSpec * 0.06;
    acc += hitBonus;
  }
  acc = Math.max(0.05, Math.min(0.95, acc));
  let targetCover = target.getCoverBonus(attacker);
  if (ammoKey === '5.56x45' && targetCover === 0.65) targetCover = 0.75;
  acc *= targetCover;
  if (target.suppressionLevel.level >= 3) acc += SUPPRESSED_HIT_BONUS;
  acc = Math.min(0.95, acc);
  const hit = Math.random() < acc;

  let modeTag;
  if (isSnipe) modeTag = isAutoDMR ? '【精确打击】' : '【狙击】';
  else if (isSuppress) modeTag = isAutoDMR ? '【持续压制】' : '【压制】';
  else modeTag = '【短点射】';
  if (attacker.shockLevel === 2) modeTag += '（弹震）';
  const pairTag = (!isSnipe && getPairBonus(attacker) > 0) ? ' [协作]' : '';
  const crewTag = (!isSnipe && getCrewPenalty(attacker) < 0) ? ' [缺员]' : '';
  const secTag = isSecondary ? ` [${wd.name}]` : '';

  let msg = `${modeTag}${attacker.name}${secTag}${pairTag}${crewTag} → ${target.name} (距离${dist}) `;
  if (hit) {
    let dmg = wd.damage * (0.7 + Math.random() * 0.6);
    if (isSnipe) dmg *= isAutoDMR ? 1.2 : 1.25;
    if (attacker.marksmanSpec > 0) dmg *= (1 + attacker.marksmanSpec * 0.08);
    target.hp -= dmg; target.stoppedBleeding = false; clampTutorialHP(target); exposeUnit(target, false);
    if (target.hp < DEATH_THRESHOLD) { onUnitDeath(target); msg += `命中，击毙！`; }
    else msg += `命中 -${Math.round(dmg)}HP (${target.healthLevel}级)`;
  } else msg += `未命中`;
  if (targetCover < 1) msg += targetCover <= 0.7 ? ` [矮墙]` : ` [道路]`;

  if (target.alive) {
    let supVal = 0;
    if (!isSnipe) {
      if (isAutoDMR && isSuppress) supVal = AUTO_DMR_SUSTAINED_SUPPRESS;
      else if (attacker.isMG) {
        const mult = [0.3, 0.6, 1.0, 1.5][attacker.mgSpec] || 0.3;
        supVal = (isSuppress ? attacker.mgBase * 2 : attacker.mgBase) * mult;
      } else {
        const base = attacker.suppressValue;
        supVal = isSuppress ? base * 2 : base;
      }
      if (attacker.shockLevel === 2) supVal *= 0.5;
      if (attacker.attackMultiplier && attacker.attackMultiplier.suppress !== undefined) supVal *= attacker.attackMultiplier.suppress;
    }
    if (supVal > 0) {
      const oldLv2 = target.suppressionLevel.level;
      target.suppression = Math.min(150, target.suppression + supVal);
      const newLv = target.suppressionLevel;
      msg += ` | 压制+${supVal.toFixed(1)}`;
      if (newLv.level > oldLv2) msg += ` → ${newLv.name}级`;
      if (newLv.level >= 3) { target.san = Math.max(0, target.san - newLv.sanDrain); exposeUnit(target, false); msg += ` | SAN-${newLv.sanDrain}`; }
    }
  }
  log(msg);

  if (attacker.isHeavyMG && !isSnipe) {
    const dir = getHexDirection(attacker, target);
    const T = offsetToAxial(target.col, target.row);
    const mult = [0.3, 0.6, 1.0, 1.5][attacker.mgSpec] || 0.3;
    const penetrateSupVal = (isSuppress ? attacker.mgBase * 2 : attacker.mgBase) * mult;
    let penetrateHits = 0;
    for (let step = 1; step <= HEAVY_MG_PENETRATE_RANGE; step++) {
      const pos = axialToOffset(T.q + dir[0] * step, T.r + dir[1] * step);
      if (pos.col < 0 || pos.col >= game.mapCols || pos.row < 0 || pos.row >= game.mapRows) break;
      const splash = game.units.find(o => o.alive && o.side !== attacker.side && o.col === pos.col && o.row === pos.row);
      if (!splash) continue;
      let splashMsg = `【贯穿】${splash.name}`;
      const splashHit = Math.random() < acc * 0.6;
      if (splashHit) {
        const splashDmg = wd.damage * HEAVY_MG_PENETRATE_DMG * (0.7 + Math.random() * 0.6);
        splash.hp -= splashDmg; splash.stoppedBleeding = false; clampTutorialHP(splash); exposeUnit(splash, false);
        penetrateHits++;
        if (splash.hp < DEATH_THRESHOLD) { onUnitDeath(splash); splashMsg += ` 被贯穿击毙！`; }
        else splashMsg += ` 被贯穿 -${Math.round(splashDmg)}HP`;
      } else splashMsg += ` 被贯穿射击擦过，未命中`;
      if (splash.alive && penetrateSupVal > 0) {
        splash.suppression = Math.min(150, splash.suppression + penetrateSupVal);
        const newLv = splash.suppressionLevel;
        if (newLv.level >= 3) { splash.san = Math.max(0, splash.san - newLv.sanDrain); exposeUnit(splash, false); }
      }
      log(splashMsg);
    }
    if (penetrateHits > 0) game._tutPenetrateHits = (game._tutPenetrateHits || 0) + penetrateHits;
  }

  if (hit && attacker.role === 'marksman' && target.hp < 60) onSniperKill(target.side, attacker);
  if (target.alive && target.side === 'red' && attacker.role !== 'marksman') target.interruptedUntilRound = game.round + 1;
  if (hit && attacker.role === 'marksman' && !attacker.isAutoDMR) {
    if (target.hp < 60) {
      attacker.dmrLocked = true;
      const sideLabel = attacker.side === 'blue' ? '蓝方' : '红方';
      log(`<span style="color:#f87171;font-weight:700;">⚠ ${sideLabel} ${attacker.name} 被锁定！</span>`);
    }
  }
  if (hit && attacker.role === 'marksman' && !game._tutSnipeKillDone) {
    game._tutSnipeKillDone = true;
    game._tutSnipeKillRound = game.round;
  }

  if (attacker.role === 'marksman' && !attacker.isAutoDMR) {
    if (attacker.boltAction) {
      attacker.boltCooldown = 2;
    } else {
      attacker.dmrCooldown = 1;
    }
  }

  checkVictory();
}