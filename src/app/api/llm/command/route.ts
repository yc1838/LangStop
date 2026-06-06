import { normalizeCommandResponse } from "@/domain";
import {
  buildCommandPrompts,
  callJsonLlm,
  isProviderRequestError,
  llmCommandRequestSchema,
  safeProviderErrorMessage
} from "@/providers";

export async function POST(request: Request): Promise<Response> {
  const parsed = llmCommandRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const prompts = buildCommandPrompts(parsed.data);
    const command = normalizeCommandResponse(
      await callJsonLlm({
        provider: parsed.data.provider,
        apiKey: parsed.data.apiKey,
        model: parsed.data.model,
        baseUrl: parsed.data.baseUrl,
        ...prompts
      })
    );

    return Response.json(command);
  } catch (error) {
    if (isProviderRequestError(error)) {
      return Response.json({ error: safeProviderErrorMessage }, { status: 502 });
    }

    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}

