import { test } from "@playwright/test";
import { mkdir, rm } from "fs/promises";
import { join } from "path";

// test("has title", async ({ page }) => {
//   await page.goto("https://playwright.dev/");

//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/);
// });

// test("get started link", async ({ page }) => {
//   await page.goto("https://playwright.dev/");

//   // Click the get started link.
//   await page.getByRole("link", { name: "Get started" }).click();

//   // Expects the URL to contain intro.
//   await expect(page).toHaveURL(/.*intro/);
// });

test("スクリーンショットを撮影します", async ({ page }) => {
  const outputDirectory = join(process.cwd(), "tmp");
  const items = [
    ["http://localhost:3000/", "トップ"],
    ["http://localhost:3000/subscriptions", "定期宅配お申し込み"],
    ["http://localhost:3000/calendar", "カレンダー設定"],
    ["http://localhost:3000/calendar/import", "カレンダー設定エクセル入力"],
    [
      "http://localhost:3000/calendar/import/finish",
      "カレンダー設定エクセル入力完了",
    ],
    ["http://localhost:3000/customers", "お客さま情報"],
    ["http://localhost:3000/customers/import", "お客さま情報エクセル入力"],
    [
      "http://localhost:3000/customers/import/finish",
      "お客さま情報エクセル入力完了",
    ],
    ["http://localhost:3000/customers/search", "お客さま情報検索"],
    ["http://localhost:3000/messages", "LINEメッセージ"],
    ["http://localhost:3000/messages/send", "LINEメッセージ一斉送信"],
    [
      "http://localhost:3000/messages/send/finish",
      "LINEメッセージ一斉送信完了",
    ],
    ["http://localhost:3000/courses", "コース"],
    ["http://localhost:3000/courses/import", "コースエクセル入力"],
    ["http://localhost:3000/courses/import/finish", "コースエクセル入力完了"],
  ];

  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory);

  let index = 1;

  for (const [url, basename] of items) {
    const number = ("" + index).padStart(2, "0");
    const extname = ".png";
    const filename = `${number}.${basename}${extname}`;
    const path = join(outputDirectory, filename);

    await page.goto(url);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await page.screenshot({ path, fullPage: true });

    index += 1;
  }
});
