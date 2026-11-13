import Link from "next/link";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import Logo from "@/components/Logo";
import { PATHS } from "@/lib/routes";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Logo />
            <p>Shippez ensemble, gardez le contrôle, sortez avec des preuves.</p>
            <div className={styles.socials}>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedinIn size={15} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub size={16} />
              </a>
            </div>
          </div>
          <div className={styles.col}>
            <h3>Produit</h3>
            <a href="#comment">Comment ça marche</a>
            <a href="#ship-card">Ship Card</a>
            <Link href={PATHS.public}>Projets publics</Link>
          </div>
          <div className={styles.col}>
            <h3>Ressources</h3>
            <Link href={PATHS.docs}>Documentation</Link>
            <Link href={PATHS.security}>Sécurité des archives</Link>
            <Link href={PATHS.faq}>FAQ</Link>
          </div>
          <div className={styles.col}>
            <h3>Contact / Légal</h3>
            <a href="mailto:bonjour@develline.example">Contact</a>
            <Link href={PATHS.legal}>Mentions légales</Link>
            <Link href={PATHS.privacy}>Confidentialité</Link>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>© 2026 DEVEL line. Tous droits réservés.</span>
          <span>Pour les devs, par les devs.</span>
        </div>
      </div>
    </footer>
  );
}
