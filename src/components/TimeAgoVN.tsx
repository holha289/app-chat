// TimeAgoVN.tsx
import { formatViRelative } from "@app/utils/vi-timeago";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";

// Dùng được cho RN (Text) hoặc web (span) tuỳ bạn thay tag
export function TimeAgoVN({
  value,
  live = true,
  interval = 1000, // 1s
  showClockForDayLabels = true,
}: {
  value: string | number | Date;
  live?: boolean;
  interval?: number;
  showClockForDayLabels?: boolean;
}) {
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [live, interval]);

  const text = formatViRelative(value, { now, showClockForDayLabels });
  return <Text>{text}</Text>; // RN: <Text>{text}</Text>
}
