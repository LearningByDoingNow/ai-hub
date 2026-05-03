export interface ProviderLink {
  label: string;
  url: string;
}

export interface Provider {
  id: string;
  name: string;
  description: string;
  category: string;
  country: string;
  links: ProviderLink[];
  tags: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  titleEn: string;
  source: string;
  date: string;
  summary: string;
  summaryEn: string;
  url: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  date: string;
  abstract: string;
  abstractEn: string;
  links: { label: string; url: string }[];
}
