
import { Injectable, signal, computed } from '@angular/core';

export type PlanType = 'FREE' | 'PRO' | 'PROFESSIONAL' | 'ULTIMATE';
export type AppView = 'FEED' | 'UPLOAD' | 'PROFILE';

export interface Plan {
  id: PlanType;
  name: string;
  dailyLimit: number; // -1 for unlimited
  price: number;
  color: string;
  badge: string;
}

export interface PaymentMethod {
  id: string;
  last4: string;
  brand: string; // 'visa', 'mastercard'
  expiry: string;
}

export interface User {
  username: string;
  email: string;
  handle: string;
  bio: string;
  followers: number;
  following: number;
  balance: number;
  plan: PlanType;
  dailyUploads: number;
  totalUploads: number;
  avatar: string;
  paymentMethod: PaymentMethod | null;
}

export interface Video {
  id: string;
  videoUrl: string; 
  thumbnailUrl: string;
  description: string;
  likes: number;
  comments: number;
  isPromoted: boolean;
  earned: number;
  author: string;
  authorAvatar: string;
}

export interface Draft {
  id: string;
  description: string;
  isPromoted: boolean;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // Plans Configuration
  readonly PLANS: Record<PlanType, Plan> = {
    FREE: { 
      id: 'FREE', 
      name: 'Plan Gratuito', 
      dailyLimit: 10, 
      price: 0, 
      color: 'bg-gray-800',
      badge: 'GUEST'
    },
    PRO: { 
      id: 'PRO', 
      name: 'Plan Pro', 
      dailyLimit: 50, 
      price: 10, 
      color: 'bg-blue-900',
      badge: 'PRO' 
    },
    PROFESSIONAL: { 
      id: 'PROFESSIONAL', 
      name: 'Profesional', 
      dailyLimit: 100, 
      price: 40, 
      color: 'bg-purple-900',
      badge: 'EXPERT'
    },
    ULTIMATE: { 
      id: 'ULTIMATE', 
      name: 'Ultimate', 
      dailyLimit: -1, 
      price: 100, 
      color: 'bg-yellow-700',
      badge: 'VIP'
    }
  };

  // Navigation State
  readonly currentView = signal<AppView>('FEED');
  readonly viewingProfileId = signal<string | null>(null); // If null, viewing self. If string, viewing username.

  // Auth State
  readonly isAuthenticated = signal(false);
  readonly isGuest = signal(false);

  // User State
  readonly user = signal<User>({
    username: 'Usuario Nuevo',
    email: '',
    handle: '@usuario_nuevo',
    bio: '¡Hola! Soy nuevo en Zenix.',
    followers: 1,
    following: 0,
    balance: 0.00,
    plan: 'FREE',
    dailyUploads: 0,
    totalUploads: 0,
    avatar: 'https://picsum.photos/seed/user_default/100/100',
    paymentMethod: null
  });

  // Following list (Set of usernames)
  readonly followingList = signal<Set<string>>(new Set());

  // Content State
  readonly videos = signal<Video[]>([
    {
      id: '1',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/v1/400/800',
      description: '¡Disfrutando del viaje! 🚗💨 #vlog #travel',
      likes: 1205,
      comments: 45,
      isPromoted: false,
      earned: 0.05,
      author: 'AdventureTime',
      authorAvatar: 'https://picsum.photos/seed/other/100/100'
    },
    {
      id: '2',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/v2/400/800',
      description: 'Animación increíble 🎨 #art #3d',
      likes: 8900,
      comments: 302,
      isPromoted: true,
      earned: 0.10,
      author: 'ArtStation',
      authorAvatar: 'https://picsum.photos/seed/travel/100/100'
    },
    {
      id: '3',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/v3/400/800',
      description: 'Efectos especiales de otro nivel 🤖 #scifi',
      likes: 5420,
      comments: 120,
      isPromoted: false,
      earned: 0.15,
      author: 'VFX_Master',
      authorAvatar: 'https://picsum.photos/seed/vfx/100/100'
    }
  ]);

