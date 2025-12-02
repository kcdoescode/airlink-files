import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useHistory } from "@/hooks/useHistory";
import { toast } from "sonner";

const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: process.env.NEXT_PUBLIC_TURN_URL as string,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME,
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
    },
  ],
};

export type ChatMessage = {
  text: string;
  sender: "me" | "peer" | "system";
  timestamp: number;
};

export const useWebRTC = (roomId: string) => {
  const [status, setStatus] = useState("Initializing...");
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);

  const { addToHistory } = useHistory();

  const receivedChunks = useRef<any[]>([]);
  const receivedSize = useRef(0);
  const totalSize = useRef(0);
  const fileName = useRef<string>("");

  useEffect(() => {
    const channel = supabase.channel(roomId);

    const sendSignal = async (payload: any) => {
      await channel.send({ type: "broadcast", event: "signal", payload });
    };

    const setupDataChannel = (dc: RTCDataChannel) => {
      dataChannel.current = dc;

      dc.onopen = () => {
        setStatus("Connected! 🟢");
        toast.success("Peer Connected Successfully!");
        setMessages(prev => [...prev, { text: "Peer connected", sender: "system", timestamp: Date.now() }]);
      };

      dc.onmessage = (e) => {
        const data = e.data;

        if (typeof data === "string") {
          const parsed = JSON.parse(data);

          if (parsed.type === "file-meta") {
            totalSize.current = parsed.size;
            fileName.current = parsed.name;
            receivedChunks.current = [];
            receivedSize.current = 0;
            setStatus(`Receiving: ${parsed.name}...`);
            toast.info(`Receiving ${parsed.name}...`);
            setMessages(prev => [...prev, { text: `⬇️ Incoming file: ${parsed.name}`, sender: "system", timestamp: Date.now() }]);
          } 
          else if (parsed.type === "chat") {
            setMessages((prev) => [
              ...prev, 
              { text: parsed.text, sender: "peer", timestamp: Date.now() }
            ]);
          }
        } 
        else {
          receivedChunks.current.push(data);
          receivedSize.current += data.byteLength;

          if (totalSize.current > 0) {
            setProgress(Math.round((receivedSize.current / totalSize.current) * 100));
          }

          if (receivedSize.current >= totalSize.current) {
            setStatus("File Received! ✅");
            addToHistory(fileName.current, totalSize.current, "received");
            toast.success("File Downloaded!");
            setMessages(prev => [...prev, { text: `✅ Received: ${fileName.current}`, sender: "system", timestamp: Date.now() }]);

            const blob = new Blob(receivedChunks.current);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName.current;
            a.click();
          }
        }
      };
    };

    const handleSignal = async (payload: any) => {
      const pc = peerConnection.current;
      if (!pc) return;

      try {
        if (payload.type === "ready") {
          setStatus("Peer found! Connecting...");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal({ type: "offer", sdp: offer });
        } else if (payload.type === "offer") {
          setStatus("Connecting...");
          await pc.setRemoteDescription(payload.sdp);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal({ type: "answer", sdp: answer });
        } else if (payload.type === "answer") {
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(payload.sdp);
          }
        } else if (payload.type === "candidate") {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(payload.candidate);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    peerConnection.current = new RTCPeerConnection(RTC_CONFIG);
    
    const dc = peerConnection.current.createDataChannel("file-transfer");
    setupDataChannel(dc);

    peerConnection.current.ondatachannel = (event) => {
      console.log("Received Data Channel from Peer");
      setupDataChannel(event.channel);
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) sendSignal({ type: "candidate", candidate: event.candidate });
    };

    channel
      .on("broadcast", { event: "signal" }, async ({ payload }) => await handleSignal(payload))
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setStatus("Waiting for peer...");
          sendSignal({ type: "ready" });
        }
      });

    return () => {
      channel.unsubscribe();
      peerConnection.current?.close();
    };
  }, [roomId]);

  const sendFile = async (file: File) => {
    const dc = dataChannel.current;
    if (!dc || dc.readyState !== "open") {
      toast.error("No connection! Wait for peer.");
      return;
    }
    
    dc.send(JSON.stringify({ type: "file-meta", name: file.name, size: file.size }));
    setMessages(prev => [...prev, { text: `⬆️ Sending file: ${file.name}`, sender: "system", timestamp: Date.now() }]);

    const chunkSize = 16 * 1024;
    let offset = 0;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        dc.send(reader.result as ArrayBuffer);
        offset += chunkSize;
        setProgress(Math.round((offset / file.size) * 100));
        
        if (offset < file.size) {
          readSlice(offset);
        } else {
          setStatus("Sent Successfully! ✅");
          addToHistory(file.name, file.size, "sent");
          toast.success("File Sent Successfully!");
        }
      }
    };
    const readSlice = (o: number) => {
      const slice = file.slice(o, o + chunkSize);
      reader.readAsArrayBuffer(slice);
    };
    readSlice(0);
  };

  const sendMessage = (text: string) => {
    const dc = dataChannel.current;
    if (!dc || dc.readyState !== "open") return;

    dc.send(JSON.stringify({ type: "chat", text }));
    setMessages((prev) => [...prev, { text, sender: "me", timestamp: Date.now() }]);
  };

  return { status, progress, sendFile, sendMessage, messages };
};