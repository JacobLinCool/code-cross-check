import { registerSW } from "virtual:pwa-register";

const updateInterval = 60 * 60 * 1000;

const updateSW = registerSW({
    onRegistered(registration) {
        if (registration) setInterval(registration.update, updateInterval);
    },
});
