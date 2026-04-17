import { httpAction } from "./_generated/server";

const SYSTEM = [
  "You edit React-PDF template source code for a browser-based PDF playground.",
  "The code is a single default-exported React component using @react-pdf/renderer primitives (Document, Page, View, Text, Image, StyleSheet).",
  'Fillable fields use $("Field Name") — preserve or add these when the user asks for new fields.',
  'Respond with a JSON object: {"code": string, "message": string}. `code` is the full updated source. `message` is a brief note to the user.',
  "Do not wrap the JSON in markdown fences.",
].join(" ");

export const editTemplate = httpAction(async (_ctx, request) => {
  const allowed = process.env.ALLOWED_ORIGIN ?? "";
  const origin = request.headers.get("origin") ?? "";

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (origin !== allowed) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { currentCode, instruction, history } = (await request.json()) as {
    currentCode: string;
    instruction: string;
    history: { role: "user" | "assistant"; content: string }[];
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": allowed,
      "X-Title": "PDF Template",
    },
    body: JSON.stringify({
      model: "qwen/qwen3-coder:free",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        ...history,
        {
          role: "user",
          content: `Current template code:\n\n\`\`\`tsx\n${currentCode}\n\`\`\`\n\nInstruction: ${instruction}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(JSON.stringify({ error: `openrouter: ${res.status} ${text}` }), {
      status: 502,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? "";
  let parsed: { code: string; message: string };
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { code: currentCode, message: text };
  }

  return new Response(JSON.stringify(parsed), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
