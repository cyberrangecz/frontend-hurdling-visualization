export enum EventType {
        gameStart =  'cz.muni.csirt.kypo.events.trainings.TrainingRunStarted',
        gameFinished = 'cz.muni.csirt.kypo.events.trainings.TrainingRunEnded',
        assessmentAnswers = 'cz.muni.csirt.kypo.events.trainings.AssessmentAnswers',
        gameExited = 'cz.muni.csirt.kypo.events.trainings.TrainingRunSurrendered',
        hint = 'cz.muni.csirt.kypo.events.trainings.HintTaken',
        wrongFlag = 'cz.muni.csirt.kypo.events.trainings.WrongFlagSubmitted',
        levelStarted = "cz.muni.csirt.kypo.events.trainings.LevelStarted",
        levelCompleted = 'cz.muni.csirt.kypo.events.trainings.LevelCompleted',
        correctFlag = 'cz.muni.csirt.kypo.events.trainings.CorrectFlagSubmitted',
        solution = 'cz.muni.csirt.kypo.events.trainings.SolutionDisplayed'
}
