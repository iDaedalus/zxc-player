// import { NextRequest, NextResponse } from "next/server";

// const STREAM_URL =
//   "https://icy-boat-356c.10011-8fd.workers.dev/frostveil88.live/file2/Ti+LM4LAW5MhXLc79dvs8zxZvHJwRdjFO4FqI4Ys9i8NoMl6nngMv214+UEFnV~c2iD3exKCtYcIm~MNbCdcMp7CQDq45JeMeCKADDFpMgYlNT519AfN+hQNQJQ0yDafQsVxOJH3axBGAtAWBfAidz9QUkzHFdNUPup00nSnTgM=/MTA4MA==/aW5kZXgubTN1OA==.m3u8";

// export async function GET(request: NextRequest) {
//   try {
//     const response = await fetch(STREAM_URL, {
//       method: "GET",
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
//         Referer: "https://watch.vidora.su/",
//         Origin: "https://watch.vidora.su", // Test origin—change to "http://localhost:3000" to simulate your app
//       },
//     });

//     const corsOrigin = response.headers.get("access-control-allow-origin");
//     const corsMethods = response.headers.get("access-control-allow-methods");
//     const contentType = response.headers.get("content-type");
//     const textPreview = await response.text();

//     const isValidM3U8 = textPreview.startsWith("#EXTM3U");

//     return NextResponse.json({
//       success: response.ok && isValidM3U8,
//       status: response.status,
//       corsAllowsOrigin: corsOrigin === "*" || corsOrigin?.includes("localhost"),
//       corsAllowsMethods: corsMethods?.includes("GET"),
//       isValidM3U8,
//       contentType,
//       preview:
//         textPreview.substring(0, 200) + (textPreview.length > 200 ? "..." : ""),
//       fullLength: textPreview.length,
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { error: (error as Error).message, success: false },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get raw URL from query
  const rawUrl = request.nextUrl.searchParams.get("url");

  // Decode URL so +, =, ~ and other chars stay correct
  const url = rawUrl ? decodeURIComponent(rawUrl) : null;

  if (!url) {
    return NextResponse.json(
      { success: false, error: "Missing 'url' parameter" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
        Referer: "https://watch.vidora.su/",
        Origin: "https://watch.vidora.su",
      },
    });

    const textPreview = await response.text();
    const isValidM3U8 = textPreview.startsWith("#EXTM3U");

    return NextResponse.json({
      success: response.ok && isValidM3U8,
      status: response.status,
      isValidM3U8,
      contentType: response.headers.get("content-type"),
      preview:
        textPreview.substring(0, 200) + (textPreview.length > 200 ? "..." : ""),
      fullLength: textPreview.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// gagana pag hindi naka encodeUri
