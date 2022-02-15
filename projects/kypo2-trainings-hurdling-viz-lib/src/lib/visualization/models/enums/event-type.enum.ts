export enum EventType {
        trainingStart =  'cz.muni.csirt.kypo.events.trainings.TrainingRunStarted',
        trainingFinished = 'cz.muni.csirt.kypo.events.trainings.TrainingRunEnded',
        assessmentAnswers = 'cz.muni.csirt.kypo.events.trainings.AssessmentAnswers',
        trainingExited = 'cz.muni.csirt.kypo.events.trainings.TrainingRunSurrendered',
        hint = 'cz.muni.csirt.kypo.events.trainings.HintTaken',
        wrongAnswer = 'cz.muni.csirt.kypo.events.trainings.WrongAnswerSubmitted',
        wrongPasskey = 'cz.muni.csirt.kypo.events.trainings.WrongPasskeySubmitted',
        wrongFlag = 'cz.muni.csirt.kypo.events.trainings.WrongFlagSubmitted',
        levelStarted = 'cz.muni.csirt.kypo.events.trainings.LevelStarted',
        levelCompleted = 'cz.muni.csirt.kypo.events.trainings.LevelCompleted',
        correctAnswer = 'cz.muni.csirt.kypo.events.trainings.CorrectAnswerSubmitted',
        correctPasskey = 'cz.muni.csirt.kypo.events.trainings.CorrectPasskeySubmitted',
        solution = 'cz.muni.csirt.kypo.events.trainings.SolutionDisplayed'
}
