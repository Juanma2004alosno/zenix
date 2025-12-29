
import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedComponent } from './components/feed.component';
import { ProfileComponent } from './components/profile.component';
import { UploadComponent } from './components/upload.component';
import { AuthComponent } from './components/auth.component';
import { StoreService, AppView } from './services/store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FeedComponent, ProfileComponent, UploadComponent, AuthComponent],
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  store = inject(StoreService);

  setView(view: AppView) {
    this.store.navigateTo(view);
  }

  showAuth() {
    return !this.store.isAuthenticated() && !this.store.isGuest();
  }
}
