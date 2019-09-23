import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';
import { Kypo2AuthInterceptor, Kypo2AuthModule } from 'kypo2-auth';
import { environment } from '../environments/environment';

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
      }),
    Kypo2AuthModule.forRoot(environment.kypo2AuthConfig)
  ],
  providers: [
    { provide: OAuthStorage, useValue: localStorage },
    { provide: HTTP_INTERCEPTORS, useClass: Kypo2AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
