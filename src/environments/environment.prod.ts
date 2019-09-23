import {View} from '../../projects/kypo2-trainings-hurdling-viz-lib/src/lib/visualization/models/view.enum';

export const environment = {
  production: true,
  assetsRoot: '/portlet_ctf_progress-0.1/',
  restBaseUrl: 'https://147.251.124.129:8083/kypo2-rest-training/api/v1/',

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
  kypo2AuthConfig: {
    maxRetryAttempts: 3,
    guardMainPageRedirect: 'hurdling',
    guardLoginPageRedirect: 'login',
    tokenInterceptorAllowedUrls: [
      'https://kypo-devel.ics.muni.cz'
    ],
    userInfoRestUri: 'https://kypo-devel.ics.muni.cz:8084/kypo2-rest-user-and-group/api/v1/',
    providers: [
      {
        label: 'Login with MUNI',
        textColor: 'white',
        backgroundColor: '#002776',
        tokenRefreshTime: 30000,
        oidcConfig: {
          issuer: 'https://oidc.muni.cz/oidc/',
          clientId: 'b53f2660-8fa0-4d32-94e4-23a59d7e7077',
          redirectUri: window.location.origin,
          scope: 'openid email profile',
          logoutUrl: 'https://oidc.muni.cz/oidc/endsession',
          postLogoutRedirectUri: window.location.origin,
          clearHashAfterLogin: true
        },
      },
    ]
  },
};
