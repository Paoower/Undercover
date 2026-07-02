# Undercover 🕵️

Jeu d'ambiance multijoueur en temps réel inspiré de *Undercover / Imposteur*.
Plusieurs joueurs rejoignent une partie via un code de room, l'hôte configure,
puis tout le monde joue en temps réel (Socket.IO).

## Stack

- **Client** : React + Vite + TypeScript + TailwindCSS
- **Serveur** : Node.js + Express + Socket.IO (état des parties **en mémoire**)
- **Packs de mots** : fichier JSON (`server/data/wordpacks.json`) + CRUD / import / export

## Installation

Prérequis : Node.js ≥ 18.

```bash
# à la racine du projet
npm install            # installe concurrently (racine)
npm run install:all    # installe racine + server + client
```

## Lancement (dev)

```bash
npm run dev
```

Cela démarre **les deux** services :

- Serveur Socket.IO : http://localhost:3001
- Client Vite : http://localhost:5173

Ouvre http://localhost:5173 dans **plusieurs onglets** pour simuler plusieurs joueurs.

> Le client se connecte au serveur sur `http://<hostname>:3001`. Pour pointer
> ailleurs, définis `VITE_SERVER_URL` (ex. `VITE_SERVER_URL=http://192.168.1.10:3001`).

## Lancer séparément

```bash
npm run dev:server   # serveur seul
npm run dev:client   # client seul
```

## Production (un seul service)

En prod, le serveur Express sert **aussi** le client buildé (une seule URL,
pas de CORS) :

```bash
npm run prod:build   # build le client + installe le serveur
npm start            # lance le serveur sur le PORT (défaut 3001)
```

## Déploiement en ligne

Voir **[DEPLOY.md](./DEPLOY.md)** — guide pas-à-pas pour **Render** / **Railway**
(un blueprint `render.yaml` est fourni), plus les options LAN et tunnel ngrok.

## Règles du jeu

- **Civils** : reçoivent tous le même mot.
- **Imposteur(s)** : reçoivent un mot proche/lié (différent).
- **Mister White** (optionnel) : carte vierge « Devinez le mot ».

Déroulé : chacun donne un mot-clé à son tour → phase de vote → le plus voté est
éliminé et son rôle révélé, puis l'hôte fait **Continuer**. Si Mister White est
éliminé, il a une chance de deviner le mot des civils. Le **joueur de départ est
tiré au hasard** à chaque manche.

### Réglages de l'hôte (lobby)

Tous les réglages sont **visibles par tous les joueurs** ; seul l'hôte peut les
modifier (les autres les voient en lecture seule), et toute modification est
répliquée en temps réel.

- **Nombre d'imposteurs** et **Mister White** (on/off).
- **Mots par joueur avant le vote** : combien de mots-clés chacun pose par manche.
- **Temps par tour (en secondes)** : compte à rebours synchronisé (serveur
  autoritaire) pour poser son mot, `60 s` par défaut. `0` = illimité. À
  l'expiration, le tour est **passé automatiquement** (mot-clé « — »).
- **Temps de vote (en secondes)** : compte à rebours de la phase de vote, `60 s`
  par défaut. `0` = illimité. À l'expiration, les votes non confirmés comptent
  comme **abstention**.
- **Afficher les rôles dès le début** : **désactivé par défaut**. Tant qu'il est
  désactivé, chaque joueur ne voit que son mot et la distinction civil/imposteur
  n'est **révélée qu'à l'écran de fin** (Mister White connaît toujours sa carte
  vierge). Activé, le rôle est affiché dès le début.
- **Afficher le nombre de votes** : à la fin de la manche/partie, affiche les
  votes reçus par **chaque** joueur sous son avatar (0 compris). Pendant le vote,
  les totaux restent cachés pour ne pas influencer les choix.
- **La partie continue jusqu'à la victoire** : activé par défaut, la partie
  enchaîne les manches jusqu'à ce qu'un camp gagne ; les **manches suivantes
  n'ont qu'un seul mot par joueur**. Désactivé, la partie s'arrête après le
  premier vote (civils gagnants si un imposteur est démasqué, sinon imposteurs).

### Vote

Le vote se fait en **deux temps** : on **sélectionne** un joueur, puis on
**confirme** (« Confirmer le vote »). Tant que ce n'est pas confirmé, le vote
n'est pas comptabilisé et la sélection peut être changée.

### Rejouer

À l'écran de fin, chaque joueur (**hors hôte**) dispose d'un bouton **« Prêt »**.
L'hôte n'a pas besoin de se déclarer prêt ; il choisit entre :

- **Relancer une partie directement** — n'est actif que lorsque **tous** les
  autres joueurs sont prêts (indicateur « prêts (X/Y) »), et redémarre
  immédiatement avec les mêmes réglages.
- **Revenir aux paramètres** — toujours disponible, ramène au lobby pour ajuster
  les réglages avant de relancer.

**Victoire** :
- Les **civils** gagnent quand tous les imposteurs ET Mister White sont éliminés.
- Les **imposteurs** gagnent s'ils atteignent la majorité (vivants ≥ civils vivants),
  ou si Mister White devine le mot.

## Packs de mots

L'hôte peut **sélectionner plusieurs packs** à la fois dans le lobby (les paires
sont alors tirées dans l'union des packs cochés). Packs fournis :

- **Thèmes** : Nourriture, Véhicules, Animaux, Sport
- **Anime** : Animes (titres), One Piece, Hunter x Hunter, Dandadan, Gachiakuta, Frieren

Depuis le lobby (hôte) → bouton **Gérer** :

- Voir / éditer / supprimer les paires d'un pack.
- **Import en masse** : une paire par ligne, format `mot civil | mot imposteur`
  (la virgule est aussi acceptée comme séparateur).
- Ajout manuel d'une paire (deux champs).
- **Export / Import** d'un pack en JSON.
- Nom + thème du pack.

Modèle d'une paire :

```json
{ "civil": "Luffy", "imposteur": "Zoro" }
```

## Structure

```
/server
  src/index.js       serveur Express + wiring Socket.IO
  src/rooms.js       Map des rooms + vues personnalisées par joueur
  src/game.js        rôles, tours, votes, conditions de victoire
  src/wordpacks.js   chargement / CRUD du JSON
  data/wordpacks.json
/client
  src/screens/       Home, Lobby, Game, Vote, Reveal, End
  src/components/     AvatarCircle, PlayerCard, RoleCard, WordpackManager
  src/useGame.ts      hook connexion + état + reconnexion
  src/socket.ts
```

## Reconnexion

La session (`code`, `playerId`) est stockée en `localStorage`. Si un joueur
recharge ou se déconnecte en cours de partie, il garde sa place et se reconnecte
automatiquement.
