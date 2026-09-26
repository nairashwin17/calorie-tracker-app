import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export interface FoodItemRequest {
    name: string;
    quantity: string;
    unit: string;
}

export interface FoodNutrition {
    name: string;
    quantity: number; // Normalized quantity if needed, or just Echo
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export const calculateBatchCalories = async (items: FoodItemRequest[]): Promise<FoodNutrition[]> => {
    if (items.length === 0) return [];

    // Use gemini-2.0-flash as it is available for this key
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
            temperature: 0.1, // Low temperature for deterministic results
            maxOutputTokens: 1000,
        }
    });

    const itemsList = items.map(i => `- ${i.quantity} ${i.unit} of ${i.name}`).join('\n');

    const prompt = `
    You are a nutrition database. Calculate the TOTAL nutritional content for the exact quantities specified below.
    Do not output per-100g unless the quantity is exactly 100g.
    Do not guess servings if a specific weight is given.

    Items to analyze:
    ${itemsList}

    For EACH item, return a JSON object with:
    - "name": Use the food name provided.
    - "quantity": The numeric quantity provided.
    - "unit": The unit provided.
    - "calories": Total kilocalories (kcal) for the specified quantity.
    - "protein": Total protein (g) for the specified quantity.
    - "carbs": Total carbs (g) for the specified quantity.
    - "fats": Total fats (g) for the specified quantity.

    Return ONLY a valid JSON ARRAY. No strings like "json" or markdown blocks.
    Example input: "- 200 g of Chicken Breast"
    Example output: [{"name": "Chicken Breast", "quantity": 200, "unit": "g", "calories": 330, "protein": 62, "carbs": 0, "fats": 7}]
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanText);

        // Ensure array
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error("Error calculating batch calories:", error);
        throw error;
    }
};
