import { Component, OnInit, Input, ViewEncapsulation, OnChanges, Output, EventEmitter } from '@angular/core';
import { Level } from '../../../models/level';
import { User } from '@sentinel/auth';
import { Player } from '../../../models/player';
import { VisualizationData } from '../../../models/visualization-data';

@Component({
  selector: 'kypo2-viz-hurdling-level-list',
  templateUrl: './level-list.component.html',
  styleUrls: ['./level-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LevelListComponent  {

  @Input() visualizationData: VisualizationData;

  @Output() filteredPlayers = new EventEmitter<Player[]>();
  @Output() playerSort = new EventEmitter<Level>();
  
  constructor() { }
  ngOnInit() {
    
  }

  ngOnChanges() {
    
  }

  getPlayersForLevel(levelId): Player[] {
    const players: Player[] = [];
    this.visualizationData.playerProgress.forEach(playerProgress => {
      if(playerProgress.levels.find(level => level.id == levelId && level.startTime && !level.endTime)){
        players.push(this.visualizationData.players.find(player => player.userRefId === playerProgress.userRefId));
      }
    });
    return players;
  }

  getFinishedPlayers() {
    const players: Player[] = [];
    this.visualizationData.playerProgress.forEach(playerProgress => {
      const finishedLevels = playerProgress.levels.filter(level => level.state == 'FINISHED');
      if(finishedLevels.length == this.visualizationData.levels.length){
        players.push(this.visualizationData.players.find(player => player.userRefId == playerProgress.userRefId))
      }
    })
    return players;
  }

  isFinished(levelId: number): boolean {
    return this.visualizationData.playerProgress.map(playerProgress => 
      playerProgress.levels.filter(level => 
        level.id == levelId && level.state == 'FINISHED')).reduce((accumulator, value) => accumulator.concat(value), []).length == this.visualizationData.playerProgress.length;
  }

  getLevelTooltip(level: Level) {
    if (level.flag)
      return level.title + '\nCorrect flag: ' + level.flag;
    return level.title;
  }

  filterPlayers(players: Player[], level: Level): void{
    this.filteredPlayers.emit(players);
    if(level) this.playerSort.emit(level);
  }

  parseLevelName(level: Level) {
    let name = level.levelType.charAt(0).toUpperCase() + level.levelType.slice(1) + ' level ';
    name += level.levelType === 'game' ? this.getGameLevelNumber(level) : '';
    return name;
  }

  private getGameLevelNumber(level: Level): number {
    return this.visualizationData.levels.filter(level => level.levelType == 'game').indexOf(level)+1;
  }
}
