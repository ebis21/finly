import { describe, expect, it } from "vitest";
import { translateAuthError, validateCredentials } from "@/lib/auth-utils";

describe("validateCredentials", () => {
  it("rejects invalid credentials and accepts a valid pair", () => {
    expect(validateCredentials("", "secret1")).toBe("Podaj poprawny adres e-mail.");
    expect(validateCredentials("jan.example.pl", "secret1")).toBe("Podaj poprawny adres e-mail.");
    expect(validateCredentials("jan@example.pl", "12345")).toBe("Hasło musi mieć co najmniej 6 znaków.");
    expect(validateCredentials(" JAN@EXAMPLE.PL ", "secret1")).toBeNull();
  });
});

describe("translateAuthError", () => {
  it("translates common Supabase errors and hides unknown backend details", () => {
    expect(translateAuthError("Invalid login credentials")).toContain("Nieprawidłowy");
    expect(translateAuthError("User already registered")).toContain("już zajęty");
    expect(translateAuthError("Email not confirmed")).toContain("potwierdź konto");
    expect(translateAuthError("Email rate limit exceeded")).toContain("Za dużo prób");
    expect(translateAuthError("database host secret failure")).toBe("Coś poszło nie tak. Spróbuj ponownie.");
  });
});
