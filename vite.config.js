import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use relative base for Capacitor/iOS builds, absolute for web deployments.
// Set VITE_CAPACITOR=true when building for iOS (handled by cap:build script).
const isCapacitor = process.env.VITE_CAPACITOR === 'true'

// https://vite.dev/config/
export default defineConfig({
  base: isCapacitor ? './' : '/',
  plugins: [react()],
})
