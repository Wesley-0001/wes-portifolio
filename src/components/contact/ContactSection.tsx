import ContactForm from "./ContactForm";
import ContactLinks from "./ContactLinks";

export default function ContactSection() {
  return (
    <section
      className="contact scroll-mt-28"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className="contact-header">
        <span className="contact-header-label">VAMOS CONVERSAR!</span>
        <h2 id="contact-title">Entre em contato</h2>
        <p>
          Se você deseja discutir um projeto, fazer uma parceria ou apenas bater
          um papo...
        </p>
      </div>

      <div className="contact-content">
        <ContactLinks />
        <ContactForm />
      </div>
    </section>
  );
}
