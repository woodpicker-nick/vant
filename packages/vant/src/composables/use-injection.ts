import { getCurrentInstance, inject, InjectionKey } from 'vue';

export function useInjection<T>(key: InjectionKey<T>, defaultValue?: T) {
  const instance = getCurrentInstance() as any;
  return instance?.provides?.[key] ?? inject(key, defaultValue);
}
