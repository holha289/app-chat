export interface StateCore {
  status: 'pending' | 'success' | 'failed';
  error: string | null;
}
