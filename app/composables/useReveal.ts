import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Ref } from 'vue'

export const useReveal = (root: Ref<HTMLElement | undefined>) => {
    let mm: gsap.MatchMedia | undefined

    onMounted(() => {
        gsap.registerPlugin(ScrollTrigger)
        mm = gsap.matchMedia()
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            root.value?.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 24 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        ease: 'power2.out',
                        delay: Number(el.dataset.reveal) || 0,
                        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
                    },
                )
            })
        })
    })

    onBeforeUnmount(() => mm?.revert())
}