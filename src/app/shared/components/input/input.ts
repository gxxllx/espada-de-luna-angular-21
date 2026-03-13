import { Component, inject, input, output } from '@angular/core';
import { ReactiveFormsModule, ControlContainer } from '@angular/forms';

const controlContainerFactory = () => inject(ControlContainer, { skipSelf: true, optional: true });
type InputAttributeValue = string | number | null;

@Component({
  selector: 'input-field',
  imports: [ReactiveFormsModule],
  templateUrl: './input.html',
  styleUrls: ['./input.scss'],
  viewProviders: [{ provide: ControlContainer, useFactory: controlContainerFactory }],
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
  min = input<InputAttributeValue>(null);
  max = input<InputAttributeValue>(null);
  step = input<InputAttributeValue>(null);
  maxLength = input<number | null>(null);
  minLength = input<number | null>(null);
  autofilled = output<string>();

  onAnimationStart(event: AnimationEvent) {
    if (event.animationName === 'onAutofill') {
      const target = event.target as HTMLInputElement;
      this.autofilled.emit(target.value);
    }
  }
}
