self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json()
        const options = {
            body: data.body,
            icon: data.icon || '/logo.png',
            badge: data.badge || '/Favicon.ico',
            data: {
                url: data.url || '/'
            },
            vibrate: [100, 50, 100],
            actions: [
                { action: 'open', title: 'View Now' }
            ]
        }
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        )
    }
})

self.addEventListener('notificationclick', function (event) {
    event.notification.close()
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    )
})
