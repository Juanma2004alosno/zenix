
import { Component, inject, signal, ElementRef, effect, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './feed.component.html',
  styles: [`
    /* Hide default controls but keep functionality accessible */
    video::-webkit-media-controls {
      display: none !important;
    }
    video {
      -webkit-user-select: none;
      user-select: none;
    }
  `],
  changeDetection: 1 // OnPush
})
export class FeedComponent implements AfterViewInit, OnDestroy {
  store = inject(StoreService);
  el = inject(ElementRef);
  
  showLoginPrompt = signal(false);
  playingVideoId = signal<string | null>(null);
  
  // Donation State
  showDonationModal = signal(false);
  selectedCreator = signal('');
  donationMsg = signal('');

  private observer: IntersectionObserver | null = null;

  constructor() {
    // Re-initialize observer when the video list updates
    effect(() => {
      const videos = this.store.videos(); // Dependency
      setTimeout(() => this.setupObserver(), 100); // Wait for render
    });
  }

  ngAfterViewInit() {
    this.setupObserver();
  }

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
  }

  setupObserver() {
    if (this.observer) this.observer.disconnect();

    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.6 // Video must be 60% visible to play
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target as HTMLVideoElement;
        const videoId = video.getAttribute('data-id');

        if (entry.isIntersecting) {
          // Attempt to play
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
               if (videoId) this.playingVideoId.set(videoId);
            }).catch(error => {
               console.log("Autoplay with sound blocked, trying muted.", error);
               video.muted = true;
               video.play().then(() => {
                 if (videoId) this.playingVideoId.set(videoId);
               }).catch(e => console.error("Autoplay failed completely", e));
            });
          }
        } else {
          // Pause when out of view
          video.pause();
          // Optional: reset time? TikTok usually resumes.
        }
      });
    }, options);

    // Observe all video elements
    const videos = this.el.nativeElement.querySelectorAll('video');
    videos.forEach((v: HTMLVideoElement) => this.observer?.observe(v));
  }

  checkAuth(action: () => void) {
    if (this.store.isAuthenticated()) {
      action();
    } else {
      this.triggerLoginPrompt();
    }
  }

  triggerLoginPrompt() {
    this.showLoginPrompt.set(true);
    setTimeout(() => this.showLoginPrompt.set(false), 2000);
  }

  togglePlay(videoElement: HTMLVideoElement, videoId: string) {
    if (videoElement.paused) {
      videoElement.play();
      this.playingVideoId.set(videoId);
    } else {
      videoElement.pause();
      this.playingVideoId.set(null);
    }
  }

  goToProfile(username: string) {
    this.store.openUserProfile(username);
  }

  toggleFollow(username: string) {
    this.checkAuth(() => {
      this.store.toggleFollowUser(username);
    });
  }

  isFollowing(username: string) {
    return this.store.followingList().has(username);
  }

  handleLike(id: string) {
    this.checkAuth(() => this.store.toggleLike(id));
  }

  handleSave(id: string) {
    this.checkAuth(() => this.store.toggleSave(id));
  }

  handleComment() {
    this.checkAuth(() => {
      // Future comment logic
    });
  }

  openDonation(author: string) {
    this.checkAuth(() => {
      this.selectedCreator.set(author);
      this.showDonationModal.set(true);
    });
  }

  handleDonate(amount: number) {
    const success = this.store.donateToCreator(amount, this.selectedCreator());
    if (success) {
       this.donationMsg.set(`¡Enviaste ${amount}€ a ${this.selectedCreator()}!`);
       setTimeout(() => {
         this.showDonationModal.set(false);
         this.donationMsg.set('');
       }, 2000);
    } else {
       this.donationMsg.set('Saldo insuficiente. Recarga en tu perfil.');
       setTimeout(() => this.donationMsg.set(''), 2000);
    }
  }

  isLiked(id: string) {
    return this.store.likedVideoIds().has(id);
  }

  isSaved(id: string) {
    return this.store.savedVideoIds().has(id);
  }
}
