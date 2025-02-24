# CyberRangeᶜᶻ Platform Trainings Hurdling Visualization

As an instructor, a user can see the ongoing course of the training runs and further filter information on demand. The
tool gives a full picture of the trainee’s walkthrough. Upon filtering in the preceding sections, selected trainees are
displayed here.

Rows represent individual trainees. Bars of each row are training levels - gray levels are finished levels, current
levels are colored green/yellow/red, according to their delay as opposed to the scheduled amount of time. The stripped
bars denote the scheduled time for the ongoing or upcoming levels.

## Input parameters

`trainingDefinitionId: number`

`trainingInstanceId: number`

`JSONData: VisualizationDataDTO` if we use periodical simulation, we use it with a local JSON data for now

`view: enum` determines if we will use the progress or the final mode

`selectedTraineeView: TraineeView` selects option to see trainee names or avatars

`colorScheme: string[]`

`eventService: TrainingAnalysisEventService`

`setDashboardView: boolean` true for dahsboard, false for the view of single visualization

`externalFilters: []` the filters to determine what events will be visible

`trainingColors: string[]`

`traineeColorScheme: string[]`

`selectedTrainees: Trainee[]` if this array exists, only the given trainees will be provided for visualization

`isStandalone: boolean` set true if we want to use the visualization in a standalone mode; in the portal, we use false

## How to use library

An example of use:

```html
<crczp-hurdling-visualization
        [isStandalone]="true"
        [trainingInstanceId]="10"
        view="progress"
        [JSONData]="data">
</crczp-hurdling-visualization>
```
