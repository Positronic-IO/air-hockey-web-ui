import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public static get apiUrl(): string { 
    return `${document.location.protocol}//${document.location.hostname}:8888`;
  }
  
  constructor() {  }
}
