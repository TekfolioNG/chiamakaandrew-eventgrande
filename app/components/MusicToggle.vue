<script setup lang="ts">
const w = useWedding()
const { playing, toggle } = useMusic()
</script>

<template>
    <button v-if="w.gate.music.enabled" type="button" class="music" :class="{ 'is-on': playing }"
        :aria-label="playing ? 'Pause music' : 'Play music'" :aria-pressed="playing" @click="toggle">
        <span class="music__bars" aria-hidden="true"><i /><i /><i /></span>
    </button>
</template>

<style scoped>
.music {
    position: fixed;
    right: max(1rem, env(safe-area-inset-right));
    bottom: max(1rem, env(safe-area-inset-bottom));
    z-index: 60;
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    border: 1px solid rgb(212 180 131 / 0.55);
    border-radius: 50%;
    background: rgb(6 7 10 / 0.55);
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    cursor: pointer;
}

.music:focus-visible {
    outline: 2px solid var(--gold-soft);
    outline-offset: 3px;
}

.music__bars {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 14px;
}

.music__bars i {
    width: 2px;
    height: 100%;
    border-radius: 1px;
    background: var(--gold-soft);
    transform-origin: bottom;
    transform: scaleY(0.3);
}

.music.is-on .music__bars i {
    animation: eq 1s ease-in-out infinite;
}

.music.is-on .music__bars i:nth-child(2) {
    animation-delay: -0.35s;
}

.music.is-on .music__bars i:nth-child(3) {
    animation-delay: -0.7s;
}

@keyframes eq {

    0%,
    100% {
        transform: scaleY(0.25);
    }

    50% {
        transform: scaleY(1);
    }
}

@media (prefers-reduced-motion: reduce) {
    .music.is-on .music__bars i {
        animation: none;
        transform: scaleY(0.7);
    }
}
</style>