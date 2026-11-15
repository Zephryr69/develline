import Reveal from "@/components/Reveal";
import styles from "./Outcomes.module.css";

const ITEMS = [
  { value: "4 à 6", unit: "semaines", text: "pour passer de l’idée au projet en ligne" },
  { value: "1", unit: "lien", text: "à glisser dans votre CV et sur LinkedIn" },
  { value: "0", unit: "Git", text: "déposez un ZIP, la plateforme fait le reste" },
  { value: "100", unit: "%", text: "des changements validés par le propriétaire" },
];

export default function Outcomes() {
  return (
    <section className={styles.wrap} aria-label="Ce que vous obtenez">
      <div className="container">
        <Reveal className={`neu ${styles.bar}`}>
          <div className="row">
            {ITEMS.map((i) => (
              <div key={i.unit} className={`col-6 col-lg-3 ${styles.item}`}>
                <div className={styles.value}>
                  {i.value} <span>{i.unit}</span>
                </div>
                <p>{i.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
