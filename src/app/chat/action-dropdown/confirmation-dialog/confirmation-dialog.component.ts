import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.less']
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  flag: string = this.data.flag;
  title: string = this.data.title;
  message: string = this.data.message;
  confirmText: string = this.data.confirmText || 'Ok';
  cancelText: string = this.data.cancelText || 'Cancel';

  onConfirm(): void {
    this.dialogRef.close({ flag: this.flag, data: true });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
