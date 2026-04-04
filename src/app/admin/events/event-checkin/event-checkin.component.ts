import { ActivatedRoute } from "@angular/router";
import { EventModel } from "../../core/models/event";
import { Registration } from "../../core/models/registration";
import { EventService } from "../event.service";
import { AfterViewInit, Component, Injectable, NgZone, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ToastrService } from "ngx-toastr";
import { SignalrService } from "../../core/signalr.service";
import { BrowserMultiFormatReader } from "@zxing/browser";

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
  
  nomeEvento = '';
  
  participantes: any[] = [];
  pendentes: any[] = [];
  realizados: any[] = [];
  realizado: number = 0;
  pendente: number = 0;
  reader = new BrowserMultiFormatReader();
  cameraAtiva: boolean = false;
  successSound = new Audio('assets/sounds/success.mp3');
  errorSound = new Audio('assets/sounds/error.mp3');
  scannerAtivo: boolean = true;
  
  constructor(private route: ActivatedRoute, 
    private service: EventService, 
    private toastr: ToastrService,
    private signalr: SignalrService,
    private zone: NgZone) {}
    
    ngOnInit() {
      const id = this.route.snapshot.params['id'];
      
      this.service.getEventById(id).subscribe((e: any) => {
        this.evento = e
        this.nomeEvento = e.nome;
      });
      
      this.service.getRegistrations(id).subscribe(list => {
        this.participantes = list;
        this.pendente = this.participantes.filter(x => !x.checkIn ).length;
        this.realizado = this.participantes.filter(x => x.checkIn ).length;
        
      });
      
      // inicia websocket
      this.signalr.startConnection();
      
      // escuta checkin em tempo real
      this.signalr.onCheckinRealizado((codigoInscricao: string) => {
        
        this.zone.run(() => {
          
          const participante = this.participantes.find(
            x => x.codigoInscricao === codigoInscricao
          );
          
          if (participante && !participante.checkIn) {
            participante.checkIn = true;
            
            
          }
          
        });
        
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
    
    lerQrCode(){
      this.cameraAtiva = true;
      
      this.reader.decodeFromVideoDevice('', 'video', (result, err) => {
        
        if (!this.scannerAtivo) return;
        
        if (result) {
          
          this.scannerAtivo = false;
          
          console.log(result.getText());
          
          this.enviarCheckin(result.getText());
          
          setTimeout(()=>{
            this.scannerAtivo = true;
          },3000);
          
        }
      });
    }
    
    fazerCheckin(inscricao: any) {
      this.service.fazerCheckin(inscricao.codigoInscricao).subscribe({
        next: () => {
          // remove da lista de pendentes
          
          this.pendentes = this.pendentes.filter(x => x.id !== inscricao.id);

          this.pendente--;
          this.realizado++;
          
          // marca e adiciona nos realizados
          inscricao.checkIn = true;
          this.toastr.success("CheckIn realizado com sucesso!")
        },
        error: () => {
          alert('Check-in já realizado ou erro no servidor');
        }
      });
    }
    
    enviarCheckin(qrCode: string){
      
      if (!qrCode.match('checkin')){
        this.toastr.error('QR Code não é válido');
        this.errorSound.play();
        return;
      }
      
      const codigo = this.extrairCodigo(qrCode);
      
      if (!codigo){
        this.toastr.error('QR Code inválido');
        this.errorSound.play();
        return;
      }
      
      // 🔎 verifica se pertence ao evento
      const participante = this.participantes.find(
        x => x.codigoInscricao === codigo
      );
      
      if (!participante){
        this.toastr.error('Este QR Code não pertence a este evento');
        this.errorSound.play();
        return;
      }
      
      // 🔒 evita checkin duplicado
      if (participante.checkIn){
        this.toastr.warning('Participante já realizou check-in');
        this.errorSound.play();
        return;
      }
      
      // chama backend
      this.service.enviarCheckin(qrCode).subscribe({
        
        next: () => {
          
          participante.checkIn = true;

          this.pendente--;
          this.realizado++;
          
          this.toastr.success("CheckIn realizado com sucesso!");
          this.successSound.play();
        },
        
        error: (e) => {
          
          if (e?.error?.code === '400'){
            this.toastr.error(e?.error?.message);
          }
          else if (e?.error?.code === '500'){
            this.toastr.error('Check-in já realizado ou erro no servidor');
          }
          
          this.errorSound.play();
        }
      });
    }
    
    extrairCodigo(url: string): string | null {
      
      const match = url.match(/eventos\/(.*?)\/checkin/);
      
      return match ? match[1] : null;
      
    }
  }
  