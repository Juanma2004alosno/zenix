
import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService, PlanType, Video, Draft } from '../services/store.service';

type Tab = 'VIDEOS' | 'LIKES' | 'SAVED' | 'DRAFTS';
type ViewMode = 'PROFILE' | 'SETTINGS';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, FormsModule],
  templateUrl: './profile.component.html',
  changeDetection: 1
})
export class ProfileComponent {
  store = inject(StoreService);
  activeTab = signal<Tab>('VIDEOS');
  viewMode = signal<ViewMode>('PROFILE');
  
  // Video Player Modal State
  fullscreenVideo = signal<Video | null>(null);

  // Payment Method Form State (Settings)
  showPaymentForm = signal(false);
  cardNumber = signal('');
  cardExpiry = signal('');
  cardCvc = signal('');
  
  // Withdrawal Form State
  withdrawalAmount = signal<number | null>(null);
  withdrawalMsg = signal('');

  // Purchase/Upgrade Modal State
  showPurchaseModal = signal(false);
  selectedPlanId = signal<PlanType | null>(null);
  isProcessingPayment = signal(false);
  purchaseSuccessMsg = signal('');

  // Edit Profile State
  showEditProfileModal = signal(false);
  editUsername = signal('');
  editHandle = signal('');
  editBio = signal('');
  editAvatar = signal('');

  // Computed projections for current values
  nextEarningEstimate = computed(() => {
    const user = this.store.user();
    const base = 0.05;
    const followerBonus = Math.floor(user.followers / 100) * 0.01;
    return base + followerBonus;
  });

  selectedPlanDetails = computed(() => {
    const id = this.selectedPlanId();
    if (!id) return null;
    return this.store.PLANS[id];
  });

  // --- Video Playback Logic ---
  openVideo(video: Video) {
    this.fullscreenVideo.set(video);
  }

  closeVideo() {
    this.fullscreenVideo.set(null);
  }

  // --- Purchase Logic ---

  openPlanPurchase(plan: PlanType) {
    if (!this.store.user().paymentMethod) {
       if(confirm("Necesitas añadir un método de pago antes de suscribirte. ¿Ir a la cartera?")) {
         this.viewMode.set('SETTINGS');
         this.showPaymentForm.set(true);
       }
       return;
    }
    this.selectedPlanId.set(plan);
    this.showPurchaseModal.set(true);
  }

  confirmPurchase() {
    if (this.isProcessingPayment()) return;
    
    this.isProcessingPayment.set(true);

    setTimeout(() => {
       const planId = this.selectedPlanId();
       if (planId) {
         this.store.upgradePlan(planId);
         this.purchaseSuccessMsg.set('¡Pago realizado con éxito! Plan activado.');
         
         setTimeout(() => {
            this.showPurchaseModal.set(false);
            this.purchaseSuccessMsg.set('');
            this.selectedPlanId.set(null);
            this.isProcessingPayment.set(false);
         }, 1500);
       }
    }, 2000);
  }

  closePurchaseModal() {
    if (this.isProcessingPayment()) return;
    this.showPurchaseModal.set(false);
    this.selectedPlanId.set(null);
  }

  // --- Edit Profile Logic ---

  openEditProfile() {
    const u = this.store.user();
    this.editUsername.set(u.username);
    this.editHandle.set(u.handle);
    this.editBio.set(u.bio || '');
    this.editAvatar.set(u.avatar);
    this.showEditProfileModal.set(true);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editAvatar.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    this.store.updateProfile({
      username: this.editUsername(),
      handle: this.editHandle().startsWith('@') ? this.editHandle() : '@' + this.editHandle(),
      bio: this.editBio(),
      avatar: this.editAvatar()
    });
    this.showEditProfileModal.set(false);
  }

  selectAvatar(url: string) {
    this.editAvatar.set(url);
  }

  // --- Follow Logic ---
  toggleFollow() {
    if (this.store.isViewingSelf()) return;
    const target = this.store.displayedUser().username;
    this.store.toggleFollowUser(target);
  }

  // --- Navigation ---
  goBack() {
    if (this.viewMode() === 'SETTINGS') {
      this.viewMode.set('PROFILE');
    } else if (!this.store.isViewingSelf()) {
      this.store.navigateTo('FEED'); // Or back to previous view conceptually
    }
  }

  // --- Draft Actions ---
  publishDraft(draft: Draft) {
    this.store.publishDraft(draft);
    this.activeTab.set('VIDEOS');
  }

  deleteDraft(id: string) {
    this.store.deleteDraft(id);
  }
  
  logout() {
    this.store.logout();
  }

  // --- Wallet / Settings Logic ---
  saveCard() {
    if (this.cardNumber() && this.cardExpiry()) {
      this.store.addPaymentMethod(this.cardNumber(), this.cardExpiry());
      this.showPaymentForm.set(false);
      this.cardNumber.set('');
      this.cardExpiry.set('');
      this.cardCvc.set('');
    }
  }

  removeCard() {
    this.store.removePaymentMethod();
  }

  processWithdrawal() {
    const amount = this.withdrawalAmount();
    if (!amount || amount <= 0) return;

    const success = this.store.withdrawFunds(amount);
    if (success) {
      this.withdrawalMsg.set(`¡Retiro de ${amount}€ exitoso!`);
      this.withdrawalAmount.set(null);
    } else {
      this.withdrawalMsg.set('Fondos insuficientes o error.');
    }
    setTimeout(() => this.withdrawalMsg.set(''), 3000);
  }
}
