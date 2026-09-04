import type { InjectionKey, Ref } from 'vue'

export type PublicServicePanel = 'ai' | 'quick-service' | 'human'

export interface PublicServicePanelContext {
  activePanel: Ref<PublicServicePanel | null>
  openServicePanel: (panel: PublicServicePanel) => void
}

export const publicServicePanelKey: InjectionKey<PublicServicePanelContext> = Symbol('public-service-panel')
