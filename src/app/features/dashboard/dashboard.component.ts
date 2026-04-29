import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Game } from '../../core/models/game.model';
import { AuthService } from '../../core/services/auth.service';
import { GameService } from '../../core/services/game.service';
import { ThemeService } from '../../theme.service';
import { NotificationService } from '../../core/services/notification.service';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DateFormatPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  game: Game | null = null;
  games: Game[] = [];
  openNumber = '';
  closeNumber = '';
  isLoading = false;
  selectedGameType = 1;
  gameTypes = [
    { value: 1, label: 'Orange City Day' },
    { value: 2, label: 'Orange City Night' }
  ];

  constructor(
    private router: Router,
    public themeService: ThemeService,
    private gameService: GameService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadData();
  }

  private loadData() {
    this.isLoading = true;
    this.fetchGame();
    this.getAllGames();
  }

  onGameTypeChange() {
    this.loadData();
  }

  fetchGame() {
    this.gameService.getCurrentGame(this.selectedGameType).subscribe({
      next: (data: Game | null) => this.game = data,
      error: (err: any) => {
        console.error('Error fetching game:', err);
        this.notificationService.show('Failed to load current game', 'error');
      }
    });
  }

  startGame() {
    this.gameService.startGame(this.selectedGameType).subscribe({
      next: (data: Game) => {
        this.game = data;
        this.loadData();
        this.notificationService.show('Game started successfully', 'success');
      },
      error: (err: any) => {
        console.error('Error starting game:', err);
        this.notificationService.show('Failed to start game', 'error');
      }
    });
  }

  endGame() {
    if (!this.openNumber || !this.closeNumber) {
      this.notificationService.show('Both open and close numbers are required to end the game.', 'error');
      return;
    }

    this.gameService.endGame(this.openNumber, this.closeNumber, this.selectedGameType).subscribe({
      next: (data: Game) => {
        this.game = data;
        this.openNumber = '';
        this.closeNumber = '';
        this.loadData();
        this.notificationService.show('Game ended successfully', 'success');
      },
      error: (err: any) => {
        console.error('Error ending game:', err);
        this.notificationService.show('Failed to end game', 'error');
      }
    });
  }

  setOpen() {
    if (!this.canSetOpen) {
      this.notificationService.show('Open number can only be set before the close number.', 'error');
      return;
    }

    if (!this.openNumber) {
      this.notificationService.show('Please enter the open number.', 'error');
      return;
    }

    this.gameService.setOpenNumber(this.openNumber, this.selectedGameType).subscribe({
      next: (data: Game | null) => {
        this.game = data;
        this.openNumber = '';
        this.loadData();
        this.notificationService.show('Open number set successfully', 'success');
      },
      error: (err: any) => {
        console.error('Error setting open number:', err);
        this.notificationService.show('Failed to set open number', 'error');
      }
    });
  }

  setClose() {
    if (!this.canSetClose) {
      this.notificationService.show('Close number can only be set after the open number is set.', 'error');
      return;
    }

    if (!this.closeNumber) {
      this.notificationService.show('Please enter the close number.', 'error');
      return;
    }

    this.gameService.setCloseNumber(this.closeNumber, this.selectedGameType).subscribe({
      next: (data: Game | null) => {
        this.game = data && data.active ? data : null;
        this.closeNumber = '';
        this.loadData();
        this.notificationService.show('Close number set successfully', 'success');
      },
      error: (err: any) => {
        console.error('Error setting close number:', err);
        this.notificationService.show('Failed to set close number', 'error');
      }
    });
  }

  get canSetOpen(): boolean {
    return !!this.game && this.game.active && !this.game.openNumber;
  }

  get canSetClose(): boolean {
    return !!this.game && this.game.active && !!this.game.openNumber && !this.game.closeNumber;
  }

  get selectedGameLabel(): string {
    const gameType = this.gameTypes.find(type => type.value === this.selectedGameType);
    return gameType ? gameType.label : 'Game';
  }

  getAllGames() {
    this.gameService.getAllGames(this.selectedGameType).subscribe({
      next: (data: Game[]) => {
        this.games = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching games:', err);
        this.notificationService.show('Failed to load games history', 'error');
        this.isLoading = false;
      }
    });
  }

  logout() {
    this.authService.logout();
  }

}
