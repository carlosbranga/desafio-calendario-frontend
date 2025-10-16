import 'zone.js'
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {App} from './app/app';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { provideHttpClient } from '@angular/common/http';


bootstrapApplication(App, { 
  providers: [
    provideRouter(routes),
    importProvidersFrom(
        CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory,
        })
    ),

    provideHttpClient() 
  ]
})
.catch(err => console.error(err));