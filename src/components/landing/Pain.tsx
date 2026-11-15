import { LuArrowRight, LuClock3, LuGitCompareArrows, LuMessagesSquare, LuRepeat2 } from "react-icons/lu";
import Reveal from "@/components/Reveal";
import styles from "./Pain.module.css";

const CARDS = [
  {
    icon: LuRepeat2,
    title: "Les tutoriels n’ont pas de fin",
    pain: "Vous apprenez, vous recommencez, mais rien ne sort jamais en ligne.",
    fix: "Un sprint avec une date de fin et un compte à rebours.",
    gold: false,
  },
  {
    icon: LuGitCompareArrows,
    title: "Git fait peur au début",
    pain: "Un conflit, une mauvaise commande, et la peur de tout casser vous freine.",
    fix: "Vous déposez un ZIP. Le propriétaire compare et décide.",
    gold: true,
  },
  {
    icon: LuMessagesSquare,
    title: "Les groupes WhatsApp ne livrent pas",
    pain: "Beaucoup d’enthousiasme le jour 1, aucune version à montrer à la semaine 4.",
    fix: "Chaque contribution acceptée devient une version visible et restaurable.",
    gold: false,
  },
];

export default function Pain() {
  return (
    <section className="section" id="probleme">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">Vous connaissez ça ?</span>
          <h2 className="section-title">Pourquoi vos projets restent à moitié finis</h2>
          <p className="section-lead">Ce n’est pas un manque de talent. C’est un manque de cadre. Voici ce qui change avec DEVEL line.</p>
        </Reveal>

        <div className="row items-stretch">
          {CARDS.map(({ icon: Icon, title, pain, fix, gold }, i) => (
            <div key={title} className="col-12 col-md-4">
              <Reveal delay={i * 0.1} className={`neu ${styles.card}`}>
                <span className={`clay-tile ${gold ? "gold" : ""}`}>
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p className={styles.pain}>{pain}</p>
                <div className={styles.fix}>
                  <span className={styles.fixLabel}>
                    <LuClock3 /> Avec DEVEL line
                  </span>
                  <p>
                    <LuArrowRight /> {fix}
                  </p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
