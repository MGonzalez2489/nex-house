import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { Button } from "primeng/button";
import { Panel } from "primeng/panel";

type infoItem = {
  id: number;
  title: string;
  description: string;
  icon: string;
};

@Component({
  selector: "app-onboarding-welcome-component",
  imports: [Button, Panel],
  templateUrl: "./onboarding-welcome-component.html",
  styleUrl: "./onboarding-welcome-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingWelcomeComponent {
  next = output();

  protected readonly items: infoItem[] = [
    {
      id: 0,
      title: "Da seguimiento a tus fraccionamientos",
      description:
        "Consulta el estado, las calles registradas y la actividad de cada uno.",
      icon: "pi pi-building",
    },
    {
      id: 1,
      title: "Recibe notificaciones en tiempo real",
      description: "Entérate de cambios y novedades importantes al instante.",
      icon: "pi pi-bell",
    },
    {
      id: 2,
      title: "Administra tu equipo",
      description: "Invita usuarios y controla roles y permisos con facilidad.",
      icon: "pi pi-users",
    },
    {
      id: 3,
      title: "Exporta información cuando la necesites",
      description: "Descarga reportes en segundos, listos para compartir.",
      icon: "pi pi-download",
    },
  ];
}
