// scenes/MenuScene.js
import { Scene } from "../core/Scene.js";

export class MenuScene extends Scene {
    constructor() {
        super();
        this.buttons = [];
        this.title = "2D Platformer";
        this.titlePosition = { x: 0, y: 150 };
        this.titleVelocity = { x: 2, y: 0 };
    }

    init() {
          // 初始化選單按鈕
          this.buttons = [
              {
                  text: "開始遊戲",
                  position: { x: 0, y: 250 },
                  size: { width: 200, height: 60 },
                  action: () => this.startGame(),
                  color: "#3498db"
              },
              {
                  text: "設定",
                  position: { x: 0, y: 330 },
                  size: { width: 200, height: 60 },
                  action: () => this.openSettings(),
                  color: "#2ecc71"
              },
              {
                  text: "離開遊戲",
                  position: { x: 0, y: 410 },
                  size: { width: 200, height: 60 },
                  action: () => this.exitGame(),
                  color: "#e74c3c"
              }
          ];
          // 居中對齊按鈕
          const canvasCenter = this.game.canvas.width / 2;
          this.buttons.forEach(btn => {
              btn.position.x = canvasCenter - btn.size.width / 2;
          });

          this.titlePosition.x = canvasCenter;

    }

    startGame() {
        // 導入 GameScene 類別
        import("./GameScene.js").then(module => {
            const GameScene = module.GameScene;
            this.game.setScene(new GameScene());
        });
    }

    openSettings() {
        console.log("開啟設定選單");
        // TODO: 實作設定場景
    }


    exitGame() {
        if (confirm("確定要離開遊戲嗎？")) {
            window.close();
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        // 標題動畫
        this.titlePosition.x += this.titleVelocity.x;
        if (this.titlePosition.x > this.game.canvas.width + 200) {
            this.titlePosition.x = -200;
        }
    }

    draw() {
        const { ctx, canvas } = this.game;

        // 繪製漸層背景
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#2c3e50");
        gradient.addColorStop(1, "#1a2530");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 繪製標題 (帶有陰影效果)
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        ctx.fillStyle = "#ecf0f1";
        ctx.font = "bold 64px 'Press Start 2P', cursive, Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.title, this.titlePosition.x, this.titlePosition.y);

        // 重置陰影
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        // 繪製按鈕 (帶有懸停效果)
        this.buttons.forEach(btn => {
            const isHover = this.isMouseOverButton(btn);
            const btnColor = isHover ? this.lightenColor(btn.color, 20) : btn.color;

            // 按鈕背景
            ctx.fillStyle = btnColor;
            ctx.beginPath();
            ctx.roundRect(
                btn.position.x,
                btn.position.y,
                btn.size.width,
                btn.size.height,
                10
            );
            ctx.fill();

            // 按鈕邊框
            ctx.strokeStyle = "#ecf0f1";
            ctx.lineWidth = 2;
            ctx.stroke();

            // 按鈕文字
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 24px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
                btn.text,
                btn.position.x + btn.size.width / 2,
                btn.position.y + btn.size.height / 2
            );
        });

        // 繪製版權資訊
        ctx.fillStyle = "rgba(236, 240, 241, 0.6)";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("© 2023 2D Platformer 開發團隊", canvas.width / 2, canvas.height - 20);
    }

    handleClick(x, y) {
        this.buttons.forEach(btn => {
            if (this.isMouseOverButton(btn, x, y)) {
                btn.action();
            }
        });
    }

    isMouseOverButton(btn, x, y) {
        return x > btn.position.x &&
               x < btn.position.x + btn.size.width &&
               y > btn.position.y &&
               y < btn.position.y + btn.size.height;
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;

        return `#${(
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1)}`;
    }

}
