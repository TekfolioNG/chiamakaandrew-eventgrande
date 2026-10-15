<script setup lang="ts">
import type { GuestReply } from '#shared/types/guest'

useSeoMeta({ title: 'RSVP replies', robots: 'noindex, nofollow' })

const w = useWedding()

const { data, pending, error, refresh } = await useFetch<{ rsvps: GuestReply[] }>('/api/admin/rsvps', {
    server: false,
    default: () => ({ rsvps: [] as GuestReply[] }),
})

const filter = ref<'all' | 'yes' | 'no'>('all')
const query = ref('')

const all = computed(() => data.value?.rsvps ?? [])

const stats = computed(() => {
    const yes = all.value.filter((g) => g.attending)
    return {
        replies: all.value.length,
        yes: yes.length,
        no: all.value.length - yes.length,
        guests: yes.reduce((n, g) => n + g.guests, 0),
    }
})
const tiles = computed(() => [
    ['Replies', stats.value.replies],
    ['Attending', stats.value.yes],
    ['Declined', stats.value.no],
    ['Guests coming', stats.value.guests],
] as const)

const rows = computed(() => {
    const q = query.value.trim().toLowerCase()
    return all.value.filter((g) => {
        if (filter.value === 'yes' && !g.attending) return false
        if (filter.value === 'no' && g.attending) return false
        if (!q) return true
        return [g.name, g.phone, g.email ?? '', g.message ?? ''].some((v) => v.toLowerCase().includes(q))
    })
})

const when = (iso: string) =>
    new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: w.event.timezone,
    }).format(new Date(iso))

// ---------- deleting ----------
const remove = async (g: GuestReply) => {
    if (!window.confirm(`Delete the reply from ${g.name}? This cannot be undone.`)) return
    await $fetch('/api/admin/rsvps', { method: 'DELETE', query: { phone: g.phone } })
    await refresh()
}

const removeAll = async () => {
    const answer = window.prompt(
        'This permanently deletes every reply. Download the CSV first. Type DELETE to continue.',
    )
    if (answer !== 'DELETE') return
    await $fetch('/api/admin/rsvps', { method: 'DELETE', query: { all: 'yes' } })
    await refresh()
}

// ---------- CSV ----------
const cell = (v: string) => {
    // a leading = + - @ would let a spreadsheet run a guest's text as a formula
    const s = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v
    return `"${s.replace(/"/g, '""')}"`
}

