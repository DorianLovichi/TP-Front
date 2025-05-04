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
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'characters', component: CharactersComponent, canActivate: [authGuard] },
  { path: 'inventory', component: InventoryComponent, canActivate: [authGuard] },
  { path: 'inventory/:id', component: InventoryComponent, canActivate: [authGuard] },
  { path: 'games', component: GamesComponent, canActivate: [authGuard] },
  { path: 'quests', component: QuestListComponent, canActivate: [authGuard] },
  { path: 'quests/:id/battle', component: QuestBattleComponent, canActivate: [authGuard] },
  { path: 'battle-selection', component: BattleSelectionComponent, canActivate: [authGuard] },
  { path: 'battle-result', component: BattleResultComponent, canActivate: [authGuard] },
  { path: 'pvp-game', component: BattleSelectionComponent, canActivate: [authGuard] },
  { path: 'plateau-game', component: PlateauGameComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/characters', pathMatch: 'full' }
];
