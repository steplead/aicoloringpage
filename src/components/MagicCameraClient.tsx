'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, Camera, Image as ImageIcon, Download, Printer } from 'lucide-react'
import Image from 'next/image'
import { generateImage } from '@/app/actions/gen-img'
import { Header } from '@/components/Header'
import { SocialShare } from '@/components/SocialShare'
import { useTranslations } from 'next-intl'

export default function MagicCameraClient({ translationNamespace = 'MagicCamera' }: { translationNamespace?: string }) {
    const t = useTranslations(translationNamespace)
    const tHome = useTranslations('HomePage') // For styles
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [prompt, setPrompt] = useState('')
    const [style, setStyle] = useState('realistic')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const img = new window.Image()
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    let width = img.width
                    let height = img.height
                    const MAX_SIZE = 1024

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width
                            width = MAX_SIZE
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height
                            height = MAX_SIZE
                        }
                    }

                    canvas.width = width
                    canvas.height = height
                    const ctx = canvas.getContext('2d')
                    ctx?.drawImage(img, 0, 0, width, height)

                    const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8) // Compress to 80% JPEG
                    setSelectedImage(resizedDataUrl)
                    setGeneratedImage(null)
                    setError('')
                }
                img.src = event.target?.result as string
            }
            reader.readAsDataURL(file)
        }
    }

    const handleGenerate = async () => {
        if (!selectedImage) return

        setLoading(true)
        setError('')
        setGeneratedImage(null)

        try {
            // Updated to use the stable API route instead of Server Action
            // Remove the data URL prefix for the payload if present
            const base64Image = selectedImage.includes('base64,')
                ? selectedImage.split('base64,')[1]
                : selectedImage;

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    style: style,
                    image: base64Image // Send base64 data to API
                }),
            });

            const result = await response.json();

            if (response.ok && result.success && result.data) {
                setGeneratedImage(result.data[0])
            } else {
                setError(result.error || 'Failed to generate image')
            }
        } catch (err) {
            setError('An unexpected error occurred')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-gray-600">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <Card className="p-6 space-y-6">
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold">{t('uploadStep')}</Label>

                            <div
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {selectedImage ? (
                                    <div className="relative aspect-square w-full max-w-[300px] mx-auto">
                                        <Image
                                            src={selectedImage}
                                            alt="Upload preview"
                                            fill
                                            className="object-contain rounded-lg"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                            <p className="text-white font-medium">{t('changeImage')}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 py-8">
                                        <div className="bg-blue-100 p-4 rounded-full">
                                            <Camera className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{t('clickUpload')}</p>
                                            <p className="text-sm text-gray-500">{t('dragDrop')}</p>
                                        </div>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('describeLabel')}</Label>
                                <Input
                                    placeholder={t('describePlaceholder')}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('chooseStyle')}</Label>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setStyle('kawaii')}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${style === 'kawaii'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {tHome('styles.kawaii')}
                                    </button>
                                    <button
                                        onClick={() => setStyle('intricate')}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${style === 'intricate'
                                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {tHome('styles.intricate')}
                                    </button>
                                    <button
                                        onClick={() => setStyle('realistic')}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${style === 'realistic'
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {tHome('styles.realistic')}
                                    </button>

                                    {/* New Styles */}
                                    <button
                                        onClick={() => setStyle('stained-glass')}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${style === 'stained-glass'
                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {tHome('styles.stainedGlass')}
                                    </button>
                                    <button
                                        onClick={() => setStyle('abstract')}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${style === 'abstract'
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {tHome('styles.abstract')}
                                    </button>
                                    <button
                                        onClick={() => setStyle('fantasy')}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${style === 'fantasy'
                                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {tHome('styles.fantasy')}
                                    </button>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 text-lg"
                                onClick={handleGenerate}
                                disabled={!selectedImage || loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        {t('transforming')}
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="mr-2 h-5 w-5" />
                                        {t('generateBtn')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>

                    {/* Output Section */}
                    <Card className="p-6 flex flex-col min-h-[500px]">
                        <Label className="text-lg font-semibold mb-4">{t('resultStep')}</Label>


                        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex items-center justify-center relative overflow-hidden">
                            {generatedImage ? (
                                <Image
                                    src={generatedImage}
                                    alt="Generated coloring page"
                                    fill
                                    className="object-contain p-4"
                                />
                            ) : (
                                <div className="text-center text-gray-400 p-8">
                                    {loading ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                                            <p>{t('drawing')}</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <ImageIcon className="w-16 h-16 opacity-20" />
                                            <p>{t('waitingResult')}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {generatedImage && (
                            <div className="space-y-4 mt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="outline" onClick={() => window.print()}>
                                        <Printer className="mr-2 h-4 w-4" />
                                        {t('print')}
                                    </Button>
                                    <Button onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = generatedImage;
                                        link.download = 'coloring-page.png';
                                        link.click();
                                    }}>
                                        <Download className="mr-2 h-4 w-4" />
                                        {t('download')}
                                    </Button>
                                </div>

                                <div className="pt-4 border-t">
                                    <p className="text-sm font-medium text-gray-500 mb-2 text-center">{t('shareMsg')}</p>
                                    <div className="flex justify-center">
                                        <SocialShare
                                            url="https://ai-coloringpage.com/create/photo"
                                            title="I just turned my photo into a coloring page with AI! 📸✨"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    )
}
