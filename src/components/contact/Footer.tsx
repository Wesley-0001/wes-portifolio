import { CONTACT } from "@/contact";

const NAV = [
  { label: "Home", href: "#home" },
  { label: "Sobre", href: "#about" },
  { label: "Projetos", href: "#work" },
  { label: "Contato", href: "#contact" },
] as const;

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <h3>Wesley Cruz</h3>
          <p>
            Transformando ideias em experiências digitais excepcionais com
            precisão e criatividade.
          </p>
        </div>

        <div className="footer-right">
          <a href={`mailto:${CONTACT.email}`}>
            <span>{CONTACT.email}</span>
          </a>
        </div>
      </div>

      <hr />

      <div className="footer-bottom">
        <nav aria-label="Navegação do rodapé">
          {NAV.map(({ label, href }) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <p>© {new Date().getFullYear()} Wesley Cruz</p>
      </div>
    </footer>
  );
}
