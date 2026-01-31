import { ActivatedRoute } from "@angular/router";
import { EventModel } from "../../core/models/event";
import { Registration } from "../../core/models/registration";
import { EventService } from "../event.service";
import { Component, Injectable, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ToastrService } from "ngx-toastr";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-evento-checkin',
  templateUrl: './event-checkin.component.html',
  styleUrls: ['./event-checkin.component.scss']
  
})
export class EventCheckinComponent implements OnInit {
  inscricoes: Registration[] = [];
  filtrados: Registration[] = [];
  filtro = '';
  evento: any | undefined;
  abaAtiva: 'pendentes' | 'realizados' = 'pendentes';
  
  nomeEvento = 'RCC Londrisfdlfnosdnfosna';
  
  participantes: any[] = [];
  pendentes: any[] = [];
  realizados: any[] = [];
  
  
  constructor(private route: ActivatedRoute, private service: EventService, private toastr: ToastrService) {}
  
  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    
    this.service.getEventById(id).subscribe((e: any) => {
      this.evento = e
      this.nomeEvento = e.nome;
    });
    
    this.service.getRegistrations(id).subscribe(list => {
      this.participantes = list;
    });
  }
  
  get participantesFiltrados(): any[] {
    return this.participantes
    .filter(p =>
      this.abaAtiva === 'pendentes'
      ? !p.checkIn
      : p.checkIn
    )
    .filter(p =>
      p.nome.toLowerCase().includes(this.filtro.toLowerCase()) ||
      p.email.toLowerCase().includes(this.filtro.toLowerCase()) ||
      p.codigoInscricao.includes(this.filtro) ||
      p.cpf.includes(this.filtro)
    );
  }
  
  get percentualCheckin(): number {
    if (!this.participantes.length) return 0;
    
    const feitos = this.participantes.filter(p => p.checkedIn).length;
    return Math.round((feitos / this.participantes.length) * 100);
  }
  
  fazerCheckin(inscricao: any) {
    this.service.fazerCheckin(inscricao.codigoInscricao).subscribe({
      next: () => {
        // remove da lista de pendentes
        
        this.pendentes = this.pendentes.filter(x => x.id !== inscricao.id);
        
        // marca e adiciona nos realizados
        inscricao.checkIn = true;
        this.toastr.success("CheckIn realizado com sucesso!")
      },
      error: () => {
        alert('Check-in já realizado ou erro no servidor');
      }
    });
  }
}
