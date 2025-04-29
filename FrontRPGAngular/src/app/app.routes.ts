import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CharactersComponent } from './components/characters/characters.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { GamesComponent } from './components/games/games.component';
import { QuestListComponent } from './components/quest-list/quest-list.component';
import { QuestBattleComponent } from './components/quest-battle/quest-battle.component';
import { BattleSelectionComponent } from './components/battle-selection/battle-selection.component';
import { BattleResultComponent } from './components/battle-result/battle-result.component';
import { PlateauGameComponent } from './components/plateau-game/plateau-game.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'characters', component: CharactersComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'inventory/:id', component: InventoryComponent },
  { path: 'games', component: GamesComponent },
  { path: 'quests', component: QuestListComponent },
  { path: 'quests/:id/battle', component: QuestBattleComponent },
  { path: 'battle-selection', component: BattleSelectionComponent },
  { path: 'battle-result', component: BattleResultComponent },
  { path: 'pvp-game', component: BattleSelectionComponent },
  { path: 'plateau-game', component: PlateauGameComponent },
  { path: '', redirectTo: '/quests', pathMatch: 'full' }
];
