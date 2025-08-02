import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { searchInput } = await req.json();
  if (!searchInput) return NextResponse.json({ error: "Missing input" }, { status: 400 });

  try {
    const { data } = await axios.get(
      `https://api.search.brave.com/res/v1/web/search?q=${searchInput}&count=5`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': process.env.BRAVE_API_KEY
        }
      }
    );

    // ✅ 提取需要的字段进行格式化
    // const formatted = data.web?.results?.map(item => ({
    //   title: item.title,
    //   description: item.description,
    //   long_name: item.profile?.long_name,
    //   img: item.profile?.img,
    //   url: item.url,
    //   thumbnail: item.thumbnail?.src
    // }));

    return NextResponse.json(result.data);
  } catch (err) {
    console.error("Brave Search Error:", err.message);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
