import { LuArrowUpRight } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Reveal from "@/components/Reveal";
import Ripples from "./Ripples";
import { PATHS } from "@/lib/routes";
import styles from "./FinalCta.module.css";

export default function FinalCta() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal className={`glass ${styles.panel}`}>
          <Ripples rings={4} />
          <div className={styles.content}>
            <span className="eyebrow">À vous de jouer</span>
            <h2>Dans 6 semaines, votre projet peut être en ligne.</h2>
            <p>Créez votre sprint aujourd’hui, invitez votre équipe et avancez avec un objectif clair.</p>
            <Button variant="primary" size="lg" href={PATHS.newProject}>
              Lancer mon projet <LuArrowUpRight />
            </Button>
            <small>Inscription en 1 minute · Aucun Git à apprendre</small>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
