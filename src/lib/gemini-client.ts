export async function generateContent(apiKey: string, prompt: string, model: string = 'gemini-2.0-flash-exp', images: string[] = []) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const parts: any[] = [{ text: prompt }];

    // Add images if provided
    if (images && images.length > 0) {
        images.forEach(base64Data => {
            // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
            const cleanBase64 = base64Data.split(',').pop() || base64Data;

            parts.push({
                inline_data: {
                    mime_type: "image/jpeg", // Defaulting to jpeg, Gemini is flexible
                    data: cleanBase64
                }
            });
        });
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: parts
            }],
            generationConfig: {
                temperature: 0.7,
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
}
