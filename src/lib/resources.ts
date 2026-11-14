export type Resource = {
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
};

const MAX_MB = process.env.MAX_ZIP_MB ?? "4";
const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export const RESOURCES: Record<string, Resource> = {
  documentation: {
    title: "Documentation",
    intro: "DEVEL line vous permet de livrer un projet en équipe sans maîtriser Git : le propriétaire garde le contrôle, les collaborateurs proposent des changements par archive ZIP.",
    sections: [
      { heading: "1. Créer un projet", body: "Renseignez le nom, la description, la stack, le contexte et la documentation. Choisissez la visibilité (public ou privé) et la durée du sprint (4 à 6 semaines). Vous pouvez déposer une archive ZIP de départ ; sinon un fichier README.md est généré. Le lien de démo peut être ajouté plus tard, mais il est requis pour livrer." },
      { heading: "2. Inviter l’équipe", body: "Invitez par adresse e-mail avec le droit « Contribuer » (peut proposer des changements) ou « Consulter » (lecture des fichiers). Chaque invitation a un lien que vous pouvez envoyer par WhatsApp ou par message : la personne se connecte, puis accepte." },
      { heading: "3. Télécharger la copie de travail", body: "Dans l’onglet Fichiers, téléchargez le ZIP d’une version précise. Il contient un fichier DEVELLINE.json : ne le supprimez pas, il permet à la plateforme de retrouver automatiquement la version de base de votre contribution." },
      { heading: "4. Proposer des changements", body: "Modifiez les fichiers en local, recompressez le dossier en ZIP et déposez-le dans l’onglet Contributions, avec un titre et un résumé. L’archive est vérifiée avant d’être enregistrée. Rien n’est jamais exécuté." },
      { heading: "5. Relire, accepter ou rejeter", body: "Le propriétaire voit les fichiers ajoutés, modifiés et supprimés, avec les différences ligne par ligne pour les fichiers texte. Un rejet laisse le projet inchangé. Une acceptation crée une nouvelle version et crédite le contributeur. Si un même fichier a changé entre-temps, la plateforme signale un conflit et demande une nouvelle proposition à partir de la version courante." },
      { heading: "6. Versions et restauration", body: "Chaque acceptation produit une version (v1.0, v1.1, …). Restaurer une ancienne version crée une nouvelle version identique : rien n’est supprimé de l’historique." },
      { heading: "7. Livrer et partager la Ship Card", body: "Une fois le lien de démo renseigné, le propriétaire marque le projet comme livré. Si le projet est public, sa Ship Card devient une page publique et partageable : projet, stack, démo, versions et contributions acceptées." },
    ],
  },
  securite: {
    title: "Sécurité des archives",
    intro: "Les archives envoyées sont considérées comme non fiables. Voici ce qui est contrôlé côté serveur avant tout enregistrement.",
    sections: [
      { heading: "Aucune exécution", body: "Le contenu d’une archive n’est jamais exécuté ni installé : aucun script, binaire ou dépendance n’est lancé. Les fichiers sont lus, vérifiés puis stockés." },
      { heading: "Chemins et structure", body: "Sont refusés : les chemins traversants (../), les chemins absolus, les séparateurs non standard, les liens symboliques, les doublons, les noms trop longs et les arborescences trop profondes (8 niveaux maximum)." },
      { heading: "Fichiers sensibles", body: "Sont refusés : les fichiers .env (sauf .env.example), les clés et certificats (.pem, .key, .p12…), les identifiants (id_rsa, .npmrc, credentials.json…), les exports de base de données et les dossiers .git ou node_modules. Une analyse par motifs détecte aussi les clés privées et jetons courants dans les fichiers texte. Cette détection est une aide, pas une garantie : relisez toujours avant d’envoyer." },
      { heading: "Types de fichiers", body: "Seuls les fichiers de code, de configuration, de documentation, d’images et de polices courants sont acceptés. Les binaires exécutables (.exe, .dll, .jar, .apk…) sont refusés." },
      { heading: "Limites", body: `Archive : ${MAX_MB} Mo maximum. Contenu : 300 fichiers, 2 Mo par fichier et 15 Mo au total une fois décompressé. La décompression est interrompue dès qu’une limite est dépassée (protection contre les « zip bombs »).` },
      { heading: "Permissions et traçabilité", body: "Chaque action est vérifiée côté serveur selon votre rôle (propriétaire, contributeur, lecteur ou visiteur). Les actions sensibles (invitation, soumission, décision, restauration, livraison) sont journalisées dans l’activité du projet." },
      { heading: "Comptes", body: "Les mots de passe sont hachés (bcrypt). Les sessions utilisent un cookie httpOnly. Les tentatives de connexion répétées sont limitées." },
    ],
  },
  faq: {
    title: "Questions fréquentes",
    intro: "Les réponses aux questions que l’on nous pose le plus souvent.",
    sections: [
      { heading: "Faut-il connaître Git ?", body: "Non. Vous téléchargez une copie de travail, vous modifiez en local et vous déposez un ZIP. Quand vous serez prêt, Git sera une étape naturelle : DEVEL line prépare le terrain, il ne le remplace pas." },
      { heading: "Pourquoi mon archive a-t-elle été refusée ?", body: "Le message indique les fichiers en cause : chemin interdit, fichier sensible, extension non autorisée ou taille dépassée. Corrigez-les, recompressez et réessayez." },
      { heading: "Qui peut voir mes fichiers ?", body: "Seuls le propriétaire et les membres invités. Pour un projet public, les visiteurs voient la fiche, les versions et la Ship Card, jamais les fichiers." },
      { heading: "Que se passe-t-il si deux personnes modifient le même fichier ?", body: "Le premier changement accepté devient la version courante. L’autre contribution est signalée en conflit : le contributeur retélécharge la version courante, reporte ses changements et soumet à nouveau." },
      { heading: "La Ship Card prouve-t-elle mes compétences ?", body: "Elle montre un projet réel, déployé, avec l’historique de ses versions et les contributions acceptées par le propriétaire. C’est une trace concrète de votre travail, pas une certification." },
      { heading: "DEVEL line héberge-t-il mon application ?", body: "Non. Vous renseignez le lien d’une démo déployée ailleurs (Vercel, Netlify, Render…). Le code n’est jamais exécuté sur la plateforme." },
    ],
  },
  "mentions-legales": {
    title: "Mentions légales",
    intro: "Informations légales relatives à l’édition et à l’hébergement du service.",
    sections: [
      { heading: "Éditeur", body: process.env.NEXT_PUBLIC_LEGAL_NAME ? `${process.env.NEXT_PUBLIC_LEGAL_NAME}${CONTACT ? ` — ${CONTACT}` : ""}` : "DEVEL line — nom de l’éditeur et coordonnées à renseigner avant la mise en production." },
      { heading: "Hébergement", body: process.env.NEXT_PUBLIC_HOST_NAME ?? "Hébergeur à renseigner avant la mise en production." },
      { heading: "Propriété des contenus", body: "Les projets et fichiers déposés restent la propriété de leurs auteurs. En les publiant, vous autorisez uniquement leur affichage sur la plateforme selon la visibilité que vous avez choisie." },
    ],
  },
  confidentialite: {
    title: "Confidentialité",
    intro: "Nous collectons le minimum nécessaire au fonctionnement du service.",
    sections: [
      { heading: "Données collectées", body: "Nom, adresse e-mail, mot de passe (haché), présentation facultative, projets, archives et fichiers que vous déposez, ainsi qu’un journal des actions sensibles sur vos projets." },
      { heading: "Cookies et stockage local", body: "Un cookie de session (httpOnly) vous maintient connecté. Votre préférence de thème (clair ou sombre) est enregistrée dans le navigateur. Aucun traceur publicitaire n’est utilisé." },
      { heading: "Visibilité", body: "Vos fichiers ne sont visibles que par les membres du projet. Les informations d’un projet public (nom, description, stack, versions, contributeurs crédités) sont visibles de tous." },
      { heading: "Vos droits", body: CONTACT ? `Pour accéder à vos données, les corriger ou supprimer votre compte, écrivez à ${CONTACT}.` : "Pour accéder à vos données, les corriger ou supprimer votre compte, contactez l’éditeur (coordonnées à renseigner avant la mise en production)." },
    ],
  },
};
