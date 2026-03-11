import { Component, inject, input } from '@angular/core';
import { ReactiveFormsModule, ControlContainer } from '@angular/forms';

const controlContainerFactory = () => inject(ControlContainer, { skipSelf: true, optional: true });

export interface SelectOption {
  value: unknown;
  label: string;
}

@Component({
  selector: 'select-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './select-form.html',
  styleUrl: './select-form.scss',
  viewProviders: [{ provide: ControlContainer, useFactory: controlContainerFactory }],
})
export class Select {
  label = input.required<string>();
  id = input.required<string>();
  controlName = input<string>('');
  placeholder = input<string>('Selecciona una opcion');
  options = input<SelectOption[]>([]);
  showError = input<boolean>(false);
  errorMessage = input<string>('');
}
