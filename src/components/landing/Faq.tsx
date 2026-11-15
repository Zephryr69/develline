import { LuChevronDown } from "react-icons/lu";
import Reveal from "@/components/Reveal";
import styles from "./Faq.module.css";

const ITEMS = [
  { q: "Je ne connais pas Git. Est-ce un problème ?", a: "Non. Vous téléchargez une copie de travail, vous modifiez en local et vous déposez un ZIP. Quand vous serez prêt, Git sera une suite naturelle : DEVEL line prépare le terrain, il ne le remplace pas." },
  { q: "Qui voit mes fichiers ?", a: "Seuls le propriétaire et les membres invités. Pour un projet public, les visiteurs voient la fiche, les versions et la Ship Card, jamais les fichiers." },
  { q: "Une archive dangereuse peut-elle abîmer mon projet ?", a: "Chaque archive est vérifiée avant d’être enregistrée : chemins interdits, fichiers sensibles (.env, clés), binaires, taille. Rien n’est jamais exécuté, et rien n’entre dans votre projet sans votre validation." },
  { q: "Que se passe-t-il si deux personnes modifient le même fichier ?", a: "Le premier changement accepté devient la version courante. L’autre contribution est signalée en conflit : le contributeur repart de la version courante et soumet à nouveau." },
  { q: "Puis-je me tromper et revenir en arrière ?", a: "Oui. Chaque acceptation crée une version. Restaurer une ancienne version en crée une nouvelle : rien n’est jamais supprimé de l’historique." },
  { q: "DEVEL line héberge-t-il mon application ?", a: "Non. Vous ajoutez le lien de votre démo (Vercel, Netlify, Render…). Le code n’est jamais exécuté sur la plateforme." },
];

export default function Faq() {
  return (
    <section className="section" id="faq">
      <div className="container">
        <Reveal className="section-head center">
          <span className="eyebrow">Questions fréquentes</span>
          <h2 className="section-title">Les réponses avant que vous ne les posiez</h2>
        </Reveal>
        <div className="row">
          <Reveal className="col-12 col-lg-8 offset-lg-2">
            <div className={`neu ${styles.list}`}>
              {ITEMS.map((i) => (
                <details key={i.q} className={styles.item}>
                  <summary>
                    <span>{i.q}</span>
                    <LuChevronDown className={styles.chev} />
                  </summary>
                  <p>{i.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
