import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

export interface PushData {
  user_id?: string;
  date_start?: string;
  push_message?: string
}

@Component({
  selector: 'app-push-modal',
  templateUrl: './push-modal.component.html',
  styleUrl: './push-modal.component.scss',
  imports: [
    ReactiveFormsModule,
    MatCheckboxModule,
    CommonModule,
    MatFormFieldModule,
    MatOptionModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule],
})

export class PushModalComponent {
  pushForm: FormGroup;
  minDate: Date = new Date();
  isSending = false;
  private isSubmitting = false;
  previewMessage = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PushModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clients: { id: string; name: string }[] },
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.pushForm = this.fb.group({
      message: ['', Validators.required],
      scheduledDate: ['']
    });
  }

  updatePreview(): void {
    this.previewMessage = this.pushForm.get('message')?.value || '';
  }

  getTodayDate(): Date {
    const now = new Date();
    now.setSeconds(0, 0);
    return now;
  }

  getTodayTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  getDateInHours(hours: number): Date {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    date.setSeconds(0, 0);
    return date;
  }

  onSubmit(): void {
    if (this.isSubmitting || this.pushForm.invalid) {
      if (this.pushForm.invalid) {
        this.pushForm.get('message')?.markAsTouched();
      }
      return;
    }

    this.isSubmitting = true;
    this.isSending = true;
    this.cdr.detectChanges();

    const formValue = this.pushForm.value;
    const clientIds = this.data.clients.map(c => c.id);

    this.sendPushToClients(clientIds, formValue.message, formValue.scheduledDate);
  }

  private sendPushToClients(clientIds: string[], message: string, scheduledDate: Date | null): void {
    let successCount = 0;
    let errorCount = 0;
    const total = clientIds.length;

    if (total === 0) {
      this.snackBar.open('Нет клиентов для отправки', 'Закрыть', {
        duration: 7000,
        panelClass: ['error-snackbar']
      });
      this.isSending = false;
      this.isSubmitting = false;
      this.cdr.detectChanges();
      this.dialogRef.close(null);
      return;
    }

    clientIds.forEach((userId) => {
      const pushData: PushData = {
        user_id: userId,
        push_message: message
      };

      if (scheduledDate) {
        pushData.date_start = new Date(scheduledDate).toISOString();
      }

      this.apiService.sendPush(pushData).subscribe({
        next: (res) => {
          console.log('Ответ', res);

          successCount++;
          this.checkCompletion(successCount, errorCount, total, scheduledDate);
        },
        error: (error) => {
          errorCount++;
          console.error(`Error sending push to ${userId}:`, error);
          this.checkCompletion(successCount, errorCount, total, scheduledDate);
        }
      });
    });
  }

  private checkCompletion(successCount: number, errorCount: number, total: number, scheduledDate: Date | null): void {
    if (successCount + errorCount === total) {
      setTimeout(() => {
        this.isSending = false;
        this.isSubmitting = false;
        this.cdr.detectChanges();

        if (successCount === total) {
          this.snackBar.open(
            scheduledDate
              ? `PUSH-рассылка запланирована на ${new Date(scheduledDate).toLocaleString()} для ${total} пользователей`
              : `PUSH-рассылка отправлена ${total} пользователям`,
            'Закрыть',
            {
              duration: 7000,
              panelClass: ['success-snackbar']
            }
          );
          this.dialogRef.close({ success: true });
        } else {
          this.snackBar.open(
            `Отправлено: ${successCount}/${total}. Ошибок: ${errorCount}`,
            'Закрыть',
            {
              duration: 7000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    }
  }

  onCancel(): void {
    if (!this.isSending) {
      this.dialogRef.close(null);
    }
  }

}