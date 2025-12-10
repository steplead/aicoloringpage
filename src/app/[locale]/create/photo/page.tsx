import { Metadata } from 'next'
import MagicCameraClient from '@/components/MagicCameraClient'

export const metadata: Metadata = {
    title: 'Magic Camera - Turn Photos into Coloring Pages',
    description: 'Upload any photo and instantly transform it into a high-quality coloring page. Best free photo-to-coloring tool powered by AI.',
    openGraph: {
        title: 'Magic Camera - Turn Photos into Coloring Pages',
        description: 'Upload any photo and instantly transform it into a high-quality coloring page.',
        url: 'https://ai-coloringpage.com/create/photo',
        images: ['/og-camera.png']
    }
}

export default function MagicCameraPage() {
    return <MagicCameraClient />
}
