import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { EventService } from "../event.service";

@Component({
  selector: 'app-evento-list',
  templateUrl: './event-list.component.html',
  //   styleUrls: ['./evento-checkin.component.scss']
  
})
export class EventListComponent implements OnInit {
  eventos: any[] = [];
  carregando: boolean = false;
  email: string = localStorage.getItem('email') || '';
  
  constructor(private service: EventService, private router: Router) {}
  
  ngOnInit() {
    this.service.getMyEvents(this.email).subscribe(res => {
      this.eventos = res
    });
  }
  
  abrir(evento: any) {
    this.router.navigate(['/eventos', evento.id, 'checkin']);
  }
  
  abrirCheckin(eventoId: string) {
    // Exemplo com rota
    this.router.navigate(['/eventos/checkin', eventoId]);
  }
}
