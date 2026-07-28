import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { TagModule } from "primeng/tag";

@Component({
  selector: "app-neigh-status-tag",
  imports: [TagModule],
  templateUrl: "./neigh-status-tag.html",
  styleUrl: "./neigh-status-tag.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeighStatusTag {
  rounded = input<boolean>(false);

  isActive = input.required<boolean>();

  severity = computed(() => (this.isActive() ? "success" : "warn"));
  value = computed(() => (this.isActive() ? "Activo" : "Inactivo"));
}
