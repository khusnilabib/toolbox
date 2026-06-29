// src/app/page.tsx — Premium landing page (Sprint UI 2.0).

import { organizationJsonLd, websiteJsonLd } from '@/shared/lib/json-ld';
import { HomeHero } from '@/shared/components/home/home-hero';
import { AnimatedStats } from '@/shared/components/home/animated-stats';
import { TrustedBy } from '@/shared/components/home/trusted-by';
import { FeaturedTools } from '@/shared/components/home/featured-tools';
import { PopularCategories } from '@/shared/components/home/popular-categories';
import { WhyChooseUs } from '@/shared/components/home/why-choose-us';
import { HowItWorks } from '@/shared/components/home/how-it-works';
import { ToolCollections } from '@/shared/components/home/tool-collections';
import { CategoryExplorer } from '@/shared/components/home/category-explorer';
import { TrendingTools } from '@/shared/components/home/trending-tools';
import { RecentlyAdded } from '@/shared/components/home/recently-added';
import { PopularSearches } from '@/shared/components/home/popular-searches';
import { ComparisonTable } from '@/shared/components/home/comparison-table';
import { Testimonials } from '@/shared/components/home/testimonials';
import { FaqSection } from '@/shared/components/home/faq-section';
import { Newsletter } from '@/shared/components/home/newsletter';

export default function HomePage() {
  const orgLd = organizationJsonLd();
  const siteLd = websiteJsonLd();

  return (
    <>
      {/* JSON-LD: Organization + WebSite with SearchAction */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }}
      />

      {/* 1. Hero with headline, subheadline, CTA, quick search */}
      <HomeHero />

      {/* 2. Animated statistics */}
      <AnimatedStats />

      {/* 3. Trusted by */}
      <TrustedBy />

      {/* 4. Featured Tools */}
      <FeaturedTools />

      {/* 5. Popular Categories */}
      <PopularCategories />

      {/* 6. Why Choose Us */}
      <WhyChooseUs />

      {/* 7. How It Works */}
      <HowItWorks />

      {/* 8. Tool Collections */}
      <ToolCollections />

      {/* 9. Category Explorer */}
      <CategoryExplorer />

      {/* 10. Trending Tools */}
      <TrendingTools />

      {/* 11. Recently Added */}
      <RecentlyAdded />

      {/* 12. Popular Searches */}
      <PopularSearches />

      {/* 13. Comparison Table */}
      <ComparisonTable />

      {/* 14. Testimonials */}
      <Testimonials />

      {/* 15. FAQ */}
      <FaqSection />

      {/* 16. Newsletter */}
      <Newsletter />

      {/* 17. Footer (rendered by root layout) */}
    </>
  );
}