  readonly likedVideoIds = signal<Set<string>>(new Set());
  readonly savedVideoIds = signal<Set<string>>(new Set());
  readonly drafts = signal<Draft[]>([]);

  // Computed
  readonly currentPlan = computed(() => this.PLANS[this.user().plan]);
  
  readonly canUpload = computed(() => {
    const limit = this.currentPlan().dailyLimit;
    return limit === -1 || this.user().dailyUploads < limit;
  });

  readonly remainingUploads = computed(() => {
    const limit = this.currentPlan().dailyLimit;
    if (limit === -1) return 'Ilimitado';
    return limit - this.user().dailyUploads;
  });
  
  // Videos for the logged-in user
  readonly myVideos = computed(() => 
    this.videos().filter(v => v.author === this.user().username)
  );
  
  readonly myLikedVideos = computed(() => 
    this.videos().filter(v => this.likedVideoIds().has(v.id))
  );

  readonly mySavedVideos = computed(() => 
    this.videos().filter(v => this.savedVideoIds().has(v.id))
  );

  // --- Profile Viewing Logic ---
  
  // Returns the data of the user currently being viewed (Self or Other)
  readonly displayedUser = computed(() => {
    const targetUsername = this.viewingProfileId();
    const currentUser = this.user();

    // If viewing self or null
    if (!targetUsername || targetUsername === currentUser.username) {
      return currentUser;
    }

    // If viewing someone else, generate a mock user based on the username
    // In a real app, this would fetch from API
    const videos = this.videos().filter(v => v.author === targetUsername);
    const totalLikes = videos.reduce((acc, v) => acc + v.likes, 0);
    const avatar = videos.length > 0 ? videos[0].authorAvatar : `https://ui-avatars.com/api/?name=${targetUsername}&background=random`;

    return {
      username: targetUsername,
      email: '',
      handle: `@${targetUsername.toLowerCase().replace(/\s/g, '')}`,
      bio: `Creador de contenido en Zenix. ${totalLikes} likes acumulados.`,
      followers: 1000 + (targetUsername.length * 55),
      following: 50,
      balance: 0,
      plan: 'PRO' as PlanType, // Mock plan
      dailyUploads: 0,
      totalUploads: videos.length,
      avatar: avatar,
      paymentMethod: null
    };
  });

  // Videos to show on the profile page based on who we are viewing
  readonly displayedUserVideos = computed(() => {
    const target = this.viewingProfileId();
    if (!target || target === this.user().username) {
      return this.myVideos();
    }
    return this.videos().filter(v => v.author === target);
  });

  readonly isViewingSelf = computed(() => {
    return !this.viewingProfileId() || this.viewingProfileId() === this.user().username;
  });

  readonly isFollowingDisplayedUser = computed(() => {
    const target = this.viewingProfileId();
    return target ? this.followingList().has(target) : false;
  });

  // --- Actions ---

  navigateTo(view: AppView) {
    this.currentView.set(view);
    if (view !== 'PROFILE') {
      this.viewingProfileId.set(null); // Reset profile view when leaving
    }
  }

  openUserProfile(username: string) {
    this.viewingProfileId.set(username);
    this.currentView.set('PROFILE');
  }

  toggleFollowUser(username: string) {
    this.followingList.update(set => {
      const newSet = new Set(set);
      if (newSet.has(username)) {
        newSet.delete(username);
        this.user.update(u => ({ ...u, following: Math.max(0, u.following - 1) }));
      } else {
        newSet.add(username);
        this.user.update(u => ({ ...u, following: u.following + 1 }));
      }
      return newSet;
    });
  }

  // --- Auth Actions ---
  loginAsGuest() {
    this.isAuthenticated.set(false);
    this.isGuest.set(true);
  }

