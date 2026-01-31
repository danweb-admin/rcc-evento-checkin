import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { EventListComponent } from './admin/events/event-list/event-list.component';
import { EventCheckinComponent } from './admin/events/event-checkin/event-checkin.component';
import { LoginComponent } from './admin/auth/login/login.component';
import { AuthGuard } from './admin/core/guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'eventos',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: EventListComponent },
      { path: ':id/checkin', component: EventCheckinComponent },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
