import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private dialogSubject = new BehaviorSubject<{ visible: boolean; title?: string; message?: string; confirmText?: string; cancelText?: string }>({
    visible: false
  });

  private resultSubject = new BehaviorSubject<boolean | null>(null);

  public dialog$ = this.dialogSubject.asObservable();

  confirm(title: string, message: string, confirmText = 'Confirm', cancelText = 'Cancel'): Observable<boolean> {
    return new Observable(observer => {
      this.dialogSubject.next({
        visible: true,
        title,
        message,
        confirmText,
        cancelText
      });

      const resultSub = this.resultSubject.subscribe(result => {
        if (result !== null) {
          this.hide();
          observer.next(result);
          observer.complete();
          this.resultSubject.next(null); // Reset
          resultSub.unsubscribe();
        }
      });

      return () => {
        resultSub.unsubscribe();
      };
    });
  }

  emitResult(result: boolean) {
    this.resultSubject.next(result);
  }

  hide() {
    this.dialogSubject.next({ visible: false });
  }
}