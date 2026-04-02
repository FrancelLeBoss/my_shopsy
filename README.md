# 🛍️ My Shopsy

Site en ligne : **https://shopsy-fc.netlify.app/**

My Shopsy est une application e-commerce front-end développée avec **React**, **TypeScript** et **Vite**. Elle permet aux utilisateurs de parcourir des produits, de gérer un panier et une liste de souhaits, de créer un compte, de se connecter et de passer commande.

---

## 🚀 Fonctionnalités

- **Catalogue de produits** : navigation par catégories (ex. chaussures), affichage détaillé de chaque produit
- **Panier** : ajout/suppression d'articles, calcul du total
- **Liste de souhaits** : sauvegarde de produits favoris
- **Authentification** : inscription, connexion, activation de compte par e-mail, réinitialisation du mot de passe
- **Profil utilisateur** : consultation et mise à jour des informations personnelles
- **Paiement / Checkout** : page de validation de commande
- **Contact & Aide** : formulaire de contact et page d'assistance
- **Mode sombre** : thème clair/sombre géré via Tailwind CSS
- **Animations** : transitions fluides grâce à la bibliothèque AOS

---

## 🏗️ Stack technique

| Technologie | Rôle |
|---|---|
| [React 18](https://react.dev/) | Bibliothèque UI |
| [TypeScript](https://www.typescriptlang.org/) | Typage statique |
| [Vite](https://vitejs.dev/) | Bundler / serveur de développement |
| [Tailwind CSS](https://tailwindcss.com/) | Styles utilitaires |
| [Redux Toolkit](https://redux-toolkit.js.org/) | Gestion d'état global (panier, wishlist, auth) |
| [React Query](https://tanstack.com/query) | Récupération et mise en cache des données API |
| [React Router v7](https://reactrouter.com/) | Routage côté client |
| [Axios](https://axios-http.com/) | Requêtes HTTP vers l'API |
| [SweetAlert2](https://sweetalert2.github.io/) | Modales et notifications |
| [AOS](https://michalsnik.github.io/aos/) | Animations au défilement |
| [React Slick](https://react-slick.neostack.com/) | Carrousels de produits |

---

## 📁 Structure du projet

```
src/
├── api/              # Configuration Axios et appels API
├── assets/           # Images et ressources statiques
├── bot/              # Logique du chatbot (Puppeteer)
├── components/       # Composants réutilisables
│   ├── Banner/
│   ├── Cart/
│   ├── Footer/
│   ├── Hero/
│   ├── navbar/
│   ├── Products/
│   ├── TopProducts/
│   ├── Wishlist/
│   └── general/
├── context/          # Contextes React (ProductContext)
├── hooks/            # Hooks personnalisés
├── pages/            # Pages de l'application
│   ├── Home.tsx
│   ├── Boutique.tsx
│   ├── Product.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Profile.tsx
│   ├── Contact.tsx
│   ├── Help.tsx
│   ├── ResetPassword.tsx
│   └── AccountActivation.tsx
├── redux/            # Store Redux (cart, wishlist, user)
├── types/            # Types TypeScript partagés
├── App.tsx           # Composant racine & routes
└── main.tsx          # Point d'entrée de l'application
```

---

## ⚙️ Installation et lancement

### Prérequis

- [Node.js](https://nodejs.org/) ≥ 18
- npm ≥ 9

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/FrancelLeBoss/my_shopsy.git
cd my_shopsy

# 2. Installer les dépendances
npm install --legacy-peer-deps

# 3. Lancer en mode développement
npm run dev
```

L'application sera disponible sur **http://localhost:5173**.

### Autres commandes

```bash
npm run build    # Build de production (dossier dist/)
npm run preview  # Prévisualiser le build de production
npm run lint     # Lancer ESLint
```

---

## 🐳 Docker

Un `Dockerfile` est fourni pour lancer l'application dans un conteneur :

```bash
# Construire l'image
docker build -t my_shopsy .

# Lancer le conteneur
docker run -p 5173:5173 my_shopsy
```

L'application sera accessible sur **http://localhost:5173**.

---

## 🌐 Déploiement

Le site est déployé automatiquement sur **Netlify** depuis la branche principale.  
URL de production : https://shopsy-fc.netlify.app/
