import { ExternalLink, Star } from 'lucide-react'
import Image from 'next/image'

const SUPPLIES = [
    {
        id: 'crayola-64',
        name: 'Crayola 64 Crayon Set',
        description: 'The classic set with built-in sharpener. Perfect for kids and beginners.',
        rating: 4.9,
        reviews: '12k',
        price: '$6.99',
        image: '/supplies/crayola.jpg', // We will need to add these images or use placeholders
        link: 'https://www.amazon.com/Crayola-Crayons- Sharpener-Non-Toxic-Coloring/dp/B00004HO58?tag=YOUR_TAG_HERE' // Placeholder
    },
    {
        id: 'prisma-pencil',
        name: 'Prismacolor Premier Pencils',
        description: 'Soft core pencils for advanced shading and blending. A favorite of artists.',
        rating: 4.8,
        reviews: '25k',
        price: '$29.99',
        image: '/supplies/prismacolor.jpg',
        link: 'https://www.amazon.com/Prismacolor-3597T-Premier-Colored-Pencils/dp/B00006IEEU?tag=YOUR_TAG_HERE'
    },
    {
        id: 'markers',
        name: 'Ohuhu Dual Tip Markers',
        description: 'Alcohol-based markers for bold, vibrant colors. Great for "Stained Glass" style.',
        rating: 4.8,
        reviews: '18k',
        price: '$19.99',
        image: '/supplies/ohuhu.jpg',
        link: 'https://www.amazon.com/Ohuhu-Markers-Double-Tipped-Coloring/dp/B01N8QNC29?tag=YOUR_TAG_HERE'
    }
]

export function RecommendedSupplies() {
    return (
        <section className="bg-white border text-left rounded-xl p-6 md:p-8 my-12 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        ✨ Best Supplies for Coloring
                    </h2>
                    <p className="text-gray-600 mt-2 text-sm max-w-lg">
                        We tested dozens of brands. These are the top tools to make your generated coloring pages look professional.
                    </p>
                </div>
                <div className="text-xs text-gray-400 border px-2 py-1 rounded bg-gray-50">
                    As an Amazon Associate I earn from qualifying purchases.
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SUPPLIES.map((item, idx) => (
                    <a
                        key={item.id}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col border rounded-lg hover:shadow-md transition-shadow duration-200 overflow-hidden"
                    >
                        {/* 
                            For now using a colored div as placeholder if image fails 
                            In production, you should upload real product images to /public/supplies/
                        */}
                        <div className={`h-40 w-full bg-gradient-to-br ${idx === 0 ? 'from-yellow-100 to-orange-100' : idx === 1 ? 'from-blue-100 to-purple-100' : 'from-green-100 to-teal-100'} flex items-center justify-center`}>
                            {/* <Image src={item.image} alt={item.name} width={200} height={200} className="object-contain h-32" /> */}
                            <span className="text-4xl">🎨</span>
                        </div>

                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                {item.name}
                            </h3>
                            <div className="flex items-center gap-1 my-2">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-current" />
                                    ))}
                                </div>
                                <span className="text-xs text-gray-500">
                                    ({item.reviews})
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-4 flex-grow">
                                {item.description}
                            </p>
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                <span className="font-bold text-gray-900">{item.price}</span>
                                <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
                                    Buy Now <ExternalLink className="w-3 h-3" />
                                </span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    )
}
