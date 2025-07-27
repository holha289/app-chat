export interface StateCore {
  status: 'pending' | 'success' | 'failed' | 'idle';
  message: string | null;
  error: string | null;
}
