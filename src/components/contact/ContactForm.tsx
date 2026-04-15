import { useState, type ChangeEvent, type FormEvent } from "react";

export type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof ContactFormData, string>>;

const emailOk = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function ContactForm() {
  const [form, setForm] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const key = name as keyof ContactFormData;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = "Informe seu nome.";
    if (!form.email.trim()) {
      next.email = "Informe seu e-mail.";
    } else if (!emailOk(form.email)) {
      next.email = "E-mail inválido.";
    }
    if (!form.message.trim()) {
      next.message = "Escreva uma mensagem.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    // Integração com backend / serviço de e-mail pode ser plugada aqui.
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <label className="contact-form-field">
        <span className="sr-only">Nome</span>
        <input
          name="name"
          type="text"
          placeholder="Nome"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          className={errors.name ? "input-error" : undefined}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
        />
        {errors.name ? (
          <span id="contact-name-error" className="error-text" role="alert">
            {errors.name}
          </span>
        ) : null}
      </label>
      <label className="contact-form-field">
        <span className="sr-only">Email</span>
        <input
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          className={errors.email ? "input-error" : undefined}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
        />
        {errors.email ? (
          <span id="contact-email-error" className="error-text" role="alert">
            {errors.email}
          </span>
        ) : null}
      </label>
      <label className="contact-form-field">
        <span className="sr-only">Mensagem</span>
        <textarea
          name="message"
          placeholder="Sua mensagem"
          rows={5}
          value={form.message}
          onChange={handleChange}
          className={errors.message ? "input-error" : undefined}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message ? (
          <span id="contact-message-error" className="error-text" role="alert">
            {errors.message}
          </span>
        ) : null}
      </label>
      <button type="submit" className="contact-form-submit">
        Enviar →
      </button>
    </form>
  );
}
