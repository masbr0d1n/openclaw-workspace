/**
 * Subscription View Page
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Calendar, CheckCircle, XCircle, AlertCircle, DollarSign, Package, Users } from 'lucide-react';
import Link from 'next/link';

interface Subscription {
  id: number;
  plan: 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'trial' | 'expired' | 'suspended';
  startDate: string;
  endDate: string;
  screens: number;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
}

export default function SubscriptionViewPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = parseInt(params.id as string);

  const [subscription, setSubscription] = useState<Subscription>({
    id: 1,
    plan: 'professional',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2026-12-31',
    screens: 90,
    price: 2500000,
    billingCycle: 'monthly',
    features: [
      'Up to 100 screens',
      'Unlimited sub-tenants',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'API access',
    ],
  });

  const [usage, setUsage] = useState({
    totalScreens: 90,
    totalSubTenants: 3,
    totalDevices: 95,
    activeLocations: 2,
  });

  const daysRemaining = Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-gray-500';
      case 'professional': return 'bg-blue-500';
      case 'enterprise': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (subscription.status) {
      case 'active': return CheckCircle;
      case 'trial': return AlertCircle;
      case 'expired': return XCircle;
      case 'suspended': return XCircle;
      default: return AlertCircle;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/tenant/${tenantId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Subscription Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage subscription and billing
          </p>
        </div>
      </div>

      {/* Current Plan */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg ${getPlanColor(subscription.plan)} flex items-center justify-center text-white`}>
              <Package className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold capitalize">{subscription.plan} Plan</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current subscription</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusIcon className={`h-4 w-4 ${
                  subscription.status === 'active' ? 'text-green-500' :
                  subscription.status === 'trial' ? 'text-yellow-500' :
                  'text-red-500'
                }`} />
                <Badge variant={
                  subscription.status === 'active' ? 'default' :
                  subscription.status === 'trial' ? 'secondary' :
                  'destructive'
                } className="capitalize">
                  {subscription.status}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <div className="flex items-center gap-1 mt-1">
                <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-lg font-semibold">
                  {subscription.price.toLocaleString('id-ID')}
                </span>
                <span className="text-sm text-gray-500">/{subscription.billingCycle}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Period</p>
              <p className="text-sm font-semibold mt-1">
                {new Date(subscription.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(subscription.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time Remaining</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-lg font-semibold">{daysRemaining} days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Features & Usage */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan Features */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Features</CardTitle>
              <CardDescription>Included with your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subscription.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Current Usage</CardTitle>
              <CardDescription>Resource utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Screens Used</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {usage.totalScreens} / {subscription.screens}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (usage.totalScreens / subscription.screens) > 0.9 ? 'bg-red-500' :
                        (usage.totalScreens / subscription.screens) > 0.7 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((usage.totalScreens / subscription.screens) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-2xl font-bold">{usage.totalSubTenants}</span>
                    </div>
                    <p className="text-xs text-gray-500">Sub-tenants</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-2xl font-bold">{usage.totalDevices}</span>
                    </div>
                    <p className="text-xs text-gray-500">Devices</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-2xl font-bold">{usage.activeLocations}</span>
                    </div>
                    <p className="text-xs text-gray-500">Active Locations</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: 'Feb 2026', amount: 2500000, status: 'paid' },
                  { date: 'Jan 2026', amount: 2500000, status: 'paid' },
                  { date: 'Dec 2025', amount: 2500000, status: 'paid' },
                  { date: 'Nov 2025', amount: 2500000, status: 'paid' },
                  { date: 'Oct 2025', amount: 2500000, status: 'paid' },
                ].map((bill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{bill.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">Rp {bill.amount.toLocaleString('id-ID')}</span>
                      <Badge variant={bill.status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                        {bill.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Update Payment Method
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Change Plan
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Billing Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                View Invoices
              </Button>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Contact our support team for assistance with your subscription.
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
              <Button variant="ghost" className="w-full">
                View Documentation
              </Button>
            </CardContent>
          </Card>

          {/* Next Billing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Next Billing Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">Mar 1, 2026</p>
                  <p className="text-xs text-gray-500 mt-1">Auto-renewal enabled</p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
