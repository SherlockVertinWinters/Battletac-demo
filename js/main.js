// ============================================================
// js/main.js — 入口：canvas 事件、教程监控、启动代码
// ============================================================

canvas.addEventListener('click', e => {
  if (game.turn !== 'blue' || game.busy || game.over) return;
  const rect = canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (canvas.width / rect.width);
  const py = (e.clientY - rect.top) * (canvas.height / rect.height);
  const hex = pixelToHex(px, py);
  if (!hex) return;
  const clicked = game.units.find(u => u.alive && u.col === hex.col && u.row === hex.row);
  if (game.selected && !game.selected.alive) { game.selected = null; game.highlights = []; game.pendingAction = null; game.throwMode = false; game.callArmorMode = false; game.callArmorVehicle = null; game.groundFireMode = false; game.markMode = false; }
  if (game.throwMode && game.selected) {
    const d = hexDistance({col:game.selected.col, row:game.selected.row}, hex);
    if (d > 0 && d <= GRENADE_THROW_RANGE) {
      throwGrenade(game.selected, hex);
      game.throwMode = false; game.selected = null; game.highlights = [];
      render(); return;
    } else { log('超出投掷距离'); game.throwMode = false; updateUnitInfo(); render(); return; }
  }
  if (game.callArmorMode && game.selected && game.callArmorVehicle) {
    callArmorSupport(game.selected, game.callArmorVehicle, hex);
    game.callArmorMode = false; game.callArmorVehicle = null;
    game.selected = null; game.highlights = [];
    render(); return;
  }
  if (game.markMode && game.selected) {
    if (clicked && clicked.side === 'red' && (!clicked.isConcealed || clicked.isDummy)) {
      if (markTarget(game.selected, clicked)) { game.markMode = false; game.selected = null; game.highlights = []; render(); return; }
      else { log('标记失败'); game.markMode = false; updateUnitInfo(); render(); return; }
    } else { log('标记目标必须是已暴露的敌人'); game.markMode = false; updateUnitInfo(); render(); return; }
  }
  if (game.pendingAction === 'treat' && game.selected) {
    if (clicked && clicked.side === 'blue' && canTreat(game.selected, clicked)) {
      performTreat(game.selected, clicked);
      game.pendingAction = null; game.selected = null; game.highlights = [];
      render(); return;
    } else { log('无效的治疗目标'); game.pendingAction = null; game.highlights = []; render(); return; }
  }
  if (game.selected) {
    if (game.selected.isBroken) { log(`${game.selected.name} 处于崩溃，无法控制`); return; }
    if (game.groundFireMode) {
      if (!game.selected.canFire) { log(`${game.selected.name} 无法射击`); game.groundFireMode = false; render(); return; }
      if (game.selected.hasFired) { log(`${game.selected.name} 本回合已行动`); game.groundFireMode = false; render(); return; }
      if (game.selected.isOutOfAmmo) { log(`${game.selected.name} 弹药耗尽`); game.groundFireMode = false; render(); return; }
      if (clicked && clicked.side === 'red' && (!clicked.isConcealed || clicked.isDummy)) resolveShoot(game.selected, clicked);
      else resolveGroundFire(game.selected, hex);
      game.groundFireMode = false; game.selected = null; game.highlights = [];
      render(); return;
    }
    if (clicked && clicked.side === 'red') {
      if (clicked.isConcealed && !clicked.isDummy) {
        if (!game.selected.canFire) { log(`${game.selected.name} 无法射击`); return; }
        if (game.selected.hasFired) { log(`${game.selected.name} 本回合已行动`); return; }
        if (game.selected.isOutOfAmmo) { log(`${game.selected.name} 弹药耗尽`); return; }
        resolveGroundFire(game.selected, { col: clicked.col, row: clicked.row });
        game.selected = null; game.highlights = [];
        render(); return;
      }
      if (!game.selected.canFire) { log(`${game.selected.name} 无法射击`); return; }
      if (game.selected.isOutOfAmmo) {
        if (game.selected.isRocket && game.selected.currentWeapon === 'primary') { if (tryRocketResupply(game.selected)) { render(); return; } }
        if (tryResupply(game.selected)) { render(); return; }
        log(`${game.selected.name} 弹药耗尽`); return;
      }
      if (game.selected.hasFired) { log(`${game.selected.name} 本回合已行动`); return; }
      resolveShoot(game.selected, clicked);
      game.selected = null; game.highlights = [];
      render(); return;
    }
    if (clicked && clicked.side === 'blue') { game.selected = clicked; game.pendingAction = null; game.throwMode = false; game.callArmorMode = false; game.callArmorVehicle = null; game.groundFireMode = false; game.markMode = false; updateHighlights(); render(); return; }
    const dist = hexDistance({ col: game.selected.col, row: game.selected.row }, hex);
    const terr = TERRAIN[hex.col] ? TERRAIN[hex.col][hex.row] : 0;
    if (!clicked && dist <= game.selected.effectiveMoveRange && !game.selected.hasMoved) {
      game.selected.col = hex.col; game.selected.row = hex.row;
      game.selected.hasMoved = true;
      if (dist >= 2) exposeUnit(game.selected, false);
      let extra = terr === 1 ? ' [道路]' : '';
      log(`${game.selected.name} 移动到 (${hex.col},${hex.row})${extra}`);
      game.selected = null; game.highlights = [];
      render(); return;
    }
    game.selected = null; game.highlights = []; game.pendingAction = null; game.throwMode = false; game.callArmorMode = false; game.callArmorVehicle = null; game.groundFireMode = false; game.markMode = false; render();
  } else {
    if (clicked && clicked.side === 'blue') { game.selected = clicked; updateHighlights(); render(); }
  }
});

