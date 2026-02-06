import { Component, input } from '@angular/core';
import { ReactiveFormsModule, ControlContainer, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'input-field',
  imports: [ReactiveFormsModule],
  templateUrl: './input.html',
  styleUrls: ['./input.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class Input {
  label = input.required<string>();
  id = input.required<string>();
  type = input<string>('text');
  placeholder = input<string>('');
  controlName = input<string>('');
  autoComplete = input<string>('off');
  showError = input<boolean>(false);
  errorMessage = input<string>('');
}
