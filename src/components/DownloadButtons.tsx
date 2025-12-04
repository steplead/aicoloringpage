'use client'

import { Button } from '@/components/ui/button'
import { Download, Printer, Loader2 } from 'lucide-react'
import { generateSinglePagePDF } from '@/lib/pdf-utils'
import { useState } from 'react'

interface DownloadButtonsProps {
    imageUrl: string
    title: string
}

export function DownloadButtons({ imageUrl, title }: DownloadButtonsProps) {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        try {
            setLoading(true)
            await generateSinglePagePDF(imageUrl, title)
        } catch (error) {
            console.error('Error downloading PDF:', error)
            alert('Failed to generate PDF. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print - ${title}</title>
                        <style>
                            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                            img { max-width: 100%; max-height: 100%; }
                            @media print {
                                @page { margin: 0; }
                                body { -webkit-print-color-adjust: exact; }
                            }
                        </style>
                    </head>
                    <body>
                        <img src="${imageUrl}" onload="window.print();window.close()" />
                    </body>
                </html>
            `)
            printWindow.document.close()
        }
    }

    return (
        <div className="flex gap-4">
            <Button
                onClick={handleDownload}
                disabled={loading}
                className="flex-1 h-12 text-lg bg-blue-600 hover:bg-blue-700"
            >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
                Download PDF
            </Button>
            <Button
                onClick={handlePrint}
                variant="outline"
                className="flex-1 h-12 text-lg"
            >
                <Printer className="w-5 h-5 mr-2" />
                Print Now
            </Button>
        </div>
    )
}
