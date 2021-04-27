import { Injectable } from '@angular/core';
import { User } from '@sentinel/auth';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayerSelectionService {

  private activePlayers = new BehaviorSubject<User[]>([]);
  private filteredPlayers = new Subject<User[]>();
  private highlightedPlayer = new Subject<User>();
  constructor() { }

  setFilteredPlayers(filteredPlayers: User[]) {
    this.filteredPlayers.next(filteredPlayers);
  }

  getFilteredPlayers(): Observable<User[]> {
    return this.filteredPlayers.asObservable();
  }

  setHighlightedPlayer(highlightedPlayer: User) {
    this.highlightedPlayer.next(highlightedPlayer);
  }

  getHighlightedPlayer(): Observable<User> {
    return this.highlightedPlayer.asObservable();
  }

  setActivePlayers(players: User[]) {
    this.activePlayers.next(players);
  }

  getActivePlayers(): Observable<User[]> {
    return this.activePlayers.asObservable();
  }

}
