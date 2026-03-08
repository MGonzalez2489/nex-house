import { Component } from '@angular/core';
import { Card } from 'primeng/card';

@Component({
  imports: [Card],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'web';
}
