import { Injectable, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { PushModalComponent } from '../push-modal/push-modal.component';

export interface PushData {
  clientIds: string[];
  message: string;
  scheduledDate?: Date;
}

@Injectable({
  providedIn: 'root'
})

export class PushService {
  private isLoadingSignal = signal(false);

  constructor(private dialog: MatDialog) { }

  openPushModal(clients: { id: string; name: string }[]): Observable<any> {
    const dialogRef = this.dialog.open(PushModalComponent, {
      width: '655px',
      height: '800px',
      data: { clients },
      disableClose: true,
      panelClass: 'push-modal-panel'
    });

    return dialogRef.afterClosed();
  }

  setLoading(loading: boolean): void {
    this.isLoadingSignal.set(loading);
  }

  isLoading(): boolean {
    return this.isLoadingSignal();
  }

}