import { LuArrowUpRight } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Reveal from "@/components/Reveal";
import { PATHS } from "@/lib/routes";
import styles from "./FinalCta.module.css";

export default function FinalCta() {
  return (
    <section className={styles.cta}>
      <Reveal className="container">
        <span className="eyebrow">À VOUS DE JOUER</span>
        <h2>
          Votre prochain projet
          <br />
          ne restera pas une idée.
        </h2>
        <p>Rassemblez votre équipe. Fixez une date. Livrez quelque chose dont vous êtes fier.</p>
        <Button variant="primary" href={PATHS.newProject}>
          Créer un projet <LuArrowUpRight />
        </Button>
      </Reveal>
    </section>
  );
}
