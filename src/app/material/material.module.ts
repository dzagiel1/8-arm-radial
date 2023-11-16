import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

const material = [MatButtonModule, MatInputModule];

@NgModule({
  exports: [material],
  imports: [material],
})
export class MaterialModule {}
