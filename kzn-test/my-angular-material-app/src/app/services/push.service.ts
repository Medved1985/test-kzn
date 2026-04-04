import { Injectable, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { PushModalComponent } from '../push-modal/push-modal';

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

  openPushModal(clients: { id: string; name: string }[]): Observable<PushData | null> {
    const dialogRef = this.dialog.open(PushModalComponent, {
      width: '500px',
      data: { clients },
      disableClose: true
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