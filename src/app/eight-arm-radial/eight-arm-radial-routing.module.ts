import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EightArmRadialComponent } from './eight-arm-radial.component';

const routes: Routes = [
  {
    path: 'eight-arm-radial',
    component: EightArmRadialComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EightArmRadialRoutingModule {}
