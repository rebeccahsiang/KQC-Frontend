import { readonly, ref } from 'vue'

const isFaqOpen = ref(false)

const openFaq = () => { isFaqOpen.value = true }
const closeFaq = () => { isFaqOpen.value = false }

export const usePublicFaq = () => ({
  isFaqOpen: readonly(isFaqOpen),
  openFaq,
  closeFaq,
})
