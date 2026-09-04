// Source unique des questions frequentes : alimente le composant FAQ et le
// JSON-LD FAQPage de la page d'accueil, pour qu'ils ne divergent jamais.
export type FaqItem = { question: string; answer: string };

export const faqItems: FaqItem[] = [
  {
    question: "Qu'est-ce que ConsoAlert ?",
    answer:
      "ConsoAlert est un service de surveillance intelligente de la consommation électrique des logements. Son agent Wattson analyse les données de consommation issues de Linky afin de repérer des comportements inhabituels et d'alerter les propriétaires ou gestionnaires lorsqu'une anomalie est détectée.",
  },
  {
    question: "Qu'est-ce que Wattson ?",
    answer:
      "Wattson est l'agent intelligent de ConsoAlert. Il analyse régulièrement la consommation électrique d'un logement, tient compte de son contexte d'occupation lorsque celui-ci est disponible et signale les écarts inhabituels qui méritent une vérification.",
  },
  {
    question: 'Dois-je installer un boîtier ?',
    answer:
      "Non. ConsoAlert exploite les données de consommation disponibles via Linky après autorisation de l'utilisateur. Aucun boîtier ConsoAlert ni capteur supplémentaire n'est nécessaire dans le logement.",
  },
  {
    question: 'À qui s’adresse ConsoAlert ?',
    answer:
      "ConsoAlert s'adresse notamment aux propriétaires, conciergeries, gestionnaires de locations courte durée, gestionnaires de plusieurs logements et propriétaires de résidences secondaires qui souhaitent surveiller leurs consommations à distance.",
  },
  {
    question: 'Quels types d’anomalies ConsoAlert peut-il signaler ?',
    answer:
      "ConsoAlert peut signaler une consommation anormalement élevée, une consommation persistante dans un logement supposé vide, des écarts entre périodes occupées et vacantes ou d'autres profils inhabituels. Ces alertes servent à attirer l'attention sur une situation qui mérite d'être vérifiée.",
  },
  {
    question: 'ConsoAlert peut-il identifier précisément l’appareil responsable d’une surconsommation ?',
    answer:
      "Pas toujours. Les données de consommation permettent de détecter des profils et des anomalies, mais elles ne suffisent pas systématiquement à identifier avec certitude l'appareil ou l'événement responsable. ConsoAlert est un outil de détection et d'aide à la décision.",
  },
  {
    question: 'Est-ce que Wattson espionne mes locataires ?',
    answer:
      "Non. Wattson analyse la consommation électrique globale du logement. ConsoAlert n'installe ni caméra, ni microphone, ni capteur de présence dans le logement.",
  },
  {
    question: 'Comment ConsoAlert sait-il si un logement est occupé ou vacant ?',
    answer:
      "Lorsque l'utilisateur synchronise ses calendriers de réservation, ConsoAlert peut utiliser ces périodes comme contexte d'analyse. Cela permet à Wattson de distinguer plus facilement une consommation normale pendant une occupation d'une consommation inhabituelle lorsque le logement est censé être vide.",
  },
  {
    question: 'Que se passe-t-il si l’autorisation d’accès aux données Linky expire ?',
    answer:
      "L'accès aux données nécessite une autorisation valide. Si elle doit être renouvelée, l'utilisateur peut rétablir son consentement afin que la surveillance reprenne avec les données disponibles.",
  },
];
