import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChatProvider } from "@/context/ChatContext";
import { ChatroomProvider } from "@/context/ChatroomContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChatroomProvider>
      <ChatProvider>
        <Component {...pageProps} />
      </ChatProvider>
    </ChatroomProvider>
  );
}
