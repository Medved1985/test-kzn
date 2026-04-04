import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    RouterOutlet
],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  title = 'teyca-test';

  constructor() {
  }

}
