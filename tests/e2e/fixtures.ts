// Shared E2E fixture user credentials. These accounts are created once by
// global-setup.ts and left in staging permanently (staging is a stable,
// reusable environment, not wiped per run) so re-running the suite is fast
// and idempotent — global-setup only creates what's missing.
export const ADMIN_USER = { email: 'e2e-admin@technoscope.test', password: 'E2eAdminPass!26' }
export const PERSONEL_USER = { email: 'e2e-personel@technoscope.test', password: 'E2ePersonelPass!26' }
export const MISAFIR_USER = { email: 'e2e-misafir@technoscope.test', password: 'E2eMisafirPass!26' }
