import { NextRequest, NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';
import { z } from 'zod';
import { YOUTUBE_CONSTANTS, HTTP_HEADERS } from '@/constants/youtube.constant';

const requestSchema = z.object({
  url: z.string().regex(YOUTUBE_CONSTANTS.REGEX, YOUTUBE_CONSTANTS.MESSAGES.INVALID_URL),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = requestSchema.parse(body);

    const stream = youtubedl.exec(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: '-',
      noPlaylist: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        if (!stream.stdout) {
          controller.error(new Error(YOUTUBE_CONSTANTS.MESSAGES.DOWNLOAD_ERROR));
          return;
        }

        stream.stdout.on('data', (chunk: Buffer) => {
          controller.enqueue(chunk);
        });

        stream.stdout.on('end', () => {
          controller.close();
        });

        stream.stdout.on('error', (error: Error) => {
          controller.error(error);
        });
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': HTTP_HEADERS.CONTENT_TYPE_MP3,
        'Content-Disposition': HTTP_HEADERS.CONTENT_DISPOSITION,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: YOUTUBE_CONSTANTS.MESSAGES.DOWNLOAD_ERROR },
      { status: 500 }
    );
  }
}
