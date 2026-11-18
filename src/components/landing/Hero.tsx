"use client";

import { motion } from "framer-motion";
import { LuArrowUpRight, LuClock3, LuLayers2, LuShieldCheck } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Ripples from "./Ripples";
import { heroSvg, HERO_VARS } from "./heroSvg";
import { PATHS } from "@/lib/routes";
import styles from "./Hero.module.css";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className="row items-center">
          <motion.div className="col-12 col-lg-6" variants={container} initial="hidden" animate="show">
            <motion.span variants={item} className={`${styles.kicker} neu-inset`}>
              Collaboration pour développeurs africains
            </motion.span>
            <motion.h1 variants={item} className={styles.title}>
              Livrez vos projets en équipe. <em>Prouvez-le avec un lien.</em>
            </motion.h1>
            <motion.p variants={item} className={styles.lead}>
              Invitez vos collaborateurs, recevez leurs contributions par ZIP, validez chaque changement et publiez la Ship Card de votre projet. Sans apprendre Git.
            </motion.p>
            <motion.div variants={item} className={styles.actions}>
              <Button variant="primary" size="lg" href={PATHS.newProject}>
                Lancer mon projet <LuArrowUpRight />
              </Button>
              <a href={PATHS.publicProjects} className={styles.link}>
                Voir un exemple livré <LuArrowUpRight />
              </a>
            </motion.div>
            <motion.ul variants={item} className={styles.proof}>
              <li><LuShieldCheck /> Inscription en 1 minute</li>
              <li><LuLayers2 /> Aucun Git à apprendre</li>
              <li><LuClock3 /> Sprint de 4 à 6 semaines</li>
            </motion.ul>
          </motion.div>

          <motion.div
            className="col-12 col-lg-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.stage}>
              <Ripples />
              <motion.div
                className={styles.visual}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                dangerouslySetInnerHTML={{ __html: heroSvg(HERO_VARS) }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
