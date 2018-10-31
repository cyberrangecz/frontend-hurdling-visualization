# KYPO Trainings Hurdling Visualization

## Authors
- [Diploma thesis](https://is.muni.cz/auth/th/ks5tu/) by Andrea Navratilova

## How to deploy on surge.sh
### Prerequisites
- recent version of [Node.js](nodejs.org) and npm. (I'd recommend using [https://github.com/creationix/nvm](nvm) to prevent conflicts with different versions of various projects)
- recent version of [Angular CLI](https://cli.angular.io/): `npm install -g @angular/cli`
- surge: `npm install -g surge`

### Steps
1. Clone this repository `git clone git@gitlab.ics.muni.cz:kypo2/frontend-new/kypo2-trainings-hurdling-visualization.git`
2. Build the app in app's folder `ng build --prod`
3. Change directory to dist files `cd dist`.
4. Run `surge` and follow CLI instructions.