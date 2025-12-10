/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class GoogleGenerativeAI {
    constructor(apiKey: string) {
        // Do nothing
    }
    getGenerativeModel(config: any) {
        return {
            generateContent: async () => ({ response: { text: () => "Mock response" } })
        };
    }
}

export enum HarmCategory {
    HARM_CATEGORY_UNSPECIFIED = 0,
    HARM_CATEGORY_DEROGATORY = 1,
    HARM_CATEGORY_TOXICITY = 2,
    HARM_CATEGORY_VIOLENCE = 3,
    HARM_CATEGORY_SEXUAL = 4,
    HARM_CATEGORY_MEDICAL = 5,
    HARM_CATEGORY_DANGEROUS = 6,
    HARM_CATEGORY_HARASSMENT = 7,
    HARM_CATEGORY_HATE_SPEECH = 8,
    HARM_CATEGORY_SEXUALLY_EXPLICIT = 9,
    HARM_CATEGORY_DANGEROUS_CONTENT = 10
}

export enum HarmBlockThreshold {
    HARM_BLOCK_THRESHOLD_UNSPECIFIED = 0,
    BLOCK_LOW_AND_ABOVE = 1,
    BLOCK_MEDIUM_AND_ABOVE = 2,
    BLOCK_ONLY_HIGH = 3,
    BLOCK_NONE = 4
}
