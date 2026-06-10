export interface DeviceMetrics {
  mobileScore: number;
  desktopScore: number;
}

export interface MetricDetail {
  value: number | string;
  rating: 'good' | 'needs-improvement' | 'poor';
  label: string;
}

export interface PerformanceMetrics {
  score: number;
  loadTimeMs: number;
  fcp: MetricDetail; // First Contentful Paint
  lcp: MetricDetail; // Largest Contentful Paint
  cls: MetricDetail; // Cumulative Layout Shift
  tbt: MetricDetail; // Total Blocking Time
  pageSizeKb: number;
  requestCount: number;
  deviceMetrics: DeviceMetrics;
}

export interface AccessibilityCheck {
  id: string;
  item: string;
  status: 'pass' | 'fail' | 'warning';
  impact: 'high' | 'medium' | 'low';
  description: string;
}

export interface AccessibilityMetrics {
  score: number;
  checks: AccessibilityCheck[];
}

export interface KeywordDensity {
  word: string;
  count: number;
  percent: number;
}

export interface OnPageSEO {
  score: number;
  title: string;
  titleLength: number;
  titleStatus: 'good' | 'warning' | 'error';
  metaDescription: string;
  descriptionLength: number;
  descriptionStatus: 'good' | 'warning' | 'error';
  h1Presence: boolean;
  headingsStructure: string[];
  altTagsMissingCount: number;
  keywordDensity: KeywordDensity[];
}

export interface TechnicalSEO {
  score: number;
  isHttps: boolean;
  sitemapFound: boolean;
  robotsTxtFound: boolean;
  compressionEnabled: boolean;
  indexable: boolean;
  pageSpeedResponseHeader: string;
}

export interface OffPageSEO {
  score: number;
  domainAuthority: number;
  estimatedBacklinks: number;
  referringDomains: number;
  rankingKeywordsCount: number;
}

export interface LocalSEO {
  score: number;
  schemaOrgType: string;
  contactInfoFound: boolean;
  mapIntegrationActive: boolean;
  recommendations: string[];
}

export interface SEOMetrics {
  score: number;
  onPage: OnPageSEO;
  technical: TechnicalSEO;
  offPage: OffPageSEO;
  local: LocalSEO;
}

export interface SocialShareability {
  score: number;
  openGraph: {
    title: string;
    description: string;
    image: string;
    type: string;
    exists: boolean;
  };
  twitterCards: {
    card: string;
    title: string;
    description: string;
    image: string;
    exists: boolean;
  };
  suggestions: string[];
}

export interface ActionableSolution {
  id: string;
  category: 'performance' | 'accessibility' | 'seo' | 'social';
  title: string;
  issueDescription: string;
  difficulty: 'easy' | 'medium' | 'hard';
  potentialImpact: 'high' | 'medium' | 'low';
  priority: number; // 1 (highest) to 5 (lowest)
  stepsToFix: string[];
  codeSnippet?: string;
}

export interface CompetitorComparison {
  targetUrl: string;
  competitorUrl: string;
  targetMetrics: {
    performance: number;
    seo: number;
    accessibility: number;
    pageSizeKb: number;
    loadTimeMs: number;
  };
  competitorMetrics: {
    performance: number;
    seo: number;
    accessibility: number;
    pageSizeKb: number;
    loadTimeMs: number;
  };
  gapAnalysis: {
    advantage: 'target' | 'competitor' | 'neutral';
    keyDifferentiator: string;
    rankingPotential: string;
  };
  keywordsOverlap: Array<{
    keyword: string;
    targetPosition: number;
    competitorPosition: number;
    searchVolume: number;
  }>;
}

export interface KeywordSuggestion {
  keyword: string;
  searchVolume: number;
  difficulty: number; // 0-100
  searchIntent: 'informational' | 'transactional' | 'commercial' | 'navigational';
  suggestedOptimizations: string;
  currentRankIndex: number; // 0 means not ranking, otherwise numeric rank
}

export interface AuditReport {
  id: string;
  url: string;
  timestamp: string;
  performance: PerformanceMetrics;
  accessibility: AccessibilityMetrics;
  seo: SEOMetrics;
  socialShareability: SocialShareability;
  solutions: ActionableSolution[];
  competitorComparison?: CompetitorComparison;
  keywords: KeywordSuggestion[];
}

// History comparison entry
export interface HistoryBenchmark {
  timestamp: string;
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
}
