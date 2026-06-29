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
éliminé et son rôle révélé. Si Mister White est éliminé, il a une chance de
deviner le mot des civils.

**Victoire** :
- Les **civils** gagnent quand tous les imposteurs ET Mister White sont éliminés.
- Les **imposteurs** gagnent s'ils atteignent la majorité (vivants ≥ civils vivants),
  ou si Mister White devine le mot.

## Gestion des packs de mots

Depuis le lobby (hôte) → bouton **Gérer** :

- Voir / éditer / supprimer les paires d'un pack.
- **Import en masse** : une paire par ligne, format `mot civil | mot imposteur`
  (la virgule est aussi acceptée comme séparateur).
- Ajout manuel d'une paire (deux champs).
- **Export / Import** d'un pack en JSON.
- Nom + thème du pack.

Modèle d'une paire :

```json
{ "civil": "Tom et Jerry", "imposteur": "Titi et Grosminet" }
```

Un **pack par défaut** (~24 paires) est fourni.

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