const downloadCsv = () => {
    const head = ['Name', 'Attending', 'Guests', 'Phone', 'Email', 'Note', 'Replied (Lagos time)']
    const lines = all.value.map((g) =>
        [
            cell(g.name),
            g.attending ? 'Yes' : 'No',
            g.guests,
            `="${g.phone}"`, // keeps Excel from turning the number into 2.3E+12
            cell(g.email ?? ''),
            cell(g.message ?? ''),
            cell(new Date(g.updatedAt).toLocaleString('en-GB', { timeZone: w.event.timezone })),
        ].join(','),
    )
    // the leading mark makes Excel read accents correctly
    const text = '\uFEFF' + [head.join(','), ...lines].join('\r\n')

    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `rsvps-${w.slug}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>

<template>
    <main class="admin">
        <div class="admin__inner">
            <header class="admin__head">
                <div>
                    <p class="admin__eyebrow">RSVP replies</p>
                    <h1 class="admin__title">{{ w.couple.partnerA.first }} &amp; {{ w.couple.partnerB.first }}</h1>
                    <p class="admin__note">Private: for the couple and the organizers only.</p>
                </div>
                <div class="admin__actions">
                    <button type="button" class="btn btn--ghost" :disabled="pending" @click="refresh()">
                        {{ pending ? 'Refreshing…' : 'Refresh' }}
                    </button>
                    <button type="button" class="btn btn--gold" :disabled="!all.length" @click="downloadCsv">
                        Download CSV
                    </button>
                </div>
            </header>

            <p v-if="error" class="admin__error" role="alert">
                We couldn’t load the replies. {{ error.statusMessage || 'Please refresh and try again.' }}
            </p>

            <section class="stats" aria-label="Summary">
                <div v-for="[label, value] in tiles" :key="label" class="stat">
                    <span class="stat__value">{{ value }}</span>
                    <span class="stat__label">{{ label }}</span>
                </div>
            </section>

            <div class="tools">
                <div class="seg" role="group" aria-label="Filter replies">
                    <button type="button" :class="{ 'is-on': filter === 'all' }" @click="filter = 'all'">All</button>
                    <button type="button" :class="{ 'is-on': filter === 'yes' }"
                        @click="filter = 'yes'">Attending</button>
                    <button type="button" :class="{ 'is-on': filter === 'no' }" @click="filter = 'no'">Declined</button>
                </div>
                <input v-model="query" type="search" class="search" placeholder="Search name, phone, email or note"
                    aria-label="Search replies">
            </div>

            <p v-if="!rows.length && !pending" class="admin__empty">
                {{ all.length ? 'No replies match your search.' : 'No replies yet. They will appear here as responses.'
                }}
            </p>

            <table v-else class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Answer</th>
                        <th>Guests</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Note</th>
                        <th>Replied</th>
                        <th><span class="sr-only">Delete</span></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="g in rows" :key="g.phone">
                        <td data-label="Name" class="table__name">{{ g.name }}</td>
                        <td data-label="Answer">
                            <span class="pill" :class="g.attending ? 'pill--yes' : 'pill--no'">
                                {{ g.attending ? 'Attending' : 'Declined' }}
                            </span>
                        </td>
                        <td data-label="Guests">{{ g.attending ? g.guests : '–' }}</td>
                        <td data-label="Phone">
                            <a :href="`https://wa.me/${g.phone.replace('+', '')}`" target="_blank"
                                rel="noopener noreferrer">{{ g.phone }}</a>
                        </td>
                        <td data-label="Email" class="table__wrap">{{ g.email || '–' }}</td>
                        <td data-label="Note" class="table__wrap">{{ g.message || '–' }}</td>
                        <td data-label="Replied">{{ when(g.updatedAt) }}</td>
                        <td class="table__del">
                            <button type="button" class="link-btn" :aria-label="`Delete the reply from ${g.name}`"
                                @click="remove(g)">
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <footer v-if="all.length" class="admin__foot">
                <p>After the event, download the CSV, then clear the replies so guest details aren’t kept longer than
                    needed.</p>
                <button type="button" class="link-btn link-btn--danger" @click="removeAll">Delete all replies</button>
            </footer>
        </div>
    </main>
</template>

<style scoped>
.admin {
    min-height: 100svh;
    padding: clamp(1.5rem, 4vw, 3rem) var(--space-3) var(--space-5);
    background: var(--night-bg);
    color: var(--mist);
    /* a plain, easy-to-read face for an everyday tool */
    font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    font-size: 0.95rem;
}

.admin :focus-visible {
    outline: 2px solid var(--gold-soft);
    outline-offset: 3px;
}

.admin__inner {
    display: grid;
    gap: var(--space-4);
    width: min(100%, 72rem);
    margin-inline: auto;
}

.admin__head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-3);
}

.admin__eyebrow {
    margin: 0;
    font-family: var(--ff-caps);
    font-size: 0.78rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.admin__title {
    margin: 0.2rem 0;
    font-family: var(--ff-display);
    font-style: italic;
    font-weight: 400;
    font-size: clamp(2rem, 1.4rem + 3vw, 3.2rem);
    line-height: 1.15;
    color: var(--cream);
}

.admin__note {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.7;
}

.admin__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
}

.admin__actions .btn {
    padding: 0.75rem 1.3rem;
    font-size: 0.78rem;
}

.admin__actions .btn:disabled {
    opacity: 0.5;
    cursor: default;
}

.admin__error {
    margin: 0;
    padding: 0.9rem 1.1rem;
    border: 1px solid #e05a73;
    border-radius: 0.7rem;
    color: #f2a3b3;
}

