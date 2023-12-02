import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EightArmRadialRoutingModule } from './eight-arm-radial-routing.module';

import { EightArmRadialComponent } from './eight-arm-radial.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [EightArmRadialComponent],
  imports: [CommonModule, SharedModule, EightArmRadialRoutingModule],
})
export class EightArmRadialModule {}
