import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {OAuthModule, OAuthStorage} from 'angular-oauth2-oidc';
import {AuthService} from './auth/auth.service';
import {AuthHttpInterceptor} from './auth/auth-http-interceptor';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    OAuthModule.forRoot(
        {
          resourceServer: {
            allowedUrls: [],
            sendAccessToken: true
          }
        })
  ],
  providers: [
    AuthService,
    { provide: OAuthStorage, useValue: localStorage },
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
