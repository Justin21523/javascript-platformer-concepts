// scenes/PauseScene.js
import { Scene } from "../core/Scene.js";
import { MenuScene } from "./MenuScene.js";

export class PauseScene extends Scene {
    constructor() {
        super();
        this.buttons = [];
        this.title = "2D Platformer";
        this.titlePosition = { x: 0, y: 150 };
        this.titleVelocity = { x: 2, y: 0 };
    }

    init() {
        // 創建模糊化的遊戲場景快照
        this.createBlurredScene();

        // 初始化按鈕
        this.buttons = [
            {
                text: "繼續遊戲",
                position: { x: 0, y: 300 },
                size: { width: 200, height: 60 },
                action: () => this.resume(),
                color: "#3498db"
            },
            {
                text: "返回主選單",
                position: { x: 0, y: 380 },
                size: { width: 200, height: 60 },
                action: () => this.backToMenu(),
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

    createBlurredScene() {
        // 創建模糊化的背景
        const canvas = document.createElement('canvas');
        canvas.width = this.game.canvas.width;
        canvas.height = this.game.canvas.height;
        const ctx = canvas.getContext('2d');

        // 繪製原始場景
        this.previousScene.draw.call({
            game: {
                ctx: ctx,
                canvas: canvas
            }
        });

        // 應用模糊效果
        const blurCtx = canvas.getContext('2d');
        blurCtx.filter = 'blur(5px) brightness(0.7)';
        blurCtx.drawImage(canvas, 0, 0);

        this.blurredScene = canvas;
    }


  resume() {
    this.game.setScene(this.previousScene);
  }

  backToMenu() {
    this.game.setScene(new MenuScene());
  }

    update() {
        // 暫停場景不需要更新
    }

    draw() {
        const { ctx, canvas } = this.game;

        // 繪製模糊背景
        if (this.blurredScene) {
            ctx.drawImage(this.blurredScene, 0, 0);
        }

        // 繪製半透明遮罩
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 繪製暫停標題
        ctx.fillStyle = "#ecf0f1";
        ctx.font = "bold 48px 'Press Start 2P', cursive, Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("遊戲暫停", canvas.width / 2, 200);

        // 繪製按鈕
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
        // 與 MenuScene 相同的實現
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
