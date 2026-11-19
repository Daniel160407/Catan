<script setup lang="ts">
import { hexToPixel } from '#shared/game/board'
import type { Port, Tile } from '#shared/game/types'

const props = withDefaults(defineProps<{ tiles: Tile[], ports?: Port[] }>(), { ports: () => [] })
const SIZE = 60

const terrainFill: Record<Tile['terrain'], string> = {
  wood: 'var(--color-wood)', brick: 'var(--color-brick)', wool: 'var(--color-wool)',
  grain: 'var(--color-grain)', ore: 'var(--color-ore)', desert: 'var(--color-desert)',
}
const texture = (t: Tile['terrain']) => `/tiles/${t}.jpg`

/** Corner i of a pointy-top hex sits at angle 60i − 30°; edge i runs from corner i to corner i+1. */
const corner = (i: number, size = SIZE) => {
  const a = (Math.PI / 180) * (60 * i - 30)
  return { x: size * Math.cos(a), y: size * Math.sin(a) }
}
const corners = Array.from({ length: 6 }, (_, i) => corner(i)).map(c => `${c.x},${c.y}`).join(' ')

const hexes = computed(() => props.tiles.map(t => ({ ...t, ...hexToPixel(t, SIZE) })))
const hot = (n: number | null) => n === 6 || n === 8

/** Each harbor: the two coast corners it serves and a marker out in the sea. */
const harbors = computed(() => props.ports.map((p) => {
  const center = hexToPixel(p, SIZE)
  const a = (Math.PI / 180) * 60 * p.side // edge midpoint direction
  const out = SIZE * 1.65 // distance from land-hex centre to the marker
  const ends = [corner(p.side), corner(p.side + 1)].map(c => ({ x: center.x + c.x, y: center.y + c.y }))
  return {
    ...p,
    key: `${p.q},${p.r},${p.side}`,
    ends,
    x: center.x + out * Math.cos(a),
    y: center.y + out * Math.sin(a),
    ratio: p.kind === 'any' ? '3:1' : '2:1',
  }
}))
</script>

<template>
  <svg viewBox="-380 -340 760 680" class="w-full max-w-2xl" role="img" aria-label="Game board">
    <defs>
      <clipPath id="hex-clip"><polygon :points="corners" /></clipPath>
      <clipPath id="port-clip"><circle r="19" /></clipPath>
      <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity="0.45" />
      </filter>
    </defs>

    <!-- Shoreline: every land hex drawn fat in sand colour behind the tiles forms a beach border. -->
    <g filter="url(#soft-shadow)">
      <polygon v-for="h in hexes" :key="`shore-${h.q},${h.r}`" :points="corners"
               :transform="`translate(${h.x},${h.y})`"
               fill="#e9d6a3" stroke="#e9d6a3" stroke-width="26" stroke-linejoin="round" />
    </g>

    <!-- Harbor docks: two wooden piers from the coast corners to the marker. -->
    <g v-for="p in harbors" :key="`dock-${p.key}`">
      <line v-for="(e, i) in p.ends" :key="i" :x1="e.x" :y1="e.y" :x2="p.x" :y2="p.y"
            stroke="#5b3a1e" stroke-width="7" stroke-linecap="round" />
      <line v-for="(e, i) in p.ends" :key="`hl-${i}`" :x1="e.x" :y1="e.y" :x2="p.x" :y2="p.y"
            stroke="#9a6a3c" stroke-width="3.5" stroke-linecap="round" />
    </g>

    <g v-for="h in hexes" :key="`${h.q},${h.r}`" :transform="`translate(${h.x},${h.y})`">
      <!-- Flat colour shows while the texture loads -->
      <polygon :points="corners" :fill="terrainFill[h.terrain]" />
      <image :href="texture(h.terrain)" :x="-SIZE" :y="-SIZE" :width="SIZE * 2" :height="SIZE * 2"
             preserveAspectRatio="xMidYMid slice" clip-path="url(#hex-clip)" />
      <polygon :points="corners" fill="none" stroke="#f5ecd7" stroke-width="3" />
      <template v-if="h.number">
        <circle r="18" fill="#f5ecd7" stroke="#00000040" stroke-width="1.5" />
        <text text-anchor="middle" dy="6" font-size="18" font-weight="700"
              :fill="hot(h.number) ? '#b91c1c' : '#1f2937'">{{ h.number }}</text>
      </template>
    </g>

    <!-- Harbor markers: resource texture for 2:1, plain for generic 3:1. -->
    <g v-for="p in harbors" :key="`port-${p.key}`" :transform="`translate(${p.x},${p.y})`" filter="url(#soft-shadow)">
      <title>{{ p.kind === 'any' ? 'Harbor 3:1 — any resource' : `Harbor 2:1 — ${p.kind}` }}</title>
      <circle r="22" fill="#f5ecd7" stroke="#5b3a1e" stroke-width="3" />
      <image v-if="p.kind !== 'any'" :href="texture(p.kind)" x="-19" y="-19" width="38" height="38"
             preserveAspectRatio="xMidYMid slice" clip-path="url(#port-clip)" />
      <text v-else text-anchor="middle" dy="7" font-size="20" font-weight="800" fill="#5b3a1e">?</text>
      <rect x="-17" y="13" width="34" height="16" rx="8" fill="#5b3a1e" />
      <text text-anchor="middle" y="25.5" font-size="12" font-weight="700" fill="#f5ecd7">{{ p.ratio }}</text>
    </g>
  </svg>
</template>