document.getElementById('endTurn').addEventListener('click', () => {
  if (game.turn !== 'blue' || game.busy || game.over) return;
  document.getElementById('endTurn').addEventListener('click', () => {
  alert('【1】点击触发\nturn=' + game.turn + ' busy=' + game.busy + ' over=' + game.over + ' units=' + game.units.length);
  if (game.turn !== 'blue' || game.busy || game.over) return;
  game.turn = 'red'; game.selected = null;
  game.turn = 'red'; game.selected = null; game.highlights = []; game.pendingAction = null;
  game.throwMode = false; game.callArmorMode = false; game.callArmorVehicle = null;
  game.groundFireMode = false; game.markMode = false;
  render(); game.busy = true;
  setTimeout(aiTurn, 400);
});

document.getElementById('startBtn').addEventListener('click', startBattle);
document.getElementById('backToMenu').addEventListener('click', backToMenu);
document.getElementById('helpBtn').addEventListener('click', openTutorial);
document.getElementById('tutCloseBtn').addEventListener('click', closeTutorial);
document.getElementById('tutTryBtn').addEventListener('click', startTutorialBattle);
document.getElementById('tutBackToMenu').addEventListener('click', exitTutorialBattle);
document.getElementById('victoryReturn').addEventListener('click', () => { document.getElementById('victoryModal').classList.add('hidden'); exitTutorialBattle(); });

document.getElementById('vehicleCancel').onclick = () => {
  document.getElementById('vehicleSetup').classList.add('hidden');
  pendingVehicleSquad = null; pendingDMRSquad = null;
  selectedVehicleConfig = null; selectedDMRConfig = null;
};
document.getElementById('vehicleConfirm').onclick = () => {
  document.getElementById('vehicleSetup').classList.add('hidden');
  if (pendingVehicleSquad) {
    if (!selectedVehicleConfig) selectedVehicleConfig = 'M2HB';
    launchBattle(SQUADS[pendingVehicleSquad], selectedVehicleConfig, null);
    pendingVehicleSquad = null;
  } else if (pendingDMRSquad) {
    if (!selectedDMRConfig) selectedDMRConfig = 'spear';
    launchBattle(SQUADS[pendingDMRSquad], null, selectedDMRConfig);
    pendingDMRSquad = null;
  }
};

document.getElementById('dlcBtn').addEventListener('click', showDLCModal);
document.getElementById('dlcCancel').addEventListener('click', hideDLCModal);
document.getElementById('dlcConfirm').addEventListener('click', tryUnlockDLC);
document.getElementById('dlcInput').addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlockDLC(); });

setInterval(() => { if (game.isTutorial) { if (game.units.some(u => u.isBroken)) game._tutSawBroken = true; } }, 500);

// ============ 启动 ============
setupNormalWalls();
renderSquadList();
game.units = [];
render();

// DLC 解锁状态恢复
try {
  if (localStorage.getItem('bt_dlc_unlocked') === '1') unlockAllDLCs();
} catch (e) {}
updateDLCBtn();

let tutorialSeen = false;
try { tutorialSeen = localStorage.getItem('bt_tutorial_seen') === '1'; } catch (e) { tutorialSeen = false; }
if (!tutorialSeen) setTimeout(openTutorial, 500);
