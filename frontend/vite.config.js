
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    root: projectRoot,
    base: '/studyflow/',
    build: {
        outDir: resolve(projectRoot, '../docs'),
        emptyOutDir: true
    }
});
