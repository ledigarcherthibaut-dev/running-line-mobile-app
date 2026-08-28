---
name: ui-ux-pro-max
description: Fournit des palettes de couleurs haut de gamme et des associations typographiques expertes pour concevoir ou revoir une interface (écrans, composants, design system). À utiliser quand on crée un nouvel écran, qu'on choisit des couleurs/polices, qu'on revoit la cohérence visuelle d'une fonctionnalité, ou qu'on veut éviter les anti-patterns visuels courants d'un secteur (fintech, santé, e-commerce, bien-être, etc.). Contenu adapté du skill open source nextlevelbuilder/ui-ux-pro-max-skill.
---

# UI/UX Pro Max — intelligence de design

> Adapté du skill open source [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
> (MIT). Le dépôt original s'appuie sur un moteur de recherche Python interrogeant des jeux de
> données CSV (192 palettes, 74 pairings typographiques, 119 règles UX) livrés avec son propre
> CLI/plugin — une dépendance qui n'a pas de sens à dupliquer telle quelle dans ce projet. Ce
> fichier reprend directement les principes, l'exemple concret et la checklist qualité publiés
> par le dépôt, sous une forme autonome exploitable sans script ni fichier externe.

## Quand appliquer ce skill

Dès qu'une tâche touche à l'apparence ou à l'ergonomie d'une interface : nouvel écran, nouveau
composant, choix ou révision de palette/typographie, cohérence visuelle d'une fonctionnalité,
accessibilité, responsive, ou relecture d'une UI existante.

**Dans ce projet (Running Line)**, un système de marque existe déjà et fait autorité :
`src/theme/tokens.ts` (accent lime `#F0FB6B`, thèmes clair/sombre, polices `Anton` / `RobotoMono`
/ `Roboto`). Ce skill sert à :
- garder les nouveaux écrans **cohérents** avec ce système plutôt qu'à le remplacer,
- fournir une check-list qualité (accessibilité, responsive, anti-patterns) avant de livrer une UI,
- offrir une bibliothèque de référence si un jour un nouveau produit / une nouvelle marque doit être
  conçue de zéro.
Ne change jamais l'identité de marque déjà en place sans qu'on te le demande explicitement.

## Priorités (du plus critique au plus accessoire)

1. **Accessibilité** — contraste, focus clavier, alternatives non-couleur, `prefers-reduced-motion`.
2. **Interactions tactiles** — cibles ≥ 44×44pt, feedback visuel/haptique, annulation possible.
3. **Performance** — pas d'animations lourdes ou de re-renders inutiles pour un effet cosmétique.
4. **Cohérence du style** — respecter le système de design déjà en place (tokens, espacements, rayons).
5. **Layout responsive** — texte et composants qui ne cassent pas à 375px, 768px, 1024px, 1440px.
6. Polish d'animation, UX des formulaires, patterns de navigation, data visualisation.

## Guidance UI résiliente

- Le texte essentiel doit rester lisible sans être coupé : zoom navigateur, mise à l'échelle du
  texte système, espacement personnalisé par l'utilisateur.
- Les listes de puces/tags doivent passer à la ligne ou se replier en `+n`, jamais déborder.
- Un badge ou un statut ne doit **jamais** reposer sur la couleur seule (ajouter icône/texte).
- Les interactions rapides (double-tap, actions en chaîne) doivent préserver l'état sémantique et
  le focus, tout en respectant les préférences de mouvement réduit.

## Checklist qualité avant de livrer une UI

- [ ] Contraste texte/fond ≥ 4.5:1 (voir le token `onAccent` de ce projet comme exemple correct
      d'un fond clair nécessitant un texte sombre, quel que soit le thème)
- [ ] Focus clavier visible sur tout élément interactif
- [ ] `prefers-reduced-motion` respecté pour les animations
- [ ] Pas d'icône-émoji comme substitut à une vraie iconographie (ce projet utilise Feather)
- [ ] Curseur/feedback clair sur tout élément cliquable
- [ ] Testé (au moins mentalement) aux largeurs 375px, 768px, 1024px, 1440px
- [ ] Aucune information transmise par la couleur seule

## Bibliothèque de palettes par intention

Palettes de référence organisées par ambiance/secteur — à utiliser pour un nouveau produit ou une
nouvelle section qui a besoin de sa propre identité (pas pour modifier la marque Running Line
existante sans demande explicite).

| Intention | Primaire | Secondaire | Accent/CTA | Fond | Texte |
|---|---|---|---|---|---|
| Spa / bien-être *(exemple original du dépôt source)* | `#E8B4B8` rose poudré | `#A8D5BA` vert sauge | `#D4AF37` or | `#FFF5F5` blanc chaud | `#2D3436` charbon |
| Fintech / banque (sérieux, confiance) | `#0B3D91` bleu marine | `#1E88E5` bleu clair | `#00C48C` vert succès | `#F7F9FC` gris très clair | `#1A1F36` bleu-noir |
| Santé (calme, clinique) | `#2C7A7B` sarcelle | `#68D391` vert doux | `#3182CE` bleu info | `#F0FDF9` menthe très clair | `#1A202C` gris ardoise |
| E-commerce (dynamique, conversion) | `#111827` noir doux | `#F97316` orange | `#111827` (CTA sombre sur fond clair) | `#FFFFFF` blanc | `#111827` |
| Créatif / portfolio (audacieux) | `#7C3AED` violet | `#F472B6` rose | `#FACC15` jaune vif | `#0F0F13` quasi-noir | `#F5F5F7` blanc cassé |
| Sport / énergie *(proche de l'identité Running Line)* | `#F0FB6B` lime | `#BEA3FE` violet | `#FF9B50` orange | `#101215` / `#F5F0EF` | selon thème |

## Pairings typographiques

| Pairing | Mood | Cas d'usage |
|---|---|---|
| Cormorant Garamond / Montserrat *(exemple original du dépôt source)* | Élégant, apaisant, sophistiqué | Spa, luxe, mariage |
| Anton / Roboto Mono *(ce projet)* | Affirmé, sportif, technique | Sport, data, fitness |
| Playfair Display / Inter | Éditorial, haut de gamme | Presse, marque premium |
| Space Grotesk / IBM Plex Sans | Tech, précis, moderne | SaaS, dev tools |
| Fraunces / Work Sans | Chaleureux, artisanal | Food, artisanat, DTC |
| Sora / Manrope | Neutre, lisible, polyvalent | Produit généraliste, admin |

## Catalogue de styles UI reconnus

Glassmorphism, Claymorphism, Minimalisme, Brutalisme, Neumorphism, Bento Grid, Dark Mode natif,
UI "AI-native" (chat/agentique). Choisir un style en fonction du secteur et de l'audience, pas par
tendance seule — voir anti-patterns ci-dessous.

## Anti-patterns par secteur

- **Banque/Fintech** : éviter les dégradés violet/rose "IA générique", les animations too-flashy,
  tout ce qui évoque le jeu/casual plutôt que la confiance.
- **Santé** : éviter le brutalisme, les couleurs saturées agressives, l'humour visuel qui minimise
  la gravité perçue du sujet.
- **Spa/bien-être** *(exemple original)* : éviter couleurs néon, animations dures, dark mode,
  dégradés violet/rose "IA".
- **E-commerce** : éviter un CTA qui se fond dans le reste de la page — le bouton d'achat doit
  toujours ressortir clairement.
- **Général** : éviter les emoji en guise d'icônes dans un produit qui se veut professionnel
  (préférer une vraie librairie d'icônes, comme Feather dans ce projet).

## Exemple complet (source originale, dépôt cité en tête de fichier)

Requête : "spa de bien-être" →

- **Pattern** : Hero-Centric + Social Proof — CTA au-dessus de la ligne de flottaison et après les
  témoignages.
- **Style** : Soft UI Evolution — ombres douces, profondeur subtile, formes organiques.
- **Couleurs** : voir ligne "Spa / bien-être" du tableau ci-dessus.
- **Typographie** : Cormorant Garamond / Montserrat.
- **Anti-patterns évités** : néon, animations dures, dark mode, dégradés violet/rose IA.
- **Checklist avant livraison** : pas d'emoji-icônes, curseur pointer sur le cliquable, contraste
  ≥ 4.5:1, focus clavier visible, `prefers-reduced-motion`, testé à 375/768/1024/1440px.

## Workflow suggéré

1. Identifier le produit/secteur et l'audience visée.
2. Si une marque existe déjà dans le projet (comme `theme/tokens.ts` ici), s'y aligner en priorité
   — ne piocher dans la bibliothèque ci-dessus que pour un nouveau produit/section sans identité.
3. Choisir palette + pairing typographique cohérents avec le mood recherché.
4. Vérifier les anti-patterns du secteur concerné.
5. Passer la checklist qualité avant de considérer l'UI terminée.
