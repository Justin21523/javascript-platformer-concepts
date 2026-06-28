import { expect, test } from "@playwright/test";

test("production demo loads assets and renders nonblank canvas", async ({ page, request }) => {
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  const tilesetResponse = await request.get("/assets/tileset.json");
  expect(tilesetResponse.ok()).toBe(true);
  expect(tilesetResponse.headers()["content-type"]).toContain("application/json");

  const spriteResponse = await request.get("/assets/sprites/player/JackOLantern/Idle/Idle(1).png");
  expect(spriteResponse.ok()).toBe(true);
  expect(spriteResponse.headers()["content-type"]).toContain("image/png");

  await page.goto("/?demo=1", { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__PLATFORMER_DEMO__?.ready === true);
  await page.waitForFunction(() => window.__PLATFORMER_DEMO__?.frames > 10);

  const nonblankPixels = await page.evaluate(() => {
    const canvas = document.querySelector("#gameCanvas");
    const ctx = canvas.getContext("2d");
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let nonblank = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] || data[i + 1] || data[i + 2]) nonblank++;
    }
    return nonblank;
  });

  expect(nonblankPixels).toBeGreaterThan(10_000);
  expect(consoleErrors.filter((text) => !text.includes("favicon"))).toEqual([]);
});
