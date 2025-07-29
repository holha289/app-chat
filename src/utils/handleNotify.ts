import { navigate } from '@app/navigation/RootNavigation';

type RawParams = string | object | null | undefined;

interface NavigatePayload {
  screen?: string;
  subScreen?: string;
  params?: RawParams;
}

export function handleNavigateFromNotification(payload: NavigatePayload) {
  try {
    const { screen, subScreen, params: rawParams } = payload;
    let params;

    if (typeof rawParams === 'string') {
      params = JSON.parse(rawParams);
    } else if (typeof rawParams === 'object' && rawParams !== null) {
      params = rawParams;
    } else {
      params = undefined;
    }

    if (typeof screen === 'string' && typeof subScreen === 'string') {
      // Navigate nested screen: screen -> subScreen with params
      navigate(screen, {
        screen: subScreen,
        params: params,
      });
    } else if (typeof screen === 'string') {
      // Navigate single screen with params
      navigate(screen, params);
    } else {
      console.warn('❌ Invalid screen type:', screen);
    }
  } catch (err) {
    console.error('❌ JSON parse failed:', err);
  }
}
