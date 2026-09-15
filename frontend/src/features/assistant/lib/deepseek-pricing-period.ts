// Official pricing, checked 2026-09-15:
// https://api-docs.deepseek.com/zh-cn/quick_start/pricing
// Beijing time: Monday-Friday 09:00-12:00 and 14:00-18:00 are peak hours.
export function getDeepSeekPricingPeriod(now: Date): "peak" | "offPeak" {
  const beijing = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const weekday = beijing.getUTCDay();
  const minutes = beijing.getUTCHours() * 60 + beijing.getUTCMinutes();
  const isWeekday = weekday >= 1 && weekday <= 5;
  return isWeekday &&
    ((minutes >= 9 * 60 && minutes < 12 * 60) || (minutes >= 14 * 60 && minutes < 18 * 60))
    ? "peak"
    : "offPeak";
}
