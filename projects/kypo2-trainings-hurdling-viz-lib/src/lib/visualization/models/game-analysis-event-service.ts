import { GameAnalysisComponent } from '../components/game-analysis/game-analysis.component';

export interface GameAnalysisEventService {

    gameAnalysisComponent: GameAnalysisComponent;

    gameAnalysisOnBarMouseover(playerId: number): void;

    gameAnalysisOnBarMouseout(playerId: number): void;

    gameAnalysisOnBarClick(playerId: number): void;

    registerGameAnalysisComponent(component: GameAnalysisComponent): void;
}
