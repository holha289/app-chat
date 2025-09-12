export const isBefore = (a:string, b:string) => {
  const A = a ?? null;
  const B = b ?? null;
  if (A == null || B == null) return false; // hoặc tùy bạn: xử lý thiếu dữ liệu
  return String(A) < String(B);
};

export const isAfter = (a:string, b:string) => {
  const A = a ?? null;
  const B = b ?? null;
  if (A == null || B == null) return false; // hoặc tùy bạn: xử lý thiếu dữ liệu
  return String(A) > String(B);
};

