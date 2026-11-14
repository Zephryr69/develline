import { LuArrowUpRight, LuBadgeCheck, LuCheck, LuStore } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Reveal from "@/components/Reveal";
import { PATHS } from "@/lib/routes";
import styles from "./ShipCardFeature.module.css";

export default function ShipCardFeature() {
  return (
    <section className={`section ${styles.section}`} id="ship-card">
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.panel}>
          <div className={styles.card}>
            <div className={styles.top}>
              <span className={styles.label}>EXEMPLE / MARCHÉ LOCAL</span>
              <span className={styles.verified}>
                <LuBadgeCheck /> LIVRÉ
              </span>
            </div>
            <div className={styles.body}>
              <div className={styles.projectIcon}>
                <LuStore />
              </div>
              <h2>
                Du travail réel.
                <br />
                Une preuve claire.
              </h2>
              <p>Projet, stack, versions et contributions : tout ce qui compte, réuni au même endroit.</p>
              <div className={styles.stats}>
                <div>
                  <div className={styles.statLabel}>VERSION</div>
                  <div className={styles.statValue}>v1.4</div>
                </div>
                <div>
                  <div className={styles.statLabel}>SPRINT</div>
                  <div className={styles.statValue}>6 semaines</div>
                </div>
                <div>
                  <div className={styles.statLabel}>ÉQUIPE</div>
                  <div className={styles.statValue}>3 devs</div>
                </div>
              </div>
              <div className={styles.row}>
                <span className={styles.rowText}>Prête pour votre CV et vos réseaux.</span>
                <a href={PATHS.publicProjects} className={styles.link}>
                  Voir des exemples <LuArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className={styles.copy} delay={0.12}>
          <span className="eyebrow">VOTRE TRAVAIL MÉRITE D’ÊTRE VU</span>
          <h2 className="section-title">
            Une Ship Card.
            <br />
            De vraies preuves.
          </h2>
          <p>
            Une page publique qui raconte l’essentiel de votre projet en quelques secondes. Pour les recruteurs, les collaborateurs et toutes les personnes à qui vous voulez montrer votre travail.
          </p>
          <ul className={styles.list}>
            <li>
              <LuCheck /> Projet, stack et démo au même endroit
            </li>
            <li>
              <LuCheck /> Contributions acceptées et créditées
            </li>
            <li>
              <LuCheck /> Un lien à partager sur votre CV ou vos réseaux
            </li>
          </ul>
          <Button variant="primary" href={PATHS.newProject}>
            Créer un projet <LuArrowUpRight />
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
