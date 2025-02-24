import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import { SentinelAuthModule } from '@sentinel/auth';
import { SentinelAuthGuardWithLogin, SentinelNegativeAuthGuard } from '@sentinel/auth/guards';
import { SentinelLayout1Module } from '@sentinel/layout/layout1';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        SentinelLayout1Module,
        SentinelAuthModule.forRoot(environment.authConfig)
    ],
    providers: [
        SentinelAuthGuardWithLogin,
        SentinelNegativeAuthGuard
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
