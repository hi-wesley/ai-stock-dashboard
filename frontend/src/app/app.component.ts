import { Component } from '@angular/core';

/**
 * Shell component that shows the dashboard.
 * Must live in src/app so ./app.module.ts resolves the import.
 */
@Component({
  selector: 'app-root',
  template: '<app-dashboard></app-dashboard>'
})
export class AppComponent {}
