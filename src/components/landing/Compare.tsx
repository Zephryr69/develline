import Reveal from "@/components/Reveal";
import styles from "./Compare.module.css";

const CARDS = [
  { label: "Les tutoriels", title: "Apprendre, c’est le début.", text: "Mais suivre un cours ne montre pas toujours ce que vous pouvez construire en équipe.", highlight: false },
  { label: "GitHub & conversations", title: "Puissants, parfois intimidants.", text: "Entre la complexité des outils et les discussions sans fin, un premier projet peut se perdre.", highlight: false },
  { label: "DEVEL line", title: "Un cadre pour livrer.", text: "Une deadline, des changements contrôlés et une preuve visible. Le nécessaire, sans le superflu.", highlight: true },
];

export default function Compare() {
  return (
    <section className="section" id="difference">
      <div className="container">
        <Reveal className="section-heading">
          <div>
            <span className="eyebrow">UN OUTIL, UN OBJECTIF</span>
            <h2>
              Fait pour aller
              <br />
              jusqu’au bout.
            </h2>
          </div>
          <p>Les autres outils ont leur place. DEVEL line se concentre sur une chose : vous aider à livrer votre premier projet collaboratif.</p>
        </Reveal>
        <div className={styles.grid}>
          {CARDS.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.1} className={`${styles.card} ${c.highlight ? styles.highlight : ""}`}>
              <span className={styles.label}>{c.label}</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
