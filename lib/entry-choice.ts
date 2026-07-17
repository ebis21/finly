const ENTRY_CHOICE_KEY = "finly-entry-choice-v1";

export function readGuestChoice() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ENTRY_CHOICE_KEY) === "guest";
}

export function rememberGuestChoice() {
  window.localStorage.setItem(ENTRY_CHOICE_KEY, "guest");
}

export function clearGuestChoice() {
  if (typeof window !== "undefined") window.localStorage.removeItem(ENTRY_CHOICE_KEY);
}

export function shouldShowEntryGate(authLoading: boolean, userPresent: boolean, guestChosen: boolean) {
  return !authLoading && !userPresent && !guestChosen;
}
