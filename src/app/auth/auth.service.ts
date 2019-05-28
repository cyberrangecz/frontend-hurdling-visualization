import {Injectable} from '@angular/core';
import { OAuthService} from 'angular-oauth2-oidc';


@Injectable()
export class AuthService {

  constructor(private oAuthService: OAuthService) {
  }

  login() {
    this.oAuthService.loadDiscoveryDocumentAndLogin()
      .then(() => {
        // TODO: Inform components about the change
      });  }

  logout() {
    localStorage.clear();
    this.oAuthService.logOut(true);
  }

  isAuthenticated(): boolean {
    return this.oAuthService.hasValidAccessToken();
  }

  getAuthorizationToken(): string {
    return this.oAuthService.authorizationHeader();
  }
}
