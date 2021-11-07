import { registerSW } from "virtual:pwa-register";

const updateInterval = 60 * 60 * 1000;

registerSW({
    onRegistered(registration) {
        if (registration) setInterval(registration.update, updateInterval);
    },
});

function removeSW() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) registration.unregister();
            console.log(registrations.length + " service workers unregistered");
        });
    }
}

export { removeSW };
