import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription, resume } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing job readiness...");

    const systemPrompt = `You are an expert career advisor and job readiness analyzer. Your task is to:
1. Extract key skills, tools, and requirements from the job description
2. Extract skills, experience, and qualifications from the resume
3. Calculate a readiness score (0-10) based on:
   - Skills Match: 50%
   - Tools/Technologies Match: 30%
   - Experience Match: 20%
4. Identify specific skill gaps
5. Provide ONE actionable recommendation

Score interpretation:
- 8-10: Strong Match
- 5-7: Moderate Match
- 0-4: Weak Match

Return ONLY valid JSON in this exact format:
{
  "score": number,
  "label": "Strong Match" | "Moderate Match" | "Weak Match",
  "explanation": "Brief explanation of the score",
  "skillGaps": ["skill1", "skill2"],
  "recommendation": "One specific actionable tip"
}`;

    const userPrompt = `Job Description:
${jobDescription}

Resume:
${resume}

Analyze the match between this job and resume. Return ONLY the JSON response, no additional text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("AI Response:", content);

    // Parse the JSON response
    let analysisResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback response if parsing fails
      analysisResult = {
        score: 5,
        label: "Moderate Match",
        explanation: "Unable to perform detailed analysis. Please try again.",
        skillGaps: ["Analysis error - please retry"],
        recommendation: "Ensure your resume clearly highlights relevant skills and experience.",
      };
    }

    console.log("Analysis complete:", analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-job-readiness:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred during analysis";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
