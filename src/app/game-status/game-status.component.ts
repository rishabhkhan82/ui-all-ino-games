import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ThemeService } from '../theme.service';
import { GameService } from '../core/services/game.service';
import { Game } from '../core/models/game.model';
import { DateFormatPipe } from '../shared/pipes/date-format.pipe';

@Component({

  selector: 'app-game-status',
  standalone: true,
  imports: [CommonModule, RouterLink, DateFormatPipe],
  templateUrl: './game-status.component.html',

  styleUrls: ['./game-status.component.css']

})

export class GameStatusComponent implements OnInit, OnDestroy {

  game: Game | null = null;

  games: Game[] = [];

  previousGames: Game[] = [];

  private streamSubscription: Subscription | null = null;

  selectedGameType = 1;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const type = params.get('type');
      this.selectedGameType = type ? Number(type) : 1;
      this.loadGameData();
    });
  }

  ngOnDestroy() {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }
  }

  loadGameData() {
    this.openGameStream();
    this.fetchAllGames();
  }

  private openGameStream() {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
      this.streamSubscription = null;
    }

    this.streamSubscription = this.gameService
      .subscribeGameStream(this.selectedGameType, this.getTodayDate())
      .subscribe({
        next: data => {
          this.game = data.currentGame;
          this.games = data.games;
        },
        error: err => {
          console.error('Game stream error', err);
          this.fetchGame();
          this.fetchTodayGames();
        }
      });
  }

  fetchGame() {
    this.gameService.getCurrentGame(this.selectedGameType).subscribe({
      next: data => this.game = data,
      error: err => {
        console.error('Error fetching game', err);
        this.game = null;
      }
    });
  }

  fetchTodayGames() {
    this.gameService.getAllGames(this.selectedGameType, this.getTodayDate()).subscribe({
      next: data => this.games = data,
      error: err => console.error('Error fetching today games', err)
    });
  }

  fetchAllGames() {
    this.gameService.getAllGames(this.selectedGameType).subscribe({
      next: data => {
        const today = this.getTodayDate();
        this.previousGames = data.filter(g => g.createdAt.split(' ')[0] !== today);
      },
      error: err => console.error('Error fetching all games', err)
    });
  }

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}
