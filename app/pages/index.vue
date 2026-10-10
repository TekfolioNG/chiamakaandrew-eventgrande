<script setup lang="ts">
const w = useWedding()
const { stage } = useStage()
const { progress, run } = usePreloader()

onMounted(async () => {
    document.documentElement.style.overflow = 'hidden'
    await run({ minMs: w.loader.minMs, maxMs: w.loader.maxMs, assets: w.loader.preload })
    stage.value = 'gate'
})

// release the scroll lock only once the invite itself is open
watch(stage, (s) => {
    document.documentElement.style.overflow = s === 'invite' ? '' : 'hidden'
})
</script>

<template>
    <div>
        <Transition name="loader">
            <WeddingLoader v-if="stage === 'loading'" :progress="progress" />
        </Transition>

        <GateScreen v-if="stage === 'gate'" @open="stage = 'invite'" />

        <!-- Temporary invite page, replaced when we build the main page -->
        <main v-else-if="stage === 'invite'" class="min-h-svh grid place-items-center text-center px-6">
            <div>
                <p class="families-line">Cordially invite you</p>
                <h1 class="couple-names">{{ w.couple.partnerA.first }} &amp; {{ w.couple.partnerB.first }}</h1>
                <p class="font-caps text-gold mt-4">19 December 2026</p>
            </div>
        </main>
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