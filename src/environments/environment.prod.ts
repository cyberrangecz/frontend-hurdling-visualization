import {View} from '../../projects/kypo2-trainings-hurdling-viz-lib/src/lib/visualization/models/view.enum';

export const environment = {
  production: true,
  assetsRoot: '/portlet_ctf_progress-0.1/',
  restBaseUrl: 'http://147.251.21.216:8083/kypo2-rest-training/api/v1',

  // OIDC SETTINGS
  // Url of the Identity Provider
  issuer: 'https://oidc.muni.cz/oidc/',
  // URL of the SPA to redirect the user after silent refresh
  silentRefreshRedirectUri: window.location.origin,
  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin,
  // The SPA's id. The SPA is registered with this id at the config-server
  clientId: 'b53f2660-8fa0-4d32-94e4-23a59d7e7077',
  // set the scope for the permissions the client should request
  scope: 'openid profile email',
  sessionChecksEnabled: false,
};
