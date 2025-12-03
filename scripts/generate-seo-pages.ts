import fs from 'fs';
import path from 'path';

// Inlining data to avoid ts-node import issues
const SUBJECTS = [
    "Cat", "Dog", "Owl", "Lion", "Tiger", "Elephant", "Butterfly", "Unicorn", "Dinosaur", "Dragon", "Wolf", "Fox", "Bear", "Rabbit", "Horse", "Dolphin", "Whale", "Shark", "Penguin", "Panda", "Koala", "Sloth", "Monkey", "Giraffe", "Zebra", "Cheetah", "Leopard", "Peacock", "Flamingo", "Parrot", "Eagle", "Hummingbird",
    "Fairy", "Mermaid", "Elf", "Wizard", "Witch", "Goblin", "Troll", "Ogre", "Vampire", "Werewolf", "Ghost", "Skeleton", "Zombie", "Alien", "Robot", "Cyborg", "Superhero", "Villain", "Princess", "Prince", "King", "Queen", "Knight", "Castle", "Dragon",
    "Flower", "Tree", "Leaf", "Mushroom", "Mountain", "River", "Ocean", "Beach", "Forest", "Jungle", "Desert", "Space", "Planet", "Star", "Moon", "Sun", "Cloud", "Rain", "Snow", "Fire", "Water", "Earth", "Air",
    "Car", "Truck", "Bus", "Train", "Plane", "Boat", "Ship", "Submarine", "Rocket", "Spaceship", "Bicycle", "Motorcycle", "Scooter", "Skateboard",
    "Pizza", "Burger", "Fries", "Ice Cream", "Cake", "Cupcake", "Donut", "Cookie", "Candy", "Fruit", "Vegetable", "Sushi", "Taco", "Burrito", "Sandwich",
    "Christmas", "Halloween", "Easter", "Thanksgiving", "Valentine's Day", "St. Patrick's Day", "Fourth of July", "New Year's Eve", "Birthday", "Wedding", "Graduation",
    "Mandala", "Pattern", "Geometric", "Abstract", "Doodle", "Zentangle", "Paisley", "Floral", "Swirl",
];

const STYLES = [
    "Realistic", "Cartoon", "Kawaii", "Chibi", "Anime", "Manga", "Comic Book", "Steampunk", "Cyberpunk", "Fantasy", "Sci-Fi", "Gothic", "Horror", "Vintage", "Retro", "Minimalist", "Abstract", "Surreal", "Pop Art", "Impressionist", "Cubist", "Art Nouveau", "Art Deco", "Graffiti", "Street Art", "Sketch", "Doodle", "Line Art", "Stained Glass", "Mosaic", "Pixel Art", "Low Poly", "Origami", "Paper Cut", "Silhouette", "Stencil", "Tattoo", "Tribal", "Celtic", "Nordic", "Egyptian", "Greek", "Roman", "Aztec", "Mayan", "Inca", "Native American", "Chinese", "Japanese", "Indian", "African",
];

const AUDIENCES = [
    "Kids", "Adults", "Toddlers", "Preschoolers", "Kindergarteners", "Teens", "Boys", "Girls", "Men", "Women", "Seniors", "Beginners", "Intermediates", "Experts",
];

interface SeoPage {
    slug: string;
    title: string;
    description: string;
    image_url: string; // Placeholder for now
    prompt: string;
    style: string;
    subject: string;
    audience: string;
    created_at: string;
}

const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'seo-pages.json');

function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

function generatePages() {
    const pages: SeoPage[] = [];
    const combinations = new Set<string>();

    // 1. Subject + Audience (e.g., "Cat Coloring Page for Kids")
    for (const subject of SUBJECTS) {
        for (const audience of AUDIENCES) {
            const title = `${subject} Coloring Page for ${audience}`;
            const slug = generateSlug(title);

            if (combinations.has(slug)) continue;
            combinations.add(slug);

            pages.push({
                slug,
                title,
                description: `Free printable ${subject} coloring page for ${audience}. High-quality, easy to print, and perfect for creativity. Generate your own custom ${subject} coloring sheets instantly!`,
                image_url: '/placeholder-image.png', // We will generate these later or use a generic one
                prompt: `A black and white coloring page of a ${subject} designed for ${audience}`,
                style: 'Standard',
                subject,
                audience,
                created_at: new Date().toISOString()
            });
        }
    }

    // 2. Style + Subject (e.g., "Kawaii Cat Coloring Page")
    for (const style of STYLES) {
        for (const subject of SUBJECTS) {
            const title = `${style} ${subject} Coloring Page`;
            const slug = generateSlug(title);

            if (combinations.has(slug)) continue;
            combinations.add(slug);

            pages.push({
                slug,
                title,
                description: `Free printable ${style} style ${subject} coloring page. Download this unique ${style} art design or generate your own custom ${subject} coloring sheets with AI.`,
                image_url: '/placeholder-image.png',
                prompt: `A ${style} style black and white coloring page of a ${subject}`,
                style,
                subject,
                audience: 'Everyone',
                created_at: new Date().toISOString()
            });
        }
    }

    // 3. Style + Subject + Audience (e.g., "Kawaii Cat Coloring Page for Kids") - LIMIT to top combos to avoid millions
    const TOP_STYLES = ['Kawaii', 'Realistic', 'Mandala', 'Steampunk'];
    for (const style of TOP_STYLES) {
        for (const subject of SUBJECTS) {
            for (const audience of AUDIENCES) {
                const title = `${style} ${subject} Coloring Page for ${audience}`;
                const slug = generateSlug(title);

                if (combinations.has(slug)) continue;
                combinations.add(slug);

                pages.push({
                    slug,
                    title,
                    description: `Free printable ${style} ${subject} coloring page designed for ${audience}. Perfect for ${audience} who love ${style} art. Generate more like this instantly!`,
                    image_url: '/placeholder-image.png',
                    prompt: `A ${style} style black and white coloring page of a ${subject} designed for ${audience}`,
                    style,
                    subject,
                    audience,
                    created_at: new Date().toISOString()
                });
            }
        }
    }

    console.log(`Generated ${pages.length} unique pages.`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pages, null, 2));
    console.log(`Saved to ${OUTPUT_FILE}`);
}

generatePages();
