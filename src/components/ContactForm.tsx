import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import deRaw from "../i18n/de.json";
import enRaw from "../i18n/en.json";
import ptRaw from "../i18n/pt-br.json";
import type { Locale } from "../i18n/utils";

const dicts = { de: deRaw, en: enRaw, "pt-br": ptRaw } as const;

const Schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(10),
  consent: z.literal(true),
});

type FormValues = z.infer<typeof Schema>;

interface Props {
  locale: Locale;
  endpoint?: string;
}

export default function ContactForm({ locale, endpoint }: Props) {
  const t = dicts[locale].contact.form;
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({ mode: "onTouched" });

  async function onSubmit(values: FormValues) {
    const parsed = Schema.safeParse(values);
    if (!parsed.success) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      if (endpoint) {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        if (!res.ok) throw new Error("Network");
      } else {
        // Fallback: open mailto until backend is wired up. Build the address
        // from parts at runtime so the literal never appears in bundled JS.
        const u = ["i", "n", "f", "o"].join("");
        const d = ["sajconnect", "com"].join(".");
        const to = `${u}@${d}`;
        const subject = encodeURIComponent("Kontaktanfrage von www.sajconnect.com");
        const body = encodeURIComponent(
          `Name: ${parsed.data.name}\nE-Mail: ${parsed.data.email}\nUnternehmen: ${parsed.data.company ?? ""}\n\n${parsed.data.message}`,
        );
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      }
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-[var(--color-saj-green-bright)] bg-[var(--color-carbon-soft)] p-10 text-center">
        <span
          className="inline-block h-2 w-2 rounded-full bg-[var(--color-saj-green-bright)]"
          style={{ boxShadow: "0 0 16px rgba(43,190,13,0.7)" }}
          aria-hidden="true"
        ></span>
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-saj-green-bright)]">
          Acknowledged
        </p>
        <p className="mt-3 font-display text-xl font-medium tracking-tight text-[var(--color-bone)]">
          {t.success}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label={t.name} error={errors.name?.message}>
          <input
            {...register("name", { required: true, minLength: 2 })}
            type="text"
            autoComplete="name"
            className="form-input"
          />
        </Field>
        <Field label={t.email} error={errors.email?.message}>
          <input
            {...register("email", { required: true })}
            type="email"
            autoComplete="email"
            className="form-input"
          />
        </Field>
      </div>
      <Field label={t.company}>
        <input
          {...register("company")}
          type="text"
          autoComplete="organization"
          className="form-input"
        />
      </Field>
      <Field label={t.message} error={errors.message?.message}>
        <textarea
          {...register("message", { required: true, minLength: 10 })}
          rows={5}
          className="form-input resize-none"
        />
      </Field>
      <label className="flex items-start gap-3 text-sm text-[var(--color-text-on-carbon-muted)]">
        <input
          type="checkbox"
          {...register("consent", { required: true })}
          className="mt-1 h-4 w-4 rounded-none border-[var(--color-hairline-dark)] bg-[var(--color-carbon-soft)] accent-[var(--color-cobalt-light)]"
        />
        <span>{t.consent}</span>
      </label>
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "submitting" || !isValid}
          className="btn btn-primary disabled:opacity-50 sm:w-auto"
        >
          {status === "submitting" ? t.submitting : t.submit} →
        </button>
        {status === "error" && (
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-red-400">
            {t.error}
          </p>
        )}
      </div>
      <style>{`
        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid var(--color-hairline-dark);
          border-radius: 2px;
          background-color: var(--color-carbon-soft);
          color: var(--color-bone);
          font: inherit;
          font-size: 0.9375rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }
        .form-input::placeholder {
          color: var(--color-text-on-carbon-faint);
        }
        .form-input:hover {
          border-color: var(--color-graphite);
        }
        .form-input:focus {
          outline: none;
          border-color: var(--color-cobalt-light);
          box-shadow: 0 0 0 1px var(--color-cobalt-light), 0 0 16px -4px var(--color-cobalt-glow);
          background-color: var(--color-carbon);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-on-carbon-faint)]">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 font-mono text-xs uppercase tracking-[0.12em] text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
