import { Button } from "@/components/ui/button";
import Image from "next/image";
import ChatInputBox from "./_components/ChatInputBox";
import 'dotenv/config';
export default function Home() {
  return (
    <div className="relative h-screen w-screen">
      <ChatInputBox/>
    </div>
  );
}
