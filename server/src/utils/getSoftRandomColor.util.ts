/**
 * 生成低饱和度的随机 HEX 颜色 在createProject时使用
 * @param sMin 饱和度下限，0-100，默认 30
 * @param sMax 饱和度上限，0-100，默认 55
 * @param lMin 亮度下限，0-100，默认 50
 * @param lMax 亮度上限，0-100，默认 75
 */
export function getSoftRandomColor(
  sMin = 30,
  sMax = 55,
  lMin = 50,
  lMax = 75
): string {
  const h = Math.random() * 360;
  const s = sMin + Math.random() * (sMax - sMin);
  const l = lMin + Math.random() * (lMax - lMin);

  return hslToHex(h, s, l);
}

/** HSL 转 HEX，h: 0-360, s/l: 0-100 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}