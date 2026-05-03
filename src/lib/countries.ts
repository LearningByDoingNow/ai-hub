export const countries: Record<string, { flag: string; nameZh: string; nameEn: string }> = {
  US: { flag: "🇺🇸", nameZh: "美国", nameEn: "United States" },
  CN: { flag: "🇨🇳", nameZh: "中国", nameEn: "China" },
  FR: { flag: "🇫🇷", nameZh: "法国", nameEn: "France" },
  DE: { flag: "🇩🇪", nameZh: "德国", nameEn: "Germany" },
  UK: { flag: "🇬🇧", nameZh: "英国", nameEn: "United Kingdom" },
  CA: { flag: "🇨🇦", nameZh: "加拿大", nameEn: "Canada" },
  IL: { flag: "🇮🇱", nameZh: "以色列", nameEn: "Israel" },
  JP: { flag: "🇯🇵", nameZh: "日本", nameEn: "Japan" },
  KR: { flag: "🇰🇷", nameZh: "韩国", nameEn: "South Korea" },
  SG: { flag: "🇸🇬", nameZh: "新加坡", nameEn: "Singapore" },
  AE: { flag: "🇦🇪", nameZh: "阿联酋", nameEn: "UAE" },
  IN: { flag: "🇮🇳", nameZh: "印度", nameEn: "India" },
  SE: { flag: "🇸🇪", nameZh: "瑞典", nameEn: "Sweden" },
  FI: { flag: "🇫🇮", nameZh: "芬兰", nameEn: "Finland" },
};

export function getFlag(code: string): string {
  return countries[code]?.flag ?? "🌐";
}

export function getCountryName(code: string, locale: string): string {
  const c = countries[code];
  if (!c) return code;
  return locale === "zh" ? c.nameZh : c.nameEn;
}
