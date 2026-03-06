import { Component, input, output } from '@angular/core';
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
  autofilled = output<string>();

  onAnimationStart(event: AnimationEvent) {
    if (event.animationName === 'onAutofill') {
      const target = event.target as HTMLInputElement;
      this.autofilled.emit(target.value);
    }
  }
}