  register(data: { username: string; email: string }) {
    this.user.update(u => ({ 
      ...u, 
      username: data.username, 
      email: data.email,
      handle: `@${data.username.toLowerCase().replace(/\s/g, '')}` 
    }));
    this.isAuthenticated.set(true);
    this.isGuest.set(false);
  }

  login(username: string) {
    this.user.update(u => ({ ...u, username: username, handle: `@${username.toLowerCase().replace(/\s/g, '')}` }));
    this.isAuthenticated.set(true);
    this.isGuest.set(false);
  }

  logout() {
    this.isAuthenticated.set(false);
    this.isGuest.set(false);
    this.likedVideoIds.set(new Set());
    this.savedVideoIds.set(new Set());
    this.followingList.set(new Set());
    this.currentView.set('FEED');
  }

  updateProfile(data: Partial<User>) {
    this.user.update(u => ({ ...u, ...data }));
  }

  // --- Financial Actions ---
  addPaymentMethod(cardNumber: string, expiry: string) {
    const last4 = cardNumber.slice(-4);
    const brand = cardNumber.startsWith('4') ? 'Visa' : 'Mastercard';
    
    this.user.update(u => ({
      ...u,
      paymentMethod: {
        id: Date.now().toString(),
        last4,
        brand,
        expiry
      }
    }));
  }

  removePaymentMethod() {
    this.user.update(u => ({ ...u, paymentMethod: null }));
  }

  withdrawFunds(amount: number): boolean {
    const u = this.user();
    if (!u.paymentMethod) return false;
    if (u.balance < amount) return false;

    this.user.update(prev => ({ ...prev, balance: prev.balance - amount }));
    return true;
  }

  donateToCreator(amount: number, creatorHandle: string): boolean {
    const u = this.user();
    if (u.balance < amount) return false;
    this.user.update(prev => ({ ...prev, balance: prev.balance - amount }));
    return true;
  }

  // --- Content Actions ---
  toggleLike(videoId: string) {
    if (!this.isAuthenticated()) return;
    
    this.likedVideoIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  }

  toggleSave(videoId: string) {
    if (!this.isAuthenticated()) return;

    this.savedVideoIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  }

  upgradePlan(newPlan: PlanType) {
    this.user.update(u => ({ ...u, plan: newPlan }));
  }

  saveDraft(description: string, isPromoted: boolean) {
    const newDraft: Draft = {
      id: Date.now().toString(),
      description,
      isPromoted,
      timestamp: Date.now()
    };
    this.drafts.update(d => [newDraft, ...d]);
  }

  deleteDraft(id: string) {
    this.drafts.update(d => d.filter(draft => draft.id !== id));
  }

  publishDraft(draft: Draft) {
    this.uploadVideo(draft.description, draft.isPromoted);
    this.deleteDraft(draft.id);
  }

  uploadVideo(description: string, isPromoted: boolean) {
    const currentUser = this.user();
    
    // Earnings Logic
    const baseRate = 0.05;
    const followerBonus = Math.floor(currentUser.followers / 100) * 0.01;
    const promoBonus = isPromoted ? 0.05 : 0;
    const earnings = baseRate + followerBonus + promoBonus;

    const demoVideos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4'
    ];
    const randomVideo = demoVideos[Math.floor(Math.random() * demoVideos.length)];

    const newVideo: Video = {
      id: Date.now().toString(),
      videoUrl: randomVideo,
      thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/400/800`,
      description,
      likes: 0,
      comments: 0,
      isPromoted,
      earned: earnings,
      author: currentUser.username,
      authorAvatar: currentUser.avatar
    };

    this.videos.update(v => [newVideo, ...v]);
    
    const gainedFollower = Math.random() > 0.5 ? 1 : 0;

    this.user.update(u => ({
      ...u,
      balance: u.balance + earnings,
      dailyUploads: u.dailyUploads + 1,
      totalUploads: u.totalUploads + 1,
      followers: u.followers + gainedFollower
    }));
  }
}
