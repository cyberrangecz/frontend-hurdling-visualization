import {Component, OnInit} from '@angular/core';
import { AuthService } from './auth/auth.service';
import { authConfig } from './auth/auth.config';
import {OAuthService, JwksValidationHandler} from 'angular-oauth2-oidc';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
      private oAuthService: OAuthService,
      private authService: AuthService) {}

  ngOnInit() {
    this.subscribeOIDCEvents();
    this.configureOidc();
  }
  private configureOidc() {
    this.oAuthService.setStorage(localStorage);
    this.oAuthService.configure(authConfig);
    this.oAuthService.loadDiscoveryDocument()
        .then(() => {
          this.oAuthService.tryLogin()
              .then(() => {
                this.oAuthService.tokenValidationHandler = new JwksValidationHandler();
                this.oAuthService.setupAutomaticSilentRefresh();
              });
        });
    this.authService.login();
  }

  private subscribeOIDCEvents() {
    this.oAuthService.events.subscribe(event => {
      if (event.type === 'token_refresh_error'
          || event.type === 'token_error'
          || event.type === 'silent_refresh_error'
          || event.type === 'token_validation_error') {
        console.log(event.type);
        this.authService.logout();
      }
    });
  }
}
