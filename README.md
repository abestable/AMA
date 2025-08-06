# AMA Planner

Un'applicazione di pianificazione intelligente che aiuta a gestire progetti e tempo in modo efficiente.

## 🚀 Tecnologie

- **Frontend**: SvelteKit + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: JSON (temporaneo, facilmente sostituibile con SQLite/PostgreSQL)
- **Package Manager**: pnpm
- **Build Tool**: Vite

## 📁 Struttura del Progetto

```
AMA1/
├── apps/
│   ├── web/          # Frontend SvelteKit
│   └── api/          # Backend Express
├── packages/
│   ├── core/         # Codice condiviso (database, types)
│   └── planner/      # Logica di pianificazione
├── package.json      # Workspace configuration
└── README.md
```

## 🛠️ Installazione

### Prerequisiti
- Node.js 18+
- pnpm

### Setup
```bash
# Clona il repository
git clone <repository-url>
cd AMA1

# Installa le dipendenze
pnpm install

# Avvia in modalità sviluppo
pnpm dev
```

## 🎯 Funzionalità

### ✅ Implementate
- **Autenticazione**: Registrazione e login utenti
- **Gestione Progetti**: Crea, modifica, elimina progetti
- **Pianificazione**: Genera agenda automatica basata su priorità
- **Dashboard**: Visualizza progetti e agenda

### 🚧 In Sviluppo
- **Finanze**: Tracciamento spese e budget
- **Notifiche**: Promemoria e alert
- **Export**: Esporta dati in PDF/Excel

## 🔧 Sviluppo

### Comandi Utili
```bash
# Avvia tutti i servizi
pnpm dev

# Build del progetto
pnpm build

# Solo frontend
pnpm --filter web dev

# Solo backend
pnpm --filter api dev

# Build del package core
pnpm --filter core build
```

### Porte
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## 🗄️ Database

Il progetto usa attualmente un database JSON per semplicità. I file del database sono esclusi da Git per sicurezza.

### Struttura Dati
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "passwordHash": "bcrypt-hash",
      "createdAt": "timestamp"
    }
  ],
  "projects": [
    {
      "id": "uuid",
      "userId": "user-id",
      "title": "Nome Progetto",
      "category": "lavoro|famiglia|studio|hobby|salute|altro",
      "valenza": 1-5, // Importanza
      "estHours": 1.0, // Ore stimate
      "priority": 1-5, // Urgenza
      "dueDate": "YYYY-MM-DD",
      "createdAt": "timestamp"
    }
  ],
  "agenda": [
    {
      "id": "uuid",
      "userId": "user-id",
      "projectId": "project-id",
      "start": "timestamp",
      "end": "timestamp",
      "createdAt": "timestamp"
    }
  ]
}
```

## 🔒 Sicurezza

- **Password**: Hashate con bcrypt
- **JWT**: Per autenticazione API
- **CORS**: Configurato per sviluppo
- **Helmet**: Headers di sicurezza

## 🧪 Testing

```bash
# Test frontend
pnpm --filter web test

# Test backend
pnpm --filter api test
```

## 📦 Deployment

### Produzione
```bash
# Build
pnpm build

# Start
pnpm start
```

### Docker
```bash
# Build image
docker build -t ama-planner .

# Run container
docker run -p 3001:3001 -p 5173:5173 ama-planner
```

## 🤝 Contribuire

1. Fork il repository
2. Crea un branch per la feature (`git checkout -b feature/nuova-funzionalita`)
3. Commit le modifiche (`git commit -am 'Aggiungi nuova funzionalità'`)
4. Push al branch (`git push origin feature/nuova-funzionalita`)
5. Crea una Pull Request

## 📝 Licenza

MIT License - vedi [LICENSE](LICENSE) per dettagli.

## 👥 Autori

- **Alberto Stabile** - Sviluppo iniziale

## 🙏 Ringraziamenti

- **SvelteKit** per il framework frontend
- **Express.js** per il backend
- **Tailwind CSS** per lo styling
- **TypeScript** per la type safety 