import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Character {
  id: number;
  name: string;
  class: string;
  race: string;
  level: number;
  health: number;
  attack: number;
  defense: number;
  is_active: boolean;
}

export interface CreateCharacterRequest {
  name: string;
  race: string;
  class: string;
}

export interface CharacterOption {
  value: string;
  label: string;
  stats?: {
    health: number;
    attack: number;
    defense: number;
  };
}

export interface CharacterOptions {
  races: CharacterOption[];
  classes: CharacterOption[];
}

interface CharactersResponse {
  characters: Character[];
}

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createCharacter(request: CreateCharacterRequest): Observable<Character> {
    return this.http.post<Character>(`${this.apiUrl}/game/api/characters`, request, {
      withCredentials: true
    }).pipe(
      tap({
        next: (character) => console.log('Character created:', character),
        error: (error) => console.error('Error creating character:', error)
      })
    );
  }

  getUserCharacters(): Observable<Character[]> {
    console.log('Fetching characters from:', `${this.apiUrl}/game/api/characters`);
    
    return this.http.get<CharactersResponse>(`${this.apiUrl}/game/api/characters`, {
      withCredentials: true
    }).pipe(
      map(response => response.characters),
      tap({
        next: (characters) => {
          console.log('Processed characters:', characters);
        },
        error: (error) => {
          console.error('Error in tap:', error);
        }
      }),
      catchError(error => {
        console.error('Error fetching characters:', error);
        throw error;
      })
    );
  }

  selectCharacter(characterId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/game/api/characters/${characterId}/select`, {}, {
      withCredentials: true
    }).pipe(
      tap({
        next: () => console.log(`Character ${characterId} selected successfully`),
        error: (error) => console.error(`Error selecting character ${characterId}:`, error)
      })
    );
  }

  getCharacterOptions(): Observable<CharacterOptions> {
    return this.http.get<CharacterOptions>(`${this.apiUrl}/game/api/character-options`, {
      withCredentials: true
    }).pipe(
      tap({
        next: (options) => console.log('Character options loaded:', options),
        error: (error) => console.error('Error loading character options:', error)
      })
    );
  }
}   