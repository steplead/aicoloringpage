'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Copy, Check, Code2, Link2 } from 'lucide-react'

interface ShareEmbedButtonProps {
    imageUrl: string
    title: string
    pageUrl: string
}

/**
 * Share/Embed Image Button
 *
 * 100% Client-Side Component - No API calls, no server computation
 *
 * Provides bloggers with:
 * 1. Direct image embed code with source attribution
 * 2. Copy-able HTML snippet
 * 3. Proper link attribution for SEO
 */
export function ShareEmbedButton({ imageUrl, title, pageUrl }: ShareEmbedButtonProps) {
    const t = useTranslations('PrintablePage.share')
    const [copiedEmbed, setCopiedEmbed] = useState(false)
    const [copiedLink, setCopiedLink] = useState(false)

    // Generate embed code (100% client-side, no API calls)
    const generateEmbedCode = () => {
        return `<a href="${pageUrl}" target="_blank" rel="noopener" title="${title} - AI Coloring Page">
  <img src="${imageUrl}" alt="${title}" style="max-width:100%; height:auto; border:1px solid #e5e7eb; border-radius:8px;" />
  <br/>
  <small style="color:#6b7280;">${t('source')}: <a href="${pageUrl}">ai-coloringpage.com</a></small>
</a>`
    }

    const embedCode = generateEmbedCode()

    const handleCopyEmbed = async () => {
        try {
            await navigator.clipboard.writeText(embedCode)
            setCopiedEmbed(true)
            setTimeout(() => setCopiedEmbed(false), 2000)
        } catch (err) {
            console.error('Failed to copy embed code:', err)
        }
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(pageUrl)
            setCopiedLink(true)
            setTimeout(() => setCopiedLink(false), 2000)
        } catch (err) {
            console.error('Failed to copy link:', err)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Code2 className="w-4 h-4" />
                    {t('button')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {t('description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Image Preview */}
                    <div className="bg-gray-50 border rounded-lg p-4">
                        <img
                            src={imageUrl}
                            alt={title}
                            className="max-h-[300px] mx-auto rounded border border-gray-200"
                        />
                        <p className="text-center text-xs text-gray-500 mt-2">
                            {t('preview')}: {title}
                        </p>
                    </div>

                    {/* Embed Code Section */}
                    <div>
                        <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                            <Code2 className="w-4 h-4" />
                            {t('embedLabel')}
                        </label>
                        <p className="text-xs text-gray-600 mb-3">
                            {t('embedHelp')}
                        </p>
                        <div className="relative">
                            <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg text-xs overflow-x-auto font-mono">
                                {embedCode}
                            </pre>
                            <Button
                                onClick={handleCopyEmbed}
                                size="sm"
                                className="absolute top-2 right-2 gap-2"
                            >
                                {copiedEmbed ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        {t('copied')}
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        {t('copyCode')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* {t('directLink')} Section */}
                    <div>
                        <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                            <Link2 className="w-4 h-4" />
                            {t('directLink')}
                        </label>
                        <p className="text-xs text-gray-600 mb-3">
                            {t('linkHelp')}
                        </p>
                        <div className="relative">
                            <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono break-all pr-20">
                                {pageUrl}
                            </div>
                            <Button
                                onClick={handleCopyLink}
                                size="sm"
                                variant="outline"
                                className="absolute top-2 right-2 gap-2"
                            >
                                {copiedLink ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        {t('copied')}
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        {t('copyLink')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Usage Terms */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-900">
                            <strong>{t('termsLabel')}:</strong> {t('terms')}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
