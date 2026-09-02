/**
 * Estimation grossière de durée à partir de la VMA (vitesse max aérobie, km/h) déjà collectée
 * dans le profil (écran Compte) mais jusqu'ici jamais exploitée ailleurs dans l'app.
 * Hypothèse : allure d'endurance soutenue ≈ 72% de la VMA — indicatif, pas un plan d'allure.
 */
const ENDURANCE_PCT_OF_VMA = 0.72;

export function estimateDurationLabel(distKm: number, vma?: number | null): string | null {
  if (!vma || vma <= 0 || distKm <= 0) return null;
  const speedKmh = vma * ENDURANCE_PCT_OF_VMA;
  const minutes = Math.round((distKm / speedKmh) * 60);
  if (minutes < 1) return null;
  if (minutes < 60) return `≈ ${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `≈ ${h} h` : `≈ ${h} h ${String(m).padStart(2, '0')}`;
}
