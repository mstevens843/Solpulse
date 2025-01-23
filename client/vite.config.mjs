import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': '/src', // Ensures you can use `@` to refer to the `src` directory
            buffer: 'buffer/', // Alias for buffer to resolve Vite compatibility issues
        },
    },
    define: {
        global: {}, // Add global definition to address Buffer compatibility
    },
    server: {
        port: 3000, // Set the development server to run on port 3000
        open: true, // Automatically opens the app in the browser
        historyApiFallback: true, // Enable single-page app routing
    },
    envPrefix: 'VITE_', // Ensure environment variables prefixed with VITE_ are loaded correctly
    build: {
        outDir: 'dist', // Customize the output directory for production builds
        sourcemap: true, // Enable sourcemaps for easier debugging
    },
});
