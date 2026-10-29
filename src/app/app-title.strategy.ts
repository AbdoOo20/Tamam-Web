import { inject, Service } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { APP_ENVIRONMENT } from '@tamam/core';

const TAGLINE = 'درع الدفع عند الاستلام';

/** Browser tab title: `<page> | تمام`. Pages without a title get the site name and tagline. */
@Service()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly appName = inject(APP_ENVIRONMENT).appName;

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const page = this.buildTitle(snapshot);

    if (!page) {
      this.title.setTitle(`${this.appName} | ${TAGLINE}`);
    } else if (page.startsWith(this.appName)) {
      this.title.setTitle(page);
    } else {
      this.title.setTitle(`${page} | ${this.appName}`);
    }
  }
}
