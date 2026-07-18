import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EntryGate } from "@/components/EntryGate";

const signIn = vi.fn();
const signUp = vi.fn();

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({
    signIn,
    signUp,
    configured: true,
  }),
}));

describe("EntryGate", () => {
  afterEach(cleanup);
  beforeEach(() => {
    signIn.mockReset();
    signUp.mockReset();
  });

  it("offers a role choice and continuing without an account", () => {
    const continueAsGuest = vi.fn();
    render(createElement(EntryGate, { onContinueAsGuest: continueAsGuest }));
    expect(screen.getByText("Jestem dzieckiem")).toBeTruthy();
    expect(screen.getByText("Jestem rodzicem")).toBeTruthy();
    expect(screen.getByText("Mam już konto — zaloguj się")).toBeTruthy();
    fireEvent.click(screen.getByText("Kontynuuj bez logowania"));
    expect(continueAsGuest).toHaveBeenCalledOnce();
  });

  it("creates an account with the chosen role", async () => {
    signUp.mockResolvedValue({ error: null });
    render(createElement(EntryGate, { onContinueAsGuest: () => undefined }));
    fireEvent.click(screen.getByText("Jestem rodzicem"));
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "mama@example.pl" } });
    fireEvent.change(screen.getByLabelText("Hasło"), { target: { value: "secret1" } });
    fireEvent.click(screen.getByRole("button", { name: "Utwórz konto" }));
    await waitFor(() =>
      expect(signUp).toHaveBeenCalledWith("mama@example.pl", "secret1", "parent")
    );
  });

  it("disables submit while an authentication request is pending", async () => {
    let resolve!: (value: { error: null }) => void;
    signIn.mockReturnValue(new Promise((done) => { resolve = done; }));
    render(createElement(EntryGate, { onContinueAsGuest: () => undefined }));
    fireEvent.click(screen.getByText("Mam już konto — zaloguj się"));
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "jan@example.pl" } });
    fireEvent.change(screen.getByLabelText("Hasło"), { target: { value: "secret1" } });
    const submit = screen.getByRole("button", { name: "Zaloguj się" }) as HTMLButtonElement;
    fireEvent.click(submit);
    expect(submit.disabled).toBe(true);
    resolve({ error: null });
    await waitFor(() => expect(submit.disabled).toBe(false));
  });
});
