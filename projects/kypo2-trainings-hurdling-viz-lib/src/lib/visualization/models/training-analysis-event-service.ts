import { TrainingAnalysisComponent } from '../components/visualizations/training-analysis/training-analysis.component';

export interface TrainingAnalysisEventService {

    trainingAnalysisComponent: TrainingAnalysisComponent;

    trainingAnalysisOnBarMouseover(playerId: string): void;

    trainingAnalysisOnBarMouseout(playerId: string): void;

    trainingAnalysisOnBarClick(playerId: string): void;

    registerTrainingAnalysisComponent(component: TrainingAnalysisComponent): void;
}
