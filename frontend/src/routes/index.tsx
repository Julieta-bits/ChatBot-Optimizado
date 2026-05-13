import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { AppHeader, BottomNav } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  component: Welcome,
  head: () => ({
    meta: [
      { title: "EduBot — Tu tutor inteligente y privado" },
      {
        name: "description",
        content:
          "Apoyo académico inmediato y 100% anónimo. Aprende sin presiones con EduBot.",
      },
    ],
  }),
});

function Welcome() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-grow flex items-center justify-center px-margin-mobile pt-32 pb-24">
        <div className="max-w-[768px] w-full flex flex-col items-center text-center">
          <div className="mb-lg relative">
            <div className="absolute inset-0 bg-primary-container blur-3xl opacity-20 rounded-full" />
            <div className="relative bg-surface-container-lowest p-xl rounded-full shadow-[var(--shadow-elev-2)] border border-outline-variant/30">
              <Icon
                name="smart_toy"
                className="text-primary"
                style={{ fontSize: 80, lineHeight: 1 }}
                fill
              />
            </div>
          </div>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-md">
            Tu tutor inteligente y privado
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg max-w-[600px]">
            Aprende sin presiones. Nuestro sistema está diseñado para ofrecerte
            apoyo académico inmediato manteniendo tu identidad totalmente
            protegida.
          </p>

          <div className="w-full max-w-[400px] mb-xl p-md bg-surface-container-lowest rounded-xl shadow-[var(--shadow-elev-1)] border border-outline-variant/20">
            <div className="flex items-center justify-center gap-sm mb-xs">
              <Icon name="shield_person" className="text-primary" />
              <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
                Identidad Asignada
              </span>
            </div>
            <div className="bg-inverse-surface text-inverse-on-surface py-sm px-lg rounded-lg inline-block">
              <p className="font-headline-md text-headline-md">Usuario #134</p>
            </div>
            <p className="mt-sm font-label-md text-label-md text-on-surface-variant italic">
              "El sistema es 100% anónimo para que te sientas seguro preguntando
              cualquier cosa."
            </p>
          </div>

          <Link
            to="/chat"
            className="group bg-primary-container text-on-primary-container px-xl py-md rounded-xl font-headline-md text-headline-md shadow-[var(--shadow-elev-2)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-200 flex items-center gap-md"
          >
            Comenzar Chat
            <Icon
              name="arrow_forward"
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <div className="mt-lg flex flex-wrap justify-center gap-md">
            {[
              { icon: "lock", label: "Privacidad Total" },
              { icon: "history_edu", label: "Sin Registro" },
              { icon: "verified", label: "Solo para Estudiantes" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-xs text-on-surface-variant font-label-md text-label-md"
              >
                <Icon name={f.icon} style={{ fontSize: 18 }} />
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
