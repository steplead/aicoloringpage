'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, BookOpen, Sparkles, Download, Printer } from 'lucide-react'
import { generatePlot } from '@/app/actions/gen-story'
import { generateImage } from '@/app/actions/gen-img'
import Image from 'next/image'
import { SocialShare } from '@/components/SocialShare'
import { useTranslations } from 'next-intl'

export default function StoryModeClient() {
    const t = useTranslations('StoryMode')
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Step 1: Character
    const [characterName, setCharacterName] = useState('')
    const [characterDesc, setCharacterDesc] = useState('')
    const [theme, setTheme] = useState('')

    // Step 2: Plot
    const [scenes, setScenes] = useState<string[]>([])

    // Step 3: Generation
    const [generatedPages, setGeneratedPages] = useState<string[]>([])
    const [generatingIndex, setGeneratingIndex] = useState(-1)

    const handleGeneratePlot = async () => {
        setLoading(true)
        const result = await generatePlot(`${characterName}, a ${characterDesc}`, theme)
        setLoading(false)
        if (result.success && result.scenes) {
            setScenes(result.scenes)
            setStep(2)
        }
    }

    const handleGenerateBook = async () => {
        setStep(3)
        setGeneratingIndex(0)
        const newPages = []

        for (let i = 0; i < scenes.length; i++) {
            setGeneratingIndex(i)
            // Consistent prompt strategy: Always include full character description
            const scenePrompt = `Character: ${characterName}, a ${characterDesc}. 
            Scene: ${scenes[i]}. 
            Style: Kawaii/Cute. 
            Ensure the character looks consistent.`

            const result = await generateImage(scenePrompt, 'kawaii')
            if (result.success && result.data) {
                newPages.push(result.data[0])
                setGeneratedPages([...newPages])
            }
        }
        setGeneratingIndex(-1) // Done
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold mb-4 flex items-center justify-center gap-3">
                    <BookOpen className="w-10 h-10 text-purple-600" />
                    {t('title')}
                </h1>
                <p className="text-xl text-gray-600">{t('subtitle')}</p>
            </div>

            {/* Step 1: Define Character */}
            {step === 1 && (
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-xl mx-auto space-y-6">
                    <div className="space-y-2">
                        <Label>{t('charNameLabel')}</Label>
                        <Input
                            placeholder={t('charNamePlaceholder')}
                            value={characterName}
                            onChange={(e) => setCharacterName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('charDescLabel')}</Label>
                        <Textarea
                            placeholder={t('charDescPlaceholder')}
                            value={characterDesc}
                            onChange={(e) => setCharacterDesc(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('themeLabel')}</Label>
                        <Input
                            placeholder={t('themePlaceholder')}
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        />
                    </div>
                    <Button
                        className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700"
                        onClick={handleGeneratePlot}
                        disabled={loading || !characterName || !characterDesc}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                        {t('generatePlotBtn')}
                    </Button>
                </div>
            )}

            {/* Step 2: Review Plot */}
            {step === 2 && (
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">
                    <h2 className="text-2xl font-bold text-center">{t('outlineTitle')}</h2>
                    <div className="space-y-4">
                        {scenes.map((scene, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-lg border flex gap-4">
                                <span className="font-bold text-purple-600 text-lg">{t('page')} {idx + 1}</span>
                                <p className="text-gray-700 text-lg">{scene}</p>
                            </div>
                        ))}
                    </div>
                    <Button
                        className="w-full h-14 text-xl bg-green-600 hover:bg-green-700"
                        onClick={handleGenerateBook}
                    >
                        <Printer className="w-6 h-6 mr-2" />
                        {t('generateBookBtn')}
                    </Button>
                </div>
            )}

            {/* Step 3: Generation & Result */}
            {step === 3 && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Placeholders for pending pages */}
                        {scenes.map((scene, idx) => (
                            <div key={idx} className="aspect-[3/4] bg-white rounded-xl shadow-md border overflow-hidden relative group">
                                {generatedPages[idx] ? (
                                    <Image
                                        src={generatedPages[idx]}
                                        alt={`Page ${idx + 1}`}
                                        fill
                                        className="object-contain p-4"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-6 text-center">
                                        {generatingIndex === idx ? (
                                            <>
                                                <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
                                                <p className="text-sm font-medium text-purple-600">{t('drawingPage')} {idx + 1}...</p>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-4xl font-bold opacity-20 mb-2">{idx + 1}</span>
                                                <p className="text-xs">{scene}</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {generatedPages.length === 5 && (
                        <div className="text-center p-8 bg-green-50 rounded-xl border border-green-100">
                            <h3 className="text-2xl font-bold text-green-800 mb-2">{t('completeTitle')}</h3>
                            <p className="text-green-600 mb-6">{t('completeMsg')}</p>
                            <div className="flex flex-col items-center gap-6">
                                <Button className="h-12 px-8 text-lg" onClick={() => window.print()}>
                                    <Download className="w-5 h-5 mr-2" />
                                    {t('downloadPrintBtn')}
                                </Button>

                                <div className="w-full max-w-md border-t border-green-200 pt-6">
                                    <p className="text-sm font-medium text-green-700 mb-3">{t('shareStoryMsg')}</p>
                                    <div className="flex justify-center">
                                        <SocialShare
                                            url="https://ai-coloringpage.com/create/story"
                                            title="I just created my own coloring book with AI! 📖✨"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
