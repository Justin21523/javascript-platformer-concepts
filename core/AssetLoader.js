// core/AssetLoader.js
export class AssetLoader {
  constructor() {
    this.assets = {};
    this.loaded = false;
  }

  addImage(name, path) {
    this.assets[name] = { type: "image", path, loaded: false };
    return this;
  }

  addSound(name, path) {
    this.assets[name] = { type: "sound", path, loaded: false };
    return this;
  }

 async loadAll() {
    const promises = [];

    Object.keys(this.assets).forEach(name => {
      const asset = this.assets[name];

      const promise = new Promise((resolve, reject) => {
        if (asset.type === "image") {
          const img = new Image();
          img.onload = () => {
            asset.data = img;
            asset.loaded = true;
            resolve();
          };
          img.onerror = reject;
          img.src = asset.path;
        } else if (asset.type === "sound") {
          // 聲音載入處理...
        }
      });

      promises.push(promise);
    });

    return Promise.all(promises).then(() => {
      this.loaded = true;
    });
  }

  getImage(name) {
    return this.assets[name]?.data;
  }
}


