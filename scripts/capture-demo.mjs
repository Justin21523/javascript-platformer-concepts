import { chromium } from "@playwright/test";
import { copyFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const baseURL = process.env.DEMO_BASE_URL || "http://127.0.0.1:4173";
const outputRoot = "docs/demo";
const screenshotDir = join(outputRoot, "screenshots");
const videoDir = join(outputRoot, "video");
const tempVideoDir = join(outputRoot, ".video-temp");

mkdirSync(screenshotDir, { recursive: true });
mkdirSync(videoDir, { recursive: true });
rmSync(tempVideoDir, { recursive: true, force: true });
mkdirSync(tempVideoDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 980 },
  recordVideo: {
    dir: tempVideoDir,
    size: { width: 1440, height: 980 },
  },
});
const page = await context.newPage();

async function screenshot(name) {
  await page.screenshot({
    path: join(screenshotDir, name),
    fullPage: true,
  });
}

await page.goto(`${baseURL}/?demo=1`, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__PLATFORMER_DEMO__?.ready === true);
await page.waitForFunction(() => window.__PLATFORMER_DEMO__?.frames > 20);
await screenshot("01-playable-canvas.png");

await page.keyboard.press("F2");
await page.keyboard.press("F4");
await page.waitForTimeout(700);
await screenshot("02-debug-hitboxes-grid.png");

await page.keyboard.press("F7");
await page.waitForTimeout(700);
await screenshot("03-level-menu.png");
await page.keyboard.press("F7");

await page.keyboard.down("ArrowRight");
await page.waitForTimeout(700);
await page.keyboard.press("KeyK");
await page.waitForTimeout(1200);
await page.keyboard.up("ArrowRight");
await screenshot("04-hyperdrive-combat.png");

const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobilePage.goto(`${baseURL}/?demo=1`, { waitUntil: "networkidle" });
await mobilePage.waitForFunction(() => window.__PLATFORMER_DEMO__?.ready === true);
await mobilePage.screenshot({
  path: join(screenshotDir, "05-mobile.png"),
  fullPage: true,
});
await mobilePage.close();

await page.waitForTimeout(1000);
await context.close();
await browser.close();

const videos = readdirSync(tempVideoDir).filter((file) => file.endsWith(".webm"));
if (videos.length) {
  copyFileSync(join(tempVideoDir, videos[0]), join(videoDir, "demo-walkthrough.webm"));
}
rmSync(tempVideoDir, { recursive: true, force: true });

console.log(`Demo screenshots written to ${screenshotDir}`);
console.log(`Demo video written to ${join(videoDir, "demo-walkthrough.webm")}`);
