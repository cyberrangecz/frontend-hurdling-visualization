export enum EventType {
    trainingStart = 'cz.cyberrange.platform.events.trainings.TrainingRunStarted',
    trainingFinished = 'cz.cyberrange.platform.events.trainings.TrainingRunEnded',
    assessmentAnswers = 'cz.cyberrange.platform.events.trainings.AssessmentAnswers',
    trainingExited = 'cz.cyberrange.platform.events.trainings.TrainingRunSurrendered',
    hint = 'cz.cyberrange.platform.events.trainings.HintTaken',
    wrongFlag = 'cz.cyberrange.platform.events.trainings.WrongAnswerSubmitted',
    levelStarted = 'cz.cyberrange.platform.events.trainings.LevelStarted',
    levelCompleted = 'cz.cyberrange.platform.events.trainings.LevelCompleted',
    correctFlag = 'cz.cyberrange.platform.events.trainings.CorrectAnswerSubmitted',
    solution = 'cz.cyberrange.platform.events.trainings.SolutionDisplayed',
}
