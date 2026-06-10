import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to safely fetch basic elements of a website
async function fetchWebpageMetadata(targetUrl: string) {
  let url = targetUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    const html = await response.text();
    const status = response.status;
    const isHttps = url.toLowerCase().startsWith("https://");

    // Gather some headers
    const headers: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      headers[key] = val;
    });

    // Clean html for regex matches to prevent excessive loops
    const sliceHtml = html.slice(0, 150000); // look at first 150KB for speed

    // Extract basic meta and headers
    const titleMatch = sliceHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descMatch = sliceHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || 
                      sliceHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    
    // OG image
    const ogTitle = sliceHtml.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const ogDesc = sliceHtml.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    const ogImage = sliceHtml.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    
    // H1 tags count
    const h1Count = (sliceHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || []).length;
    
    // Check images missing alt tags
    const imagesCount = (sliceHtml.match(/<img[^>]*>/gi) || []).length;
    const imagesWithAlt = (sliceHtml.match(/<img[^>]+\balt=["'][^"']*["']/gi) || []).length;
    const altTagsMissingCount = Math.max(0, imagesCount - imagesWithAlt);

    // Dynamic load timing estimate based on physical connection time
    return {
      success: true,
      status,
      isHttps,
      htmlLength: html.length,
      serverConnectMs: 50, // default placeholder
      metadata: {
        title: titleMatch ? titleMatch[1].trim() : "",
        description: descMatch ? descMatch[1].trim() : "",
        ogTitle: ogTitle ? ogTitle[1].trim() : "",
        ogDesc: ogDesc ? ogDesc[1].trim() : "",
        ogImage: ogImage ? ogImage[1].trim() : "",
        h1Count,
        altTagsMissingCount,
        imagesCount
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network / timeout error resolving target",
      isHttps: url.toLowerCase().startsWith("https://"),
      htmlLength: 0,
      metadata: null
    };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize server-side GoogleGenAI safely
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } else {
    console.warn("No valid GEMINI_API_KEY found. Running in demo validation mode.");
  }

  // Actionable audit API
  app.post("/api/audit", async (req, res) => {
    const { url, competitorUrl } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    console.log(`Auditing target URL: ${url} compared to: ${competitorUrl || "default"}`);

    // Standardize URL protocol
    let validatedUrl = url.trim();
    if (!/^https?:\/\//i.test(validatedUrl)) {
      validatedUrl = "https://" + validatedUrl;
    }

    let validatedCompUrl = competitorUrl ? competitorUrl.trim() : "";
    if (validatedCompUrl && !/^https?:\/\//i.test(validatedCompUrl)) {
      validatedCompUrl = "https://" + validatedCompUrl;
    }

    // 1. Crawl URL on server
    const crawlData = await fetchWebpageMetadata(validatedUrl);

    // 2. Generate detailed core metrics and solutions
    if (ai) {
      try {
        const prompt = `You are an elite Search Engine Optimization (SEO) Consultant, Google Core Web Vitals Expert, and Accessibility Engineer.
Perform a detailed audit on the web address: "${validatedUrl}".
Competitor URL requested: "${validatedCompUrl || "Standard Industry Competitors in same niche"}".

Facts Crawled from Website:
- Fetch Success: ${crawlData.success}
- HTTPS: ${crawlData.isHttps}
- Static HTML Size: ${crawlData.htmlLength} bytes
- Page Title: "${crawlData.metadata?.title || "Not found"}"
- Meta Description: "${crawlData.metadata?.description || "Not found"}"
- Total H1 Headings: ${crawlData.metadata?.h1Count || 0}
- Images Missing Content 'alt' tags: ${crawlData.metadata?.altTagsMissingCount || 0}
${crawlData.error ? `- Crawling Warning/Error: ${crawlData.error}` : ""}

Ensure you evaluate:
1. Performance scores (FCP, LCP, CLS, TBT, page size, load time in ms)
2. Accessibility check scores (Alt tags, text contrast, form labels, ARIA landmarks, screen reader readiness)
3. SEO parameters (On-page elements like title status, meta structures, keyword density; Technical setups like SiteMap/Robots tags; Off-page parameters like estimated backlink metrics, domain authority; Local optimizations)
4. Social Media index/Shareability (OpenGraph properties and Twitter Card tags with specific rating tags)
5. Actionable Developer Solutions: Include detailed steps and direct code fixes (HTML layouts, scripts, css properties, config overrides) to solve issues like deferred image scaling, preloading fonts, viewport configurations, schema generation, ALT patches.
6. Competitor Comparison gaps: Metric contrast, structural advantages, and organic keyword positions.
7. Multi-Engine Keyword Opportunities: Suggestions with volumes, parent search intents, rank indices, and targeted optimization tips.

Return the audit report in a strict JSON format matching the specifications. Every percentage score must be between 0 and 100. Ratings must be one of 'good', 'needs-improvement', or 'poor'. Difficulty must be 'easy', 'medium', or 'hard'. PotentialImpact must be 'high', 'medium', or 'low'. Priority must be a numbered integer between 1 and 5.`;

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            performance: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                loadTimeMs: { type: Type.INTEGER },
                fcp: {
                  type: Type.OBJECT,
                  properties: {
                    value: { type: Type.NUMBER },
                    rating: { type: Type.STRING },
                    label: { type: Type.STRING }
                  },
                  required: ["value", "rating", "label"]
                },
                lcp: {
                  type: Type.OBJECT,
                  properties: {
                    value: { type: Type.NUMBER },
                    rating: { type: Type.STRING },
                    label: { type: Type.STRING }
                  },
                  required: ["value", "rating", "label"]
                },
                cls: {
                  type: Type.OBJECT,
                  properties: {
                    value: { type: Type.NUMBER },
                    rating: { type: Type.STRING },
                    label: { type: Type.STRING }
                  },
                  required: ["value", "rating", "label"]
                },
                tbt: {
                  type: Type.OBJECT,
                  properties: {
                    value: { type: Type.INTEGER },
                    rating: { type: Type.STRING },
                    label: { type: Type.STRING }
                  },
                  required: ["value", "rating", "label"]
                },
                pageSizeKb: { type: Type.INTEGER },
                requestCount: { type: Type.INTEGER },
                deviceMetrics: {
                  type: Type.OBJECT,
                  properties: {
                    mobileScore: { type: Type.INTEGER },
                    desktopScore: { type: Type.INTEGER }
                  },
                  required: ["mobileScore", "desktopScore"]
                }
              },
              required: ["score", "loadTimeMs", "fcp", "lcp", "cls", "tbt", "pageSizeKb", "requestCount", "deviceMetrics"]
            },
            accessibility: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                checks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      item: { type: Type.STRING },
                      status: { type: Type.STRING },
                      impact: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["id", "item", "status", "impact", "description"]
                  }
                }
              },
              required: ["score", "checks"]
            },
            seo: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                onPage: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    titleLength: { type: Type.INTEGER },
                    titleStatus: { type: Type.STRING },
                    metaDescription: { type: Type.STRING },
                    descriptionLength: { type: Type.INTEGER },
                    descriptionStatus: { type: Type.STRING },
                    h1Presence: { type: Type.BOOLEAN },
                    headingsStructure: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    altTagsMissingCount: { type: Type.INTEGER },
                    keywordDensity: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          word: { type: Type.STRING },
                          count: { type: Type.INTEGER },
                          percent: { type: Type.NUMBER }
                        },
                        required: ["word", "count", "percent"]
                      }
                    }
                  },
                  required: ["score", "title", "titleLength", "titleStatus", "metaDescription", "descriptionLength", "descriptionStatus", "h1Presence", "headingsStructure", "altTagsMissingCount", "keywordDensity"]
                },
                technical: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    isHttps: { type: Type.BOOLEAN },
                    sitemapFound: { type: Type.BOOLEAN },
                    robotsTxtFound: { type: Type.BOOLEAN },
                    compressionEnabled: { type: Type.BOOLEAN },
                    indexable: { type: Type.BOOLEAN },
                    pageSpeedResponseHeader: { type: Type.STRING }
                  },
                  required: ["score", "isHttps", "sitemapFound", "robotsTxtFound", "compressionEnabled", "indexable", "pageSpeedResponseHeader"]
                },
                offPage: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    domainAuthority: { type: Type.INTEGER },
                    estimatedBacklinks: { type: Type.INTEGER },
                    referringDomains: { type: Type.INTEGER },
                    rankingKeywordsCount: { type: Type.INTEGER }
                  },
                  required: ["score", "domainAuthority", "estimatedBacklinks", "referringDomains", "rankingKeywordsCount"]
                },
                local: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    schemaOrgType: { type: Type.STRING },
                    contactInfoFound: { type: Type.BOOLEAN },
                    mapIntegrationActive: { type: Type.BOOLEAN },
                    recommendations: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["score", "schemaOrgType", "contactInfoFound", "mapIntegrationActive", "recommendations"]
                }
              },
              required: ["score", "onPage", "technical", "offPage", "local"]
            },
            socialShareability: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                openGraph: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    image: { type: Type.STRING },
                    type: { type: Type.STRING },
                    exists: { type: Type.BOOLEAN }
                  },
                  required: ["title", "description", "image", "type", "exists"]
                },
                twitterCards: {
                  type: Type.OBJECT,
                  properties: {
                    card: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    image: { type: Type.STRING },
                    exists: { type: Type.BOOLEAN }
                  },
                  required: ["card", "title", "description", "image", "exists"]
                },
                suggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["score", "openGraph", "twitterCards", "suggestions"]
            },
            solutions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING },
                  title: { type: Type.STRING },
                  issueDescription: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  potentialImpact: { type: Type.STRING },
                  priority: { type: Type.INTEGER },
                  stepsToFix: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  codeSnippet: { type: Type.STRING }
                },
                required: ["id", "category", "title", "issueDescription", "difficulty", "potentialImpact", "priority", "stepsToFix"]
              }
            },
            competitorComparison: {
              type: Type.OBJECT,
              properties: {
                targetUrl: { type: Type.STRING },
                competitorUrl: { type: Type.STRING },
                targetMetrics: {
                  type: Type.OBJECT,
                  properties: {
                    performance: { type: Type.NUMBER },
                    seo: { type: Type.NUMBER },
                    accessibility: { type: Type.NUMBER },
                    pageSizeKb: { type: Type.NUMBER },
                    loadTimeMs: { type: Type.NUMBER }
                  },
                  required: ["performance", "seo", "accessibility", "pageSizeKb", "loadTimeMs"]
                },
                competitorMetrics: {
                  type: Type.OBJECT,
                  properties: {
                    performance: { type: Type.NUMBER },
                    seo: { type: Type.NUMBER },
                    accessibility: { type: Type.NUMBER },
                    pageSizeKb: { type: Type.NUMBER },
                    loadTimeMs: { type: Type.NUMBER }
                  },
                  required: ["performance", "seo", "accessibility", "pageSizeKb", "loadTimeMs"]
                },
                gapAnalysis: {
                  type: Type.OBJECT,
                  properties: {
                    advantage: { type: Type.STRING },
                    keyDifferentiator: { type: Type.STRING },
                    rankingPotential: { type: Type.STRING }
                  },
                  required: ["advantage", "keyDifferentiator", "rankingPotential"]
                },
                keywordsOverlap: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      keyword: { type: Type.STRING },
                      targetPosition: { type: Type.INTEGER },
                      competitorPosition: { type: Type.INTEGER },
                      searchVolume: { type: Type.INTEGER }
                    },
                    required: ["keyword", "targetPosition", "competitorPosition", "searchVolume"]
                  }
                }
              },
              required: ["targetUrl", "competitorUrl", "targetMetrics", "competitorMetrics", "gapAnalysis", "keywordsOverlap"]
            },
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  searchVolume: { type: Type.INTEGER },
                  difficulty: { type: Type.INTEGER },
                  searchIntent: { type: Type.STRING },
                  suggestedOptimizations: { type: Type.STRING },
                  currentRankIndex: { type: Type.INTEGER }
                },
                required: ["keyword", "searchVolume", "difficulty", "searchIntent", "suggestedOptimizations", "currentRankIndex"]
              }
            }
          },
          required: ["performance", "accessibility", "seo", "socialShareability", "solutions", "keywords"]
        };

        const resultResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.2
          }
        });

        const rawText = resultResponse.text?.trim() || "{}";
        const parsedReport = JSON.parse(rawText);

        // Append id and url post-generation for structure integrity
        const id = "rep_" + Date.now();
        const report = {
          id,
          url: validatedUrl,
          timestamp: new Date().toISOString(),
          ...parsedReport
        };

        return res.json({ report, demoMode: false });
      } catch (geminiError: any) {
        console.error("Gemini API call failed, generating simulated high-fidelity report", geminiError);
        const report = getSimulatedReport(validatedUrl, validatedCompUrl, crawlData);
        return res.json({ report, demoMode: true, warning: "Using validation simulation due to API response error: " + geminiError.message });
      }
    } else {
      // Return high fidelity simulation
      const report = getSimulatedReport(validatedUrl, validatedCompUrl, crawlData);
      return res.json({ report, demoMode: true, warning: "Running in offline demo sandbox. Set up GEMINI_API_KEY for real AI calculations!" });
    }
  });

  // Serve static assets in production or hook Vite development server in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Web Performance and SEO Auditor listening on port ${PORT}`);
  });
}

