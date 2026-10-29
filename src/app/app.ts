import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmHost, ToastHost } from '@tamam/shared';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHost, ConfirmHost],
  template: `
    <router-outlet />
    <tamam-toast-host />
    <tamam-confirm-host />
  `,
})
export class App {}
