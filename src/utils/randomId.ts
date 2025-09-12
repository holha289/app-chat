// utils/randomId.ts

export const randomId = (() => {
  let lastMs = 0;
  let seq = 0;
  const MAX_SEQ = 0xFFFFFF; // ~16.7 triệu ID trong 1ms

  const toHex = (n: number, width: number): string =>
    n.toString(16).padStart(width, "0");

  return function generateId(): string {
    let now = Date.now();

    // Chống đồng hồ hệ thống bị lùi
    if (now < lastMs) {
      now = lastMs;
    }

    if (now === lastMs) {
      // cùng 1 ms -> tăng sequence
      if (++seq > MAX_SEQ) {
        lastMs = lastMs + 1; // nhảy logic sang ms tiếp theo
        seq = 0;
      }
    } else {
      // ms mới -> reset sequence
      lastMs = now;
      seq = 0;
    }

    // fixed-width -> so sánh theo chuỗi vẫn đúng thứ tự
    const timeHex = toHex(lastMs, 12);                  // 48-bit time
    const seqHex = toHex(seq, 6);                       // 24-bit seq
    const randHex = toHex((Math.random() * 0x10000) | 0, 4); // 16-bit random

    return `${timeHex}${seqHex}${randHex}`;
  };
})();
