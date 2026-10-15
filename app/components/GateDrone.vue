<script setup lang="ts">
defineProps<{ hot: boolean }>()

// Exposed so the takeoff animation (step 3) can fly the whole drone
const lift = ref<SVGGElement>()
defineExpose({ lift })
</script>

<template>
    <svg class="drone" :class="{ 'is-hot': hot }" viewBox="0 30 240 150" aria-hidden="true">
        <defs>
            <linearGradient id="droneBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#1a2750" />
                <stop offset="1" stop-color="#0b1228" />
            </linearGradient>
        </defs>

        <g ref="lift" class="drone__lift">
            <g class="drone__float">
                <!-- rear arms and rotors (further away, softer) -->
                <g class="drone__far">
                    <line class="arm" x1="104" y1="70" x2="70" y2="52" />
                    <line class="arm" x1="136" y1="70" x2="170" y2="52" />
                    <circle class="motor" cx="70" cy="52" r="3" />
                    <circle class="motor" cx="170" cy="52" r="3" />
                    <g transform="translate(70 47)">
                        <ellipse class="disc" rx="24" ry="4" />
                        <g class="blade">
                            <line class="blade__line" x1="-24" y1="0" x2="24" y2="0" />
                        </g>
                    </g>
                    <g transform="translate(170 47)">
                        <ellipse class="disc" rx="24" ry="4" />
                        <g class="blade blade--b">
                            <line class="blade__line" x1="-24" y1="0" x2="24" y2="0" />
                        </g>
                    </g>
                </g>

                <!-- front arms and rotors -->
                <line class="arm" x1="90" y1="78" x2="34" y2="66" />
                <line class="arm" x1="150" y1="78" x2="206" y2="66" />
                <circle class="motor" cx="34" cy="66" r="4.5" />
                <circle class="motor" cx="206" cy="66" r="4.5" />
                <g transform="translate(34 60)">
                    <ellipse class="disc" rx="32" ry="5.5" />
                    <g class="blade blade--b">
                        <line class="blade__line" x1="-32" y1="0" x2="32" y2="0" />
                    </g>
                </g>
                <g transform="translate(206 60)">
                    <ellipse class="disc" rx="32" ry="5.5" />
                    <g class="blade">
                        <line class="blade__line" x1="-32" y1="0" x2="32" y2="0" />
                    </g>
                </g>
                <circle class="led" cx="46" cy="69" r="1.7" />
                <circle class="led led--b" cx="194" cy="69" r="1.7" />

                <!-- body -->
                <path class="body"
                    d="M88 78 C88 66 104 60 120 60 C136 60 152 66 152 78 C152 90 138 96 120 96 C102 96 88 90 88 78 Z" />
                <path class="body__shine" d="M101 69 C109 63 131 63 139 69" />
                <circle class="lens" cx="120" cy="95" r="5.5" />
                <circle class="lens__eye" cx="120" cy="95" r="1.6" />

                <!-- the delivery: gift box on cords, swaying -->
                <g class="drone__payload">
                    <line class="cord" x1="106" y1="93" x2="100" y2="125" />
                    <line class="cord" x1="134" y1="93" x2="140" y2="125" />
                    <rect class="box" x="97" y="135" width="46" height="36" rx="2" />
                    <rect class="box box--lid" x="94" y="124" width="52" height="11" rx="2" />
                    <rect class="ribbon" x="115.5" y="124" width="9" height="47" />
                    <path class="bow"
                        d="M120 124 C108 108 96 118 104 124 C108 127 116 126 120 124 Z M120 124 C132 108 144 118 136 124 C132 127 124 126 120 124 Z" />
                </g>
            </g>
        </g>
    </svg>
</template>

<style scoped>
.drone {
    display: block;
    overflow: visible;
    filter: drop-shadow(0 0 10px rgb(212 180 131 / 0.22));
}

/* Shared line-art look */
.arm,
.cord,
.body__shine {
    stroke: var(--gold-soft);
    stroke-linecap: round;
    fill: none;
}

.arm {
    stroke-width: 2.4;
}

.cord {
    stroke-width: 0.8;
    opacity: 0.7;
}

.body__shine {
    stroke-width: 1;
    opacity: 0.45;
}

.body {
    fill: url(#droneBody);
    stroke: var(--gold-soft);
    stroke-width: 1.5;
}

.motor {
    fill: #0b1228;
    stroke: var(--gold-soft);
    stroke-width: 1.3;
}

.lens {
    fill: #0b1228;
    stroke: var(--gold-soft);
    stroke-width: 1.2;
}

.lens__eye {
    fill: var(--heart, var(--gate-particle));
    transition: fill 700ms var(--ease-soft);
}

.drone__far {
    opacity: 0.55;
}

/* Rotors: a soft disc, and a blade that flips through edge-on to read as spinning */
.disc {
    fill: rgb(212 180 131 / 0.07);
    stroke: rgb(212 180 131 / 0.35);
    stroke-width: 0.5;
}

.blade__line {
    stroke: var(--gold-soft);
    stroke-width: 1.4;
    stroke-linecap: round;
}

.blade {
    transform-box: fill-box;
    transform-origin: center;
    animation: spin 0.32s linear infinite;
}

.blade--b {
    animation-delay: -0.11s;
}

.drone.is-hot .blade {
    animation-duration: 0.2s;
}

@keyframes spin {
    from {
        transform: scaleX(1);
    }

    to {
        transform: scaleX(-1);
    }
}

/* LEDs share the heart's colour: gold at rest, rose on hover */
.led {
    fill: var(--heart, var(--gate-particle));
    transition: fill 700ms var(--ease-soft);
    animation: blink 1.8s ease-in-out infinite;
}

.led--b {
    animation-delay: -0.9s;
}

@keyframes blink {

    0%,
    100% {
        opacity: 0.35;
    }

    50% {
        opacity: 1;
    }
}

/* The gift box */
.box {
    fill: rgb(212 180 131 / 0.16);
    stroke: var(--gold-soft);
    stroke-width: 1.2;
}

.box--lid {
    fill: rgb(212 180 131 / 0.26);
}

.ribbon {
    fill: var(--gold-soft);
    opacity: 0.85;
}

.bow {
    fill: rgb(212 180 131 / 0.25);
    stroke: var(--gold-soft);
    stroke-width: 1.1;
    stroke-linejoin: round;
}

.drone__lift,
.drone__float,
.drone__payload {
    transform-box: view-box;
}

.drone__lift {
    transform-origin: 120px 100px;
    transition:
        translate 0.8s var(--ease-settle),
        rotate 0.8s var(--ease-settle),
        scale 0.8s var(--ease-settle);
}

.drone.is-hot .drone__lift {
    translate: 0 -14px;
    rotate: -2.5deg;
    scale: 1.05;
}

.drone__float {
    transform-origin: 120px 80px;
    animation: bob 2.6s ease-in-out infinite alternate;
}

@keyframes bob {
    from {
        translate: 0 0;
        rotate: -1deg;
    }

    to {
        translate: 0 -9px;
        rotate: 1.2deg;
    }
}

.drone__payload {
    transform-origin: 120px 92px;
    animation: sway 2.1s ease-in-out -0.6s infinite alternate;
}

@keyframes sway {
    from {
        rotate: -3.5deg;
    }

    to {
        rotate: 3.5deg;
    }
}

@media (prefers-reduced-motion: reduce) {

    .drone__float,
    .drone__payload,
    .blade,
    .led {
        animation: none;
    }

    .drone__lift {
        transition: none;
    }
}
</style>