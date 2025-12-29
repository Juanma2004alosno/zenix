
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';

type AuthMode = 'MENU' | 'LOGIN' | 'REGISTER_1' | 'REGISTER_2';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full w-full bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute top-0 left-0 w-80 h-80 bg-purple-600 rounded-full blur-[120px] opacity-20 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
      <div class="absolute bottom-0 right-0 w-80 h-80 bg-cyan-600 rounded-full blur-[120px] opacity-20 translate-x-1/2 translate-y-1/2 animate-pulse-slow" style="animation-delay: 2s;"></div>

      <div class="z-10 w-full max-w-sm flex flex-col items-center gap-6">
        
        <!-- Logo/Brand -->
        <div class="text-center mb-4 transition-all duration-500" [class.scale-75]="mode() !== 'MENU'">
           <div class="w-20 h-20 bg-gradient-to-tr from-cyan-400 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/20 rotate-3 hover:rotate-6 transition duration-300">
             <span class="material-icons-round text-5xl text-white">play_arrow</span>
           </div>
           <h1 class="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">Zenix</h1>
           @if (mode() === 'MENU') {
              <p class="text-gray-400 text-sm mt-2 font-medium">Monetiza tu creatividad desde el primer video.</p>
           }
        </div>

        <!-- MENU -->
        @if (mode() === 'MENU') {
          <div class="w-full flex flex-col gap-3 animate-fade-in-up">
            <button (click)="mode.set('LOGIN')" 
                    class="w-full bg-white/10 backdrop-blur-md border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/20 transition active:scale-95 shadow-lg">
              Iniciar Sesión
            </button>

            <button (click)="mode.set('REGISTER_1')" 
                    class="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold py-4 rounded-2xl hover:shadow-cyan-500/20 shadow-lg transition active:scale-95 relative overflow-hidden group">
              <span class="relative z-10">Crear Cuenta Gratis</span>
              <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition duration-300"></div>
            </button>

            <div class="relative py-4">
              <div class="absolute inset-0 flex items-center"><span class="w-full border-t border-gray-800"></span></div>
              <div class="relative flex justify-center text-xs uppercase tracking-widest"><span class="bg-black px-2 text-gray-500">O explorar</span></div>
            </div>

            <button (click)="store.loginAsGuest()" 
                    class="w-full bg-gray-900 border border-gray-800 text-gray-400 font-medium py-3 rounded-2xl hover:bg-gray-800 transition flex items-center justify-center gap-2">
              <span class="material-icons-round text-sm">visibility</span>
              Modo Invitado
            </button>
          </div>
        }

        <!-- LOGIN -->
        @if (mode() === 'LOGIN') {
          <div class="w-full flex flex-col gap-4 animate-fade-in-up">
             <div class="bg-gray-900/50 border border-gray-800 rounded-2xl p-1 focus-within:border-cyan-500 focus-within:bg-gray-900 transition duration-300">
               <input type="text" [ngModel]="username()" (ngModelChange)="username.set($event)" placeholder="Nombre de usuario" 
                      class="w-full bg-transparent text-white px-4 py-3 outline-none placeholder-gray-500">
             </div>
             
             <div class="bg-gray-900/50 border border-gray-800 rounded-2xl p-1 focus-within:border-cyan-500 focus-within:bg-gray-900 transition duration-300">
               <input type="password" placeholder="Contraseña" 
                      class="w-full bg-transparent text-white px-4 py-3 outline-none placeholder-gray-500">
             </div>

             <button (click)="handleLogin()" 
                     class="w-full bg-white text-black font-bold py-4 rounded-2xl mt-2 hover:bg-gray-200 transition shadow-xl">
               Entrar
             </button>
             
             <button (click)="mode.set('MENU')" class="text-gray-500 text-sm hover:text-white transition mt-2">Cancelar</button>
          </div>
        }

        <!-- REGISTER STEP 1 -->
        @if (mode() === 'REGISTER_1') {
           <div class="w-full flex flex-col gap-4 animate-fade-in-up">
              <h2 class="text-white font-bold text-lg text-center">Tus Datos</h2>
              
              <div class="space-y-3">
                 <input type="email" [ngModel]="regEmail()" (ngModelChange)="regEmail.set($event)" placeholder="Correo electrónico" 
                        class="w-full bg-gray-900/50 border border-gray-800 text-white px-4 py-3 rounded-2xl focus:border-purple-500 focus:outline-none transition">
                 
                 <div class="flex gap-2">
                    <input type="text" placeholder="DD" class="w-1/3 bg-gray-900/50 border border-gray-800 text-white px-4 py-3 rounded-2xl text-center focus:border-purple-500 outline-none">
                    <input type="text" placeholder="MM" class="w-1/3 bg-gray-900/50 border border-gray-800 text-white px-4 py-3 rounded-2xl text-center focus:border-purple-500 outline-none">
                    <input type="text" placeholder="AAAA" class="w-1/3 bg-gray-900/50 border border-gray-800 text-white px-4 py-3 rounded-2xl text-center focus:border-purple-500 outline-none">
                 </div>
                 <p class="text-[10px] text-gray-500 px-2">Fecha de nacimiento para verificar edad.</p>
              </div>

              <button (click)="mode.set('REGISTER_2')" 
                      [disabled]="!regEmail()"
                      class="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl mt-2 hover:bg-purple-500 transition shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed">
                Siguiente
              </button>
              <button (click)="mode.set('MENU')" class="text-gray-500 text-sm hover:text-white transition text-center">Cancelar</button>
           </div>
        }

        <!-- REGISTER STEP 2 -->
        @if (mode() === 'REGISTER_2') {
           <div class="w-full flex flex-col gap-4 animate-fade-in-up">
              <h2 class="text-white font-bold text-lg text-center">Crea tu Identidad</h2>
              
              <div class="space-y-3">
                 <!-- Username -->
                 <input type="text" [ngModel]="username()" (ngModelChange)="username.set($event)" placeholder="Nombre de usuario único" 
                        class="w-full bg-gray-900/50 border border-gray-800 text-white px-4 py-3 rounded-2xl focus:border-purple-500 focus:outline-none transition">
                 
                 <!-- Password Field -->
                 <div class="relative">
                   <input [type]="showPassword() ? 'text' : 'password'" 
                          [ngModel]="password()" (ngModelChange)="password.set($event)"
                          placeholder="Crear contraseña" 
                          class="w-full bg-gray-900/50 border border-gray-800 text-white px-4 py-3 rounded-2xl focus:border-purple-500 focus:outline-none transition pr-10">
                   <button (click)="showPassword.set(!showPassword())" tabindex="-1" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition focus:outline-none" title="Mostrar/Ocultar contraseña">
                      <span class="material-icons-round text-xl">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                   </button>
                 </div>

                 <!-- Confirm Password Field -->
                 <div class="relative">
                   <input [type]="showPassword() ? 'text' : 'password'" 
                          [ngModel]="confirmPassword()" (ngModelChange)="confirmPassword.set($event)"
                          placeholder="Repetir contraseña" 
                          class="w-full bg-gray-900/50 border border-gray-800 text-white px-4 py-3 rounded-2xl focus:border-purple-500 focus:outline-none transition pr-10"
                          [class.border-red-500]="passwordsDoNotMatch()">
                 </div>

                 @if (passwordsDoNotMatch()) {
                    <div class="flex items-center gap-1 text-red-500 px-2 animate-pulse">
                      <span class="material-icons-round text-sm">error_outline</span>
                      <p class="text-xs font-bold">Las contraseñas no coinciden</p>
                    </div>
                 }
              </div>

              <button (click)="handleRegister()" 
                      [disabled]="!isValidRegistration()"
                      class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-2xl mt-2 hover:shadow-pink-500/30 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                ¡Empezar a Ganar!
              </button>
              <button (click)="mode.set('REGISTER_1')" class="text-gray-500 text-sm hover:text-white transition text-center">Atrás</button>
           </div>
        }

      </div>
      
      <div class="absolute bottom-6 text-gray-600 text-[10px] text-center max-w-xs leading-tight">
        Al continuar, aceptas nuestros Términos de Servicio y confirmas que tienes más de 18 años para monetizar.
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-slow {
      0%, 100% { opacity: 0.2; transform: scale(1) translate(-50%, -50%); }
      50% { opacity: 0.3; transform: scale(1.1) translate(-50%, -50%); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .animate-pulse-slow {
      animation: pulse-slow 8s infinite ease-in-out;
    }
  `]
})
export class AuthComponent {
  store = inject(StoreService);
  mode = signal<AuthMode>('MENU');
  
  // Registration Signals
  username = signal('');
  regEmail = signal('');
  password = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);

  passwordsDoNotMatch() {
    return this.password() && this.confirmPassword() && this.password() !== this.confirmPassword();
  }

  isValidRegistration() {
    return this.username() && 
           this.password() && 
           this.confirmPassword() && 
           this.password() === this.confirmPassword();
  }

  handleLogin() {
    if (this.username()) {
      this.store.login(this.username());
    } else {
      this.store.login('Usuario Demo');
    }
  }

  handleRegister() {
    if (this.isValidRegistration()) {
      this.store.register({ 
        username: this.username(), 
        email: this.regEmail() 
      });
    }
  }
}
