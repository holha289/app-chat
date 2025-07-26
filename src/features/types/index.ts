export interface StateCore {
  status: 'pending' | 'success' | 'failed' | 'idle';
  error: string | null;
}
