import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/Icon";
import { AppHeader, SideNav, BottomNav } from "@/components/AppShell";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  head: () => ({
    meta: [
      { title: "EduBot — Chat Tutor" },
      {
        name: "description",
        content:
          "Conversa con tu tutor educativo anónimo y recibe explicaciones a tu ritmo.",
      },
    ],
  }),
});

type Msg = { from: "bot" | "user"; text: string };

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "bot",
      text:
        "¡Hola! Soy tu Tutor Educativo. ¿En qué tema te gustaría profundizar hoy? Puedo ayudarte con matemáticas, historia o incluso revisar tus ejercicios actuales.",
    },
    {
      from: "user",
      text:
        "Me gustaría entender mejor la fotosíntesis. ¿Podrías explicármelo de forma sencilla?",
    },
    {
      from: "bot",
      text:
        'Imagina que las plantas tienen "cocinas" en sus hojas. Para cocinar su alimento (glucosa) necesitan luz solar, agua y dióxido de carbono. ¿Sabes qué gas liberan como resultado?',
    },
    { from: "user", text: "¡Sí! Liberan oxígeno, ¿verdad?" },
  ]);
  const [input, setInput] = useState("");
  const [confidence, setConfidence] = useState<string | null>("Alta");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [
      ...m,
      { from: "user", text },
      {
        from: "bot",
        text: "¡Excelente pregunta! Déjame pensarlo y te respondo enseguida.",
      },
    ]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <SideNav />
      <BottomNav />

      <main className="md:pl-80 pt-16 pb-24 md:pb-0 h-screen flex flex-col">
        <div className="max-w-[768px] mx-auto w-full h-full flex flex-col px-margin-mobile md:px-md">
          <div ref={scrollRef} className="flex-1 overflow-y-auto pt-lg pb-md space-y-md">
            {messages.map((m, i) => (
              <Bubble key={i} msg={m} />
            ))}

            <div className="bg-surface-container-lowest p-md rounded-xl shadow-[var(--shadow-elev-1)] border border-outline-variant/30">
              <div className="w-full h-40 rounded-lg mb-md bg-gradient-to-br from-primary-container/40 via-tertiary-fixed/30 to-primary-fixed/40 flex items-center justify-center">
                <Icon name="eco" className="text-primary" style={{ fontSize: 64 }} fill />
              </div>
              <h3 className="font-label-md text-label-md text-on-surface">
                Diagrama Interactivo: Proceso Químico
              </h3>
              <p className="text-xs text-on-surface-variant">Ref: BIO-101-SEC2</p>
            </div>

            <div className="flex flex-col gap-sm py-md">
              <p className="font-label-md text-label-md text-center text-on-surface-variant uppercase tracking-wider">
                ¿Qué tan clara fue esta explicación?
              </p>
              <div className="flex justify-between gap-xs max-w-md mx-auto w-full">
                {["Baja", "Media", "Alta"].map((opt) => {
                  const active = confidence === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setConfidence(opt)}
                      className={`flex-1 h-12 rounded-lg font-label-md text-label-md transition-all duration-200 active:scale-95 border ${
                        active
                          ? "bg-primary-container border-primary-container text-on-primary-container shadow-[var(--shadow-elev-2)]"
                          : "bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-primary-container/40"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-background pt-base pb-md">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-full shadow-[var(--shadow-elev-2)] px-md py-xs flex items-center gap-sm">
              <button className="p-xs text-on-surface-variant hover:text-primary transition-colors">
                <Icon name="add_circle" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                className="flex-1 bg-transparent border-none outline-none font-body-md text-on-surface placeholder:text-on-surface-variant/60"
                placeholder="Escribe tu duda aquí..."
              />
              <button
                onClick={send}
                className="bg-primary-container text-on-primary-container w-10 h-10 flex items-center justify-center rounded-full shadow-sm hover:shadow-md active:scale-90 transition-all"
              >
                <Icon name="send" fill />
              </button>
            </div>
            <p className="text-center text-[10px] text-on-surface-variant/60 mt-xs hidden md:block">
              EduBot puede cometer errores. Verifica la información importante.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  if (msg.from === "user") {
    return (
      <div className="flex flex-col gap-xs max-w-[85%] ml-auto items-end">
        <span className="font-label-md text-[12px] text-on-surface-variant mr-base">Tú</span>
        <div className="bg-primary-container text-[#333333] p-md rounded-xl rounded-tr-none shadow-[var(--shadow-elev-1)]">
          <p className="font-body-md text-body-md">{msg.text}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-xs max-w-[85%]">
      <div className="flex items-center gap-xs ml-base">
        <Icon name="smart_toy" className="text-primary" style={{ fontSize: 16 }} />
        <span className="font-label-md text-[12px] text-on-surface-variant">Tutor Educativo</span>
      </div>
      <div className="bg-surface-container-lowest text-on-surface p-md rounded-xl rounded-tl-none shadow-[var(--shadow-elev-1)] border border-outline-variant/30">
        <p className="font-body-md text-body-md">{msg.text}</p>
      </div>
    </div>
  );
}
