import Reveal from "@/components/Reveal";
import styles from "./Compare.module.css";

const CARDS = [
  {
    tag: "Les tutoriels",
    title: "Parfaits pour apprendre.",
    text: "Mais suivre un cours ne prouve pas que vous savez construire et livrer en équipe.",
    highlight: false,
  },
  {
    tag: "GitHub et discussions",
    title: "Puissants, mais exigeants au départ.",
    text: "Sans cadre ni échéance, les dépôts restent en pause et les conversations tournent en rond.",
    highlight: false,
  },
  {
    tag: "DEVEL line",
    title: "Un cadre pour livrer.",
    text: "Un sprint borné, des changements contrôlés, une preuve publique. Et quand vous êtes prêt, GitHub devient l’étape suivante.",
    highlight: true,
  },
];

export default function Compare() {
  return (
    <section className="section" id="difference">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">Pourquoi pas juste…</span>
          <h2 className="section-title">Conçu pour une seule chose : vous faire livrer</h2>
          <p className="section-lead">Les autres outils ont leur place. DEVEL line se concentre sur votre premier projet collaboratif terminé.</p>
        </Reveal>
        <div className="row items-stretch">
          {CARDS.map((c, i) => (
            <div key={c.tag} className={`col-12 col-md-6 col-lg-4 ${i === 2 ? "col-md-12" : ""}`}>
              <Reveal delay={i * 0.1} className={`${c.highlight ? `glass ${styles.highlight}` : "neu"} ${styles.card}`}>
                <span className={styles.tag}>{c.tag}</span>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
