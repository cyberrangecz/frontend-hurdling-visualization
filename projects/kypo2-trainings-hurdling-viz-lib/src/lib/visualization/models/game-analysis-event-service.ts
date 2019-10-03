import { GameAnalysisComponent } from '../components/game-analysis/game-analysis.component';

export interface GameAnalysisEventService {

    gameAnalysisComponent: GameAnalysisComponent;

    gameAnalysisOnBarMouseover(playerId: string): void;

    gameAnalysisOnBarMouseout(playerId: string): void;

    gameAnalysisOnBarClick(playerId: string): void;

    registerGameAnalysisComponent(component: GameAnalysisComponent): void;
}
