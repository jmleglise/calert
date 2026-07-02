---
title: "Surveiller la consommation Linky d’une location courte durée"
description: "Comment utiliser les données Linky pour repérer les anomalies, maîtriser les coûts et protéger un logement entre deux séjours."
pubDate: 2026-07-02
tags: ["Linky", "Location courte durée", "Anomalies", "Économies"]
keywords: ["surveillance Linky", "location saisonnière", "consommation électrique"]
translationKey: "linky-short-term-rental-monitoring"
---

## Pourquoi surveiller la consommation ?

Une location courte durée alterne des périodes occupées, vacantes et de préparation. Chaque période a une signature électrique différente. Le suivi quotidien permet de distinguer un usage normal d’une consommation anormale.

## Les signaux à observer

Les données Linky peuvent faire apparaître un chauffage oublié, une recharge de véhicule électrique, un sèche-serviettes programmé ou une occupation non prévue.

## Estimer l’impact financier

Une estimation simple consiste à multiplier l’énergie excédentaire par le prix du kWh :

$$
coût = kWh_{excédentaires} \times prix_{kWh}
$$

Si un appareil consomme 1 kW pendant 48 heures, l’énergie consommée est $1 \times 48 = 48 kWh$.

## Ce que ConsoAlert automatise

ConsoAlert analyse les écarts de consommation et transforme les données électriques en alertes compréhensibles pour les propriétaires, conciergeries et gestionnaires de logements.

## Exemple de modèle probabiliste

Pour capturer les signatures énergétiques normales, la fonction objectif, maximisant l'ELBO, s'écrit :$$\mathcal{L}(\theta, \phi; \mathbf{x}) = \mathbb{E}_{q_{\phi}(\mathbf{z}|\mathbf{x})}\left[\log p_{\theta}(\mathbf{x}|\mathbf{z})\right] - D_{KL}\left(q_{\phi}(\mathbf{z}|\mathbf{x}) \| p(\mathbf{z})\right)$$Où $\mathbf{x}$ représente la séquence de consommation observée et $\mathbf{z}$ la représentation latente des usages.
