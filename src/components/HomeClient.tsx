'use client'

import { useState } from 'react'
import Image from 'next/image'
import { generateImage } from '@/app/actions/gen-img'
import { generateSinglePagePDF, generateBookPDF } from '@/lib/pdf-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/Header'
import { GallerySection } from '@/components/GallerySection'
import { Download, Sparkles, Loader2, Image as ImageIcon, BookOpen, Plus, Trash2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useTranslations } from 'next-intl'

function HomeContent() {
    const t = useTranslations('HomePage')
    const searchParams = useSearchParams()
    const initialPrompt = searchParams.get('prompt') || ''

    const [prompt, setPrompt] = useState(initialPrompt)
    const [imageUrl, setImageUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Style State
    const [style, setStyle] = useState('kawaii')

    // Book State
    const [book, setBook] = useState<Array<{ url: string, prompt: string }>>([])
    const [showBook, setShowBook] = useState(false)

    async function handleGenerate() {
        if (!prompt.trim()) return

        setLoading(true)
        setError('')
        setImageUrl('')

        try {
            // Use the standard API route purely for stability on Edge
            // Server Actions (POST to /en) were returning 404s
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    style
                })
            })

            const result = await response.json()

            if (result.success && result.data) {
                setImageUrl(String(result.data[0]))
            } else {
                throw new Error(result.error || 'Failed to generate image')
            }
        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : 'Failed to generate image. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadPDF = async () => {
        if (!imageUrl) return
        await generateSinglePagePDF(imageUrl, prompt || t('defaultPrompt'))
    }

    const addToBook = () => {
        if (!imageUrl) return
        setBook([...book, { url: imageUrl, prompt: prompt || t('defaultPrompt') }])
    }

    const removeFromBook = (index: number) => {
        const newBook = [...book]
        newBook.splice(index, 1)
        setBook(newBook)
    }

    const downloadBook = async () => {
        if (book.length === 0) return
        await generateBookPDF(book)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center gap-10">

                {/* Hero Section */}
                <div className="text-center space-y-4 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span>{t('poweredBy')}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
                        {t('heroTitle')} <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            {t('heroTitleHighlight')}
                        </span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {t('heroSubtitle')}
                    </p>
                </div>

                {/* Generator Section */}
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* Input Card */}
                    <Card className="p-6 shadow-xl border-2 border-gray-100 bg-white/80 backdrop-blur-sm">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('inputLabel')}
                                </label>
                                <div className="flex gap-2 mb-4">
                                    <Input
                                        placeholder={t('inputPlaceholder')}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        className="h-12 text-lg"
                                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                    />
                                </div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('styleLabel')}
                                </label>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                                    <button
                                        onClick={() => setStyle('kawaii')}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${style === 'kawaii'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {t('styles.kawaii')}
                                    </button>
                                    <button
                                        onClick={() => setStyle('intricate')}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${style === 'intricate'
                                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {t('styles.intricate')}
                                    </button>
                                    <button
                                        onClick={() => setStyle('realistic')}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${style === 'realistic'
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {t('styles.realistic')}
                                    </button>

                                    {/* New Styles */}
                                    <button
                                        onClick={() => setStyle('stained-glass')}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${style === 'stained-glass'
                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {t('styles.stainedGlass')}
                                    </button>
                                    <button
                                        onClick={() => setStyle('abstract')}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${style === 'abstract'
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {t('styles.abstract')}
                                    </button>
                                    <button
                                        onClick={() => setStyle('fantasy')}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${style === 'fantasy'
                                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {t('styles.fantasy')}
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 mt-2">
                                    {t('tryPrompts')}
                                </p>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={loading || !prompt.trim()}
                                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        {t('loadingButton')}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        {t('generateButton')}
                                    </>
                                )}
                            </Button>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                                    {error}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Result Card */}
                    <Card className="p-6 shadow-xl border-2 border-gray-100 min-h-[400px] flex flex-col items-center justify-center bg-white relative overflow-hidden group">
                        {loading ? (
                            <div className="flex flex-col items-center gap-4 text-gray-400 animate-pulse">
                                <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                                <p>{t('drawingMasterpiece')}</p>
                            </div>
                        ) : imageUrl ? (
                            <div className="relative w-full aspect-square flex flex-col items-center">
                                <div className="relative w-full h-full">
                                    <Image
                                        src={imageUrl}
                                        alt="Generated Coloring Page"
                                        fill
                                        className="object-contain p-2"
                                        unoptimized
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2">
                                    <Button onClick={handleDownloadPDF} className="shadow-lg">
                                        <Download className="w-4 h-4 mr-2" />
                                        {t('downloadPdf')}
                                    </Button>
                                    <Button onClick={addToBook} variant="secondary" className="shadow-lg">
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t('addToBook')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 space-y-2">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ImageIcon className="w-10 h-10 text-gray-300" />
                                </div>
                                <p className="font-medium">{t('noImageGenerated')}</p>
                                <p className="text-sm">{t('enterPrompt')}</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Community Gallery */}
                <GallerySection />

            </main>

            {/* Floating Book Button */}
            {book.length > 0 && (
                <div className="fixed bottom-8 right-8 z-50">
                    <Button
                        onClick={() => setShowBook(!showBook)}
                        className="h-16 w-16 rounded-full shadow-2xl bg-black hover:bg-gray-800 relative"
                    >
                        <BookOpen className="w-8 h-8" />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                            {book.length}
                        </span>
                    </Button>
                </div>
            )}

            {/* Book Drawer / Modal Use Simple Overlay */}
            {showBook && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
                    <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <BookOpen className="w-6 h-6" />
                                {t('myBook')}
                            </h2>
                            <Button variant="ghost" onClick={() => setShowBook(false)}>{t('close')}</Button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4">
                            {book.length === 0 ? (
                                <p className="text-gray-500 text-center mt-10">{t('emptyBook')}</p>
                            ) : (
                                book.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center p-3 border rounded-lg hover:bg-gray-50">
                                        <div className="w-16 h-16 relative bg-gray-100 rounded">
                                            <Image src={item.url} alt="Thumbnail" fill className="object-contain" unoptimized />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{item.prompt}</p>
                                            <p className="text-xs text-gray-500">Page {idx + 1}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeFromBook(idx)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-6 border-t mt-4">
                            <Button onClick={downloadBook} className="w-full h-12 text-lg" disabled={book.length === 0}>
                                <Download className="w-5 h-5 mr-2" />
                                {t('downloadFullBook')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Removed - using global footer */}
        </div>
    )
}

export function HomeClient() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
            <HomeContent />
        </Suspense>
    )
}
