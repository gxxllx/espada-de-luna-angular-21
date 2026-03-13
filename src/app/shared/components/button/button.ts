import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'button-field',
  imports: [ReactiveFormsModule],
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
})
export class Button {
  label = input.required<string>();
  type = input<string>('submit');
  showError = input<boolean>(false);
  errorMessage = input<string>('');
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(true);
  readonly clicked = output<void>();
}
