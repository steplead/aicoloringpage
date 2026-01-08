import fs from 'fs';
import path from 'path';

// =====================================================
// ENHANCED NICHES: 100+ Specific Categories
// =====================================================

const BASE_SUBJECTS = [
    "Cat", "Dog", "Owl", "Lion", "Tiger", "Elephant", "Butterfly", "Unicorn", "Dinosaur", "Dragon",
    "Wolf", "Fox", "Bear", "Rabbit", "Horse", "Dolphin", "Whale", "Shark", "Penguin", "Panda",
];

// ===== Niche Category 1: Holiday + Subject =====
const HOLIDAYS = [
    "Christmas", "Halloween", "Easter", "Thanksgiving", "Valentine's Day", "St. Patrick's Day",
    "Fourth of July", "New Year's Eve", "Birthday",
];

// ===== Niche Category 2: Activity + Subject =====
const ACTIVITIES = [
    "Sleeping", "Running", "Flying", "Swimming", "Dancing", "Singing", "Playing", "Reading",
    "Cooking", "Gardening", "Painting", "Fishing", "Hiking", "Skating", "Skiing",
];

// ===== Niche Category 3: Location/Setting + Subject =====
const LOCATIONS = [
    "Space", "Beach", "Forest", "Jungle", "Desert", "Ocean", "Mountain", "Castle", "City", "Farm",
    "School", "Library", "Park", "Garden", "Underwater", "Moon", "Sky", "Candy Land",
];

// ===== Niche Category 4: Costume/Outfit + Subject =====
const COSTUMES = [
    "Superhero", "Princess", "Knight", "Pirate", "Astronaut", "Doctor", "Chef", "Police Officer",
    "Firefighter", "Wizard", "Fairy", "Mermaid", "Cowboy", "Ballroom", "Winter", "Summer",
];

// ===== Niche Category 5: Food + Subject =====
const FOODS = [
    "Pizza", "Ice Cream", "Cake", "Cupcake", "Donut", "Cookie", "Burger", "Taco", "Sushi",
    "Candy", "Chocolate", "Fruit", "Sandwich",
];

// ===== Niche Category 6: Emotion/Action + Subject =====
const EMOTIONS = [
    "Happy", "Sad", "Angry", "Surprised", "Scared", "Loving", "Dreamy", "Curious", "Brave",
    "Sleepy", "Excited", "Silly", "Grumpy",
];

// ===== Niche Category 7: Fantasy/Sci-Fi Elements =====
const FANTASY_ELEMENTS = [
    "Magical", "Enchanted", "Robot", "Alien", "Cyber", "Steampunk", "Glowing", "Crystal",
    "Rainbow", "Golden", "Silver", "Moonlit", "Sunny", "Stormy",
];

// ===== Niche Category 8: Action Scenes (High Volume) =====
const ACTION_SCENES = [
    "Dinosaur eating pizza", "Cat playing guitar", "Dog riding skateboard", "Dragon reading book",
    "Unicorn baking cake", "Elephant dancing ballet", "Penguin surfing", "Cat sleeping on cloud",
    "Dog playing poker", "Owl wearing glasses", "Tiger playing basketball", "Bear fishing",
    "Rabbit painting masterpiece", "Fox playing chess", "Wolf howling at moon",
];

const AUDIENCES = ["Kids", "Adults", "Toddlers", "Preschoolers", "Kindergarteners", "Teens", "Boys", "Girls"];

interface SeoPage {
    slug: string;
    title: string;
    description: string;
    image_url: string;
    prompt: string;
    style: string;
    subject: string;
    audience: string;
    keywords?: string[];
    created_at: string;
    pinterest_posted?: boolean;
}

const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'seo-pages-generated.json');

function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

