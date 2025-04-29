import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PlateauCharacter {
  id: number;
  name: string;
  health: number;
  attack: number;
  defense: number;
  level: number;
}

export interface PlateauEvent {
  type: 'item' | 'enemy' | 'empty' | 'victory';
  item?: string;
  enemy?: string;
  message?: string;
}

export interface PlateauTurn {
  dice_roll: number;
  position: number;
  events: PlateauEvent[];
}

export interface PlateauGameResult {
  character: PlateauCharacter;
  turns: PlateauTurn[];
  completed: boolean;
  game_over: boolean;
  final_position: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlateauService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  playGame(characterId: number): Observable<PlateauGameResult> {
    return this.http.get<PlateauGameResult>(`${this.apiUrl}/game/api/plateau/play/${characterId}`, {
      withCredentials: true
    });
  }
} 