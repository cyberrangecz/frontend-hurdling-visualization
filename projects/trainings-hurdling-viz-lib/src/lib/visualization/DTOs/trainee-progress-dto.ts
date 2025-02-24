import { TraineeLevelDTO } from './trainee-level-dto';

export class TraineeProgressDTO {
    user_ref_id: number;
    training_run_id: number;
    levels: TraineeLevelDTO[];
}
