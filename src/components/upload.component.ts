
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';
import { GoogleGenAI } from "@google/genai";

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html',
  changeDetection: 1
})
export class UploadComponent {
  store = inject(StoreService);
  
  description = signal('');
  isPromoted = signal(false);
  isGenerating = signal(false);
  feedbackMessage = signal('');
  
  // Video Selection State
  selectedFileName = signal('');
  isUploading = signal(false);
  uploadProgress = signal(0);
  fileSelected = signal(false);

  // Simulation of file selection
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName.set(file.name);
      this.fileSelected.set(true);
    }
  }

  async generateCaption() {
    this.isGenerating.set(true);
    try {
      const apiKey = process.env['API_KEY'];
      if (!apiKey) {
         this.description.set("¡Video exclusivo para ustedes! 🎥 #viral #zenix");
         return;
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Write a short, viral, catchy social media caption in Spanish for a video. Include 2 hashtags. Max 20 words.',
      });
      
      if (response.text) {
        this.description.set(response.text.trim());
      }
    } catch (e) {
      console.error(e);
      this.description.set("¡Nuevo contenido subido! 🔥 #parati");
    } finally {
      this.isGenerating.set(false);
    }
  }

  saveDraft() {
    if (!this.description()) {
      this.feedbackMessage.set("Añade descripción para guardar.");
      setTimeout(() => this.feedbackMessage.set(''), 3000);
      return;
    }
    this.store.saveDraft(this.description(), this.isPromoted());
    this.resetForm();
    this.feedbackMessage.set("Guardado en borradores.");
    setTimeout(() => this.feedbackMessage.set(''), 3000);
  }

  submitUpload() {
    if (!this.store.canUpload()) {
      this.feedbackMessage.set("Has alcanzado tu límite diario. ¡Mejora tu plan!");
      setTimeout(() => this.feedbackMessage.set(''), 3000);
      return;
    }

    if (!this.fileSelected() && !this.description()) {
       this.feedbackMessage.set("Selecciona un video y añade descripción.");
       return;
    }
    
    // Simulate Upload Process
    this.isUploading.set(true);
    this.uploadProgress.set(0);
    
    const interval = setInterval(() => {
      this.uploadProgress.update(p => p + 10);
      if (this.uploadProgress() >= 100) {
        clearInterval(interval);
        this.finalizeUpload();
      }
    }, 200);
  }

  finalizeUpload() {
    this.store.uploadVideo(this.description(), this.isPromoted());
    this.feedbackMessage.set("¡Video subido y monetizado exitosamente!");
    this.resetForm();
    this.isUploading.set(false);
    
    setTimeout(() => this.feedbackMessage.set(''), 3000);
  }

  resetForm() {
    this.description.set('');
    this.isPromoted.set(false);
    this.selectedFileName.set('');
    this.fileSelected.set(false);
    this.uploadProgress.set(0);
  }
}
