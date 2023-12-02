import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppButtonComponent } from './app-button/app-button.component';

@NgModule({
  imports: [CommonModule],
  declarations: [AppButtonComponent],
  exports: [AppButtonComponent],
})
export class UiModule {}
