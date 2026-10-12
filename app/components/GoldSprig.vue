<template>
    <svg class="sprig" viewBox="0 0 100 232" aria-hidden="true">
        <path class="sprig__stem" d="M50 230 C46 170 54 100 64 20" />
        <path class="sprig__leaf" d="M48 200 C26 196 16 178 18 160 C38 164 50 180 48 200 Z" />
        <path class="sprig__leaf" d="M49 172 C70 168 82 150 80 132 C60 136 48 152 49 172 Z" />
        <path class="sprig__leaf" d="M51 142 C30 138 20 120 22 102 C42 106 54 122 51 142 Z" />
        <path class="sprig__leaf" d="M54 114 C74 110 86 92 84 74 C64 78 52 94 54 114 Z" />
        <path class="sprig__leaf" d="M57 86 C38 82 28 66 30 50 C48 54 59 68 57 86 Z" />
        <path class="sprig__leaf" d="M60 58 C78 54 88 40 86 26 C70 30 59 42 60 58 Z" />
        <path class="sprig__leaf" d="M64 20 C58 12 60 4 64 0 C68 6 68 14 64 20 Z" />
    </svg>
</template>

<style scoped>
.sprig {
    display: block;
    overflow: visible;
}

.sprig__stem {
    fill: none;
    stroke: var(--gold);
    stroke-width: 1;
    stroke-linecap: round;
}

.sprig__leaf {
    fill: rgb(212 180 131 / 0.12);
    stroke: var(--gold);
    stroke-width: 0.8;
    stroke-linejoin: round;
}
</style>