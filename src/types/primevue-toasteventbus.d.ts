declare module 'primevue/toasteventbus' {
  type ToastSeverity = 'success' | 'info' | 'warn' | 'error' | (string & {});

  interface ToastMessage {
    severity?: ToastSeverity;
    summary?: string;
    detail?: string;
    life?: number;
  }

  interface PrimeToastEventBus {
    emit(event: 'add', message: ToastMessage): void;
  }

  const ToastEventBus: PrimeToastEventBus;
  export default ToastEventBus;
}
