import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import Header from '../../components/index/Header';
import { toast } from '../../hooks/use-toast';
import axiosInstance from '../../features/auth/axiosInstance';

const Subscription = () => {
    const [plans, setPlans] = useState([]);
    const [user, setUser] = useState(null);
    const [userSubscription, setUserSubscription] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

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
                const profileSub = res.data.subscription;
                setUserSubscription(profileSub || null);
            } catch {
                setUserSubscription(null);
            }
        };
        const fetchHistory = async () => {
            try {
                const res = await axiosInstance.get('/subscription-history/');
                setHistory(res.data || []);
            } catch {
                setHistory([]);
            }
        };
        fetchPlans();
        fetchUser();
        fetchUserSubscription();
        fetchHistory();
        setLoading(false);
    }, []);

    const getFeatures = (plan) => {
        if (!plan || !plan.features) return [];
        if (typeof plan.features === 'string') {
            return plan.features
                .split(',')
                .map(f => f.trim())
                .filter(Boolean)
                .map(f => {
                    if (f.toLowerCase().includes('(disabled)')) {
                        return { text: f.replace('(disabled)', '').trim(), disabled: true };
                    }
                    return { text: f, disabled: false };
                });
        }
        return [];
    };

    const getCurrentPlan = () => {
        if (!userSubscription || !userSubscription.plan) return null;
        return {
            ...userSubscription.plan,
            id: parseInt(userSubscription.plan.id),
            features: getFeatures(userSubscription.plan),
            price: parseFloat(userSubscription.plan.price),
            name: userSubscription.plan.name,
        };
    };

    const handleUpgrade = async (plan) => {
        if (!user) {
            toast({ title: 'Sign in required', description: 'Please sign in to upgrade.', variant: 'destructive' });
            return;
        }
        setPaymentLoading(true);
        try {
            const orderRes = await axiosInstance.post('/payment/create-order/', { plan_id: plan.id });
            const { order_id, amount, key, currency, plan_id } = orderRes.data;

            const options = {
                key,
                amount,
                currency,
                name: 'TalkMate',
                description: plan.name,
                order_id,
                handler: async function (response) {
                    try {
                        await axiosInstance.post('/payment/verify/', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan_id: plan_id,
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
                    color: '#9b87f5',
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

    useEffect(() => {
        if (!window.Razorpay) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const PlanCard = ({ plan, isCurrent, canUpgrade, onUpgrade }) => (
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
                    {getFeatures(plan).map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                            {feature.disabled ? (
                                <X className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                            ) : (
                                <Check className={`h-5 w-5 ${isCurrent ? 'text-neon-purple' : 'text-green-400'} mr-3 flex-shrink-0 mt-0.5`} />
                            )}
                            <span className={feature.disabled ? 'text-gray-500' : ''}>{feature.text}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                {isCurrent ? (
                    <Button disabled className="w-full bg-neon-purple/70">
                        Current Plan
                    </Button>
                ) : canUpgrade ? (
                    <Button
                        onClick={() => onUpgrade(plan)}
                        loading={paymentLoading && selectedPlan?.id === plan.id}
                        className="w-full bg-neon-purple hover:bg-neon-purple/90 hover:glow-purple"
                    >
                        Upgrade Now
                    </Button>
                ) : (
                    <Button disabled className="w-full bg-gray-700 cursor-not-allowed">
                        Not Available
                    </Button>
                )}
            </CardFooter>

        </Card>
    );

    const currentPlan = getCurrentPlan();

    return (
        <div className="min-h-screen bg-[#13071D]">
            <Header />
            <main className="container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Subscription Plans</h1>
                    <p className="text-gray-400 mb-8">Choose the best plan for your language journey.</p>

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
                                    {getFeatures(currentPlan).map((feature, idx) => (
                                        <li key={idx} className="flex items-start">
                                            {feature.disabled ? (
                                                <X className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <Check className="h-5 w-5 text-neon-purple mr-3 flex-shrink-0 mt-0.5" />
                                            )}
                                            <span className={feature.disabled ? 'text-gray-500' : ''}>{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {plans.map(plan => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                isCurrent={parseInt(userSubscription?.plan?.id) === parseInt(plan.id)}
                                canUpgrade={parseFloat(plan.price) > parseFloat(currentPlan?.price || 0)}
                                onUpgrade={(p) => {
                                    if (parseFloat(plan.price) > parseFloat(currentPlan?.price || 0)) {
                                        setSelectedPlan(p);
                                        handleUpgrade(p);
                                    }
                                }}
                            />

                        ))}
                    </div>

                    {/* Subscription History */}
                    {history.length > 0 && (
                        <div className="text-white mt-12">
                            <h2 className="text-2xl font-semibold mb-4">Subscription History</h2>
                            <ul className="space-y-3">
                                {history.map((entry, idx) => {
                                    const startDate = new Date(entry.start_date);
                                    const endDate = new Date(entry.end_date);

                                    const formatDate = (date) => {
                                        const day = String(date.getDate()).padStart(2, '0');
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const year = date.getFullYear();
                                        return `${day}/${month}/${year}`;
                                    };

    

                                    return (
                                        <li
                                            key={idx}
                                            className="bg-[#1A0E29]/60 p-4 rounded-md border border-white/10"
                                        >
                                            <div>
                                                <strong>Plan:</strong> {entry.plan.name}
                                            </div>
                                            <div>
                                                <strong>Price:</strong> ₹{entry.plan.price}
                                            </div>
                                            <div>
                                                <strong>Start:</strong> {formatDate(startDate)}
                                            </div>
                                            <div>
                                                <strong>End:</strong> {formatDate(endDate)}
                                            </div>
                                
                                        </li>
                                    );
                                })}
                            </ul>

                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Subscription;
