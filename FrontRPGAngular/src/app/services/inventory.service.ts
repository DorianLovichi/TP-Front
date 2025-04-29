import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InventoryItem {
  id: number;
  name: string;
  type: string;
  quantity: number;
}

export interface Inventory {
  character_name: string;
  character_id: number;
  items: InventoryItem[];
}

export interface AddItemRequest {
  character_id: number;
  name: string;
  type_id: number;
  quantity?: number;
}

export interface ItemType {
  id: number;
  name: string;
}

export interface ItemTypesResponse {
  item_types: ItemType[];
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/game/api/inventory`;

  constructor(private http: HttpClient) { }

  getInventory(characterId: number): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.apiUrl}/${characterId}`, {
      withCredentials: true
    });
  }

  addItem(request: AddItemRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, request, {
      withCredentials: true
    });
  }

  getItemTypes(): Observable<ItemTypesResponse> {
    return this.http.get<ItemTypesResponse>(`${environment.apiUrl}/game/api/item-types`, {
      withCredentials: true
    });
  }
} 