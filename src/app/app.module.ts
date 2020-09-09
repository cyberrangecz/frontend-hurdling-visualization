import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import {SentinelAuthModule} from '@sentinel/auth';
import {SentinelAuthGuardWithLogin, SentinelNegativeAuthGuard} from '@sentinel/auth/guards';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    SentinelAuthModule.forRoot(environment.authConfig)
  ],
  providers: [
    SentinelAuthGuardWithLogin,
    SentinelNegativeAuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
