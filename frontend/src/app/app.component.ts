import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InterviewComponent } from './components/interview/interview.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, InterviewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent {
  title = 'frontend';
}