function generatePages(): SeoPage[] {
    const pages: SeoPage[] = [];
    const combinations = new Set<string>();

    // Helper to add page if unique
    const addPage = (title: string, description: string, prompt: string, subject: string, audience: string = 'Everyone', keywords: string[] = []) => {
        const slug = generateSlug(title);
        if (combinations.has(slug)) return;
        combinations.add(slug);

        pages.push({
            slug,
            title,
            description,
            image_url: 'PLACEHOLDER_IMAGE_URL', // Will be replaced with generated image
            prompt,
            style: 'Standard',
            subject,
            audience,
            keywords,
            created_at: new Date().toISOString(),
            pinterest_posted: false
        });
    };

    console.log('🚀 Generating 100+ Niche SEO Pages...\n');

    // ========================================
    // 1. Holiday + Subject (High Volume)
    // ========================================
    console.log('📅 Generating Holiday + Subject combinations...');
    for (const holiday of HOLIDAYS) {
        for (const subject of BASE_SUBJECTS.slice(0, 10)) {
            const title = `${holiday} ${subject} Coloring Page`;
            const description = `Free printable ${holiday} ${subject} coloring page. Festive and fun ${subject} coloring sheet perfect for ${holiday} celebration. Download and print now!`;
            const prompt = `A black and white coloring page of a ${subject} in ${holiday} theme`;
            const keywords = [holiday, subject.toLowerCase(), 'holiday coloring page', 'festive', 'printable'];

            addPage(title, description, prompt, subject, 'Kids', keywords);
        }
    }

    // ========================================
    // 2. Activity + Subject
    // ========================================
    console.log('🏃 Generating Activity + Subject combinations...');
    for (const activity of ACTIVITIES.slice(0, 12)) {
        for (const subject of BASE_SUBJECTS.slice(0, 8)) {
            const title = `${activity} ${subject} Coloring Page`;
            const description = `Free printable ${activity} ${subject} coloring page. Show this ${subject} ${activity.toLowerCase()} in this fun coloring sheet. Perfect for kids who love ${subject.toLowerCase()}s!`;
            const prompt = `A black and white coloring page of a ${subject} ${activity.toLowerCase()}`;
            const keywords = [activity.toLowerCase(), subject.toLowerCase(), 'activity coloring page', 'action'];

            addPage(title, description, prompt, subject, 'Kids', keywords);
        }
    }

    // ========================================
    // 3. Location + Subject
    // ========================================
    console.log('🌍 Generating Location + Subject combinations...');
    for (const location of LOCATIONS.slice(0, 12)) {
        for (const subject of BASE_SUBJECTS.slice(0, 8)) {
            const title = `${subject} in ${location} Coloring Page`;
            const description = `Free printable ${subject} in ${location} coloring page. Adventure-themed coloring sheet showing ${subject.toLowerCase()} in ${location.toLowerCase()}. Download and print!`;
            const prompt = `A black and white coloring page of a ${subject} in ${location} setting`;
            const keywords = [location.toLowerCase(), subject.toLowerCase(), 'adventure coloring page', 'themed'];

            addPage(title, description, prompt, subject, 'Kids', keywords);
        }
    }

    // ========================================
    // 4. Costume + Subject
    // ========================================
    console.log('👔 Generating Costume + Subject combinations...');
    for (const costume of COSTUMES.slice(0, 10)) {
        for (const subject of BASE_SUBJECTS.slice(0, 6)) {
            const title = `${subject} dressed as ${costume} Coloring Page`;
            const description = `Free printable ${subject} dressed as ${costume} coloring page. Cute and creative ${costume} costume ${subject} coloring sheet for kids. Print now!`;
            const prompt = `A black and white coloring page of a ${subject} wearing ${costume} costume`;
            const keywords = [costume.toLowerCase(), subject.toLowerCase(), 'costume coloring page', 'dress up', 'pretend play'];

            addPage(title, description, prompt, subject, 'Kids', keywords);
        }
    }

    // ========================================
    // 5. Food + Subject (Funny/Niche)
    // ========================================
    console.log('🍕 Generating Food + Subject combinations...');
    for (const food of FOODS.slice(0, 8)) {
        for (const subject of BASE_SUBJECTS.slice(0, 6)) {
            const title = `${subject} eating ${food} Coloring Page`;
            const description = `Free printable ${subject} eating ${food} coloring page. Funny and cute coloring sheet showing ${subject.toLowerCase()} enjoying ${food.toLowerCase()}. Print for free!`;
            const prompt = `A black and white coloring page of a ${subject} eating ${food}`;
            const keywords = [food.toLowerCase(), subject.toLowerCase(), 'funny coloring page', 'cute', 'food'];

            addPage(title, description, prompt, subject, 'Kids', keywords);
        }
    }

    // ========================================
    // 6. Emotion + Subject
    // ========================================
    console.log('😊 Generating Emotion + Subject combinations...');
    for (const emotion of EMOTIONS.slice(0, 10)) {
        for (const subject of BASE_SUBJECTS.slice(0, 5)) {
            const title = `${emotion} ${subject} Coloring Page`;
            const description = `Free printable ${emotion} ${subject} coloring page. Expressive coloring sheet showing a ${emotion.toLowerCase()} ${subject.toLowerCase()}. Great for teaching emotions!`;
            const prompt = `A black and white coloring page of a ${emotion} ${subject}`;
            const keywords = [emotion.toLowerCase(), subject.toLowerCase(), 'emotions coloring page', 'feelings', 'expressive'];

            addPage(title, description, prompt, subject, 'Kids', keywords);
        }
    }

    // ========================================
    // 7. Fantasy Elements + Subject
    // ========================================
    console.log('✨ Generating Fantasy + Subject combinations...');
    for (const fantasy of FANTASY_ELEMENTS.slice(0, 10)) {
        for (const subject of BASE_SUBJECTS.slice(0, 5)) {
            const title = `${fantasy} ${subject} Coloring Page`;
            const description = `Free printable ${fantasy} ${subject} coloring page. Magical ${fantasy.toLowerCase()} themed ${subject.toLowerCase()} coloring sheet. Perfect for imagination!`;
            const prompt = `A black and white coloring page of a ${fantasy} ${subject}`;
            const keywords = [fantasy.toLowerCase(), subject.toLowerCase(), 'fantasy coloring page', 'magical', 'imaginative'];

            addPage(title, description, prompt, subject, 'Kids', keywords);
        }
    }

    // ========================================
    // 8. Specific Action Scenes (High KD/High Volume)
    // ========================================
    console.log('🎬 Generating Specific Action Scenes...');
    for (const scene of ACTION_SCENES) {
        const title = `${scene} Coloring Page`;
        const description = `Free printable ${scene} coloring page. Hilarious and unique coloring sheet showing ${scene.toLowerCase()}. Perfect for kids who love funny coloring pages!`;
        const prompt = `A black and white coloring page of ${scene}`;
        const keywords = scene.split(' ').map(w => w.toLowerCase());

        addPage(title, description, prompt, scene.split(' ').pop() || 'Scene', 'Kids', keywords);
    }

    // ========================================
    // 9. Audience-Specific Variations (Top 50 only)
    // ========================================
    console.log('👥 Generating Audience-Specific variations...');
    const top50Pages = pages.slice(0, 50);
    for (const page of top50Pages) {
        for (const audience of ['Toddlers', 'Preschoolers', 'Kindergarteners']) {
            const title = `${page.title} for ${audience}`;
            const description = page.description.replace(/\.$/, '') + ` Specifically designed for ${audience.toLowerCase()} with simple lines and age-appropriate details.`;
            const prompt = `${page.prompt} designed for ${audience}`;

            addPage(title, description, prompt, page.subject, audience, page.keywords || []);
        }
    }

    console.log(`\n✅ Generated ${pages.length} unique niche SEO pages!\n`);
    console.log('📊 Breakdown:');
    console.log(`   - Holiday + Subject: ${HOLIDAYS.length * 10}`);
    console.log(`   - Activity + Subject: ${ACTIVITIES.slice(0, 12).length * 8}`);
    console.log(`   - Location + Subject: ${LOCATIONS.slice(0, 12).length * 8}`);
    console.log(`   - Costume + Subject: ${COSTUMES.slice(0, 10).length * 6}`);
    console.log(`   - Food + Subject: ${FOODS.slice(0, 8).length * 6}`);
    console.log(`   - Emotion + Subject: ${EMOTIONS.slice(0, 10).length * 5}`);
    console.log(`   - Fantasy + Subject: ${FANTASY_ELEMENTS.slice(0, 10).length * 5}`);
    console.log(`   - Action Scenes: ${ACTION_SCENES.length}`);
    console.log(`   - Audience Variations: ${top50Pages.length * 3}`);

    return pages;
}

// Main execution
try {
    const pages = generatePages();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pages, null, 2));
    console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);
    console.log('\n🎯 Next Steps:');
    console.log('   1. Review generated pages');
    console.log('   2. Run image generation script');
    console.log('   3. Merge with existing seo-pages.json');
} catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
}
