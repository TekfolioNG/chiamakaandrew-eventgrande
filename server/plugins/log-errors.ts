export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('error', (error, ctx) => {
        console.error('[SSR ERROR]', ctx?.event?.path)
        console.error(error)
        console.error((error as Error)?.stack)
    })
})