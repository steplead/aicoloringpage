'use client'

import { useState } from 'react'
import { X, Sparkles, Download, Loader2, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generateImage } from '@/app/actions/gen-img'
import Image from 'next/image'

interface RemixModalProps {
    isOpen: boolean
    onClose: () => void
    originalPrompt: string
}

export function RemixModal({ isOpen, onClose, originalPrompt }: RemixModalProps) {
    const [modifier, setModifier] = useState('')
    const [loading, setLoading] = useState(false)
    const [remixedImage, setRemixedImage] = useState('')
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleRemix = async () => {
        setLoading(true)
        setError('')
        setRemixedImage('')

        // Combine original prompt with modifier
        const fullPrompt = modifier.trim()
            ? `${originalPrompt}, ${modifier}`
            : originalPrompt

        try {
            const result = await generateImage(fullPrompt, 'kawaii') // Default to kawaii for now, or add style selector
            if (result.success && result.data) {
                setRemixedImage(String(result.data[0]))
            } else {
                setError(result.error || 'Failed to remix')
            }
        } catch (err) {
            setError('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = () => {
        if (!remixedImage) return
        const link = document.createElement('a')
        link.href = remixedImage
        link.download = `remix-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const quickStyles = [
        { label: '🚀 In Space', value: 'in space, sci-fi style' },
        { label: '🎩 With a Hat', value: 'wearing a fancy top hat' },
        { label: '🎃 Spooky', value: 'halloween style, spooky, cute ghost' },
        { label: '🌈 Rainbow', value: 'with a rainbow background' },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center gap-2 text-purple-700">
                        <Wand2 className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Remix Magic</h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/50">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <div className="text-sm text-gray-500">
                            Original: <span className="font-medium text-gray-900">{originalPrompt}</span>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Add a twist (e.g. 'wearing sunglasses')"
                                value={modifier}
                                onChange={(e) => setModifier(e.target.value)}
                                className="flex-1"
                                onKeyDown={(e) => e.key === 'Enter' && handleRemix()}
                            />
                            <Button
                                onClick={handleRemix}
                                disabled={loading}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            </Button>
                        </div>

                        {/* Quick Styles */}
                        <div className="flex flex-wrap gap-2">
                            {quickStyles.map((style) => (
                                <button
                                    key={style.label}
                                    onClick={() => setModifier(style.value)}
                                    className="px-3 py-1 text-xs font-medium bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700 rounded-full transition-colors border border-transparent hover:border-purple-200"
                                >
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Result Area */}
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    {remixedImage ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="relative aspect-square w-full bg-gray-50 rounded-xl overflow-hidden border-2 border-purple-100">
                                <Image
                                    src={remixedImage}
                                    alt="Remixed Result"
                                    fill
                                    className="object-contain p-4"
                                    unoptimized
                                />
                            </div>
                            <Button onClick={handleDownload} className="w-full" variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Download Remix
                            </Button>
                        </div>
                    ) : (
                        !loading && (
                            <div className="h-48 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                                <Sparkles className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm">Your remix will appear here</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
