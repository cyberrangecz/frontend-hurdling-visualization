
import {Component, Input, OnInit, OnDestroy, OnChanges, Output, EventEmitter, SimpleChange, SimpleChanges} from '@angular/core';
import { CTF_PROGRESS_CONFIG } from '../../../../app.config';
import {D3Service} from '@muni-kypo-crp/d3-service';
import { User } from '@sentinel/auth';
import { VisualizationData } from '../../../models/visualization-data';
import { Player } from '../../../models/player';
import { PlayerView } from '../../../models/enums/player-view..enum';
import { Level } from '../../../models/level';
import { PlayerLevel } from '../../../models/player-level';
import { View } from '../../../models/view.enum';
import { PlayerSelectData } from '../../../models/player-select-data';
@Component({
  selector: 'kypo2-viz-hurdling-player-selection',
  templateUrl: './player-selection.component.html',
  styleUrls: ['./player-selection.component.css']
})
export class PlayerSelectionComponent implements OnInit, OnChanges {

  @Input() visualizationData: VisualizationData;
  @Input() selectedPlayerView: PlayerView;

  @Input() filteredPlayers: Player[] = [];
  @Output() filteredPlayersChange = new EventEmitter<Player[]>(true);
  @Output() highlightPlayerChange = new EventEmitter<Player>();

  public numberOfColumns = 12;
  public gridWidth = 60;
  private d3;
  private highlightedPlayer: Player;
  private playerSelectData: PlayerSelectData[] = [];

  constructor(d3: D3Service) {
    this.d3 = d3.getD3();
  }

