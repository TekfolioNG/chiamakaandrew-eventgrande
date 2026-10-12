<template>
    <div class="rule" aria-hidden="true"><span /><i /><span /></div>
</template>

<style scoped>
.rule {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.7rem;
}

.rule span {
    width: clamp(2.5rem, 8vw, 4rem);
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold));
}

.rule span:last-child {
    background: linear-gradient(270deg, transparent, var(--gold));
}

.rule i {
    width: 0.4rem;
    height: 0.4rem;
    background: var(--gold);
    transform: rotate(45deg);
}
</style>