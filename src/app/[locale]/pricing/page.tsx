'use client'

import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Zap } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export default function PricingPage() {
    const t = useTranslations('PricingPage')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubscribe = async () => {
        alert("Pro plan is coming soon!");
        // setLoading(true)
        // try {
        //     const { data: { user } } = await supabase.auth.getUser()
        // 
        //     if (!user) {
        //         router.push('/login?next=/pricing')
        //         return
        //     }
        // 
        //     const response = await fetch('/api/stripe/checkout', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({
        //             priceId: 'price_1Q...', // TODO: Replace with actual Stripe Price ID
        //         }),
        //     })
        // 
        //     const { url } = await response.json()
        //     window.location.href = url
        // } catch (error) {
        //     console.error(error)
        //     alert('Something went wrong. Please try again.')
        // } finally {
        //     setLoading(false)
        // }
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />

            <main className="container mx-auto px-4 py-20">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-gray-600">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    {/* Free Plan */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('freeTitle')}</h3>
                        <div className="text-4xl font-extrabold text-gray-900 mb-6">
                            {t('freePrice')} <span className="text-lg font-normal text-gray-500">{t('perMo')}</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center text-gray-600">
                                <Check className="w-5 h-5 text-green-500 mr-3" />
                                {t('freeFeature1')}
                            </li>
                            <li className="flex items-center text-gray-600">
                                <Check className="w-5 h-5 text-green-500 mr-3" />
                                {t('freeFeature2')}
                            </li>
                            <li className="flex items-center text-gray-600">
                                <Check className="w-5 h-5 text-green-500 mr-3" />
                                {t('freeFeature3')}
                            </li>
                        </ul>
                        <Button variant="outline" className="w-full h-12 text-lg" disabled>
                            {t('currentPlan')}
                        </Button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            {t('popular')}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                            {t('proTitle')} <Sparkles className="w-5 h-5 text-yellow-400" />
                        </h3>
                        <div className="text-4xl font-extrabold text-white mb-6">
                            {t('proPrice')} <span className="text-lg font-normal text-gray-400">{t('perMo')}</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center text-gray-300">
                                <Check className="w-5 h-5 text-blue-400 mr-3" />
                                <span className="font-bold text-white">{t('proFeature1Bold')}</span> {t('proFeature1').replace(t('proFeature1Bold'), '').trim()}
                            </li>
                            <li className="flex items-center text-gray-300">
                                <Check className="w-5 h-5 text-blue-400 mr-3" />
                                {t('proFeature2')}
                            </li>
                            <li className="flex items-center text-gray-300">
                                <Check className="w-5 h-5 text-blue-400 mr-3" />
                                {t('proFeature3')}
                            </li>
                            <li className="flex items-center text-gray-300">
                                <Check className="w-5 h-5 text-blue-400 mr-3" />
                                {t('proFeature4')}
                            </li>
                        </ul>
                        <Button
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-none text-white"
                        >
                            {loading ? t('processing') : t('upgradeBtn')} <Zap className="w-4 h-4 ml-2 fill-current" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}
