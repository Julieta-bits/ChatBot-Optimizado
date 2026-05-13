import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/evaluation")({
  component: EvaluationPage,
  head: () => ({
    meta: [
      { title: "EduBot — Evaluación de Confianza" },
      {
        name: "description",
        content:
          "Comparte cómo te sientes con cada tema para que EduBot ajuste tu ritmo de aprendizaje.",
      },
    ],
  }),
});

const SCALE = [
  { label: "Muy baja", icon: "sentiment_very_dissatisfied" },
  { label: "Baja", icon: "sentiment_dissatisfied" },
  { label: "Media", icon: "sentiment_neutral" },
  { label: "Alta", icon: "sentiment_satisfied" },
  { label: "Muy alta", icon: "sentiment_very_satisfied" },
];

function EvaluationPage() {
  const [selected, setSelected] = useState(3);
  const pct = ((selected + 1) / SCALE.length) * 100;

  return (
    <AppShell>
      <div className="max-w-[768px] mx-auto flex flex-col gap-lg">
        <div className="flex flex-col items-center text-center gap-md">
          <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center shadow-md">
            <Icon name="psychology" className="text-on-primary-container" style={{ fontSize: 48 }} fill />
          </div>
          <div className="space-y-xs">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              ¿Cómo te sientes con este tema?
            </h1>
            <p className="text-on-surface-variant font-body-md max-w-md mx-auto">
              Tu percepción nos ayuda a ajustar el ritmo de aprendizaje de EduBot
              para las próximas lecciones.
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-md md:p-lg shadow-[var(--shadow-elev-1)] border border-outline-variant/30">
          <div className="flex flex-col gap-lg">
            <div className="grid grid-cols-5 gap-xs">
              {SCALE.map((s, i) => {
                const active = i === selected;
                return (
                  <div key={s.label} className="text-center">
                    <span
                      className={`font-label-md text-label-md block mb-sm ${
                        active ? "text-primary font-bold" : "text-on-surface-variant"
                      }`}
                    >
                      {s.label}
                    </span>
                    <button
                      onClick={() => setSelected(i)}
                      className={`w-full aspect-square md:aspect-auto md:h-16 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 ${
                        active
                          ? "border-2 border-primary bg-primary-container shadow-[var(--shadow-elev-2)]"
                          : "border border-outline-variant bg-surface hover:bg-surface-container-high"
                      }`}
                    >
                      <Icon
                        name={s.icon}
                        className={active ? "text-on-primary-container" : "text-outline"}
                        fill={active}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="relative h-2 w-full bg-surface-container rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FFF9C4] via-[#FFD700] to-[#FBC02D] rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex justify-center pt-md">
              <button className="bg-primary text-on-primary px-xl py-md rounded-full font-label-md text-label-md shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-sm">
                Confirmar Evaluación
                <Icon name="arrow_forward" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <InsightCard
            icon="trending_up"
            tone="tertiary"
            title="Progreso Actual"
            text="Has completado el 85% de los módulos de Álgebra Lineal."
          />
          <InsightCard
            icon="history"
            tone="secondary"
            title="Última Sesión"
            text="Tu confianza promedio en la sesión anterior fue 'Media'."
          />
        </div>
      </div>
    </AppShell>
  );
}

function InsightCard({
  icon,
  tone,
  title,
  text,
}: {
  icon: string;
  tone: "tertiary" | "secondary";
  title: string;
  text: string;
}) {
  const toneClass =
    tone === "tertiary"
      ? "bg-tertiary-container text-on-tertiary-container"
      : "bg-secondary-container text-on-secondary-container";
  return (
    <div className="bg-surface-container-low rounded-xl p-md border border-outline-variant/20 flex items-start gap-md">
      <div className={`p-sm rounded-lg ${toneClass}`}>
        <Icon name={icon} />
      </div>
      <div>
        <h3 className="font-label-md text-label-md text-on-surface">{title}</h3>
        <p className="text-on-surface-variant text-[14px]">{text}</p>
      </div>
    </div>
  );
}
