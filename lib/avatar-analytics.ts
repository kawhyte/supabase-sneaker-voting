// lib/avatar-analytics.ts

export const AvatarAnalytics = {
  pickerOpened: () => {
    // Track avatar picker opened
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'avatar_picker_opened', {
        event_category: 'engagement',
        event_label: 'profile_page'
      })
    }
    console.log('[Analytics] Avatar picker opened')
  },

  avatarSelected: (avatarId: string, avatarName: string, previousType: string | null) => {
    // Track avatar selected
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'avatar_selected', {
        event_category: 'engagement',
        event_label: avatarName,
        avatar_id: avatarId,
        previous_type: previousType
      })
    }
    console.log('[Analytics] Avatar selected:', { avatarId, avatarName, previousType })
  },

  avatarSaveFailed: (error: string) => {
    // Track avatar save failure
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'avatar_save_failed', {
        event_category: 'error',
        event_label: error
      })
    }
    console.error('[Analytics] Avatar save failed:', error)
  }
}
