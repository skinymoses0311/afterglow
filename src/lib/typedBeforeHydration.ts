import { useEffect, type RefObject } from "react";

export type FormField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const startingValue = (field: FormField) =>
  field instanceof HTMLSelectElement
    ? (Array.from(field.options).find((option) => option.defaultSelected) ?? field.options[0])?.value ?? ""
    : field.defaultValue;

/**
 * Picks up anything entered into a form before the page came alive.
 *
 * Pages arrive pre-rendered, so a form is on screen — and can be typed into —
 * before React takes it over. React leaves the typing in the box, but the
 * form's state never hears about it, so submitting reported those fields as
 * empty. Measured on a slow phone, a visitor who typed their name straight away
 * was told the name was missing while it sat there in the field.
 *
 * Runs once, right after hydration, and hands every field that no longer holds
 * its starting value to `apply`, for the form to copy into its state.
 */
export function useTypedBeforeHydration(
  formRef: RefObject<HTMLFormElement | null>,
  apply: (field: FormField) => void,
): void {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    for (const element of Array.from(form.elements)) {
      if (element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio")) {
        if (element.checked !== element.defaultChecked) apply(element);
      } else if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
      ) {
        if (element.value !== startingValue(element)) apply(element);
      }
    }
    // Deliberately once: the first effect in the browser is the hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
