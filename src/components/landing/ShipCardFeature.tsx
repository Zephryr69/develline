import { LuArrowUpRight, LuBadgeCheck, LuBox, LuCheck, LuExternalLink } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Reveal from "@/components/Reveal";
import Ripples from "./Ripples";
import { PATHS } from "@/lib/routes";
import styles from "./ShipCardFeature.module.css";

export default function ShipCardFeature() {
  return (
    <section className={`section ${styles.section}`} id="ship-card">
      <div className="container">
        <div className="row items-center">
          <Reveal className="col-12 col-lg-5 order-lg-1">
            <span className="eyebrow">Votre preuve</span>
            <h2 className="section-title">Ce qu’un recruteur comprend en 5 secondes</h2>
            <p className="section-lead">Pas un CV de plus : une page publique qui montre ce que vous avez réellement construit.</p>
            <ul className={styles.list}>
              <li><LuCheck /> Le projet, sa stack et sa démo en ligne</li>
              <li><LuCheck /> L’historique de ses versions</li>
              <li><LuCheck /> Vos contributions acceptées, créditées à votre nom</li>
              <li><LuCheck /> Un lien à partager sur WhatsApp, LinkedIn ou votre CV</li>
            </ul>
            <Button variant="primary" size="lg" href={PATHS.newProject}>
              Créer ma Ship Card <LuArrowUpRight />
            </Button>
          </Reveal>

          <Reveal delay={0.12} className="col-12 col-lg-6 offset-lg-1 order-lg-2">
            <div className={styles.panel}>
              <Ripples rings={3} gold={false} />
              <article className={`glass ${styles.card}`} aria-label="Exemple de Ship Card">
                <header className={styles.top}>
                  <span className={styles.label}>EXEMPLE / MARCHÉ LOCAL</span>
                  <span className={styles.status}><LuBadgeCheck /> LIVRÉ</span>
                </header>
                <div className={styles.body}>
                  <div className="clay-tile gold"><LuBox /></div>
                  <h3>Du travail réel. Une preuve claire.</h3>
                  <p>Projet, stack, versions et contributions : tout ce qui compte, réuni au même endroit.</p>
                  <dl className={styles.stats}>
                    <div><dt>Version</dt><dd>v1.4</dd></div>
                    <div><dt>Sprint</dt><dd>6 semaines</dd></div>
                    <div><dt>Équipe</dt><dd>3 devs</dd></div>
                  </dl>
                  <div className={styles.row}>
                    <span>Prête pour votre CV et vos réseaux.</span>
                    <a href={PATHS.publicProjects}>
                      Voir des exemples <LuExternalLink />
                    </a>
                  </div>
                </div>
              </article>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
