import { NextResponse } from "next/server";
import {
  makeProviders,
  makeStandardFetcher,
  targets,
} from "@p-stream/providers";
export interface MovieMedia {
  type: "movie";
  tmdbId: string;
  title: string;
  releaseYear: number;
}

export interface ShowMedia {
  type: "show";
  tmdbId: string;

  title: string;
  releaseYear: number;

  season: {
    number: number;
    tmdbId: string;
    title: string;
    episodeCount?: number;
  };

  episode: {
    number: number;
    tmdbId: string;
  };
}

const customFetch: typeof fetch = (input, init) => {
  return fetch(input, {
    ...init,
    headers: {
      // Mobile Chrome on Android (Pixel 9, Android 15, Chrome 131)
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",

      // Common mobile headers
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",

      // Optional: fake viewport (some sites check this via JS, but good for realism)
      "Viewport-Width": "412",
      DPR: "2.625", // Pixel 9 has ~420dpi → ~2.6x

      // Override any headers passed in init
      ...((init?.headers as Record<string, string>) || {}),
    },
    signal: init?.signal ?? AbortSignal.timeout?.(30_000),
  });
};

const providers = makeProviders({
  fetcher: makeStandardFetcher(customFetch), // Only 1 argument!
  target: targets.NATIVE,
});

export async function GET(req: Request) {
  console.log(
    "providers",
    providers.listSources().filter((s) => s.mediaTypes?.includes("show"))
  );

  const url = new URL(req.url);
  const title = url.searchParams.get("title") || "";
  const releaseYear = Number(url.searchParams.get("releaseYear") || 0);
  const tmdbId = url.searchParams.get("tmdbId");
  const media_type = url.searchParams.get("media_type") || "movie";

  const seasonTitle = url.searchParams.get("seasonTitle") || "";
  const season = Number(url.searchParams.get("season") || 1);
  const episode = Number(url.searchParams.get("episode") || 1);
  const episodeCount = Number(url.searchParams.get("episodeCount") || 0);
  if (!tmdbId)
    return NextResponse.json({ success: false, error: "Missing TMDB ID" });

  // --------------------------
  // MOVIE MEDIA
  // --------------------------
  if (media_type === "movie") {
    const media: MovieMedia = {
      type: "movie" as const,
      tmdbId,
      title,
      releaseYear,
    };
    try {
      const streams = await providers.runAll({ media });
      return NextResponse.json({ success: true, streams });
    } catch (error) {
      return NextResponse.json({
        success: false,
        streams: [],
        message: "404 not found.",
      });
    }
  }
  // --------------------------
  // SHOW MEDIA
  // --------------------------

  const media: ShowMedia = {
    type: "show" as const,
    tmdbId,
    title,
    releaseYear,

    season: {
      number: season,
      tmdbId,
      title: seasonTitle,
      episodeCount,
    },

    episode: {
      number: episode,
      tmdbId,
    },
  };

  try {
    const streams = await providers.runAll({ media });
    return NextResponse.json({ success: true, streams });
  } catch (error) {
    return NextResponse.json({
      success: false,
      streams: [],
      message: "404 not found. Try switching server.",
    });
  }
}
