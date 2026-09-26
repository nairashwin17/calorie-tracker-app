
if (!import.meta.env.VITE_GEMINI_API_KEY) {
    console.error("Missing Gemini API Key in .env file");
} else {
    console.log("Gemini API Key loaded successfully");
}
