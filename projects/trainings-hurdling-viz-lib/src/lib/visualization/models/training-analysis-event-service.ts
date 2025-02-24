import { TrainingAnalysisComponent } from '../components/visualizations/training-analysis/training-analysis.component';

export interface TrainingAnalysisEventService {
    trainingAnalysisComponent: TrainingAnalysisComponent;

    trainingAnalysisOnBarMouseover(traineeId: string): void;

    trainingAnalysisOnBarMouseout(traineeId: string): void;

    trainingAnalysisOnBarClick(traineeId: string): void;

    registerTrainingAnalysisComponent(component: TrainingAnalysisComponent): void;
}
