export function calcRankPt(rank: string): number {
  const r = Number(rank);
  if (!Number.isFinite(r) || rank === "") return 0;
  if (r === 1) return 12;
  if (r === 2) return 9;
  if (r === 3) return 7;
  if (r === 4) return 5;
  if (r === 5) return 4;
  if (r <= 7) return 3;
  if (r <= 10) return 2;
  if (r <= 15) return 1;
  return 0;
}

export function calcKillPt(kill: string, killLimit: number): number {
  const k = Number.isFinite(Number(kill)) && kill !== "" ? Number(kill) : 0;
  return Math.min(k, killLimit);
}

export function calcTotal(
  rank: string,
  kill: string,
  killLimit: number
): number {
  return calcRankPt(rank) + calcKillPt(kill, killLimit);
}
