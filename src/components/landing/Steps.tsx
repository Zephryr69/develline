import { LuArrowUpRight, LuFileDiff, LuFolderPlus, LuRocket, LuUsersRound } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Reveal from "@/components/Reveal";
import { PATHS } from "@/lib/routes";
import styles from "./Steps.module.css";

const STEPS = [
  { icon: LuFolderPlus, title: "Cadrez votre sprint", text: "Nom, stack, lien de démo, durée : deux minutes suffisent.", result: "Vous avez un objectif et une date." },
  { icon: LuUsersRound, title: "Invitez votre équipe", text: "Par e-mail ou par lien WhatsApp, avec le bon niveau d’accès.", result: "Chacun sait ce qu’il peut faire." },
  { icon: LuFileDiff, title: "Proposez, relisez, décidez", text: "Un ZIP déposé, les différences affichées : vous acceptez ou vous rejetez.", result: "Rien n’entre sans votre accord." },
  { icon: LuRocket, title: "Livrez et partagez", text: "Marquez le projet comme livré : votre Ship Card devient publique.", result: "Une preuve que n’importe qui peut ouvrir." },
];

export default function Steps() {
  return (
    <section className="section" id="comment">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">Simple, du début à la fin</span>
          <h2 className="section-title">De l’idée au lien partageable en 4 étapes</h2>
          <p className="section-lead">Pas de branches à gérer, pas de discussions sans fin. Juste ce qu’il faut pour construire, décider et livrer.</p>
        </Reveal>

        <div className="row items-stretch">
          {STEPS.map(({ icon: Icon, title, text, result }, i) => (
            <div key={title} className="col-12 col-sm-6 col-lg-3">
              <Reveal as="article" delay={i * 0.08} className={`neu ${styles.step}`}>
                <div className={styles.top}>
                  <span className={`clay-tile ${i % 2 ? "gold" : ""}`}>
                    <Icon />
                  </span>
                  <span className={styles.num}>0{i + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <p className={styles.result}>{result}</p>
              </Reveal>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <Button variant="primary" size="lg" href={PATHS.newProject}>
            Lancer mon projet <LuArrowUpRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