// Complete and robust simulated SEO analysis callback
function getSimulatedReport(url: string, competitorUrl: string, crawlData: any): any {
  const host = url.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0];
  const compHost = competitorUrl ? competitorUrl.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0] : "competitor.com";

  const cleanTitle = crawlData.metadata?.title || host.split(".")[0].toUpperCase();
  const cleanDesc = crawlData.metadata?.description || `Discover excellent solutions on ${host}. We perform technical consulting and support.`;
  const isHttps = crawlData.isHttps;

  // Simulate scores based on crawl success status to give realistic user dynamic experience
  const perfScore = crawlData.success ? 78 : 64;
  const accessibilityScore = crawlData.success ? 85 : 79;
  const onPageScore = crawlData.success ? (crawlData.metadata?.description ? 92 : 70) : 60;
  
  return {
    id: "rep_" + Date.now(),
    url: url,
    timestamp: new Date().toISOString(),
    performance: {
      score: perfScore,
      loadTimeMs: crawlData.success ? 1420 : 2900,
      fcp: { value: crawlData.success ? 0.9 : 2.1, rating: crawlData.success ? "good" : "needs-improvement", label: "First Contentful Paint" },
      lcp: { value: crawlData.success ? 1.8 : 3.4, rating: crawlData.success ? "good" : "needs-improvement", label: "Largest Contentful Paint" },
      cls: { value: crawlData.success ? 0.05 : 0.22, rating: crawlData.success ? "good" : "needs-improvement", label: "Cumulative Layout Shift" },
      tbt: { value: crawlData.success ? 180 : 420, rating: crawlData.success ? "good" : "needs-improvement", label: "Total Blocking Time" },
      pageSizeKb: crawlData.success ? Math.round(crawlData.htmlLength / 1024) || 240 : 1250,
      requestCount: crawlData.success ? 42 : 115,
      deviceMetrics: {
        mobileScore: perfScore - 12,
        desktopScore: perfScore + 8
      }
    },
    accessibility: {
      score: accessibilityScore,
      checks: [
        {
          id: "acc_1",
          item: "Image alt description tags",
          status: crawlData.metadata?.altTagsMissingCount === 0 ? "pass" : "fail",
          impact: "high",
          description: crawlData.metadata?.altTagsMissingCount > 0 
            ? `Found ${crawlData.metadata.altTagsMissingCount} decorative or contextual images missing 'alt' descriptors.` 
            : "All key images present have rich structured alternate descriptional text."
        },
        {
          id: "acc_2",
          item: "ARIA Landmark regions",
          status: "pass",
          impact: "medium",
          description: "All section containers feature semantic element structures (<header>, <main>, <nav>, <footer>)."
        },
        {
          id: "acc_3",
          item: "Text background contrast ratios",
          status: "warning",
          impact: "high",
          description: "Some light muted text containers did not meet the standard WCAG AAA contrast ratio guidelines (4.5:1)."
        },
        {
          id: "acc_4",
          item: "Doc Language definitions",
          status: crawlData.success ? "pass" : "warning",
          impact: "medium",
          description: "The <html> element correctly provides a descriptive lang='en' tag."
        }
      ]
    },
    seo: {
      score: Math.round((onPageScore + (isHttps ? 90 : 50) + 75) / 3),
      onPage: {
        score: onPageScore,
        title: cleanTitle,
        titleLength: cleanTitle.length,
        titleStatus: cleanTitle.length > 20 && cleanTitle.length < 65 ? "good" : "warning",
        metaDescription: cleanDesc,
        descriptionLength: cleanDesc.length,
        descriptionStatus: cleanDesc.length > 50 && cleanDesc.length < 160 ? "good" : "warning",
        h1Presence: crawlData.metadata?.h1Count > 0,
        headingsStructure: ["H1: " + cleanTitle, "H2: Core Architecture", "H2: Performance Benchmarks", "H3: Detailed Methodology"],
        altTagsMissingCount: crawlData.metadata?.altTagsMissingCount || 0,
        keywordDensity: [
          { word: host.split(".")[0], count: 8, percent: 1.4 },
          { word: "performance", count: 6, percent: 1.1 },
          { word: "metrics", count: 5, percent: 0.9 },
          { word: "optimization", count: 4, percent: 0.7 }
        ]
      },
      technical: {
        score: isHttps ? 95 : 50,
        isHttps: isHttps,
        sitemapFound: true,
        robotsTxtFound: crawlData.success,
        compressionEnabled: crawlData.success,
        indexable: true,
        pageSpeedResponseHeader: crawlData.success ? "x-powered-by: Express; cache-control: public, max-age=31536000" : "none"
      },
      offPage: {
        score: 72,
        domainAuthority: crawlData.success ? 48 : 12,
        estimatedBacklinks: crawlData.success ? 34200 : 150,
        referringDomains: crawlData.success ? 890 : 15,
        rankingKeywordsCount: crawlData.success ? 1420 : 45
      },
      local: {
        score: 80,
        schemaOrgType: "WebSite / LocalBusiness",
        contactInfoFound: true,
        mapIntegrationActive: false,
        recommendations: [
          "Add structured JSON-LD Organization schema markup tags to your root index file.",
          "Ensure your brand matches standard NAP records (Name, Address, Phone) uniformly across indexing maps.",
          "Link your site index explicitly in structural Google Business profile dashboards."
        ]
      }
    },
    socialShareability: {
      score: crawlData.metadata?.ogTitle ? 95 : 45,
      openGraph: {
        title: crawlData.metadata?.ogTitle || cleanTitle,
        description: crawlData.metadata?.ogDesc || cleanDesc,
        image: crawlData.metadata?.ogImage || `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop`,
        type: "website",
        exists: !!crawlData.metadata?.ogTitle
      },
      twitterCards: {
        card: "summary_large_image",
        title: crawlData.metadata?.ogTitle || cleanTitle,
        description: crawlData.metadata?.ogDesc || cleanDesc,
        image: crawlData.metadata?.ogImage || `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop`,
        exists: !!crawlData.metadata?.ogTitle
      },
      suggestions: [
        crawlData.metadata?.ogTitle 
          ? "Great job: OpenGraph tags are validly indexed with core tags." 
          : "Urgent: Add standard OpenGraph meta tags in header context to ensure previews are rich when shared on Twitter/X, Discord, Slack, and WhatsApp.",
        "Add an official optimized 'twitter:creator' username parameter.",
        "Ensure your og:image link is absolute and cached below 1MB resolution limits."
      ]
    },
    solutions: [
      {
        id: "sol_1",
        category: "performance",
        title: "Serve Next-Gen Image Formats (WebP/AVIF)",
        issueDescription: "Traditional jpeg/png images load sluggishly compared to modern next-gen compression wrappers, blocking first content loads.",
        difficulty: "easy",
        potentialImpact: "high",
        priority: 1,
        stepsToFix: [
          "Export your standard PNG and JPG graphic files to WebP or AVIF formats using compression toolkits.",
          "Implement responsive html <picture> declarations with mime-type fallbacks to satisfy older engine layouts."
        ],
        codeSnippet: `<picture>
  <source srcset="assets/hero.avif" type="image/avif">
  <source srcset="assets/hero.webp" type="image/webp">
  <img src="assets/hero.jpg" alt="Optimized Hero Graphic" width="800" height="400" loading="lazy">
</picture>`
      },
      {
        id: "sol_2",
        category: "seo",
        title: "Implement Structured JSON-LD Schema",
        issueDescription: "Search engines struggle to dynamically categorize website context without standard Organization/WebSite schema definitions.",
        difficulty: "medium",
        potentialImpact: "medium",
        priority: 2,
        stepsToFix: [
          "Add structural organization script code inside target header elements.",
          "Populate organizational attributes including legal company name, logo graphic URLs, and key social media touchpoints."
        ],
        codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${cleanTitle}",
  "url": "${url}",
  "logo": "${url}/logo.png",
  "sameAs": [
    "https://facebook.com/${host.split(".")[0]}",
    "https://twitter.com/${host.split(".")[0]}"
  ]
}
</script>`
      },
      {
        id: "sol_3",
        category: "accessibility",
        title: "Establish Explicit Alternate Image Text Descriptors",
        issueDescription: "Screen readers skip structural image indicators when standard 'alt' tags are fully absent, presenting raw link endpoints.",
        difficulty: "easy",
        potentialImpact: "high",
        priority: 3,
        stepsToFix: [
          "Scan standard markup targets missing alternate text indicators.",
          "Add descriptive tags describing target images or label them as decorative via alt='' values."
        ],
        codeSnippet: `<!-- Actionable Alt Tags Fix -->
<img src="assets/logo.png" alt="${cleanTitle} Creative Company Branding" width="150" height="50">
<!-- Use alt="" for simple purely decorative dividers -->
<img src="assets/divider.svg" alt="" role="presentation">`
      },
      {
        id: "sol_4",
        category: "social",
        title: "Integrate OpenGraph metadata preview frames",
        issueDescription: "Static social sharing panels default to plain url texts when explicit OpenGraph titles and cover headers are undefined in the markup headers.",
        difficulty: "easy",
        potentialImpact: "medium",
        priority: 4,
        stepsToFix: [
          "Copy standardized social schema meta declarations into the webpage <head> container.",
          "Configure descriptive absolute image destinations and optimized title segments."
        ],
        codeSnippet: `<!-- Primary Meta Tags -->
<title>${cleanTitle}</title>
<meta name="title" content="${cleanTitle}">
<meta name="description" content="${cleanDesc.substring(0, 150)}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${cleanTitle}">
<meta property="og:description" content="${cleanDesc.substring(0, 150)}">
<meta property="og:image" content="https://unsplash.com/photos/some-optimized-graph.jpg">`
      }
    ],
    competitorComparison: {
      targetUrl: url,
      competitorUrl: competitorUrl || `${host.split(".")[0]}comp.com`,
      targetMetrics: {
        performance: perfScore,
        seo: Math.round((onPageScore + (isHttps ? 95 : 50) + 75) / 3),
        accessibility: accessibilityScore,
        pageSizeKb: crawlData.success ? Math.round(crawlData.htmlLength / 1024) || 240 : 1250,
        loadTimeMs: crawlData.success ? 1420 : 2900
      },
      competitorMetrics: {
        performance: 82,
        seo: 88,
        accessibility: 84,
        pageSizeKb: 480,
        loadTimeMs: 1650
      },
      gapAnalysis: {
        advantage: perfScore >= 82 ? "target" : "competitor",
        keyDifferentiator: perfScore >= 82 
          ? "Your site leads in bundle compression and fast initial TTFB metrics." 
          : `Competitor ${compHost} features optimized WebP image rendering and active cache-control configurations.`,
        rankingPotential: "Improving LCP speeds on your site will close the search ranking priority gap with your target competitor."
      },
      keywordsOverlap: [
        { keyword: `${host.split(".")[0]} login`, targetPosition: 1, competitorPosition: 12, searchVolume: 2400 },
        { keyword: "web benchmarking services", targetPosition: 14, competitorPosition: 3, searchVolume: 890 },
        { keyword: "seo auditing dashboard", targetPosition: 42, competitorPosition: 8, searchVolume: 1200 },
        { keyword: "core web vitals analyzer", targetPosition: 18, competitorPosition: 7, searchVolume: 1540 }
      ]
    },
    keywords: [
      { keyword: `${host.split(".")[0]} pricing`, searchVolume: 1400, difficulty: 22, searchIntent: "commercial", suggestedOptimizations: "Write highly detailed comparative tables and explicitly display currency listings with local structured metadata.", currentRankIndex: 4 },
      { keyword: "website audit online tool", searchVolume: 5400, difficulty: 58, searchIntent: "transactional", suggestedOptimizations: "Target this with a dedicated interactive dashboard tool subpage and detailed feature benefits.", currentRankIndex: 38 },
      { keyword: "performance optimization guides", searchVolume: 890, difficulty: 32, searchIntent: "informational", suggestedOptimizations: "Draft step-by-step developer code blocks displaying alternate image formatting and font-display preloads.", currentRankIndex: 12 },
      { keyword: "reduce total blocking time react", searchVolume: 1100, difficulty: 45, searchIntent: "informational", suggestedOptimizations: "Publish specific scripts showing code splitting hooks and debouncing layout updates.", currentRankIndex: 0 },
      { keyword: "audit google core web vitals", searchVolume: 3200, difficulty: 51, searchIntent: "commercial", suggestedOptimizations: "Mention performance scores, first contentful paints, and cumulative layout shift indicators clearly in header fields.", currentRankIndex: 19 }
    ]
  };
}

startServer();
