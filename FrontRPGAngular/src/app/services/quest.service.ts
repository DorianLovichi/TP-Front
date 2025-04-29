import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Quest {
  id: number;
  title: string;
  description: string;
  level: number;
  experience: number;
  gold: number;
  accepted: boolean;
  completed: boolean;
}

export interface QuestReward {
  name: string;
  type: string;
  quantity: number;
}

export interface QuestBattleResult {
  won: boolean;
  battle_log: string[];
  rewards: {
    experience: number;
    items: QuestReward[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  private apiUrl = `${environment.apiUrl}/game/api/quests`;

  constructor(private http: HttpClient) {}

  getQuests(): Observable<Quest[]> {
    return this.http.get<Quest[]>(this.apiUrl, { withCredentials: true });
  }

  getQuest(id: number): Observable<Quest> {
    return this.http.get<Quest>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  startQuest(id: number): Observable<QuestBattleResult> {
    return this.http.post<QuestBattleResult>(`${this.apiUrl}/${id}/start`, {}, { withCredentials: true });
  }

  acceptQuest(id: number): Observable<Quest> {
    return this.http.post<Quest>(`${this.apiUrl}/${id}/accept`, {}, { withCredentials: true });
  }

  completeQuest(id: number): Observable<Quest> {
    return this.http.post<Quest>(`${this.apiUrl}/${id}/complete`, {}, { withCredentials: true });
  }
} 