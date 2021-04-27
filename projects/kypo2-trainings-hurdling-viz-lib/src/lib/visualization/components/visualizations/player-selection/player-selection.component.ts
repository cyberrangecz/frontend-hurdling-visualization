
import {Component, Input, OnInit, OnDestroy, OnChanges, Output, EventEmitter, SimpleChange, SimpleChanges} from '@angular/core';
import { PlayerSelectionService } from '../../../services/player-selection.service';
import { CTF_PROGRESS_CONFIG } from '../../../../app.config';
import {D3Service} from '@muni-kypo-crp/d3-service';
import { User } from '@sentinel/auth';
import { VisualizationData } from '../../../models/visualization-data';
import { Player } from '../../../models/player';
import { PlayerView } from '../../../models/enums/player-view..enum';
import { Level } from '../../../models/level';
import { PlayerLevel } from '../../../models/player-level';
import { View } from '../../../models/view.enum';
@Component({
  selector: 'kypo2-viz-hurdling-player-selection',
  templateUrl: './player-selection.component.html',
  styleUrls: ['./player-selection.component.css']
})
export class PlayerSelectionComponent implements OnInit, OnChanges, OnDestroy {

  @Input() visualizationData: VisualizationData;
  @Input() selectedPlayerView: PlayerView;

  @Input() filteredPlayers: Player[];
  @Output() filteredPlayersChange = new EventEmitter<Player[]>(true);

  public numberOfColumns = 12;
  public gridWidth = 60;
  private d3;
  
  private pp: PP[] = [];

  constructor(private playerSelectionService: PlayerSelectionService, d3: D3Service) {
    this.d3 = d3.getD3();
  }

  ngOnInit() {
    this.setPlayerColumnDistribution();
    this.visualizationData.players.forEach(player => {
      this.pp.push({player: player, isActive: false, isSelected: null})
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    this.pp.forEach(player => {
      player.isActive = this.checkIfActive(player.player);
      if(player.isSelected == null && !this.checkIfActive(player.player)) {
        player.isSelected = null;
      }
      else if(player.isSelected == null && this.checkIfActive(player.player)) {
        player.isSelected = true;
      }
      else
        player.isSelected = this.filteredPlayers.find(p => p.userRefId === player.player.userRefId) ? true : false;
    })
     if('visualizationData' in changes) {
      this.filteredPlayersChange.emit(this.pp.filter(p => p.isSelected).map(p=>p.player)) 
     }
  }

  setPlayerColumnDistribution() {
    if (this.visualizationData.players.length < 12) {
      this.numberOfColumns = 12;
    }
    else {
      this.numberOfColumns = this.visualizationData.players.length;
    }
  }

  togglePlayer(player: Player) {
    this.pp.find(pp => pp.player.userRefId == player.userRefId).isSelected = !this.pp.find(pp => pp.player.userRefId == player.userRefId).isSelected;
    let x = this.pp.filter(pp => pp.isSelected == true).map(pp => pp.player)
    this.filteredPlayersChange.emit(x);
  }

  showAllPlayers() {
    this.pp.forEach(selectionData => {
      if(selectionData.isActive) {
        selectionData.isSelected = true;
      }
    })
    let x = this.pp.filter(pp => pp.isSelected == true).map(pp => pp.player)
    this.filteredPlayersChange.emit(x);
  }

  checkIfSelected(player: Player): boolean {
    return this.pp.find(p => p.player.userRefId == player.userRefId).isSelected;
  }

  checkIfActive(player: Player): boolean {
    return this.visualizationData.playerProgress.find(playerProgress => playerProgress.userRefId == player.userRefId) ? true : false;
  }

  buildAndShowTooltip(player, event: MouseEvent) {
    let tooltipText = player.name;
    let conjunction = '';
    if (this.checkLatePlayer(player)) {
      tooltipText += '\n is too long in the current level ';
      conjunction = 'and';
    }
    if (this.checkWrongFlags(player)) {
      tooltipText += '\n' + conjunction + ' submitted many wrong flags ';
      conjunction = 'and';
    }
    if (this.checkOutOfHints(player))
      tooltipText += '\n' + conjunction + ' had used all level hints';
    this.showTooltip(tooltipText, event);
  }

  showTooltip(innerText, event) {
    const tooltip = this.d3
        .select('.vis-participant-grid .kypo2-viz-hurdling-player-tooltip');

    tooltip
        .transition()
        .duration(100)
        .style('visibility', 'visible')
        .style('opacity', '0.8');

    const yOffset = 0;

    tooltip
        .html(innerText)
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY + yOffset + 'px');
  }

  hideTooltip() {
    this.d3.selectAll('.kypo2-viz-hurdling-player-tooltip')
        .style('visibility', 'hidden')
        .style('opacity', '0');
  }

  getDisplayedPlayers() {
    return this.visualizationData.players.filter(player => this.checkIfSelected(player));
  }

  checkLatePlayer(player: Player): boolean {
    if (!this.checkIfActive(player))
    return false;
    if (!this.getCurrentPlayerLevel(player))
      return false;
    return this.visualizationData.currentTime > (this.getCurrentPlayerLevel(player).startTime + this.getCurrentLevel(player).estimatedDuration*60 * 1.5)
  }

  checkWrongFlags(player: Player) {
    return this.getNumOfWrongFlags(player) >= CTF_PROGRESS_CONFIG.wrongFlagWarningThreshold;
  }

  checkOutOfHints(player: Player): boolean {
    const levelHints = this.visualizationData.levels.find(level => level.id == this.getCurrentPlayerLevel(player)?.id)?.hints;
    if(!levelHints || levelHints.length == 0) {
      return false;
    }
    const levelHintsTaken = this.getCurrentPlayerLevel(player).hintsTaken == null ? [] : this.getCurrentPlayerLevel(player).hintsTaken;
    return levelHints.length == levelHintsTaken.length;
  }

  getNumOfWrongFlags(player: Player): number {
    return this.getCurrentPlayerLevel(player)?.wrongFlags_number;
  }

  getCurrentPlayerLevel(player: Player): PlayerLevel {
    return this.visualizationData.playerProgress.find(p => p.userRefId == player.userRefId).levels.find(level => level.state != 'FINISHED');
  }

  getCurrentLevel(player: Player): Level {
    return this.visualizationData.levels.find(level => level.id == this.getCurrentPlayerLevel(player).id)
  }

  over(player: User) {
    //this.playerSelectionService.setHighlightedPlayer(player);
  }

  out() {
    //this.playerSelectionService.setHighlightedPlayer(null);
  }

  ngOnDestroy(): void {
   
  }

}


export class PP {
  player: Player;
  isActive: boolean;
  isSelected: boolean;
}