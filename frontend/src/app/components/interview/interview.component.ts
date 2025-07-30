import { Component, OnInit } from '@angular/core';
import { InterviewService } from '../../services/interview.service';
import { Message } from '../../models/message.model';
import { firstValueFrom } from 'rxjs';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    NgFor,
    NgIf,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatIconModule
  ],
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.scss']
})
export class InterviewComponent implements OnInit {
  messages: Message[] = [];
  userInputControl = new FormControl('');
  sessionId: string | null = null;
  isLoading = false;

  constructor(private interviewService: InterviewService) {}

  async ngOnInit() {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(this.interviewService.startSession());
      this.sessionId = response.sessionId;
      this.messages.push({
        content: response.message,
        sender: 'ai',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error starting session:', error);
      this.messages.push({
        content: 'Error al iniciar la sesión. Por favor, recarga la página.',
        sender: 'ai',
        timestamp: new Date()
      });
    } finally {
      this.isLoading = false;
    }
  }

  sendMessage() {
    const userInput = this.userInputControl.value?.trim() || '';
    if (!userInput || !this.sessionId) return;

    const userMessage: Message = {
      content: userInput,
      sender: 'user',
      timestamp: new Date()
    };
    
    this.messages.push(userMessage);
    this.userInputControl.reset('', { emitEvent: false });
    this.userInputControl.disable(); // Deshabilita el control
    this.isLoading = true;

    this.interviewService.sendMessage(this.sessionId, userMessage.content)
      .subscribe({
        next: (aiResponse) => {
          this.messages.push({
            content: aiResponse,
            sender: 'ai',
            timestamp: new Date()
          });
        },
        error: () => {
          this.messages.push({
            content: 'Error al procesar tu pregunta',
            sender: 'ai',
            timestamp: new Date()
          });
        },
        complete: () => {
          this.isLoading = false;
          this.userInputControl.enable(); 
        }
      });
  }
}
