// app/api/get/route.ts
import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";

export const dynamic = "force-dynamic";
export const maxDuration = 15; // Vercel: allow up to 15s

export async function GET(req: NextRequest) {
  const url =
    req.nextUrl.searchParams.get("url") ??
    "https://watch.vidora.su/watch/movie/1242898";

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      viewport: { width: 1920, height: 1080 },
    });

    // Bypass bot detection
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    const page = await context.newPage();
    let m3u8Url = "";

    // Capture the real stream request
    page.on("request", (req) => {
      const url = req.url();
      if (
        url.includes("workers.dev") &&
        url.includes(".m3u8") &&
        url.includes("cGxheWxpc3Q")
      ) {
        m3u8Url = url;
      }
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });

    // Wait up to 10 seconds for the request
    for (let i = 0; i < 20; i++) {
      if (m3u8Url) break;
      await new Promise((r) => setTimeout(r, 500));
    }

    await browser.close();

    if (!m3u8Url) {
      return NextResponse.json({
        success: false,
        error: "Stream not found in 10s",
      });
    }

    return NextResponse.json({
      success: true,
      realStreamUrl: m3u8Url,
      playInVLC: m3u8Url,
      download: `ffmpeg -i "${m3u8Url}" -c copy "movie.mp4"`,
    });
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    });
  }
}
