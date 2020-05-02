import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { LogsSummaryPageRoutingModule } from './logs-summary-routing.module';
import { LogsSummaryPage } from './logs-summary.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LogsSummaryPageRoutingModule,
  ],
  declarations: [LogsSummaryPage]
})
export class LogsSummaryPageModule {}
