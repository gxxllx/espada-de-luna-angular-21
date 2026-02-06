import { Component, input } from '@angular/core';
import { ReactiveFormsModule, ControlContainer, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'button-field',
  imports: [ReactiveFormsModule],
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class Button {
  label = input.required<string>();
  type = input<string>('submit');
  showError = input<boolean>(false);
  errorMessage = input<string>('');
  disabled = input<boolean>(false);
  onClick = input<() => void>(() => {});
}
