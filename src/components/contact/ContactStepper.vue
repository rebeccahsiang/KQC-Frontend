<script setup lang="ts">
defineProps<{ currentStep: number; complete: boolean }>()
const steps = ['我想諮詢什麼', '關於您', '告訴我們您的需求']
</script>

<template>
  <!-- CONTACT-R1A — Contact Stepper / text and numbering communicate progress without color-only state. -->
  <ol class="contact-stepper" aria-label="諮詢填寫進度">
    <li v-for="(label, index) in steps" :key="label" :class="{ active: !complete && currentStep === index + 1, done: complete || currentStep > index + 1 }" :aria-current="!complete && currentStep === index + 1 ? 'step' : undefined"><span>{{ index + 1 }}</span><strong>{{ label }}</strong></li>
    <li :class="{ active: complete }" :aria-current="complete ? 'step' : undefined"><span>4</span><strong>送出完成</strong></li>
  </ol>
</template>

<style scoped lang="scss">
.contact-stepper{display:grid;margin:0;padding:0;grid-template-columns:repeat(4,minmax(0,1fr));list-style:none}.contact-stepper li{position:relative;display:grid;justify-items:center;gap:.45rem;color:#69798b;font-size:.94rem;line-height:1.35;text-align:center}.contact-stepper li:not(:last-child)::after{position:absolute;top:1.1rem;left:calc(50% + 1.35rem);width:calc(100% - 2.7rem);height:2px;background:#dbe4e9;content:''}.contact-stepper span{z-index:1;display:grid;width:2.2rem;height:2.2rem;place-items:center;border:2px solid #cbd6dd;border-radius:50%;background:#fff;font-size:.9rem;font-weight:850}.contact-stepper .active,.contact-stepper .done{color:#174f63}.contact-stepper .active span,.contact-stepper .done span{border-color:#247188;color:#fff;background:#247188}.contact-stepper .done:not(:last-child)::after{background:#76aebb}@media(max-width:560px){.contact-stepper li{font-size:.82rem}.contact-stepper strong{max-width:5.5rem}.contact-stepper li:not(:last-child)::after{left:calc(50% + 1.1rem);width:calc(100% - 2.2rem)}}
</style>
