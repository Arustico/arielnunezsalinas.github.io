import { defineConfig } from 'vite'
import path from 'path'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    root: 'src',
    envDir: '../',  // variables .env
    base: '/arielnunezsalinas.github.io/',
    // Copia las partes partciales de html para el deploy
    plugins: [
        viteStaticCopy({
            targets:[
                {
                    src:"partials",
                    dest: "."
                }
            ]

        })
    ],
    // deply a dist
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html'),
                project1: resolve(__dirname, 'src/project-1.html'),
                project2: resolve(__dirname, 'src/project-2.html'),
            },
        },
    },

    server: {
        port: 8000,
        open: true,
    },

    css: {
        preprocessorOptions: {
            scss: {
                sourceMap: true,
            },
        },
    },
})
