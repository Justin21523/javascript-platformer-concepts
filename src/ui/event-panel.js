// src/ui/event-panel.js
// 簡易事件資訊提示（顯示當前祭壇類型與獎勵/陷阱描述）

export class EventPanel {
  constructor() {
    this.root = document.createElement("div");
    this.root.id = "eventPanel";
    this.root.style.position = "fixed";
    this.root.style.bottom = "12px";
    this.root.style.left = "12px";
    this.root.style.padding = "10px 12px";
    this.root.style.background = "rgba(20,20,40,0.8)";
    this.root.style.border = "1px solid rgba(120,160,255,0.5)";
    this.root.style.color = "#e8ecff";
    this.root.style.fontSize = "12px";
    this.root.style.lineHeight = "1.4";
    this.root.style.display = "none";
    this.root.style.zIndex = "1200";
    document.body.appendChild(this.root);
  }

  show(text) {
    this.root.textContent = text;
    this.root.style.display = "block";
  }

  hide() {
    this.root.style.display = "none";
  }
}
