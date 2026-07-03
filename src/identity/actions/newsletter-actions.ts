// src/identity/actions/newsletter-actions.ts — Newsletter + Waitlist server actions.
// Sprint 13 Phase 7, 9 — Newsletter and waitlist with Supabase persistence.

'use server';

import { createSupabaseServerClient } from '@/identity/lib/supabase-server';
import { isSupabaseConfigured } from '@/shared/config/env';

export interface NewsletterResult {
  success: boolean;
  error?: string;
}

/**
 * Subscribe to newsletter. Works with or without Supabase.
 */
export async function subscribeNewsletter(input: {
  email: string;
  country?: string;
  source?: string;
  tool?: string;
}): Promise<NewsletterResult> {
  const email = input.email.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!isSupabaseConfigured()) {
    // Store locally — the client will handle localStorage
    return { success: true };
  }

  const client = await createSupabaseServerClient();
  if (!client) return { success: true };

  const { error } = await client.from('newsletter_subscribers').upsert({
    email,
    country: input.country ?? null,
    source: input.source ?? 'website',
    tool: input.tool ?? null,
  }, { onConflict: 'email' });

  if (error) {
    return { success: false, error: 'Could not subscribe. Please try again.' };
  }

  return { success: true };
}

/**
 * Unsubscribe from newsletter.
 */
export async function unsubscribeNewsletter(email: string): Promise<NewsletterResult> {
  if (!isSupabaseConfigured()) return { success: true };

  const client = await createSupabaseServerClient();
  if (!client) return { success: true };

  const { error } = await client.from('newsletter_subscribers')
    .update({ unsubscribed: true })
    .eq('email', email.toLowerCase().trim());

  if (error) return { success: false, error: 'Could not unsubscribe.' };
  return { success: true };
}

/**
 * Join the premium waitlist.
 */
export async function joinWaitlist(input: {
  email: string;
  company?: string;
  requestedFeature?: string;
  tool?: string;
}): Promise<NewsletterResult> {
  const email = input.email.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!isSupabaseConfigured()) return { success: true };

  const client = await createSupabaseServerClient();
  if (!client) return { success: true };

  const { error } = await client.from('waitlist').upsert({
    email,
    company: input.company ?? null,
    requested_feature: input.requestedFeature ?? null,
    tool: input.tool ?? null,
  }, { onConflict: 'email' });

  if (error) return { success: false, error: 'Could not join waitlist.' };
  return { success: true };
}

/**
 * Submit feedback (from feedback widget).
 */
export async function submitFeedback(input: {
  toolSlug: string;
  rating: 'helpful' | 'not-helpful';
  comment?: string;
  browser?: string;
  country?: string;
}): Promise<NewsletterResult> {
  if (!input.toolSlug || !input.rating) {
    return { success: false, error: 'Missing feedback data.' };
  }

  if (!isSupabaseConfigured()) return { success: true };

  const client = await createSupabaseServerClient();
  if (!client) return { success: true };

  const { error } = await client.from('feedback').insert({
    tool_slug: input.toolSlug,
    rating: input.rating,
    comment: input.comment ?? null,
    browser: input.browser ?? null,
    country: input.country ?? null,
  });

  if (error) return { success: false, error: 'Could not submit feedback.' };
  return { success: true };
}
