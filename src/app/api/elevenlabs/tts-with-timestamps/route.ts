import {
  elevenLabsTtsRequestSchema,
  isProviderRequestError,
  requestElevenLabsTtsWithTimestamps,
  safeProviderErrorMessage
} from "@/providers";

export async function POST(request: Request): Promise<Response> {
  const parsed = elevenLabsTtsRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    return Response.json(await requestElevenLabsTtsWithTimestamps(parsed.data));
  } catch (error) {
    if (isProviderRequestError(error)) {
      return Response.json({ error: safeProviderErrorMessage }, { status: 502 });
    }

    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}

