export class FirestorePermissionError extends Error {
  public operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  public path: string;
  public resource?: Record<string, any>;

  constructor({
    operation,
    path,
    resource,
  }: {
    operation: 'get' | 'list' | 'create' | 'update' | 'delete';
    path: string;
    resource?: Record<string, any>;
  }) {
    const message = `Operation: ${operation}, Path: ${path}, Resource: ${JSON.stringify(
      resource
    )}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.operation = operation;
    this.path = path;
    this.resource = resource;
  }
}
