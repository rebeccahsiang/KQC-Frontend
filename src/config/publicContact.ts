const consultationPhone = import.meta.env.VITE_PUBLIC_CONSULTATION_PHONE?.trim() || ''

export const publicContact = Object.freeze({
  consultationPhone,
  consultationPhoneHref: consultationPhone ? `tel:${consultationPhone}` : '',
})
