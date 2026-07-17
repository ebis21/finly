export function validateCredentials(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return "Podaj poprawny adres e-mail.";
  }
  if (password.length < 6) {
    return "Hasło musi mieć co najmniej 6 znaków.";
  }
  return null;
}

export function translateAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials"))
    return "Nieprawidłowy e-mail lub hasło.";
  if (normalized.includes("user already registered") || normalized.includes("already been registered"))
    return "Ten e-mail jest już zajęty. Spróbuj się zalogować.";
  if (normalized.includes("password should be at least"))
    return "Hasło musi mieć co najmniej 6 znaków.";
  if (normalized.includes("unable to validate email") || normalized.includes("invalid email"))
    return "Podaj poprawny adres e-mail.";
  if (normalized.includes("email not confirmed"))
    return "Najpierw potwierdź konto — sprawdź swój e-mail.";
  if (normalized.includes("rate limit") || normalized.includes("too many"))
    return "Za dużo prób. Odczekaj chwilę i spróbuj ponownie.";
  return "Coś poszło nie tak. Spróbuj ponownie.";
}
