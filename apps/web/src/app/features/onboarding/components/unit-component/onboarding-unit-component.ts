import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { Button } from "primeng/button";

@Component({
  selector: "app-onboarding-unit-component",
  imports: [Button],
  templateUrl: "./onboarding-unit-component.html",
  styleUrl: "./onboarding-unit-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingUnitComponent {
  next = output();
  prev = output();
}