.admin__empty {
    margin: 0;
    padding: var(--space-4) 0;
    text-align: center;
    opacity: 0.8;
}

.stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
}

@media (min-width: 40rem) {
    .stats {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}

.stat {
    display: grid;
    gap: 0.2rem;
    padding: 1.1rem 1.2rem;
    border: 1px solid rgb(212 180 131 / 0.28);
    border-radius: 0.9rem;
    background: linear-gradient(180deg, var(--night-2), var(--night-1));
}

.stat__value {
    font-family: var(--ff-display);
    font-size: 2.4rem;
    line-height: 1;
    color: var(--cream);
    font-variant-numeric: tabular-nums;
}

.stat__label {
    font-size: 0.72rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.tools {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    align-items: center;
    justify-content: space-between;
}

.seg {
    display: inline-flex;
    overflow: hidden;
    border: 1px solid rgb(212 180 131 / 0.4);
    border-radius: 999px;
}

.seg button {
    padding: 0.55rem 1.1rem;
    border: 0;
    background: none;
    font: inherit;
    color: var(--mist);
    cursor: pointer;
}

.seg button.is-on {
    background: var(--gold-soft);
    color: #1b1309;
}

.search {
    flex: 1 1 16rem;
    max-width: 24rem;
    padding: 0.65rem 1rem;
    border: 1px solid rgb(212 180 131 / 0.3);
    border-radius: 999px;
    background: rgb(6 7 10 / 0.55);
    font: inherit;
    color: var(--cream);
}

/* the table */
.table {
    width: 100%;
    border-collapse: collapse;
}

.table th {
    padding: 0.7rem 0.8rem;
    border-bottom: 1px solid rgb(212 180 131 / 0.3);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-align: left;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.table td {
    padding: 0.85rem 0.8rem;
    border-bottom: 1px solid rgb(212 180 131 / 0.12);
    vertical-align: top;
}

.table__name {
    font-weight: 600;
    color: var(--cream);
}

.table__wrap {
    max-width: 18rem;
    overflow-wrap: anywhere;
}

.table a {
    color: var(--gold-soft);
    text-decoration: none;
    border-bottom: 1px solid rgb(212 180 131 / 0.35);
}

.table a:hover {
    color: var(--cream);
}

.pill {
    display: inline-block;
    padding: 0.2rem 0.7rem;
    border-radius: 999px;
    font-size: 0.78rem;
    white-space: nowrap;
}

.pill--yes {
    background: rgb(212 180 131 / 0.18);
    border: 1px solid var(--gold-soft);
    color: var(--cream);
}

.pill--no {
    border: 1px solid rgb(207 200 184 / 0.4);
    color: var(--mist);
}

.link-btn {
    padding: 0.2rem 0;
    border: 0;
    background: none;
    font: inherit;
    font-size: 0.85rem;
    color: var(--mist);
    text-decoration: underline;
    cursor: pointer;
}

.link-btn:hover {
    color: var(--cream);
}

.link-btn--danger {
    color: #f2a3b3;
}

.admin__foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    font-size: 0.85rem;
    opacity: 0.85;
}

.admin__foot p {
    margin: 0;
    max-width: 40rem;
}

/* phones: each row becomes a small card */
@media (max-width: 47.99rem) {
    .table thead {
        position: absolute;
        left: -9999px;
    }

    .table,
    .table tbody,
    .table tr,
    .table td {
        display: block;
    }

    .table tr {
        margin-bottom: 0.8rem;
        padding: 0.8rem 1rem;
        border: 1px solid rgb(212 180 131 / 0.25);
        border-radius: 0.9rem;
        background: linear-gradient(180deg, var(--night-2), var(--night-1));
    }

    .table td {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.35rem 0;
        border: 0;
        text-align: right;
    }

    .table td::before {
        content: attr(data-label);
        flex: none;
        font-size: 0.7rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        text-align: left;
        color: var(--gold-soft);
    }

    .table__del {
        justify-content: flex-end;
    }

    .table__del::before {
        content: none;
    }
}
</style>