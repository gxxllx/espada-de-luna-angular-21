import {
  Component,
  inject,
  signal,
  viewChildren,
  ElementRef,
  afterNextRender,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
  selector: 'app-two-factor',
  imports: [],
  templateUrl: './two-factor.html',
  styleUrls: ['./two-factor.scss'],
})
export class TwoFactor {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  otpInputs = viewChildren<ElementRef<HTMLInputElement>>('otpInput');

  qrCode = this.authService.pending2FAQRCode;
  showQrDialog = signal(!!this.authService.pending2FAQRCode());
  otpDigits = signal<string[]>(['', '', '', '', '', '']);
  serverError = signal<string | null>(null);
  verifying = signal(false);

  constructor() {
    afterNextRender(() => {
      if (!this.showQrDialog()) {
        this.focusOtpInput(0);
      }
    });
  }

  closeQrDialog(): void {
    this.showQrDialog.set(false);
    setTimeout(() => this.focusOtpInput(0));
  }

  onOtpInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replaceAll(/\D/g, '');

    const current = [...this.otpDigits()];
    current[index] = value.charAt(0) || '';
    this.otpDigits.set(current);
    input.value = current[index];

    if (value && index < 5) {
      this.focusOtpInput(index + 1);
    }

    this.trySubmit();
  }

  onOtpKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.otpDigits()[index] && index > 0) {
      const current = [...this.otpDigits()];
      current[index - 1] = '';
      this.otpDigits.set(current);
      this.syncOtpInputs();
      this.focusOtpInput(index - 1);
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = (event.clipboardData?.getData('text') || '').replaceAll(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const current = ['', '', '', '', '', ''];
    pasted.split('').forEach((d, i) => (current[i] = d));
    this.otpDigits.set(current);
    this.syncOtpInputs();
    this.focusOtpInput(Math.min(pasted.length, 5));
    this.trySubmit();
  }

  private trySubmit(): void {
    const code = this.otpDigits().join('');
    if (code.length < 6 || this.verifying()) return;

    this.verifying.set(true);
    this.serverError.set(null);

    this.authService.verify2FA(this.authService.pending2FACredentials(), code).subscribe({
      next: () => {
        this.verifying.set(false);
        this.authService.pending2FAQRCode.set(null);
        this.authService.pending2FACredentials.set(null);
        void this.router.navigate(['collections/all']);
      },
      error: () => {
        this.verifying.set(false);
        this.serverError.set('Código incorrecto');
        this.otpDigits.set(['', '', '', '', '', '']);
        this.syncOtpInputs();
        this.focusOtpInput(0);
      },
    });
  }

  private focusOtpInput(index: number): void {
    this.otpInputs()?.[index]?.nativeElement.focus();
  }

  private syncOtpInputs(): void {
    const inputs = this.otpInputs();
    if (!inputs) return;
    this.otpDigits().forEach((d, i) => {
      if (inputs[i]) inputs[i].nativeElement.value = d;
    });
  }
}
