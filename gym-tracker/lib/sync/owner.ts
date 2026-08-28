const OWNER_KEY = "gym-tracker-cloud-owner";

export function getCloudOwnerId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(OWNER_KEY);
}

export function setCloudOwnerId(userId: string): void {
  window.localStorage.setItem(OWNER_KEY, userId);
}
