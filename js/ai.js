// ============================================================
// js/ai.js — AI 回合决策、回合结算
// ============================================================

function aiTurn() {
  alert('【2】aiTurn 进入');
  if (checkVictory()) { alert('【2.5】checkVictory 返回 true，直接退出'); return; }
  alert('【3】checkVictory 通过，继续往下');
  processBrokenTurn('blue');
  const reds = game.units.filter(u => u.alive && u.side === 'red');
  const blues = game.units.filter(u => u.alive && u.side === 'blue');
  processBrokenTurn('red');
  const leaders = reds.filter(r => r.alive && r.canCallArmor);
  let protectee = null;
  for (const L of leaders) { if (L.hp < 80 || L.suppressionLevel.level >= 1) { protectee = L; break; } }
  if (!protectee && leaders.length > 0) protectee = leaders[0];
  let i = 0;
  function step() {
    if (checkVictory()) return;
    if (i >= reds.length) { endRound(); return; }
    const u = reds[i];
    if (!u.alive) { i++; step(); return; }
    if (u.isBroken) { i++; step(); return; }
    if (u.isDummy) { u.isConcealed = false; i++; render(); setTimeout(step, 100); return; }
    const mult = u.attackMultiplier || null;
    const origAcc = u.accuracy;
    const origDmg = u.damage;
    if (mult) {
      if (mult.acc !== undefined) u.accuracy = origAcc * mult.acc;
      if (mult.dmg !== undefined) u.damage = origDmg * mult.dmg;
    }
    const restore = () => { if (mult) { u.accuracy = origAcc; u.damage = origDmg; } };

    // 接管平台
    if (!u.isOperatingHeavy && !u.hasMoved && !u.hasFired) {
      const platforms = game.droppedWeapons.filter(p => p.available && p.side === 'red');
      for (const p of platforms) {
        if (canTakeOverPlatform(u, p)) { takeOverPlatform(u, p); restore(); i++; render(); setTimeout(step, 400); return; }
      }
    }

    // 医疗
    if (u.role === 'medic' && !u.hasTreated && u.medSupplies > 0) {
      const wounded = game.units.filter(t => t.alive && t.side === u.side && t !== u && canTreat(u, t))
        .sort((a, b) => { const order = { II: 0, III: 1, IV: 2 }; return (order[a.healthLevel] ?? 9) - (order[b.healthLevel] ?? 9); });
      if (wounded.length > 0) { performTreat(u, wounded[0]); restore(); i++; render(); setTimeout(step, 400); return; }
    }

    // 观察手标记
    if (u.isObserver && u.markCharges > 0 && !u.hasFired && u.shockLevel !== 0) {
      let bestTarget = null, bestScore = 0;
      for (const b of blues) {
        if (!b.alive || b.role === 'medic' || (b.isConcealed && !b.isDummy)) continue;
        const d = hexDistance({col:u.col,row:u.row}, {col:b.col,row:b.row});
        if (d > MARK_RANGE) continue;
        let sc = 0;
        if (b.role === 'marksman') sc += 6;
        if (b.isMG) sc += 5;
        if (b.role === 'leader' || b.role === 'deputy') sc += 2;
        if (sc > bestScore) { bestScore = sc; bestTarget = b; }
      }
      if (bestTarget && bestScore >= 3) { markTarget(u, bestTarget); restore(); i++; render(); setTimeout(step, 500); return; }
    }

    // 找掩体
    const underFire = u.hp < 80 || u.suppressionLevel.level >= 2;
    const needCover = (game.sniperDetected.red || underFire) && u.healthLevel !== 'II' && !u.hasMoved;
    const noCover = !unitHasAnyWall(u);
    const heavySuppressed = u.suppressionLevel.level >= 3;
    if (needCover && (noCover || heavySuppressed)) {
      const cover = findNearestCover(u);
      if (cover && (cover.col !== u.col || cover.row !== u.row)) {
        const st = findBestAdjacentStep(u, cover);
        if (st) { u.col = st.col; u.row = st.row; u.hasMoved = true; const terr = TERRAIN[st.col] ? TERRAIN[st.col][st.row] : 0; const extra = terr === 1 ? ' [道路]' : ''; log(`${u.name} 移动到 (${st.col},${st.row})${extra}`); }
      }
    }

    // 保护指挥员
    if (protectee && protectee.alive && protectee !== u && !u.canCallArmor && !u.hasMoved) {
      const protecteeInDanger = protectee.hp < 80 || protectee.suppressionLevel.level >= 2;
      if (protecteeInDanger) {
        const dp = hexDistance({col:u.col,row:u.row}, {col:protectee.col,row:protectee.row});
        if (dp > 2) {
          const pst = findBestAdjacentStep(u, { col: protectee.col, row: protectee.row });
          if (pst) { u.col = pst.col; u.row = pst.row; u.hasMoved = true; const terr = TERRAIN[pst.col] ? TERRAIN[pst.col][pst.row] : 0; const extra = terr === 1 ? ' [道路]' : ''; log(`${u.name} 移动到 (${pst.col},${pst.row})${extra}`); }
        }
      }
    }

    // 呼叫载具支援
    if (u.canCallArmor && !u.hasFired) {
      let markTargetHex = null;
      for (const m of game.marks) {
        if (m.side !== u.side || m.expiresRound < game.round) continue;
        const d = hexDistance({col:u.col,row:u.row}, {col:m.col,row:m.row});
        if (d > 14) continue;
        markTargetHex = { col: m.col, row: m.row }; break;
      }
      let chosenVehicle = null;
      for (const v of u.armorVehicles) {
        const cd = game.vehicleCooldowns[u.side][v] || 0;
        if (cd === 0 && u.armorCallCount[v] < u.armorCallMax[v]) { chosenVehicle = v; break; }
      }
      if (chosenVehicle) {
        const isMGS = chosenVehicle === 'Stryker MGS';
        let bestTarget = null, bestScore = 0;
        if (markTargetHex) {
          if (isMGS) { callArmorSupport(u, chosenVehicle, markTargetHex); restore(); i++; render(); setTimeout(step, 500); return; }
          bestTarget = markTargetHex; bestScore = 10;
        }
        if (!bestTarget) {
          const aliveRed = reds.filter(r => r.alive && r.role !== 'medic').length;
          const aliveBlue = blues.filter(b => b.alive && b.role !== 'medic').length;
          const losing = aliveRed < aliveBlue;
          const selfHurt = u.hp < 80 || u.suppressionLevel.level >= 1;
          for (const b of blues) {
            if (!b.alive || b.role === 'medic' || (b.isConcealed && !b.isDummy)) continue;
            const d = hexDistance({col:u.col,row:u.row}, {col:b.col,row:b.row});
            if (d > 14) continue;
            let score = 0;
            if (b.role === 'marksman') score += 6;
            if (b.isMG) score += 5;
            if (b.role === 'leader' || b.role === 'deputy') score += 2;
            for (const b2 of blues) { if (b2 === b || !b2.alive) continue; const dd = hexDistance({col:b.col,row:b.row}, {col:b2.col,row:b2.row}); if (dd <= 1) score += 3; }
            if (b.healthLevel === 'II') score += 4; else if (b.healthLevel === 'III') score += 2;
            if (!unitHasAnyWall(b)) score += 1;
            if (score > bestScore) { bestScore = score; bestTarget = b; }
          }
          let threshold = isMGS ? 5 : 4;
          if (losing || selfHurt) threshold = isMGS ? 3 : 2;
          if (bestScore < threshold) bestTarget = null;
        }
        if (bestTarget) {
          const usePrediction = Math.random() < 0.6;
          const callTarget = usePrediction ? predictTargetHex(bestTarget) : { col: bestTarget.col, row: bestTarget.row };
          callArmorSupport(u, chosenVehicle, callTarget);
          restore(); i++; render(); setTimeout(step, 500); return;
        }
      }
    }

    // 无法开火
    if (!u.canFire) { restore(); i++; setTimeout(step, 300); return; }

    // 弹药耗尽（含火箭筒补给）
    if (u.isOutOfAmmo) {
      if (u.isRocket && u.currentWeapon === 'primary') {
        try {
          if (tryRocketResupply(u)) { restore(); i++; render(); setTimeout(step, 350); return; }
        } catch (e) { console.log('火箭筒补给失败:', e); }
      }
      if (tryResupply(u)) { restore(); i++; render(); setTimeout(step, 350); return; }
      restore(); i++; setTimeout(step, 300); return;
    }

    // 选目标
    let target = null, minD = Infinity, targetScore = -Infinity;
    for (const b of blues) {
      if (!b.alive || b.role === 'medic' || (b.isConcealed && !b.isDummy)) continue;
      const d = hexDistance({ col: u.col, row: u.row }, { col: b.col, row: b.row });
      let score = 20 - d;
      if (b.isMG || b.role === 'marksman') score += 5;
      if (b.role === 'leader' || b.role === 'deputy') score += 3;
      if (b.healthLevel === 'II') score += 8; else if (b.healthLevel === 'III') score += 4;
      if (!unitHasAnyWall(b)) score += 2;
      if (b.suppressionLevel.level >= 2) score += 2;
      if (u.role === 'marksman' && d >= 6) score += 3;
      if (u.role !== 'marksman' && d <= 3) score += 2;
      const mark = isInAnyMark(b.col, b.row, u.side);
      if (mark) score += 5;
      if (score > targetScore) { targetScore = score; target = b; minD = d; }
    }

    // 无目标时的行为
    if (!target || !target.alive) {
      const decoyTrust = game.decoyTrust.red || 1.0;
      const candidates = [];
      for (const b of blues) { if (!b.alive) continue; if (b.lastFiredAt) candidates.push(b.lastFiredAt); if (b.lastSeenAt) candidates.push(b.lastSeenAt); }
      const seen = new Set(); const uniq = [];
      for (const c of candidates) { const key = `${c.col},${c.row}`; if (seen.has(key)) continue; seen.add(key); const d = hexDistance({col:u.col,row:u.row}, c); if (d <= BLIND_FIRE_RANGE) uniq.push({ c, d }); }
      uniq.sort((a, b) => a.d - b.d);
      if (uniq.length > 0 && !u.hasFired) {
        const top = uniq[0];
        let probeChance = decoyTrust * u.detection * (1 - top.d / BLIND_FIRE_RANGE) * 0.5;
        probeChance = Math.max(0.05, Math.min(0.65, probeChance));
        if (Math.random() < probeChance) {
          const beforeHP = blues.filter(b => b.alive).reduce((s,b)=>s+b.hp, 0);
          resolveGroundFire(u, { col: top.c.col, row: top.c.row });
          const afterHP = blues.filter(b => b.alive).reduce((s,b)=>s+b.hp, 0);
          if (afterHP < beforeHP) game.decoyTrust.red = Math.min(1.5, decoyTrust + 0.15);
          else game.decoyTrust.red = Math.max(0.2, decoyTrust - 0.10);
          restore(); i++; render(); setTimeout(step, 400); return;
        }
      }
           if (game.sniperDetected.red) aiBlindFireAtSniper(u);
      // 无目标时：往蓝方方向推进（红方视角 = 往西）
      if (!u.hasMoved) {
        const combatBlues = blues.filter(b => b.alive && b.role !== 'medic');
        let st = null;
        if (combatBlues.length > 0) {
          const cx = combatBlues.reduce((s,b)=>s+b.col,0) / combatBlues.length;
          const cy = combatBlues.reduce((s,b)=>s+b.row,0) / combatBlues.length;
          st = findBestAdjacentStep(u, { col: Math.round(cx), row: Math.round(cy) });
        }
        // 后备：如果质心移动失败，就往西走一格
        if (!st) st = findBestAdjacentStep(u, { col: u.col - 3, row: u.row });
        if (st) {
          u.col = st.col; u.row = st.row; u.hasMoved = true;
          const terr = TERRAIN[st.col] ? TERRAIN[st.col][st.row] : 0;
          const extra = terr === 1 ? ' [道路]' : '';
          log(`${u.name} 移动到 (${st.col},${st.row})${extra}`);
        }
      }
      restore(); i++; render(); setTimeout(step, 350); return;
    // 火箭筒优先
    if (u.isRocket && u.currentWeapon === 'primary' && u.rpgCooldown === 0 && u.rocketAmmo > 0 && !u.hasFired) {
      let rocketTarget = null, rScore = 0;
      for (const b of blues) {
        if (!b.alive || b.role === 'medic' || (b.isConcealed && !b.isDummy)) continue;
        const d = hexDistance({col:u.col,row:u.row}, {col:b.col,row:b.row});
        if (d > ROCKET_MAX_RANGE) continue;
        let sc = 0;
        let wallCount = 0;
        for (let j = 0; j < 6; j++) if (hasWallAt(b.col, b.row, j)) wallCount++;
        if (wallCount > 0) sc += 3;
        if (b.isMG || b.role === 'marksman') sc += 2;
        if (sc > rScore) { rScore = sc; rocketTarget = b; }
      }
      if (rocketTarget && rScore >= 3) { fireRocket(u, rocketTarget); restore(); i++; render(); setTimeout(step, 400); return; }
    }

    // 手雷
    if (u.grenades > 0 && !u.hasFired && minD <= GRENADE_THROW_RANGE) {
      let clusterCount = 0, friendInKillZone = false;
      for (const b of blues) { if (!b.alive || b.role === 'medic') continue; const d = hexDistance({ col: target.col, row: target.row }, { col: b.col, row: b.row }); if (d <= 1) clusterCount++; }
      for (const f of reds) { if (!f.alive || f === u) continue; const d = hexDistance({ col: target.col, row: target.row }, { col: f.col, row: f.row }); if (d <= GRENADE_KILL_RADIUS) friendInKillZone = true; }
      if (!friendInKillZone && clusterCount >= 2 && Math.random() < 0.5) {
        throwGrenade(u, { col: target.col, row: target.row });
        restore(); i++; render(); setTimeout(step, 400); return;
      }
    }

    // 选择射击模式
    if (u.role === 'marksman') {
      if (u.isAutoDMR) { if (minD <= 5 || target.suppressionLevel.level >= 1) u.fireMode = 'suppress'; else u.fireMode = 'snipe'; }
      else { if (minD <= 4 || target.suppressionLevel.level >= 2) u.fireMode = 'suppress'; else u.fireMode = 'snipe'; }
    } else {
      const shouldSuppress = (target.isMG || target.suppressionLevel.level >= 2) && u.magAmmo >= (u.isMG ? 10 : 6);
      u.fireMode = shouldSuppress ? 'suppress' : 'normal';
    }

    // 距离过远则前进
    if (minD > 5 && !u.hasMoved) {
      const st = findBestAdjacentStep(u, { col: target.col, row: target.row });
      if (st) { u.col = st.col; u.row = st.row; u.hasMoved = true; const terr = TERRAIN[st.col] ? TERRAIN[st.col][st.row] : 0; const extra = terr === 1 ? ' [道路]' : ''; log(`${u.name} 移动到 (${st.col},${st.row})${extra}`); }
    }

    if (!u.hasFired && u.canFire && target.alive) resolveShoot(u, target);
    restore(); i++; render(); setTimeout(step, 350);
  }
  step();
}

function endRound() {
  if (checkVictory()) return;
  for (const u of game.units) {
    if (!u.alive) continue;
    if (!u.hasMoved && !u.hasFired && !u.hasTreated) tryReconceal(u);
    else u.restConcealRounds = 0;
    u.moveHistory.push({ col: u.col, row: u.row, round: game.round });
    if (u.moveHistory.length > 2) u.moveHistory.shift();
  }
  checkConcealment();
  checkBroken();
  recoverBrokenUnits();
  checkDMRLock();
  game.marks = game.marks.filter(m => m.expiresRound >= game.round);
  game.decoyTrust.red = game.decoyTrust.red * 0.9 + 1.0 * 0.1;
  for (const u of game.units) {
    if (!u.alive) continue;
    if (u.isMG && u.isOutOfAmmo) tryResupply(u);
    if (u.shockRounds > 0) { u.shockRounds--; if (u.shockRounds === 1) u.shockLevel = 2; else if (u.shockRounds === 0) u.shockLevel = 0; }
    if (u.rpgCooldown > 0) u.rpgCooldown--;
    if (u.boltCooldown > 0) u.boltCooldown--;
    if (u.isWounded && !u.stoppedBleeding) {
      const lvl = u.healthLevel;
      let drain = 0;
      if (lvl === 'IV') drain = 2; else if (lvl === 'III') drain = 4; else if (lvl === 'II') drain = 8;
      if (drain > 0) {
        if (u.firstAidKit > 0) { u.firstAidKit--; u.stoppedBleeding = true; }
        else { u.hp = Math.max(0, u.hp - drain); if (u.hp < DEATH_THRESHOLD) onUnitDeath(u); }
      }
    }
    u.suppression = Math.max(0, u.suppression - 8);
    u.hasMoved = false; u.hasFired = false; u.hasTreated = false;
  }
  checkMedicCall('blue'); checkMedicCall('red'); removeExhaustedMedics();
  if (checkVictory()) return;
  game.round++; game.turn = 'blue'; game.busy = false;
  game.selected = null; game.highlights = []; game.pendingAction = null;
  game.throwMode = false; game.callArmorMode = false; game.callArmorVehicle = null;
  game.groundFireMode = false; game.markMode = false;
  log(`--- 第 ${game.round} 回合 ---`);
  resolvePendingStrikes();
  tickVehicleCooldowns();
  render();
}
