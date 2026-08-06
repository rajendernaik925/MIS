import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  private http: HttpClient = inject(HttpClient);
  openAIApi(formData: FormData): Observable<any> {
    return this.http.post(
      'https://sso.heterohcl.com/DataCaptureAPI/api/openai/chat-image-upload',
      formData
    );  
  }
  analyzeDocument(file: File, description: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('query', description);
    return this.openAIApi(formData);
  }

  textInformation(formData: FormData): Observable<any> {
    return this.openAIApi(formData);
  }
}