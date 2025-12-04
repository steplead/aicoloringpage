'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isIOS, setIsIOS] = useState(false)

    useEffect(() => {
        // Check if iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        if (isStandalone) return;

        // Android / Desktop install prompt
        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        // Show iOS prompt after a delay if not installed
        if (isIosDevice) {
            setTimeout(() => setShowPrompt(true), 3000)
        }

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
                setDeferredPrompt(null)
            }
        }
        setShowPrompt(false)
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white p-4 rounded-xl shadow-2xl border border-purple-100 z-50 animate-in slide-in-from-bottom-10">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Install AI Coloring</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        {isIOS
                            ? "Tap the Share button and select 'Add to Home Screen' for the best experience."
                            : "Install our app for a better full-screen experience and offline access."}
                    </p>
                    {!isIOS && (
                        <Button onClick={handleInstall} className="w-full bg-purple-600 hover:bg-purple-700">
                            <Download className="w-4 h-4 mr-2" />
                            Install App
                        </Button>
                    )}
                </div>
                <button
                    onClick={() => setShowPrompt(false)}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
