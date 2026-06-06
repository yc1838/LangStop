import {
  elevenLabsTtsRequestSchema,
  isProviderRequestError,
  requestElevenLabsTts,
  safeProviderErrorMessage
} from "@/providers";

export async function POST(request: Request): Promise<Response> {
  const parsed = elevenLabsTtsRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const result = await requestElevenLabsTts(parsed.data);
    return new Response(result.audio, {
      status: 200,
      headers: {
        "content-type": result.contentType
      }
    });
  } catch (error) {
    if (isProviderRequestError(error)) {
      return Response.json({ error: safeProviderErrorMessage }, { status: 502 });
    }

    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}

