import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SunburstComponent } from './components/sunburst/sunburst.component';
import { HttpClientModule } from '@angular/common/http';
import { HeatmapComponent } from './components/heatmap/heatmap.component';

@NgModule({
  declarations: [
    AppComponent,
    SunburstComponent,
    HeatmapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
