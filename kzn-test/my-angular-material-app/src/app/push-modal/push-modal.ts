import { Component, Inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface PushModalData {
  clients: { id: string; name: string }[];
}

@Component({
  selector: 'app-push-modal',
  templateUrl: './push-modal.html'
})
export class PushModalComponent {
  pushForm: FormGroup;
  isScheduled = signal(false);
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PushModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PushModalData
  ) {
    this.pushForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]],
      isScheduled: [false],
      scheduledDate: ['', [Validators.required]]
    });

    this.pushForm.get('isScheduled')?.valueChanges.subscribe(value => {
      this.isScheduled.set(value);
      const scheduledDateControl = this.pushForm.get('scheduledDate');
      if (value) {
        scheduledDateControl?.setValidators([Validators.required]);
      } else {
        scheduledDateControl?.clearValidators();
        scheduledDateControl?.setValue('');
      }
      scheduledDateControl?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.pushForm.invalid) {
      Object.keys(this.pushForm.controls).forEach(key => {
        this.pushForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.pushForm.value;
    const result = {
      clientIds: this.data.clients.map(c => c.id),
      message: formValue.message,
      scheduledDate: formValue.isScheduled ? new Date(formValue.scheduledDate) : undefined
    };

    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}