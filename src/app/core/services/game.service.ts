import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Game } from '../models/game.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private normalizeGame(data: any): Game {
    return {
      id: data.id,
      name: data.name,
      gameType: data.gameType ?? data.game_type,
      active: !!data.active,
      openTime: data.openTime ?? data.open_time ?? '',
      openNumber: data.openNumber ?? data.open_number ?? '',
      closeTime: data.closeTime ?? data.close_time ?? '',
      closeNumber: data.closeNumber ?? data.close_number ?? '',
      finalNumber: data.finalNumber ?? data.final_number ?? '',
      createdAt: data.createdAt ?? data.created_at ?? ''
    };
  }

  private normalizeGames(data: any[]): Game[] {
    return (data || []).map(item => this.normalizeGame(item));
  }

  private buildParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });
    return searchParams.toString() ? `?${searchParams.toString()}` : '';
  }

  getCurrentGame(gameType?: number): Observable<Game | null> {
    return this.http.get<any>(`${environment.apiUrl}/public/game${this.buildParams({ type: gameType })}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(data => data ? this.normalizeGame(data) : null)
    );
  }

  startGame(gameType: number): Observable<Game> {
    return this.http.post<any>(`${environment.apiUrl}/admin/game/start${this.buildParams({ type: gameType })}`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(data => this.normalizeGame(data))
    );
  }

  endGame(openNumber: string, closeNumber: string, gameType?: number): Observable<Game> {
    return this.http.post<any>(`${environment.apiUrl}/admin/game/end${this.buildParams({ openNumber, closeNumber, type: gameType })}`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(data => this.normalizeGame(data))
    );
  }

  setOpenNumber(number: string, gameType?: number): Observable<Game> {
    return this.http.post<any>(`${environment.apiUrl}/admin/game/setOpen${this.buildParams({ number, type: gameType })}`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(data => this.normalizeGame(data))
    );
  }

  setCloseNumber(number: string, gameType?: number): Observable<Game> {
    return this.http.post<any>(`${environment.apiUrl}/admin/game/setClose${this.buildParams({ number, type: gameType })}`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(data => this.normalizeGame(data))
    );
  }

  setFinalNumber(number: string, gameType?: number): Observable<Game> {
    return this.http.post<any>(`${environment.apiUrl}/admin/game/setFinal${this.buildParams({ number, type: gameType })}`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(data => this.normalizeGame(data))
    );
  }

  getAllGames(gameType?: number, date?: string): Observable<Game[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/admin/games${this.buildParams({ type: gameType, date })}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(data => this.normalizeGames(data))
    );
  }

  subscribeGameStream(gameType?: number, date?: string): Observable<{ currentGame: Game | null; games: Game[] }> {
    return new Observable(observer => {
      const url = `${environment.apiUrl}/public/game/stream${this.buildParams({ type: gameType, date })}`;
      const eventSource = new EventSource(url);

      eventSource.addEventListener('gameUpdate', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          observer.next({
            currentGame: parsed.currentGame ? this.normalizeGame(parsed.currentGame) : null,
            games: this.normalizeGames(parsed.games || [])
          });
        } catch (error) {
          observer.error(error);
        }
      });

      eventSource.onerror = (error) => {
        observer.error(error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    });
  }
}