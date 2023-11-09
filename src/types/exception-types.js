export class UpdateStopPlatformError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UpdateStopPlatformError';
    }
}
