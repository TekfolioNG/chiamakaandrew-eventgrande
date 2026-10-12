export const useCalendar = () => {
    const w = useWedding()

    const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const esc = (s: string) =>
        s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

    const downloadIcs = () => {
        const start = new Date(w.event.startISO)
        const end = new Date(start.getTime() + w.event.calendar.durationHours * 3600 * 1000)
        const venue = w.event.venue

        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Tekfolio//Wedding Invitation//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `UID:${w.slug}-${stamp(start)}@wedding-invitation`,
            `DTSTAMP:${stamp(new Date())}`,
            `DTSTART:${stamp(start)}`,
            `DTEND:${stamp(end)}`,
            `SUMMARY:${esc(`Wedding of ${w.couple.partnerA.first} & ${w.couple.partnerB.first}`)}`,
            `LOCATION:${esc([venue.name, ...venue.addressLines].join(', '))}`,
            `DESCRIPTION:${esc(w.event.arrivalNote ?? '')}`,
            'BEGIN:VALARM',
            'TRIGGER:-P1D',
            'ACTION:DISPLAY',
            'DESCRIPTION:The wedding is tomorrow',
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR',
        ]

        const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${w.slug}.ics`
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
    }

    return { downloadIcs }
}