  ngOnInit() {
    this.setPlayerColumnDistribution();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(!this.filteredPlayers)
    this.filteredPlayers = [];
    this.visualizationData.players.sort((a,b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en', { numeric: true }))
    this.visualizationData.players.forEach(player => {
      if(!this.playerSelectData.find(p => p.player.userRefId == player.userRefId)) {
        const res = new PlayerSelectData();
        res.player = player;
        res.isActive = false;
        res.isSelected = null;
        res.warnings = {wrongAnswerWarning: false, hintWarning: false, tooLongWarning: false};
        res.fadedWarnings = {wrongAnswerWarning: false, hintWarning: false, tooLongWarning: false};
        this.playerSelectData.push(res)
        this.filteredPlayers.push(player);
      }
    })
    this.playerSelectData.forEach(player => {
      player.isActive = this.checkIfActive(player.player);
      if(player.isSelected == null && !this.checkIfActive(player.player)) {
        player.isSelected = null;
      }
      else if(player.isSelected == null && this.checkIfActive(player.player)) {
        player.isSelected = true;
      }
      else
        {player.isSelected = this.filteredPlayers.find(p => p.userRefId === player.player.userRefId) ? true : false;}
      player.warnings = {
          wrongAnswerWarning: this.checkWrongAnswers(player.player),
          hintWarning: this.checkOutOfHints(player.player), 
          tooLongWarning: this.checkLatePlayer(player.player)};

      if(!player.warnings.hintWarning && !player.warnings.wrongAnswerWarning && !player.warnings.tooLongWarning ) {
        player.fadedWarnings = {
          wrongAnswerWarning: this.checkWrongAnswers(player.player),
          hintWarning: this.checkOutOfHints(player.player), 
          tooLongWarning: this.checkLatePlayer(player.player)};
      }
      this.highlightPlayerChange.emit(this.highlightedPlayer);
    })

 

    if('visualizationData' in changes) {
    this.filteredPlayersChange.emit(this.playerSelectData.filter(p => p.isSelected).map(p=>p.player)) 
    }
  }

  setPlayerColumnDistribution(): void {
    if (this.visualizationData.players.length < 12) {
      this.numberOfColumns = 12;
    }
    else {
      this.numberOfColumns = this.visualizationData.players.length;
    }
  }

  togglePlayer(player: Player): void {
    this.playerSelectData.find(pp => pp.player.userRefId == player.userRefId).isSelected = 
      !this.playerSelectData.find(pp => pp.player.userRefId == player.userRefId).isSelected;
    this.filteredPlayersChange.emit(this.playerSelectData.filter(pp => pp.isSelected == true).map(pp => pp.player));
  }

  showAllPlayers(): void{
    this.playerSelectData.forEach(selectionData => {
      if(selectionData.isActive) {
        selectionData.isSelected = true;
      }
    })
    this.filteredPlayersChange.emit(this.playerSelectData.filter(pp => pp.isSelected == true).map(pp => pp.player));
  }

  hideAllPlayers(): void{
    this.playerSelectData.forEach(selectionData => {
      if(selectionData.isActive) {
        selectionData.isSelected = false;
      }
    })
    this.filteredPlayersChange.emit(this.playerSelectData.filter(pp => pp.isSelected == true).map(pp => pp.player));
  }

  checkIfSelected(player: Player): boolean {
    return this.playerSelectData.find(p => p.player.userRefId == player.userRefId).isSelected;
  }

  checkIfActive(player: Player): boolean {
    return this.visualizationData.playerProgress.find(playerProgress => playerProgress.userRefId == player.userRefId) ? true : false;
  }

  buildAndShowWarningTooltip(player, event: MouseEvent): void {
    let tooltipText = player.name;
    tooltipText += '\nLevel: ' + this.getCurrentLevel(player).title;
    let conjunction = '';
    if (this.checkLatePlayer(player)) {
      tooltipText += '\n is too long in the current level ';
      conjunction = 'and';
    }
    if (this.checkWrongAnswers(player)) {
      tooltipText += '\n' + conjunction + ' submitted many wrong answers ';
      conjunction = 'and';
    }
    if (this.checkOutOfHints(player))
      tooltipText += '\n' + conjunction + ' had used all level hints';
    this.showTooltip(tooltipText, event);
  }

  buildAndShowPlayerTooltip(player, event: MouseEvent): void {
    let tooltipText = player.name;
    if(this.checkIfActive(player))
      tooltipText += this.getCurrentPlayerLevel(player) ? '\nLevel: ' + this.getCurrentLevel(player).title : '\nFinished';
    this.showTooltip(tooltipText, event);
  }
  
  showTooltip(innerText, event): void {
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

  hideTooltip(): void {
    this.d3
        .select('.kypo2-viz-hurdling-player-tooltip')
        .transition()
        .style('opacity', 0);

  }

  getDisplayedPlayers(): Player[] {
    return this.visualizationData.players.filter(player => this.checkIfSelected(player));
  }

  checkLatePlayer(player: Player): boolean {
    if (!this.checkIfActive(player))
    return false;
    if (!this.getCurrentPlayerLevel(player))
      return false;
    if (this.getCurrentLevel(player).estimatedDuration == 0)
      return false;
    return this.visualizationData.currentTime > 
        (this.getCurrentPlayerLevel(player).startTime + this.getCurrentLevel(player).estimatedDuration*60 * 1.5)
  }

  checkWrongAnswers(player: Player): boolean {
    return this.getNumOfWrongAnswers(player) >= CTF_PROGRESS_CONFIG.wrongAnswerWarningThreshold;
  }

  checkOutOfHints(player: Player): boolean {
    const levelHints = this.visualizationData.levels.find(level => level.id == this.getCurrentPlayerLevel(player)?.id)?.hints;
    if(!levelHints || levelHints.length == 0) {
      return false;
    }
    const levelHintsTaken = this.getCurrentPlayerLevel(player).hintsTaken == null ? [] : this.getCurrentPlayerLevel(player).hintsTaken;
    return levelHints.length == levelHintsTaken.length;
  }

  getNumOfWrongAnswers(player: Player): number {
    return this.getCurrentPlayerLevel(player)?.wrongAnswers_number;
  }

  getCurrentPlayerLevel(player: Player): PlayerLevel {
    return this.visualizationData.playerProgress
      .find(p => p.userRefId == player.userRefId)?.levels
      .find(level => level.state != 'FINISHED');
  }

  getCurrentLevel(player: Player): Level {
    return this.visualizationData.levels.find(level => level.id == this.getCurrentPlayerLevel(player)?.id)
  }

  over(player: Player): void {
    this.highlightedPlayer = player;
    this.highlightPlayerChange.emit(player)
  }

  out(): void {
    this.highlightedPlayer = null;
    this.highlightPlayerChange.emit(null);
  }

  hasWarnings(player: Player): boolean {
    const playerWarnings = this.playerSelectData.find(p => p.player.userRefId === player.userRefId).warnings
    return playerWarnings.hintWarning || playerWarnings.tooLongWarning || playerWarnings.wrongAnswerWarning;
  }

  allCurrentWarningsFaded(player: Player): boolean {
    const warnings = this.playerSelectData.find(p => p.player.userRefId === player.userRefId).warnings;
    const fadedWarnings = this.playerSelectData.find(p => p.player.userRefId === player.userRefId).fadedWarnings;
    return  warnings.hintWarning == fadedWarnings.hintWarning && 
            warnings.tooLongWarning == fadedWarnings.tooLongWarning && 
            warnings.wrongAnswerWarning == fadedWarnings.wrongAnswerWarning;
  }

  fadeCurrentWarnings(player: Player): void {
    const playerData = this.playerSelectData.find(p => p.player.userRefId === player.userRefId);
    playerData.fadedWarnings.tooLongWarning = this.checkLatePlayer(player);
    playerData.fadedWarnings.hintWarning = this.checkOutOfHints(player);
    playerData.fadedWarnings.wrongAnswerWarning = this.checkWrongAnswers(player);
  }

}
