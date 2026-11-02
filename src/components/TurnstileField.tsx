'use client'

import { useEffect, useRef } from 'react'

type TurnstileWidgetId = string

type TurnstileApi = {
    render: (
        container: HTMLElement,
        options: {
            sitekey: string
            action: string
            callback: (token: string) => void
            'error-callback'?: () => void
            'expired-callback'?: () => void
        },
    ) => TurnstileWidgetId
    reset: (widgetId: TurnstileWidgetId) => void
}

declare global {
    interface Window {
        turnstile?: TurnstileApi
    }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

export function turnstileEnabled() {
    return SITE_KEY.length > 0
}

/**
 * Explicit Turnstile widget. Call `onReset` after each submission so the
 * single-use token can be replaced.
 */
export function TurnstileField({
    action,
    onToken,
    resetSignal,
}: {
    action: 'generate' | 'story'
    onToken: (token: string) => void
    resetSignal: number
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetId = useRef<TurnstileWidgetId | null>(null)
    const onTokenRef = useRef(onToken)
    onTokenRef.current = onToken

    useEffect(() => {
        if (!SITE_KEY) return
        if (!document.querySelector('script[data-turnstile]')) {
            const script = document.createElement('script')
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
            script.async = true
            script.dataset.turnstile = '1'
            document.head.appendChild(script)
        }

        let cancelled = false
        const timer = window.setInterval(() => {
            if (cancelled || !containerRef.current || !window.turnstile || widgetId.current) return
            widgetId.current = window.turnstile.render(containerRef.current, {
                sitekey: SITE_KEY,
                action,
                callback: (token) => onTokenRef.current(token),
                'error-callback': () => onTokenRef.current(''),
                'expired-callback': () => onTokenRef.current(''),
            })
            window.clearInterval(timer)
        }, 200)

        return () => {
            cancelled = true
            window.clearInterval(timer)
        }
    }, [action])

    useEffect(() => {
        if (resetSignal === 0 || widgetId.current === null || !window.turnstile) return
        window.turnstile.reset(widgetId.current)
        onTokenRef.current('')
    }, [resetSignal])

    if (!SITE_KEY) return null

    return <div ref={containerRef} className="min-h-[65px]" />
}
