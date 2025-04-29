import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface BattleResult {
  won: boolean;
  battle_log: string[];
  players: {
    player1: {
      name: string;
      health: number;
      attack: number;
      defense: number;
    };
    player2: {
      name: string;
      health: number;
      attack: number;
      defense: number;
    };
  };
}

interface BattleCharactersResponse {
  characters: any[];
}

@Injectable({
  providedIn: 'root'
})
export class BattleService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllBattleCharacters(): Observable<any[]> {
    return this.http.get<BattleCharactersResponse>(`${this.apiUrl}/game/api/characters/battle`, {
      withCredentials: true
    }).pipe(
      map(response => Array.isArray(response) ? response : response.characters || [])
    );
  }

  startBattle(player1Id: number, player2Id: number): Observable<BattleResult> {
    return this.http.post<BattleResult>(`${this.apiUrl}/game/api/battle`, {
      player1_id: player1Id,
      player2_id: player2Id
    }, {
      withCredentials: true
    });
  }

  getBattleResult(battleId: number): Observable<BattleResult> {
    return this.http.get<BattleResult>(`${this.apiUrl}/game/api/battle/${battleId}`, {
      withCredentials: true
    });
  }
} 