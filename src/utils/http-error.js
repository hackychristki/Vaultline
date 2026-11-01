export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);          // der Text
    this.name = 'HttpError';
    this.status = status;    // die Zahl
    this.details = details;
  }
}