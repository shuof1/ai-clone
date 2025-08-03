import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";
export async function POST(req) {
    try {
        const body = await req.json();
        console.log("🟡 Received POST /api/llm-model with body:", body);

        const { searchInput, searchResult, recordId } = body;
       
        const inngestRunId = await inngest.send({
            name: "llm-model",
            data: {
                searchInput: searchInput,
                searchResult: searchResult,
                recordId: recordId
            },
        });
        return NextResponse.json(inngestRunId.ids[0])
    } catch (error) {
        console.error("LLM-API Error:", error); // 👈 打印真正的错误信息
        return NextResponse.json(
            { error: "Something went wrong", detail: error.message },
            { status: 500 }
        );
    }

}