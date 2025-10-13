> The code from this repository has been integrated to the [frontend-platform monorepo](https://github.com/cyberrangecz/frontend-platform), where development and maintenance continue.

# CyberRangeᶜᶻ Platform Trainings Hurdling Visualization

As an instructor, a user can see the ongoing course of the training runs and further filter information on demand. The
tool gives a full picture of the trainee’s walkthrough. Upon filtering in the preceding sections, selected trainees are
displayed here.

Rows represent individual trainees. Bars of each row are training levels - gray levels are finished levels, current
levels are colored green/yellow/red, according to their delay as opposed to the scheduled amount of time. The stripped
bars denote the scheduled time for the ongoing or upcoming levels.

## Steps to Build & Develop

1. Pull and run the [Training service](https://github.com/cyberrangecz/backend-training) or deploy the whole [deployment](https://github.com/cyberrangecz/devops-helm)
2. Configure the [environment.local.ts](src/environments/environment.local.ts) file, pointing to the services.
3. Run `npm install`.
4. Run the app in local environment and ssl via `npm run start`
5. Navigate to `https://localhost:4200/`. The app will automatically reload if you change any of the source files. The app will use a self-signed certificate, so you will need to accept it in the browser.

## How to Simulate Training Run with Provided Test Data

1. To enable simulation, in hurdling-overview.component.ts, change the `ngOnInit()` function accordingly (check the
   comments).
2. Run `npm install`.
3. Run the app in local environment and ssl `npm start` and access it on `https://localhost:4200`.

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

## How to Use as a Library

An example of use:

```html
<crczp-hurdling-visualization
        [isStandalone]="true"
        [trainingInstanceId]="10"
        view="progress"
        [JSONData]="data">
</crczp-hurdling-visualization>
```
