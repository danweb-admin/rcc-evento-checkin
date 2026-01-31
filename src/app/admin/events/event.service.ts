import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { EventModel } from '../core/models/event';

@Injectable({ providedIn: 'root' })
export class EventService {
    
    private apiUrl = 'https://backend.rcc-londrina.online/api/v1';
    // private apiUrl = 'http://localhost:5290/api/v1';
    
    constructor(private http: HttpClient) {}
    
    getMyEvents(email: string) {
        return this.http.get<EventModel[]>(`${this.apiUrl}/eventos/get-events-by-email?email=${email}`);
    }
    
    getRegistrations(eventId: string) {
        return this.http.get<any[]>(`${this.apiUrl}/eventos/${eventId}/inscricoes`);
    }

    getEventById(eventId: string) {
        return this.http.get<any[]>(`${this.apiUrl}/eventos/${eventId}`);
    }
    
    fazerCheckin(codigoInscricao: string) {
        return this.http.get(`${this.apiUrl}/eventos/${codigoInscricao}/checkin`);
    }
}
