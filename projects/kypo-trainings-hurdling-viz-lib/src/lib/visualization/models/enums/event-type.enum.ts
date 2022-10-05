export enum EventType {
        trainingStart =  'cz.muni.csirt.kypo.events.trainings.TrainingRunStarted',
        trainingFinished = 'cz.muni.csirt.kypo.events.trainings.TrainingRunEnded',
        assessmentAnswers = 'cz.muni.csirt.kypo.events.trainings.AssessmentAnswers',
        trainingExited = 'cz.muni.csirt.kypo.events.trainings.TrainingRunSurrendered',
        hint = 'cz.muni.csirt.kypo.events.trainings.HintTaken',
        wrongFlag = 'cz.muni.csirt.kypo.events.trainings.WrongAnswerSubmitted',
        levelStarted = "cz.muni.csirt.kypo.events.trainings.LevelStarted",
        levelCompleted = 'cz.muni.csirt.kypo.events.trainings.LevelCompleted',
        correctFlag = 'cz.muni.csirt.kypo.events.trainings.CorrectAnswerSubmitted',
        solution = 'cz.muni.csirt.kypo.events.trainings.SolutionDisplayed'
}
