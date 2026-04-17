import { httpAction } from "./_generated/server";

const SYSTEM = [
  "You edit React-PDF template source code for a browser-based PDF playground.",
  "The code is a single default-exported React component using @react-pdf/renderer primitives (Document, Page, View, Text, Image, StyleSheet).",
  'Fillable fields use $("Field Name") — preserve or add these when the user asks for new fields.',
  'Respond with a JSON object: {"code": string, "message": string}. `code` is the full updated source. `message` is a brief note to the user.',
  "Do not wrap the JSON in markdown fences.",
].join(" ");

const MODELS = [
  "qwen/qwen3-coder:free",
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
];

export const editTemplate = httpAction(async (_ctx, request) => {
  const allowed = process.env.ALLOWED_ORIGIN ?? "";

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const origin = request.headers.get("origin") ?? "";
  if (origin !== allowed) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { currentCode, instruction, history } = (await request.json()) as {
      currentCode: string;
      instruction: string;
      history: { role: "user" | "assistant"; content: string }[];
    };

    const messages = [
      { role: "system", content: SYSTEM },
      ...history,
      {
        role: "user",
        content: `Current template code:\n\n\`\`\`tsx\n${currentCode}\n\`\`\`\n\nInstruction: ${instruction}`,
      },
    ];

    let lastError = "";

    for (const model of MODELS) {
      console.log("Trying model:", model);

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": allowed,
          "X-Title": "PDF Template",
        },
        body: JSON.stringify({
          model,
          response_format: { type: "json_object" },
          messages,
        }),
      });

      if (res.status === 429) {
        lastError = await res.text();
        console.log("Rate limited on", model, "— trying next");
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        console.error("OpenRouter error:", res.status, text.slice(0, 500));
        return new Response(JSON.stringify({ error: `openrouter: ${res.status} ${text}` }), {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      console.log("Success with model:", model);

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
    }

    return new Response(JSON.stringify({ error: `All models rate-limited. ${lastError}` }), {
      status: 429,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e: unknown) {
    console.error("editTemplate crashed:", e);
    const message = e instanceof Error ? e.message : "Internal error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
