export interface Session {
  id: string;
  userId: string;
  startedAt: Date;
  finishedAt?: Date;
}