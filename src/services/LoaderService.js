// core/LoaderService.js
import * as THREE from 'three';

/** Interface abstraite pour le loader */
export class ITextureLoader {
  load(src) { throw new Error('Not implemented'); }
}

/**
 * Service de chargement de textures avec cache et vérification d'existence de fichier
 */
export class LoaderService extends ITextureLoader {
  constructor() {
    super();
    this.loader = new THREE.TextureLoader();
    this.cache = new Map();
  }

  /**
   * Charge une texture après vérification que le fichier existe
   * @param {string} src - Chemin relatif de l'image
   * @returns {Promise<THREE.Texture>}
   */
  async load(src) {
    // Vérification de l'existence du fichier via une requête HEAD
    try {
      const response = await fetch(src, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Fichier introuvable à l'adresse : ${src}`);
      }
    } catch (err) {
      return Promise.reject(new Error(`Impossible de vérifier le fichier ${src}: ${err.message}`));
    }

    // Retourne depuis le cache si déjà chargé
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src));
    }

    // Chargement réel via Three.js TextureLoader
    return new Promise((resolve, reject) => {
      this.loader.load(
        src,
        texture => {
          this.cache.set(src, texture);
          resolve(texture);
        },
        undefined,
        err => reject(new Error(`Erreur chargement texture ${src}: ${err.message}`))
      );
    });
  }
}