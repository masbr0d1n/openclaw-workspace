/**
 * Subscription Model for Videotron
 */

export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise';

export interface SubscriptionTier {
  plan: SubscriptionPlan;
  name: string;
  screens: number | 'unlimited';
  storage: string;
  price: number | 'custom';
  currency: string;
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    plan: 'basic',
    name: 'Basic',
    screens: 5,
    storage: '10GB',
    price: 29,
    currency: 'USD',
    features: [
      'Up to 5 screens',
      '10GB storage',
      'Basic analytics',
      'Email support',
      'Standard content delivery',
    ],
  },
  {
    plan: 'pro',
    name: 'Pro',
    screens: 25,
    storage: '100GB',
    price: 99,
    currency: 'USD',
    features: [
      'Up to 25 screens',
      '100GB storage',
      'Advanced analytics',
      'Priority support',
      'HD content delivery',
      'API access',
    ],
    popular: true,
  },
  {
    plan: 'enterprise',
    name: 'Enterprise',
    screens: 'unlimited',
    storage: 'Custom',
    price: 'custom' as any,
    currency: 'USD',
    features: [
      'Unlimited screens',
      'Custom storage',
      'White-label solution',
      'Dedicated support',
      '4K content delivery',
      'Advanced API access',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
];

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: 'active' | 'inactive' | 'trialing' | 'past_due' | 'cancelled';
  currentScreens: number;
  currentStorage: number; // in GB
  billingCycle: 'monthly' | 'yearly';
  trialEndsAt?: Date;
  renewsAt?: Date;
  cancelledAt?: Date;
}

export function canAddScreens(subscription: UserSubscription, screensToAdd: number): boolean {
  const tier = SUBSCRIPTION_TIERS.find(t => t.plan === subscription.plan);
  if (!tier) return false;

  if (tier.screens === 'unlimited') return true;
  return subscription.currentScreens + screensToAdd <= tier.screens;
}

export function canUploadContent(subscription: UserSubscription, fileSizeGB: number): boolean {
  const tier = SUBSCRIPTION_TIERS.find(t => t.plan === subscription.plan);
  if (!tier) return false;

  const storageLimit = parseInt(tier.storage) || 0;
  return subscription.currentStorage + fileSizeGB <= storageLimit;
}

export function getStorageUsagePercentage(subscription: UserSubscription): number {
  const tier = SUBSCRIPTION_TIERS.find(t => t.plan === subscription.plan);
  if (!tier) return 0;

  const storageLimit = parseInt(tier.storage) || 0;
  if (storageLimit === 0) return 0;

  return Math.round((subscription.currentStorage / storageLimit) * 100);
}

export function getScreensUsagePercentage(subscription: UserSubscription): number {
  const tier = SUBSCRIPTION_TIERS.find(t => t.plan === subscription.plan);
  if (!tier) return 0;

  if (tier.screens === 'unlimited') return 0;

  return Math.round((subscription.currentScreens / tier.screens) * 100);
}

export function planName(plan: SubscriptionPlan): string {
  const tier = SUBSCRIPTION_TIERS.find(t => t.plan === plan);
  return tier?.name || plan;
}

export function planPrice(plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly' = 'monthly'): string {
  const tier = SUBSCRIPTION_TIERS.find(t => t.plan === plan);
  if (!tier) return '-';

  if (tier.price === 'custom') return 'Custom';

  const price = billingCycle === 'yearly' ? (tier.price as number) * 0.8 : tier.price;
  return `$${Math.round(price)}`;
}
