export interface Message {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}