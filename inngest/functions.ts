import { supabase } from "@/services/supabase";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

export const llmModel = inngest.createFunction(
  { id: "llm-model" },
  { event: "llm-model" },
  async ({ event, step }) => {
    const aiResp = await step.ai.infer('generate-ai-llm-model-call', {
      model: step.ai.models.gemini({
        model: 'gemini-2.0-flash',
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
      }),
      body: {
        contents: [
          // {
          //   role: 'system',
          //   parts: [
          //     {
          //       text: 'Depends on user input sources, Summerize and search about topic, Give me a markdown text proper formatting. User input is:'
          //         + event.data.searchInput
          //     }
          //   ]
          // },
          {
            role: 'user',
            parts: [
              {
                text: `
You are a helpful assistant. Given the following user input and web search sources, generate a well-formatted **Markdown summary** of the topic.

### Instructions:
- Use markdown syntax (## headings, **bold**, *italic*, lists)
- Be concise and structured
- Provide a readable and informative summary

User input:
${event.data.searchInput}

Search sources:
${JSON.stringify(event.data.searchResult, null, 2)}
`
              }
            ]
          }
        ]
      }
    })

    const saveToDb = await step.run('saveToDb', async () => {
      console.log(aiResp);
      const { data, error } = await supabase
        .from('Chats')
        .update({ aiResp: aiResp?.candidates[0].content.parts[0] })
        .eq('id', event.data.recordId)
        .select()
      return aiResp;
    })
  }
);