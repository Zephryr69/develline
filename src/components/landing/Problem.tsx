import { LuArrowUpRight, LuLayers2, LuScanSearch } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Reveal from "@/components/Reveal";
import { PATHS } from "@/lib/routes";
import styles from "./Problem.module.css";

export default function Problem() {
  return (
    <section className={`section ${styles.problem}`}>
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.copy}>
          <span className="eyebrow">ON CONNAÎT LA SUITE</span>
          <h2 className="section-title">
            Moins de tutos.
            <br />
            Plus de projets terminés.
          </h2>
          <p>
            Vous avez appris, expérimenté, recommencé. Mais sans projet livré, difficile de montrer ce que vous savez vraiment faire. DEVEL line vous aide à aller jusqu’au bout, ensemble.
          </p>
          <Button variant="outline" href={PATHS.create}>
            Créer un projet <LuArrowUpRight />
          </Button>
        </Reveal>
        <div className={styles.boxes}>
          <Reveal className={styles.box} delay={0.1}>
            <LuLayers2 />
            <h3>Un cadre pour avancer</h3>
            <p>Un projet, une équipe et une deadline claire. On sait où l’on va.</p>
          </Reveal>
          <Reveal className={styles.box} delay={0.2}>
            <LuScanSearch />
            <h3>Une preuve qui parle</h3>
            <p>Vos contributions acceptées deviennent visibles sur une page publique.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
