import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
    root: 'src',
    base: '/arielnunezsalinas.github.io/',

    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },

    server: {
        port: 3000,
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
