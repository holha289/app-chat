// vi-timeago.ts
const TZ_OFFSET_MS = 7 * 60 * 60 * 1000; // Asia/Ho_Chi_Minh

const pad2 = (n: number) => String(n).padStart(2, "0");
const toLocalMs = (ms: number) => ms + TZ_OFFSET_MS;
const dayIndex = (ms: number) => Math.floor(toLocalMs(ms) / 86_400_000);

const hhmm = (ms: number) => {
  const d = new Date(toLocalMs(ms));
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
};
const dmy = (ms: number) => {
  const d = new Date(toLocalMs(ms));
  return `${pad2(d.getUTCDate())}/${pad2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
};
const monthIndex = (ms: number) => {
  const d = new Date(toLocalMs(ms));
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
};
const weekdayVi = (ms: number) => {
  const d = new Date(toLocalMs(ms));
  const dow = d.getUTCDay(); // 0..6
  return ["CN","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"][dow];
};

export function formatViRelative(
  input: string | number | Date,
  opts?: { now?: Date; showClockForDayLabels?: boolean }
): string {
  const now = opts?.now ? opts.now.getTime() : Date.now();
  const t = input instanceof Date ? input.getTime() : new Date(input).getTime();

  if (Number.isNaN(t)) return "—";

  const diffMs = now - t;
  const absSec = Math.round(Math.abs(diffMs) / 1000);

  const today = dayIndex(now);
  const day = dayIndex(t);
  const daysDiff = today - day;

  // Tương lai: show lịch + giờ gọn gàng
  if (diffMs < 0) {
    if (daysDiff === 0) return `Hôm nay lúc ${hhmm(t)}`;
    if (daysDiff === -1) return `Ngày mai lúc ${hhmm(t)}`;
    return `${dmy(t)} lúc ${hhmm(t)}`;
  }

  // Rất gần
  if (absSec < 60) return "Vừa xong";
  // if (absSec < 60) return `${absSec} giây trước`;

  const mins = Math.round(absSec / 60);
  if (mins < 60) return mins === 1 ? "1 phút trước" : `khoảng ${mins} phút trước`;

  const hours = Math.round(mins / 60);
  if (daysDiff === 0) return hours === 1 ? "1 giờ trước" : `khoảng ${hours} giờ trước`;

  // Nhãn theo ngày
  if (daysDiff === 1)
    return opts?.showClockForDayLabels ? `Hôm qua lúc ${hhmm(t)}` : "Hôm qua";
  if (daysDiff === 2)
    return opts?.showClockForDayLabels ? `Hôm kia lúc ${hhmm(t)}` : "Hôm kia";

  // Tuần trước: 7–13 ngày trước
  if (daysDiff >= 7 && daysDiff < 14)
    return `Tuần trước ${weekdayVi(t)} lúc ${hhmm(t)}`;

  // Tháng trước (so theo lịch, không đoán ngày)
  const nowM = monthIndex(now);
  const tM = monthIndex(t);
  if (nowM - tM === 1) return `Tháng trước ngày ${dmy(t).slice(0, 5)} lúc ${hhmm(t)}`;

  // Cũ hơn: cùng năm thì DD/MM, khác năm thì DD/MM/YYYY
  const sameYear =
    new Date(toLocalMs(now)).getUTCFullYear() ===
    new Date(toLocalMs(t)).getUTCFullYear();

  return sameYear ? `${dmy(t).slice(0, 5)} lúc ${hhmm(t)}` : `${dmy(t)} lúc ${hhmm(t)}`;
}
