import { LuArrowUpRight, LuFileDiff, LuFolderPlus, LuRocket, LuUsersRound } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Reveal from "@/components/Reveal";
import { PATHS } from "@/lib/routes";
import styles from "./Steps.module.css";

const STEPS = [
  { icon: LuFolderPlus, title: "Créez votre projet", text: "Posez le contexte, choisissez votre stack et fixez une durée de sprint." },
  { icon: LuUsersRound, title: "Invitez votre équipe", text: "Donnez à chacun le bon accès et téléchargez une copie de travail." },
  { icon: LuFileDiff, title: "Proposez, vérifiez", text: "Envoyez un ZIP. Le propriétaire compare et décide quoi intégrer." },
  { icon: LuRocket, title: "Livrez et partagez", text: "Publiez votre Ship Card et montrez au monde ce que vous avez construit." },
];

export default function Steps() {
  return (
    <section className="section" id="comment">
      <div className="container">
        <Reveal className="section-heading">
          <div>
            <span className="eyebrow">SIMPLE, DU DÉBUT À LA FIN</span>
            <h2>
              De l’idée à la livraison.
              <br />
              En quatre étapes.
            </h2>
          </div>
          <p>Pas de branches à gérer ni de longs échanges sans fin. Juste ce qu’il faut pour construire et livrer ensemble.</p>
        </Reveal>

        <div className={styles.steps}>
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <Reveal as="article" key={title} className={styles.step} delay={i * 0.08}>
              <div className={styles.top}>
                <span className={styles.num}>0{i + 1} /</span>
                <span className={styles.icon}>
                  <Icon />
                </span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>

        <div className={styles.cta}>
          <Button variant="primary" href={PATHS.create}>
            Créer un projet <LuArrowUpRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
