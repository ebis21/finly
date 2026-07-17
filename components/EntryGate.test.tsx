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

  it("offers login, registration and continuing without an account", () => {
    const continueAsGuest = vi.fn();
    render(createElement(EntryGate, { onContinueAsGuest: continueAsGuest }));
    expect(screen.getAllByText("Zaloguj się").length).toBeGreaterThan(0);
    expect(screen.getByText("Utwórz konto")).toBeTruthy();
    fireEvent.click(screen.getByText("Kontynuuj bez logowania"));
    expect(continueAsGuest).toHaveBeenCalledOnce();
  });

  it("disables submit while an authentication request is pending", async () => {
    let resolve!: (value: { error: null }) => void;
    signIn.mockReturnValue(new Promise((done) => { resolve = done; }));
    render(createElement(EntryGate, { onContinueAsGuest: () => undefined }));
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "jan@example.pl" } });
    fireEvent.change(screen.getByLabelText("Hasło"), { target: { value: "secret1" } });
    const submit = screen.getAllByRole("button", { name: "Zaloguj się" }).find((button) => button.getAttribute("type") === "submit") as HTMLButtonElement;
    fireEvent.click(submit);
    expect(submit.disabled).toBe(true);
    resolve({ error: null });
    await waitFor(() => expect(submit.disabled).toBe(false));
  });
});
