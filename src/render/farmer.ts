/** Draws the kibbutznik farmer: kippah, tzitzit fringes, work shirt. (x, y) = tile center. */
export function drawFarmer(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs (khaki)
  ctx.fillStyle = '#8a7a4f';
  ctx.fillRect(x - 6, y - 9, 4, 11);
  ctx.fillRect(x + 2, y - 9, 4, 11);

  // tzitzit fringes (white, hanging from the waist)
  ctx.strokeStyle = '#f5f0e6';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 4; i++) {
    const fx = x - 6 + i * 4;
    ctx.beginPath();
    ctx.moveTo(fx, y - 24);
    ctx.lineTo(fx + (i % 2 === 0 ? -2 : 2), y - 16);
    ctx.stroke();
  }

  // torso (blue work shirt)
  ctx.fillStyle = '#3f6ea8';
  ctx.fillRect(x - 8, y - 30, 16, 18);

  // arms
  ctx.fillStyle = '#3f6ea8';
  ctx.fillRect(x - 11, y - 28, 3, 13);
  ctx.fillRect(x + 8, y - 28, 3, 13);
  ctx.fillStyle = '#e8b88a';
  ctx.beginPath();
  ctx.arc(x - 9.5, y - 14, 2.2, 0, Math.PI * 2);
  ctx.arc(x + 9.5, y - 14, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.fillStyle = '#e8b88a';
  ctx.beginPath();
  ctx.arc(x, y - 37, 6.5, 0, Math.PI * 2);
  ctx.fill();

  // kippah (dark dome on top)
  ctx.fillStyle = '#2b3a67';
  ctx.beginPath();
  ctx.arc(x, y - 41, 4.5, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
}
