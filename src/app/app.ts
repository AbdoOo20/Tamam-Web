import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHost } from '@tamam/shared';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHost],
  template: `
    <router-outlet />
    <tamam-toast-host />
  `,
})
export class App {}
