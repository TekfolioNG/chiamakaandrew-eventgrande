<script setup lang="ts">
const w = useWedding()
const { stage } = useStage()
const { progress, run } = usePreloader()
const gateExiting = ref(false)

onMounted(async () => {
    // coming back from the thank-you page: the invitation is already open
    if (stage.value === 'invite') return

    document.documentElement.style.overflow = 'hidden'
    await run({ minMs: w.loader.minMs, maxMs: w.loader.maxMs, assets: w.loader.preload })
    stage.value = 'gate'
})

// release the scroll lock only once the invite itself is open
watch(stage, (s: string) => {
    document.documentElement.style.overflow = s === 'invite' ? '' : 'hidden'
})

// The page mounts underneath while the gate is still fading out
const onOpen = () => {
    gateExiting.value = true
    stage.value = 'invite'
}
</script>

<template>
    <div>
        <Transition name="loader">
            <WeddingLoader v-if="stage === 'loading'" :progress="progress" />
        </Transition>

        <GateScreen v-if="stage === 'gate' || gateExiting" @open="onOpen" @done="gateExiting = false" />

        <template v-if="stage === 'invite'">
            <main>
                <SectionHero />
                <SectionDate />
                <SectionMoments />
                <SectionDetails />
                <SectionColors />
                <SectionOrder />
                <SectionRsvp />
            </main>
            <MusicToggle />
        </template>
    </div>
</template>

<style>
.loader-leave-active {
    transition: opacity 900ms var(--ease-soft), transform 900ms var(--ease-soft);
}

.loader-leave-to {
    opacity: 0;
    transform: scale(1.02);
}
</style>