import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LineChartComponent } from './shared/visualize/line-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LineChartComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    ScrollingModule,
    NgxChartsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
