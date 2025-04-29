import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BattleResult } from '../../services/battle.service';

@Component({
  selector: 'app-battle-result',
  templateUrl: './battle-result.component.html',
  styleUrls: ['./battle-result.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class BattleResultComponent implements OnInit {
  battleResult: BattleResult | null = null;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.battleResult = navigation.extras.state['battleResult'];
    }
  }

  ngOnInit(): void {
    if (!this.battleResult) {
      this.router.navigate(['/pvp-game']);
    }
  }

  goBack(): void {
    this.router.navigate(['/pvp-game']);
  }
} 