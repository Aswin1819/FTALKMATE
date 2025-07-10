import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import Header from "../../components/index/Header";
import { toast } from '../../hooks/use-toast';
import axiosInstance from '../../features/auth/axiosInstance';

const BASE_PLAN = {
  id: 'base',
  name: 'Free Plan',
  price: 0,
  duration_days: null,
  features: [
    'Join up to 5 language rooms per day',
    'Audio-only conversations',
    'Basic language learning tools',
    { disabled: true, text: 'Video calling capability' },
    { disabled: true, text: 'Advanced learning analytics' },
    { disabled: true, text: 'Create unlimited custom rooms' },
  ],
};

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [user, setUser] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Fetch plans and user subscription
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axiosInstance.get('/subscription/');
        setPlans(res.data || []);
      } catch {
        toast({ title: 'Error', description: 'Failed to fetch plans', variant: 'destructive' });
      }
    };
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get('/current-user/');
        setUser(res.data.user);
      } catch {
        setUser(null);
      }
    };
    const fetchUserSubscription = async () => {
      try {
        const res = await axiosInstance.get('/profile/');
        setUserSubscription(res.data.profile?.subscription || null);
      } catch {
        setUserSubscription(null);
      }
    };
    fetchPlans();
    fetchUser();
    fetchUserSubscription();
    setLoading(false);
  }, []);

  // Helper: get plan features as array
  const getFeatures = (plan) => {
    if (!plan) return [];
    if (Array.isArray(plan.features)) return plan.features;
    if (typeof plan.features === 'string') {
      return plan.features.split(/\r?\n|,/).map(f => f.trim()).filter(Boolean);
    }
    return [];
  };

  // Helper: get current plan for user
  const getCurrentPlan = () => {
    if (!user) return null;
    if (!userSubscription || !userSubscription.plan) return BASE_PLAN;
    return {
      ...userSubscription.plan,
      features: getFeatures(userSubscription.plan),
      price: userSubscription.plan.price || 0,
      name: userSubscription.plan.name,
      id: userSubscription.plan.id,
    };
  };

  // Razorpay integration
  const handleUpgrade = async (plan) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to upgrade.', variant: 'destructive' });
      return;
    }
    setPaymentLoading(true);
    try {
      // 1. Create order from backend
      const orderRes = await axiosInstance.post('/payment/create-order/', { plan_id: plan.id });
      const { order_id, amount, key, currency, plan_id } = orderRes.data;

      // 2. Open Razorpay checkout
      const options = {
        key,
        amount,
        currency,
        name: 'TalkMate',
        description: plan.name,
        order_id,
        handler: async function (response) {
          // 3. Verify payment with backend
          try {
            await axiosInstance.post('/payment/verify/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plain_id: plan_id,
            });
            toast({ title: 'Success', description: 'Subscription activated!' });
            window.location.reload();
          } catch {
            toast({ title: 'Payment Failed', description: 'Could not verify payment.', variant: 'destructive' });
          }
        },
        prefill: {
          name: user.username,
          email: user.email,
        },
        theme: {
          color: "#9b87f5",
        },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast({ title: 'Error', description: 'Payment initiation failed.', variant: 'destructive' });
    }
    setPaymentLoading(false);
  };

  // Load Razorpay script
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // UI: Plan Card
  const PlanCard = ({ plan, isCurrent, onUpgrade }) => (
    <Card className={`transition-all ${isCurrent ? 'border-2 border-neon-purple/80 shadow-neon-purple/30' : 'border-white/10'} bg-[#1A0E29]/40 backdrop-blur-md shadow-lg text-white relative`}>
      {isCurrent && (
        <Badge className="absolute top-4 right-4 bg-neon-purple text-white z-10">Current Plan</Badge>
      )}
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription className="text-gray-400">
          {plan.price === 0 ? '₹0 / month' : `₹${plan.price} / month`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-3">
          {getFeatures(plan).map((feature, idx) =>
            typeof feature === 'object' && feature.disabled ? (
              <li key={idx} className="flex items-start">
                <X className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-500">{feature.text}</span>
              </li>
            ) : (
              <li key={idx} className="flex items-start">
                <Check className={`h-5 w-5 ${isCurrent ? 'text-neon-purple' : 'text-green-400'} mr-3 flex-shrink-0 mt-0.5`} />
                <span>{typeof feature === 'string' ? feature : feature.text}</span>
              </li>
            )
          )}
        </ul>
      </CardContent>
      <CardFooter>
        {isCurrent ? (
          <Button disabled className="w-full bg-neon-purple/70">
            Current Plan
          </Button>
        ) : (
          <Button
            onClick={() => onUpgrade(plan)}
            loading={paymentLoading && selectedPlan?.id === plan.id}
            className="w-full bg-neon-purple hover:bg-neon-purple/90 hover:glow-purple"
          >
            Upgrade Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  // UI: Current Plan Section
  const currentPlan = getCurrentPlan();

  return (
    <div className="min-h-screen bg-[#13071D]">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Subscription Plans</h1>
          <p className="text-gray-400 mb-8">Choose the best plan for your language journey.</p>

          {/* Current Plan */}
          {user && currentPlan && (
            <Card className="mb-8 bg-[#1A0E29]/60 border-neon-purple/40 backdrop-blur-md shadow-lg text-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#1A0E29] to-[#1A0E29]/80">
                <CardTitle className="flex items-center justify-between">
                  <span>Your Current Plan</span>
                  <Badge className="bg-neon-purple text-white">
                    {currentPlan.name}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {currentPlan.price === 0
                    ? 'You are on the Free plan. Upgrade to unlock more features!'
                    : 'You have access to all premium features.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {getFeatures(currentPlan).map((feature, idx) =>
                    typeof feature === 'object' && feature.disabled ? (
                      <li key={idx} className="flex items-start">
                        <X className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500">{feature.text}</span>
                      </li>
                    ) : (
                      <li key={idx} className="flex items-start">
                        <Check className="h-5 w-5 text-neon-purple mr-3 flex-shrink-0 mt-0.5" />
                        <span>{typeof feature === 'string' ? feature : feature.text}</span>
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Plan Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <PlanCard
              plan={BASE_PLAN}
              isCurrent={user && (!userSubscription || !userSubscription.plan)}
              onUpgrade={() => {}} // No upgrade for base plan
            />
            {plans
              .filter(plan => plan.price > 0)
              .map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={userSubscription && userSubscription.plan && userSubscription.plan.id === plan.id}
                  onUpgrade={(p) => {
                    setSelectedPlan(p);
                    handleUpgrade(p);
                  }}
                />
              ))}
          </div>

          {/* FAQ */}
          <h2 className="text-2xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full mb-12">
            <AccordionItem value="item-1" className="bg-[#1A0E29]/40 border-white/10 rounded-lg mb-4">
              <AccordionTrigger className="px-4 text-white">How do I cancel my subscription?</AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-gray-400">
                You can cancel your subscription at any time through your account settings. Your Premium features will remain active until the end of your current billing period.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="bg-[#1A0E29]/40 border-white/10 rounded-lg mb-4">
              <AccordionTrigger className="px-4 text-white">Are there any discounts for annual subscriptions?</AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-gray-400">
                Yes! You can save 20% by choosing our annual subscription plan instead of the monthly plan. This option is available during checkout.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="bg-[#1A0E29]/40 border-white/10 rounded-lg mb-4">
              <AccordionTrigger className="px-4 text-white">Can I try Premium features before subscribing?</AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-gray-400">
                We offer a 7-day free trial of our Premium plan for all new users. You can cancel anytime during the trial period and won't be charged.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="bg-[#1A0E29]/40 border-white/10 rounded-lg">
              <AccordionTrigger className="px-4 text-white">What payment methods do you accept?</AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-gray-400">
                We accept all major credit and debit cards including Visa, Mastercard, American Express, and Discover. We also support PayPal payments.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </div>
  );
};

export default Subscription;
