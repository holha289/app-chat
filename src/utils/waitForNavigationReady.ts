import { navigationRef } from '@app/navigation/RootNavigation';

export const waitForNavigationReady = async (timeout = 5000) => {
  const started = Date.now();
  while (!navigationRef.isReady()) {
    await new Promise(res => setTimeout(res, 100));
    if (Date.now() - started > timeout) break;
  }
};