const DEFAULT_PUBLIC_CONSULTATION_PHONE = '0908939319'
const consultationPhone = import.meta.env.VITE_PUBLIC_CONSULTATION_PHONE?.trim() || DEFAULT_PUBLIC_CONSULTATION_PHONE

export const publicContact = Object.freeze({
  consultationPhone,
  consultationPhoneHref: consultationPhone ? `tel:${consultationPhone}` : '',
})
