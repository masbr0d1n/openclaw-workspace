/**
 * Subscription Management Page - Videotron
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Crown, Zap, Star, TrendingUp, Monitor } from 'lucide-react';
import { SUBSCRIPTION_TIERS, SubscriptionPlan, planName, planPrice, getScreensUsagePercentage, getStorageUsagePercentage } from '@/lib/subscription';

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Mock current subscription data
  const currentSubscription = {
    plan: currentPlan,
    status: 'active' as const,
    currentScreens: 18,
    currentStorage: 45, // GB
    billingCycle: billingCycle,
    renewsAt: new Date('2026-03-27'),
  };

  const screensUsage = getScreensUsagePercentage(currentSubscription);
  const storageUsage = getStorageUsagePercentage(currentSubscription);

  const handleUpgrade = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    // In real app, this would call an API to upgrade
  };

  const handleDowngrade = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    // In real app, this would call an API to downgrade
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current Plan Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Current Plan: {planName(currentPlan)}
          </CardTitle>
          <CardDescription>
            Your subscription is {currentSubscription.status}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Screens Usage</p>
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl font-bold">{currentSubscription.currentScreens}</span>
                  <span className="text-sm text-gray-500">
                    {SUBSCRIPTION_TIERS.find(t => t.plan === currentPlan)?.screens === 'unlimited'
                      ? 'Unlimited'
                      : `/ ${SUBSCRIPTION_TIERS.find(t => t.plan === currentPlan)?.screens}`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${screensUsage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{screensUsage}% used</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Storage Usage</p>
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl font-bold">{currentSubscription.currentStorage} GB</span>
                  <span className="text-sm text-gray-500">
                    / {SUBSCRIPTION_TIERS.find(t => t.plan === currentPlan)?.storage}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${storageUsage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{storageUsage}% used</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Billing</p>
              <div className="mt-2">
                <p className="text-2xl font-bold">
                  {planPrice(currentPlan, billingCycle)}/{billingCycle === 'monthly' ? 'mo' : 'yr'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Renews on {currentSubscription.renewsAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Cycle Toggle */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'font-bold' : ''}`}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${
                billingCycle === 'yearly' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'font-bold' : ''}`}>Yearly</span>
            <Badge variant="secondary" className="ml-2">Save 20%</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const isCurrentPlan = tier.plan === currentPlan;
          const Icon = tier.plan === 'basic' ? Zap : tier.plan === 'pro' ? Star : Crown;

          return (
            <Card
              key={tier.plan}
              className={`relative ${isCurrentPlan ? 'border-blue-500 border-2' : ''} ${
                tier.popular ? 'border-purple-500' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500">Most Popular</Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-blue-500" />
                    <CardTitle>{tier.name}</CardTitle>
                  </div>
                  {isCurrentPlan && <Badge variant="default">Current</Badge>}
                </div>
                <CardDescription>{tier.features[0]}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      {tier.price === 'custom' ? 'Custom' : `$${tier.price}`}
                    </span>
                    {tier.price !== 'custom' && (
                      <span className="text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && tier.price !== 'custom' && (
                    <p className="text-sm text-gray-500 mt-1">
                      Billed ${tier.price * 12} yearly (save 20%)
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {tier.screens === 'unlimited' ? 'Unlimited' : tier.screens} screens
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{tier.storage} storage</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={isCurrentPlan ? 'outline' : 'default'}
                  disabled={isCurrentPlan}
                  onClick={() => {
                    if (!isCurrentPlan) {
                      if (SUBSCRIPTION_TIERS.findIndex(t => t.plan === tier.plan) >
                          SUBSCRIPTION_TIERS.findIndex(t => t.plan === currentPlan)) {
                        handleUpgrade(tier.plan);
                      } else {
                        handleDowngrade(tier.plan);
                      }
                    }
                  }}
                >
                  {isCurrentPlan
                    ? 'Current Plan'
                    : SUBSCRIPTION_TIERS.findIndex(t => t.plan === tier.plan) >
                        SUBSCRIPTION_TIERS.findIndex(t => t.plan === currentPlan)
                    ? 'Upgrade'
                    : 'Downgrade'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>Compare all plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">Basic</th>
                  <th className="text-center py-3 px-4">Pro</th>
                  <th className="text-center py-3 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Screens</td>
                  <td className="text-center py-3 px-4">5</td>
                  <td className="text-center py-3 px-4">25</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Storage</td>
                  <td className="text-center py-3 px-4">10 GB</td>
                  <td className="text-center py-3 px-4">100 GB</td>
                  <td className="text-center py-3 px-4">Custom</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Analytics</td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">API Access</td>
                  <td className="text-center py-3 px-4">
                    <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">White-label</td>
                  <td className="text-center py-3 px-4">
                    <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
