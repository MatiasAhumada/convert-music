import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { z } from "zod";
import { YOUTUBE_CONSTANTS, HTTP_HEADERS } from "@/constants/youtube.constant";

const requestSchema = z.object({
  url: z.string().regex(YOUTUBE_CONSTANTS.REGEX, YOUTUBE_CONSTANTS.MESSAGES.INVALID_URL),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = requestSchema.parse(body);

    const ytDlpPath =
      process.platform === "win32"
        ? "C:\\Users\\Matias\\AppData\\Local\\Microsoft\\WinGet\\Packages\\yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe\\yt-dlp.exe"
        : "/usr/local/bin/yt-dlp";

    console.log("Using yt-dlp path:", ytDlpPath);

    const getTitle = spawn(ytDlpPath, [
      url,
      "--print", "title",
      "--no-playlist",
      "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ]);
    let title = "audio";

    await new Promise<void>((resolve, reject) => {
      let titleData = "";
      let errorData = "";
      getTitle.stdout?.on("data", (chunk: Buffer) => {
        titleData += chunk.toString();
      });
      getTitle.stderr?.on("data", (chunk: Buffer) => {
        errorData += chunk.toString();
      });
      getTitle.on("close", () => {
        if (errorData) {
          console.log("yt-dlp stderr:", errorData);
        }
        const cleanTitle = titleData
          .trim()
          .replace(/[^a-z0-9\s]/gi, "_")
          .replace(/\s+/g, "_")
          .substring(0, 50);
        console.log("Video title:", cleanTitle || "audio");
        if (cleanTitle) {
          title = cleanTitle;
        }
        resolve();
      });
      getTitle.on("error", () => resolve());
    });

    const ytDlp = spawn(ytDlpPath, [
      url,
      "--extract-audio",
      "--audio-format",
      "mp3",
      "--output",
      "-",
      "--no-playlist",
      "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ]);

    const readableStream = new ReadableStream({
      async start(controller) {
        if (!ytDlp.stdout) {
          controller.error(new Error(YOUTUBE_CONSTANTS.MESSAGES.DOWNLOAD_ERROR));
          return;
        }

        ytDlp.stdout.on("data", (chunk: Buffer) => {
          controller.enqueue(chunk);
        });

        ytDlp.stdout.on("end", () => {
          controller.close();
        });

        ytDlp.on("error", (error: Error) => {
          controller.error(error);
        });
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": HTTP_HEADERS.CONTENT_TYPE_MP3,
        "Content-Disposition": `attachment; filename="${title}.mp3"`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: YOUTUBE_CONSTANTS.MESSAGES.DOWNLOAD_ERROR }, { status: 500 });
  }
}
