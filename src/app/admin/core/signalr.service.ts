import * as signalR from '@microsoft/signalr';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SignalrService {
    
    private hubConnection!: signalR.HubConnection;
    private baseUrl = 'https://backend.rcc-londrina.online';
    // private baseUrl = 'http://localhost:5290';
    // private baseUrl = 'http://192.168.15.5:5100';
    // 🔥 evento global
    private checkinRecebidoSource = new Subject<string>();
    checkinRecebido$ = this.checkinRecebidoSource.asObservable();
    
    startConnection() {
        
        this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.baseUrl + "/hub/checkin", {
            withCredentials: true
        })
        .withAutomaticReconnect()
        .build();
        
        this.hubConnection
        .start()
        .then(() => console.log('SignalR conectado'))
        .catch(err => console.log('Erro SignalR: ', err));
    }
    
    onCheckinRealizado(callback: (inscricaoId: string) => void) {
        this.hubConnection.on('checkin-realizado', callback);
    }
    
}
