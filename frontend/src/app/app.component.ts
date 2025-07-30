import { Component } from '@angular/core';
import { InterviewComponent } from './components/interview/interview.component';

@Component({
  selector: 'app-root',
  imports: [InterviewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent {
  title = 'frontend';
}
