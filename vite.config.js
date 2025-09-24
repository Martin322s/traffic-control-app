// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	server: {
		hmr: {
			clientPort: 5173,
		},
		proxy: {
			"/cam": {
				target: "http://212.112.136.4:83",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/cam/, ""),
			},
		},
	},
});
