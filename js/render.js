// ============================================================
// js/render.js — Canvas 渲染、绘制函数、状态栏、高亮
// ============================================================

const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');
const SIZE = 16;
const MAP_OX = 30, MAP_OY = 20;

function hexToPixel(col, row) {
  const x = SIZE * 1.5 * col + MAP_OX;
  const y = SIZE * Math.sqrt(3) * (row + 0.5 * (col & 1)) + MAP_OY;
  return { x, y };
}
function pixelToHex(px, py) {
  let best = null, bestD = Infinity;
  for (let c = 0; c < game.mapCols; c++) for (let r = 0; r < game.mapRows; r++) {
    const p = hexToPixel(c, r);
    const d = Math.hypot(p.x - px, p.y - py);
    if (d < bestD) { bestD = d; best = { col: c, row: r }; }
  }
  return bestD < SIZE * 0.9 ? best : null;
}
function hexCorners(cx, cy) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 180 * (60 * i);
    pts.push({ x: cx + SIZE * Math.cos(a), y: cy + SIZE * Math.sin(a) });
  }
  return pts;
}

const EDGE_MAP = [0, 5, 4, 3, 2, 1];

function drawHex(c, r) {
  const { x, y } = hexToPixel(c, r);
  const pts = hexCorners(x, y);
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < 6; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  const t = TERRAIN[c] ? TERRAIN[c][r] : 0;
  if (t === 1) {
    ctx.fillStyle = '#111827'; ctx.fill();
    ctx.strokeStyle = '#6b7280'; ctx.stroke();
    ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(x - SIZE * 0.7, y); ctx.lineTo(x + SIZE * 0.7, y);
    ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.setLineDash([]); ctx.lineWidth = 1;
  } else {
    ctx.fillStyle = '#1e293b'; ctx.fill();
    ctx.strokeStyle = '#334155'; ctx.stroke();
  }
  for (let i = 0; i < 6; i++) {
    if (hasWallAt(c, r, i)) {
      const e = EDGE_MAP[i];
      const p1 = pts[e], p2 = pts[(e + 1) % 6];
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3.5; ctx.stroke(); ctx.lineWidth = 1;
    }
  }
}
function drawHexHL(c, r, color) {
  const { x, y } = hexToPixel(c, r);
  const pts = hexCorners(x, y);
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < 6; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}
function drawNatoDiamond(x, y, W, H) {
  ctx.beginPath();
  ctx.moveTo(x, y - H / 2); ctx.lineTo(x + W / 2, y);
  ctx.lineTo(x, y + H / 2); ctx.lineTo(x - W / 2, y); ctx.closePath();
}
function drawDecoy(col, row) {
  const { x, y } = hexToPixel(col, row);
  const W = SIZE * 1.25, H = SIZE * 1.1;
  const x0 = x - W / 2, y0 = y - H / 2;
  ctx.fillStyle = 'rgba(148, 163, 184, 0.25)'; ctx.fillRect(x0, y0, W, H);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)'; ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]); ctx.strokeRect(x0, y0, W, H);
  ctx.setLineDash([]); ctx.lineWidth = 1;
  ctx.fillStyle = '#cbd5e1'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
  ctx.fillText('?', x + W * 0.35, y - H * 0.25);
}
function drawPlatform(p) {
  const { x, y } = hexToPixel(p.col, p.row);
  const W = SIZE * 1.25, H = SIZE * 1.1;
  const x0 = x - W / 2, y0 = y - H / 2;
  let borderColor = '#f59e0b';
  if (p.type === 'mg') borderColor = '#94a3b8';
  else if (p.type === 'rocket') borderColor = '#f97316';
  ctx.fillStyle = p.side === 'blue' ? 'rgba(30, 64, 175, 0.4)' : 'rgba(153, 27, 27, 0.4)';
  ctx.fillRect(x0, y0, W, H);
  ctx.strokeStyle = borderColor; ctx.lineWidth = 2;
  ctx.setLineDash([3, 3]); ctx.strokeRect(x0, y0, W, H);
  ctx.setLineDash([]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x, y - 2, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(226, 232, 240, 0.9)'; ctx.fill();
  ctx.fillStyle = borderColor; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
  const label = p.type === 'qjy88' ? 'QJY-88' : (p.type === 'mg' ? 'MG' : 'RPG');
  ctx.fillText(label, x, y + H * 0.35);
}

function drawUnit(u) {
  if (!u.alive) return;
  const { x, y } = hexToPixel(u.col, u.row);
  const sup = u.suppressionLevel;
  const W = SIZE * 1.25, H = SIZE * 1.1;
  const x0 = x - W / 2, y0 = y - H / 2;
  if (u.shockRounds > 0) {
    ctx.beginPath(); ctx.arc(x, y, SIZE * 1.35, 0, Math.PI * 2);
    ctx.strokeStyle = u.shockLevel === 1 ? 'rgba(239,68,68,0.9)' : 'rgba(239,68,68,0.5)';
    ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.stroke();
    ctx.setLineDash([]); ctx.lineWidth = 1;
  }
  if (u.isBroken) {
    ctx.beginPath(); ctx.arc(x, y, SIZE * 1.45, 0, Math.PI * 2);
    ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.lineWidth = 1;
  }
  if (u.isOutOfAmmo) {
    ctx.beginPath(); ctx.arc(x, y, SIZE * 1.2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(248,113,113,0.5)'; ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
  }
  if (u.crewRequired > 1 && !u.isCrewed) {
    ctx.beginPath(); ctx.arc(x, y, SIZE * 1.28, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245,158,11,0.7)'; ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
  }
  if (u.isConcealed && u.side === 'blue' && !u.isBroken) {
    ctx.beginPath(); ctx.arc(x, y, SIZE * 1.35, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(6,182,212,0.9)'; ctx.lineWidth = 2;
    ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
  }
  if (u.dmrLocked) {
    ctx.beginPath(); ctx.arc(x, y, SIZE * 1.4, 0, Math.PI * 2);
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
    ctx.setLineDash([2, 2]); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
  }
  if (u.role === 'medic' && u.medSupplies > 0) {
    ctx.beginPath(); ctx.arc(x, y, SIZE * 1.15, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(34,197,94,0.6)'; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1;
  } else if (u.role === 'ammo' && u.supplyBoxes > 0) {
    ctx.beginPath(); ctx.arc(x, y, SIZE * 1.15, 0, Math.PI * 2);
    ctx.strokeStyle = u.side === 'blue' ? 'rgba(96,165,250,0.7)' : 'rgba(248,113,113,0.7)';
    ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1;
  } else if (u.isHeavyMG) {
    ctx.beginPath(); ctx.arc(x, y, SIZE * 1.15, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245,158,11,0.6)'; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1;
  }
  const t = TERRAIN[u.col] ? TERRAIN[u.col][u.row] : 0;
  if (t === 1) {
    ctx.beginPath(); ctx.arc(x, y, SIZE * 1.1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(250,204,21,0.35)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineWidth = 1;
  }
  if (sup.level >= 3) {
    ctx.beginPath(); ctx.arc(x, y, SIZE * 1.05, 0, Math.PI * 2);
    ctx.strokeStyle = sup.level >= 5 ? '#dc2626' : sup.level >= 4 ? '#f97316' : '#a855f7';
    ctx.lineWidth = 3; ctx.stroke(); ctx.lineWidth = 1;
  }
  if (game.selected === u) {
    ctx.beginPath(); ctx.arc(x, y, SIZE * 1.15, 0, Math.PI * 2);
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.lineWidth = 1;
  }
  const unitFactionColor = u.side === 'blue' ? (game.playerFactionColor || '#1e40af') : (game.aiFactionColor || '#991b1b');
  if (u.side === 'red') {
    ctx.save();
    if (u.isDummy) {
      ctx.fillStyle = '#7f1d1d';
      drawNatoDiamond(x, y, W, H); ctx.fill();
      ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1;
    } else {
      ctx.fillStyle = unitFactionColor;
      drawNatoDiamond(x, y, W, H); ctx.fill();
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineWidth = 1;
      drawRoleSymbol(u, x, y, W, H);
    }
    ctx.restore();
  } else {
    ctx.fillStyle = unitFactionColor;
    if (u.isConcealed && u.side === 'blue') ctx.globalAlpha = 0.75;
    ctx.fillRect(x0, y0, W, H);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.5; ctx.strokeRect(x0, y0, W, H);
    drawRoleSymbol(u, x, y, W, H);
  }
  if (u.isBroken) {
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.arc(x + W * 0.42, y - H * 0.42, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('!', x + W * 0.42, y - H * 0.42 + 1);
    ctx.textBaseline = 'alphabetic';
  }
  const bw = W - 4, bh = 2;
  const bx = x - bw / 2;
  const bloodY = y0 + H - 3;
  ctx.fillStyle = '#1f2937'; ctx.fillRect(bx, bloodY, bw, bh);
  const hl = u.healthLevel;
  const hpColor = hl === 'V' ? '#22c55e' : hl === 'IV' ? '#eab308' : hl === 'III' ? '#f97316' : hl === 'II' ? '#ef4444' : '#450a0a';
  ctx.fillStyle = hpColor; ctx.fillRect(bx, bloodY, bw * (u.hp / 100), bh);
  const supY = bloodY - 3;
  ctx.fillStyle = '#1f2937'; ctx.fillRect(bx, supY, bw, bh);
  ctx.fillStyle = '#a855f7'; ctx.fillRect(bx, supY, bw * Math.min(u.suppression / 150, 1), bh);
  const sanY = supY - 3;
  ctx.fillStyle = '#1f2937'; ctx.fillRect(bx, sanY, bw, bh);
  ctx.fillStyle = '#06b6d4'; ctx.fillRect(bx, sanY, bw * (u.san / u.sanMax), bh);
}

function drawRoleSymbol(u, x, y, W, H) {
  const role = u.role;
  const symR = 4;
  const cx = x, cy = y - H * 0.05;
  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.3; ctx.fillStyle = '#e2e8f0';
  const drawDotsLocal = (cx2, cy2, count, color) => {
    const r = 1.8, gap = 5;
    const startX = cx2 - ((count - 1) * gap) / 2;
    for (let i = 0; i < count; i++) { ctx.beginPath(); ctx.arc(startX + i * gap, cy2, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
  };
  if (role === 'leader') {
    ctx.beginPath();
    ctx.moveTo(cx - symR, cy - symR); ctx.lineTo(cx + symR, cy + symR);
    ctx.moveTo(cx + symR, cy - symR); ctx.lineTo(cx - symR, cy + symR); ctx.stroke();
    drawDotsLocal(cx, y - H * 0.45, 2, '#fbbf24');
    if (u.isObserver) { ctx.beginPath(); ctx.moveTo(cx - symR, cy + symR); ctx.lineTo(cx + symR, cy - symR); ctx.stroke(); }
  } else if (u.isObserver) {
    ctx.beginPath(); ctx.moveTo(cx - symR, cy + symR); ctx.lineTo(cx + symR, cy - symR); ctx.stroke();
  } else if (role === 'deputy') {
    ctx.beginPath();
    ctx.moveTo(cx - symR, cy - symR); ctx.lineTo(cx + symR, cy + symR);
    ctx.moveTo(cx + symR, cy - symR); ctx.lineTo(cx - symR, cy + symR); ctx.stroke();
    drawDotsLocal(cx, y - H * 0.45, 1, '#fbbf24');
  } else if (role === 'mg' || u.isMG) {
    ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();
  } else if (role === 'assist' && u.team === 'mg') {
    ctx.beginPath(); ctx.arc(cx, cy - 2, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - 4, cy + 4); ctx.lineTo(cx + 4, cy + 4); ctx.stroke();
  } else if (role === 'assist' && u.team === 'rpg') {
    ctx.beginPath(); ctx.moveTo(cx - 5, cy + 1); ctx.lineTo(cx, cy - 5); ctx.lineTo(cx + 5, cy + 1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 4, cy + 4); ctx.lineTo(cx + 4, cy + 4); ctx.stroke();
  } else if (role === 'assist') {
    ctx.beginPath(); ctx.arc(cx, cy - 2, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - 4, cy + 4); ctx.lineTo(cx + 4, cy + 4); ctx.stroke();
  } else if (role === 'ammo') {
    ctx.beginPath(); ctx.arc(cx, cy - 2, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy + 4, 1.3, 0, Math.PI * 2); ctx.fill();
  } else if (role === 'medic') {
    ctx.beginPath(); ctx.moveTo(cx - 3.5, cy); ctx.lineTo(cx + 3.5, cy); ctx.moveTo(cx, cy - 3.5); ctx.lineTo(cx, cy + 3.5); ctx.stroke();
  } else if (role === 'marksman') {
    ctx.beginPath();
    ctx.moveTo(cx - symR, cy - symR); ctx.lineTo(cx + symR, cy + symR);
    ctx.moveTo(cx + symR, cy - symR); ctx.lineTo(cx - symR, cy + symR); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 3.5, cy); ctx.lineTo(cx + 3.5, cy); ctx.moveTo(cx, cy - 3.5); ctx.lineTo(cx, cy + 3.5); ctx.stroke();
  } else if (u.team === 'rpg' && u.isRocket) {
    ctx.beginPath(); ctx.moveTo(cx - 5, cy + 3); ctx.lineTo(cx, cy - 5); ctx.lineTo(cx + 5, cy + 3); ctx.stroke();
  } else if (role === 'rifle') {
    ctx.beginPath();
    ctx.moveTo(cx - symR, cy - symR); ctx.lineTo(cx + symR, cy + symR);
    ctx.moveTo(cx + symR, cy - symR); ctx.lineTo(cx - symR, cy + symR); ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - symR, cy - symR); ctx.lineTo(cx + symR, cy + symR);
    ctx.moveTo(cx + symR, cy - symR); ctx.lineTo(cx - symR, cy + symR); ctx.stroke();
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let c = 0; c < game.mapCols; c++) for (let r = 0; r < game.mapRows; r++) drawHex(c, r);
  ctx.fillStyle = 'rgba(15,23,42,0.9)';
  const borderRight = hexToPixel(game.mapCols - 1, 0).x + SIZE * 2;
  const borderBottom = hexToPixel(0, game.mapRows - 1).y + SIZE * 2;
  ctx.fillRect(borderRight, 0, canvas.width - borderRight, canvas.height);
  ctx.fillRect(0, borderBottom, canvas.width, canvas.height - borderBottom);
  for (const h of game.highlights) drawHexHL(h.col, h.row, 'rgba(96,165,250,0.35)');
  for (const m of game.marks) {
    if (m.expiresRound < game.round) continue;
    const A = offsetToAxial(m.col, m.row);
    const cells = [{col:m.col,row:m.row}];
    for (const [dq, dr] of HEX_DIRS) {
      const nb = axialToOffset(A.q + dq, A.r + dr);
      if (nb.col >= 0 && nb.col < game.mapCols && nb.row >= 0 && nb.row < game.mapRows) cells.push(nb);
    }
    for (const cell of cells) drawHexHL(cell.col, cell.row, 'rgba(8,145,178,0.18)');
    const { x, y } = hexToPixel(m.col, m.row);
    ctx.strokeStyle = '#0891b2'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, SIZE * 0.6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.stroke();
    ctx.lineWidth = 1;
  }
  for (const s of game.pendingStrikes) {
    const { x, y } = hexToPixel(s.targetHex.col, s.targetHex.row);
    ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]);
    const r = SIZE * 0.8;
    ctx.strokeRect(x - r, y - r, r * 2, r * 2);
    ctx.beginPath();
    ctx.moveTo(x - r * 0.7, y - r * 0.7); ctx.lineTo(x + r * 0.7, y + r * 0.7);
    ctx.moveTo(x + r * 0.7, y - r * 0.7); ctx.lineTo(x - r * 0.7, y + r * 0.7);
    ctx.stroke();
    ctx.setLineDash([]); ctx.lineWidth = 1;
  }
  if (game.throwMode && game.selected) {
    for (let c = 0; c < game.mapCols; c++) for (let r = 0; r < game.mapRows; r++) {
      const d = hexDistance({col:game.selected.col, row:game.selected.row}, {col:c, row:r});
      if (d > 0 && d <= GRENADE_THROW_RANGE) drawHexHL(c, r, 'rgba(239,68,68,0.18)');
    }
  }
  if (game.callArmorMode && game.selected && game.callArmorVehicle !== 'Stryker MGS') {
    const vName = game.callArmorVehicle;
    const vCfg = (game.selected.resolvedArmorSupport && game.selected.resolvedArmorSupport[vName]) || ARMOR_SUPPORT[vName] || ARMOR_SUPPORT['BTR-82A'];
    const blastR = vCfg.blastRadius !== undefined ? vCfg.blastRadius : 1;
    for (const u of game.units) {
      if (!u.alive || u.side === game.selected.side) continue;
      drawHexHL(u.col, u.row, 'rgba(161,98,7,0.20)');
      const A = offsetToAxial(u.col, u.row);
      for (const [dq, dr] of HEX_DIRS) {
        const nb = axialToOffset(A.q + dq, A.r + dr);
        if (nb.col >= 0 && nb.col < game.mapCols && nb.row >= 0 && nb.row < game.mapRows) {
          drawHexHL(nb.col, nb.row, 'rgba(161,98,7,0.10)');
          if (blastR >= 2) {
            const A2 = offsetToAxial(nb.col, nb.row);
            for (const [dq2, dr2] of HEX_DIRS) {
              const nb2 = axialToOffset(A2.q + dq2, A2.r + dr2);
              if (nb2.col >= 0 && nb2.col < game.mapCols && nb2.row >= 0 && nb2.row < game.mapRows) drawHexHL(nb2.col, nb2.row, 'rgba(161,98,7,0.05)');
            }
          }
        }
      }
    }
  }
  if (game.groundFireMode && game.selected) {
    for (let c = 0; c < game.mapCols; c++) for (let r = 0; r < game.mapRows; r++) {
      const d = hexDistance({col:game.selected.col, row:game.selected.row}, {col:c, row:r});
      if (d > 0 && d <= 12) drawHexHL(c, r, 'rgba(124,58,237,0.10)');
    }
  }
  if (game.markMode && game.selected) {
    for (const u of game.units) {
      if (!u.alive || u.side === game.selected.side) continue;
      if (u.isConcealed && !u.isDummy) continue;
      const d = hexDistance({col:game.selected.col,row:game.selected.row}, {col:u.col,row:u.row});
      if (d > MARK_RANGE) continue;
      drawHexHL(u.col, u.row, 'rgba(8,145,178,0.25)');
    }
  }
  for (const p of game.droppedWeapons) if (p.available) drawPlatform(p);
  for (const u of game.units) {
    if (!u.alive) continue;
    if (u.side === 'red' && u.isConcealed && !u.isBroken && !u.isDummy) {
      if (u.lastFiredAt) drawDecoy(u.lastFiredAt.col, u.lastFiredAt.row);
      continue;
    }
    drawUnit(u);
  }
  updateStatus();
  updateUnitInfo();
  document.getElementById('endTurn').disabled = game.turn !== 'blue' || game.busy || game.over;
}

function updateStatus() {
  const el = document.getElementById('statusInfo');
  const parts = [];
  if (game.throwMode) parts.push(`<div style="color:#ef4444;font-weight:700;padding:3px 0;">◈ 投掷模式：点击目标格</div>`);
  if (game.callArmorMode) { const v = game.callArmorVehicle || '载具'; parts.push(`<div style="color:#a16207;font-weight:700;padding:3px 0;">◈ ${v} 呼叫模式：点击目标格</div>`); }
  if (game.groundFireMode) parts.push(`<div style="color:#7c3aed;font-weight:700;padding:3px 0;">◈ 强制攻击模式：点击任意格开火（隐蔽目标命中率大幅下降）</div>`);
  if (game.markMode) parts.push(`<div style="color:#0891b2;font-weight:700;padding:3px 0;">◈ 标记模式：点击已暴露的敌人</div>`);
  if (game.sniperDetected.blue) parts.push(`<div style="color:#f87171;font-weight:700;padding:3px 0;">⚠ 发现敌人狙击手！</div>`);
  if (game.sniperDetected.red) parts.push(`<div style="color:#fbbf24;padding:3px 0;">◈ 红方察觉我方狙击手</div>`);
  for (const s of game.pendingStrikes) {
    const sideLabel = s.side === 'blue' ? '蓝方' : '红方';
    const color = s.side === 'blue' ? '#60a5fa' : '#f87171';
    parts.push(`<div style="color:${color};padding:3px 0;">◈ ${sideLabel} ${s.vehicleName} 火力将于下回合抵达 (${s.targetHex.col},${s.targetHex.row})</div>`);
  }
  for (const p of game.droppedWeapons) {
    if (p.available) {
      const sideLabel = p.side === 'blue' ? '蓝方' : '红方';
      parts.push(`<div style="color:#f59e0b;padding:3px 0;">▢ ${sideLabel} ${p.weapon} 平台待接管 (${p.col},${p.row})</div>`);
    }
  }
  for (const side of ['blue', 'red']) {
    const call = game.medicCall[side];
    if (call.pending) {
      const label = side === 'blue' ? '卫生员' : '医护兵';
      const color = side === 'blue' ? '#60a5fa' : '#f87171';
      parts.push(`<div style="color:${color};padding:3px 0;">◈ 【${side === 'blue' ? '蓝方' : '红方'}】${label}将在 ${call.turnsLeft} 回合后抵达</div>`);
    }
  }
  el.innerHTML = parts.length > 0 ? parts.join('') : '<div style="color:#64748b;">无待命增援</div>';
}

function updateHighlights() {
  game.highlights = [];
  if (!game.selected || !game.selected.alive) return;
  const u = game.selected;
  if (u.isBroken) return;
  if (game.pendingAction === 'treat') {
    for (const t of game.units) { if (t.alive && t.side === u.side && t !== u && canTreat(u, t)) game.highlights.push({ col: t.col, row: t.row }); }
    return;
  }
  if (u.hasMoved) return;
  const range = u.effectiveMoveRange;
  for (let c = 0; c < game.mapCols; c++) for (let r = 0; r < game.mapRows; r++) {
    const d = hexDistance({ col: u.col, row: u.row }, { col: c, row: r });
    if (d > 0 && d <= range) {
      const occ = game.units.some(o => o.alive && o.col === c && o.row === r);
      if (!occ) game.highlights.push({ col: c, row: r });
    }
  }
}