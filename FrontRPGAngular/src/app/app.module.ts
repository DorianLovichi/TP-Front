import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { QuestListComponent } from './components/quest-list/quest-list.component';
import { QuestDetailComponent } from './components/quest-detail/quest-detail.component';
import { QuestBattleComponent } from './components/quest-battle/quest-battle.component';
import { AuthService, AuthInterceptor } from './services/auth.service';
import { QuestService } from './services/quest.service';
import { BattleSelectionComponent } from './components/battle-selection/battle-selection.component';
import { BattleResultComponent } from './components/battle-result/battle-result.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    QuestListComponent,
    QuestDetailComponent,
    QuestBattleComponent,
    BattleSelectionComponent,
    BattleResultComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    RouterModule.forRoot([
      { path: 'battle-selection', component: BattleSelectionComponent },
      { path: 'battle-result', component: BattleResultComponent },
      { path: '', redirectTo: '/battle-selection', pathMatch: 'full' }
    ])
  ],
  providers: [
    AuthService,
    QuestService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 