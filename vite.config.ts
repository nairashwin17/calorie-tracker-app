import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    base: './', // Relative paths work best for generic hosting/local preview
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icon.svg'],
            manifest: {
                name: 'NutriTrack Calorie Counter',
                short_name: 'NutriTrack',
                description: 'AI-Powered Calorie and Nutrition Tracker',
                theme_color: '#4f46e5',
                background_color: '#ffffff',
                display: 'standalone',
                scope: './',
                start_url: './',
                orientation: 'portrait',
                icons: [
                    {
                        src: 'icon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
});
