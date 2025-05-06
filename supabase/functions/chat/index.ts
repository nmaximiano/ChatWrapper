import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Command } from "https://deno.land/x/cmd@v1.2.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const { message, userId } = await req.json();

    if (!message) {
      throw new Error("No message provided");
    }

    // Execute Python handler using Deno's Command API
    const pythonProcess = new Command("python3", {
      args: ["handler.py"],
      env: {
        OPENAI_API_KEY: OPENAI_API_KEY,
      },
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    });

    // Prepare input for Python script
    const pythonInput = JSON.stringify({
      message,
      userId: userId || "anonymous",
    });

    // Start the process and write to stdin
    pythonProcess.start();
    const writer = pythonProcess.stdin.getWriter();
    await writer.write(new TextEncoder().encode(pythonInput));
    await writer.close();

    // Read the output
    const output = await new Response(pythonProcess.stdout).text();
    const errorOutput = await new Response(pythonProcess.stderr).text();
    const status = await pythonProcess.status;

    // Check for errors
    if (!status.success) {
      console.error("Python process error:", errorOutput);
      throw new Error(`Python process failed: ${errorOutput}`);
    }

    // Parse the output
    let result;
    try {
      result = JSON.parse(output);
    } catch (e) {
      console.error("Failed to parse Python output:", output);
      throw new Error(`Invalid output from Python: ${output}`);
    }

    // Return the result
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
