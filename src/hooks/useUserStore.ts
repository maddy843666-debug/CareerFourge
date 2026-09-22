import { useSyncExternalStore } from 'react';
import { userStore, UserStoreData } from '../services/userStore';

export function useUserStore(): UserStoreData {
  return useSyncExternalStore(
    (callback) => userStore.subscribe(callback),
    () => userStore.getSnapshot()
  );
}
