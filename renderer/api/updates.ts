import { ApiResponse } from './common';

export interface UpdateApi {
  onUpdateAvailable: (callback: () => void) => void;
  removeUpdateListener: (callback: () => void) => void;
  restart: () => Promise<ApiResponse<void>>;
}
