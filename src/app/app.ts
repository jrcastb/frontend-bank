import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorMessageService } from './core/errors/error-message.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly errorService = inject(ErrorMessageService);
  protected readonly currentError = this.errorService.currentError;

  protected dismissError(): void {
    this.errorService.clear();
  }
}
