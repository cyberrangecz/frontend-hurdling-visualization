import { TrainingAnalysisComponent } from '../components/visualizations/training-analysis/training-analysis.component';

export interface TrainingAnalysisEventService {
    trainingAnalysisComponent: TrainingAnalysisComponent;

    trainingAnalysisOnBarMouseover(subjectId: string): void;

    trainingAnalysisOnBarMouseout(subjectId: string): void;

    trainingAnalysisOnBarClick(subjectId: string): void;

    registerTrainingAnalysisComponent(component: TrainingAnalysisComponent): void;
}
