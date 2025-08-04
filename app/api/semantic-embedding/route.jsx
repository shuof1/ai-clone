import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/services/supabase";
const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

export async function POST(req) {
    const { searchInput, searchResults, libid } = await req.json();

    for (const item of searchResults) {
        const content = `${item.title ?? ""}\n${item.description ?? ""}`;
        if (!content.trim()) continue;
        // Step 1: Generate embeddings for each result
        try {
            const embeddingResp = await openai.embeddings.create({
                input: item.content,
                model: "text-embedding-3-small",
            });

            const [{ embedding }] = embeddingResp.data;
            // Step 2: Insert into semantic_results table
            const { error } = await supabase.from("semantic_results").insert({
                libid: libid,
                content: item.content,
                url: item.url,
                embedding,
            });

            if (error) {
                console.error("Insert error:", error);
            }
        } catch (err) {
            console.error("Embedding error:", err);
        }
    }

    // Step 3: Embed input query
    const input = await openai.embeddings.create({
        input: searchInput,
        model: "text-embedding-3-small",
    });
    const [{ embedding }] = input.data;

    // Step 4: Call RPC function for semantic match
    const { data: matches, e } = await supabase
        .rpc("match_semantic_results", {
            query_embedding: embedding,
            match_threshold: 0.85,
            match_count: 6
        });
    if (e) {
        console.error("Semantic match error:", e);
    } else {
        console.log("Top matching results:", matches);
    }
    
    return NextResponse.json(matches)
}