import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker (only in production and when supported)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js')
			.then((reg) => {
				// Registration successful
				console.log('Service worker registered:', reg.scope);
			})
			.catch((err) => {
				console.warn('Service worker registration failed:', err);
			});
	});
}
