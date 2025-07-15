import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  startSession(): Observable<{ sessionId: string; message: string }> {
    return this.http.post<{ sessionId: string; message: string }>(
      `${this.apiUrl}/session`,
      {}
    );
  }

 sendMessage(sessionId: string, message: string): Observable<string> {
  return this.http.post(
    `${this.apiUrl}/interview`,
    { sessionId, message },
    { 
      responseType: 'text',
      withCredentials: true // Si necesitas credenciales
    }
  ).pipe(
    catchError(error => of('Error: ' + error.message))
  );
}
}