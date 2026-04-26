import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  readonly open = input(false);
  readonly title = input('Confirmar accion');
  readonly message = input('Esta accion no se puede deshacer.');
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly busy = input(false);

  readonly cancel = output<void>();
  readonly confirm = output<void>();

  protected onBackdropClick(): void {
    this.emitCancel();
  }

  protected onCancelClick(): void {
    this.emitCancel();
  }

  protected onConfirmClick(): void {
    if (this.busy()) {
      return;
    }

    this.confirm.emit();
  }

  protected onEscapeKey(): void {
    this.emitCancel();
  }

  private emitCancel(): void {
    if (this.busy()) {
      return;
    }

    this.cancel.emit();
  }
}
