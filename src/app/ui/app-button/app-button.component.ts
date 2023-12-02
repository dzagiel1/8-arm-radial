import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './app-button.component.html',
  styleUrls: ['./app-button.component.scss'],
})
export class AppButtonComponent {
  @Input() disabled = false;
  @Output() btnClicked = new EventEmitter<void>();

  click(): void {
    this.btnClicked.emit();
  }
}
