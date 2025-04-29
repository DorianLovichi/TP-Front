import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuestListComponent } from './components/quest-list/quest-list.component';
import { QuestBattleComponent } from './components/quest-battle/quest-battle.component';

const routes: Routes = [
  { path: 'quests', component: QuestListComponent },
  { path: 'quests/:id/battle', component: QuestBattleComponent },
  { path: '', redirectTo: '/quests', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 