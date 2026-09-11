import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/supabase/server';
import { LandingHero } from '@/components/marketing/LandingHero';
import { WhatItReplaces } from '@/components/marketing/WhatItReplaces';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { FeedbackSample } from '@/components/marketing/FeedbackSample';
import { PostingTerms } from '@/components/marketing/PostingTerms';
import { ClosingCta } from '@/components/marketing/ClosingCta';
import { LandingFooter } from '@/components/marketing/LandingFooter';

export const metadata: Metadata = {
  title: { absolute: 'Resume Feed' },
  description:
    'Post your resume to a public feed and get rated, marked up, and argued with by people in your field. Free, and reciprocal: post one, review one back.',
};

/**
 * Public on purpose, signed in or not — this is the page people are sent when
 * someone recommends the product, and a signed-in visitor still needs to read
 * the pitch to know what to tell them.
 */
export default async function LandingPage() {
  const user = await getCurrentUser();
  const signedIn = Boolean(user);

  return (
    <main className="flex-1">
      <LandingHero signedIn={signedIn} />
      <WhatItReplaces />
      <HowItWorks />
      <FeedbackSample />
      <PostingTerms />
      <ClosingCta signedIn={signedIn} />
      <LandingFooter signedIn={signedIn} />
    </main>
  );
}
