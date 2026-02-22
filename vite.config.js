import { defineConfig } from 'vite'
import path from 'path'
import { resolve } from 'path'

export default defineConfig({
    root: 'src',
    envDir: '../',  // variables .env
    base: '/arielnunezsalinas.github.io/',

    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html'),
                project1: resolve(__dirname, 'src/project-1.html'),
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
