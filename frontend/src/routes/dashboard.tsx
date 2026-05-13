import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "EduBot — Panel del Docente" },
      {
        name: "description",
        content:
          "Monitoreo de confianza académica y métricas de aprendizaje para docentes.",
      },
    ],
  }),
});

const ENTRIES = [
  { id: "#134", score: 90, status: "Muy alta", time: "Hace 2 minutos", color: "bg-primary", textColor: "text-primary" },
  { id: "#156", score: 65, status: "Media", time: "Hace 15 minutos", color: "bg-primary", textColor: "text-on-surface-variant" },
  { id: "#201", score: 20, status: "Muy baja", time: "Hace 45 minutos", color: "bg-error", textColor: "text-error" },
];

const BARS = [
  { label: "Muy baja", h: 10, kind: "muted" as const },
  { label: "Baja", h: 25, kind: "muted" as const },
  { label: "Media", h: 60, kind: "soft" as const },
  { label: "Alta", h: 85, kind: "primary" as const },
  { label: "Muy alta", h: 15, kind: "muted" as const },
];

function DashboardPage() {
  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto">
        <header className="mb-lg">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-xs">
            Panel del Docente
          </h1>
          <p className="text-on-surface-variant font-body-lg">
            Monitoreo de confianza académica y métricas de aprendizaje.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-gutter">
          {/* Confianza promedio */}
          <section className="col-span-12 md:col-span-5 bg-surface-container-lowest p-md rounded-xl shadow-[var(--shadow-elev-1)] border border-outline-variant flex flex-col items-center text-center">
            <div className="w-full flex justify-between items-start mb-md">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                Nivel de Confianza Promedio
              </span>
              <div className="bg-inverse-surface text-inverse-on-surface py-xs px-sm rounded-full font-id-marker text-id-marker">
                LIVE
              </div>
            </div>
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
                <circle cx="96" cy="96" fill="transparent" r="88" stroke="#f6edda" strokeWidth="12" />
                <circle
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="88"
                  stroke="#705d00"
                  strokeDasharray="552"
                  strokeDashoffset="121"
                  strokeLinecap="round"
                  strokeWidth="12"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display-lg text-display-lg text-primary">78%</span>
                <span className="font-label-md text-label-md text-on-surface-variant">Alta</span>
              </div>
            </div>
            <p className="mt-md text-on-surface-variant font-body-md px-lg">
              Los estudiantes muestran una tendencia positiva en la resolución de problemas lógicos.
            </p>
          </section>

          {/* Distribución */}
          <section className="col-span-12 md:col-span-7 bg-surface-container-lowest p-md rounded-xl shadow-[var(--shadow-elev-1)] border border-outline-variant">
            <div className="flex justify-between items-center mb-lg">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Distribución de Confianza
              </h3>
              <Icon name="bar_chart" className="text-on-surface-variant" />
            </div>
            <div className="flex items-end justify-between h-64 gap-base px-md">
              {BARS.map((b) => {
                const cls =
                  b.kind === "primary"
                    ? "bg-primary"
                    : b.kind === "soft"
                      ? "bg-primary-container"
                      : "bg-surface-container-high group-hover:bg-primary-container";
                return (
                  <div key={b.label} className="flex-1 flex flex-col items-center gap-base group">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${cls}`}
                      style={{ height: `${b.h}%` }}
                    />
                    <span className="font-id-marker text-[10px] text-on-surface-variant whitespace-nowrap">
                      {b.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Tabla */}
          <section className="col-span-12 bg-surface-container-lowest p-md rounded-xl shadow-[var(--shadow-elev-1)] border border-outline-variant">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-headline-md text-headline-md text-on-surface">Entradas Recientes</h3>
              <button className="bg-surface-container-high text-on-surface-variant px-md py-sm rounded-lg font-label-md hover:bg-outline-variant transition-colors flex items-center gap-xs">
                <Icon name="filter_list" style={{ fontSize: 18 }} /> Filtrar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-outline-variant">
                    <th className="py-md px-sm font-label-md text-on-surface-variant">Estudiante ID</th>
                    <th className="py-md px-sm font-label-md text-on-surface-variant">Puntaje</th>
                    <th className="py-md px-sm font-label-md text-on-surface-variant">Estado</th>
                    <th className="py-md px-sm font-label-md text-on-surface-variant">Última Actividad</th>
                    <th className="py-md px-sm font-label-md text-on-surface-variant text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {ENTRIES.map((e) => (
                    <tr key={e.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-md px-sm">
                        <span className="bg-inverse-surface text-inverse-on-surface py-xs px-sm rounded-full font-id-marker text-id-marker">
                          {e.id}
                        </span>
                      </td>
                      <td className="py-md px-sm">
                        <div className="flex items-center gap-base">
                          <div className="w-24 h-2 bg-surface-variant rounded-full overflow-hidden">
                            <div className={`h-full ${e.color}`} style={{ width: `${e.score}%` }} />
                          </div>
                          <span className={`font-label-md ${e.score < 30 ? "text-error" : ""}`}>
                            {e.score}/100
                          </span>
                        </div>
                      </td>
                      <td className={`py-md px-sm font-bold ${e.textColor}`}>{e.status}</td>
                      <td className="py-md px-sm text-on-surface-variant text-sm">{e.time}</td>
                      <td className="py-md px-sm text-right">
                        <Icon
                          name="visibility"
                          className="text-primary-container cursor-pointer hover:text-primary transition-colors"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Insight IA */}
          <section className="col-span-12 md:col-span-6 lg:col-span-4 bg-primary-container p-md rounded-xl shadow-md border border-primary">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-label-md text-label-md text-on-primary-container opacity-80 uppercase mb-xs">
                  Insights de IA
                </h4>
                <p className="font-headline-md text-headline-md text-on-primary-container">
                  Progreso acelerado en ID: #156
                </p>
              </div>
              <Icon name="bolt" className="text-primary" fill />
            </div>
            <p className="mt-md text-on-primary-container/80 font-body-md">
              Este estudiante ha mejorado su confianza en un 15% en los últimos 3 días al completar
              módulos de álgebra interactivos.
            </p>
          </section>

          {/* Predictivo */}
          <div className="col-span-12 md:col-span-6 lg:col-span-8 relative rounded-xl overflow-hidden min-h-[200px] border border-outline-variant shadow-lg bg-gradient-to-br from-inverse-surface via-on-surface to-inverse-surface flex items-center p-lg">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--color-primary-container),transparent_60%)]" />
            <div className="relative text-inverse-on-surface">
              <h4 className="font-headline-lg text-headline-lg mb-xs">Análisis Predictivo</h4>
              <p className="font-body-md max-w-md opacity-90">
                Basado en el historial de chat, el 82% del aula superará el examen de certificación
                del próximo mes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
