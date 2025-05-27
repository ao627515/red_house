// vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  // 1. root du projet — là où se trouve index.html
  //    Vite servira et résoudra les fichiers relatifs à ce dossier.
  root: process.cwd(),

  // 2. publicDir — dossier des assets statiques (servis tels quels à la racine)
  //    public/main.js → accessible via /main.js
  publicDir: path.resolve(__dirname, 'assets'),

  // 3. resolve.alias — raccourcis pour éviter les chemins relatifs complexes
  resolve: {
    alias: {
    }
  },

  // 4. server — configuration du dev server
  server: {
    host: true,        // écoute sur 0.0.0.0, accessible depuis le LAN
    port: 5173,        // port de dev (modifiable en cas de conflit)
    strictPort: true,  // échoue si 5173 est pris
    open: true         // ouvre le navigateur automatiquement
  },

  // 5. build — options pour la prod
  build: {
    outDir: 'dist',      // dossier de sortie
    assetsDir: 'assets', // sous-dossier pour images, CSS, etc.
    sourcemap: true      // génère des sourcemaps pour faciliter le debug
  }
})
