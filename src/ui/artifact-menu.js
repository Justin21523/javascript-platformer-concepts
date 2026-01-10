// src/ui/artifact-menu.js
// 簡易三選一神器/超能力選單

export class ArtifactMenu {
  constructor(options = []) {
    this.visible = false;
    this.options = options;
    this.selected = null;
    this.root = null;
    this.build();
  }

  build() {
    this.root = document.createElement("div");
    this.root.id = "artifactMenu";
    this.root.style.position = "fixed";
    this.root.style.inset = "0";
    this.root.style.display = "none";
    this.root.style.alignItems = "center";
    this.root.style.justifyContent = "center";
    this.root.style.background = "rgba(0,0,0,0.55)";
    this.root.style.zIndex = "1500";

    const box = document.createElement("div");
    box.className = "artifact-box";
    const title = document.createElement("div");
    title.className = "artifact-title";
    title.textContent = "選擇一個強化";
    box.appendChild(title);

    const list = document.createElement("div");
    list.className = "artifact-list";
    this.optionNodes = [];
    for (let i = 0; i < 3; i++) {
      const opt = document.createElement("div");
      opt.className = "artifact-option";
      list.appendChild(opt);
      this.optionNodes.push(opt);
    }
    box.appendChild(list);
    this.root.appendChild(box);
    document.body.appendChild(this.root);
  }

  show(options, onPick, fragments = 0, cost = 0) {
    this.visible = true;
    this.onPick = onPick;
    this.options = options;
    this.root.style.display = "flex";
    options.slice(0, 3).forEach((opt, idx) => {
      const node = this.optionNodes[idx];
      node.innerHTML = "";
      const name = document.createElement("div");
      name.className = "artifact-name";
      name.textContent = opt.name;
      if (opt.rarity) {
        name.classList.add(`rarity-${opt.rarity}`);
      }
      const desc = document.createElement("div");
      desc.className = "artifact-desc";
      desc.textContent = opt.desc;
      const costLabel = document.createElement("div");
      costLabel.className = "artifact-cost";
      costLabel.textContent = `花費 ${cost} 碎片 (擁有 ${fragments})`;
      node.appendChild(name);
      node.appendChild(desc);
      node.appendChild(costLabel);
      const affordable = fragments >= cost;
      node.style.opacity = affordable ? "1" : "0.5";
      node.onclick = () => {
        if (!affordable) return;
        this.pick(opt, cost);
      };
    });
  }

  pick(opt, cost) {
    this.visible = false;
    this.root.style.display = "none";
    if (this.onPick) {
      this.onPick(opt, cost);
    }
  }
}
