# Implémentation WebSocket Frontend (Socket.IO)

Ce document détaille comment intégrer les fonctionnalités temps réel (messagerie et notifications) dans l'application frontend en utilisant `socket.io-client`.

## Installation

```bash
pnpm install socket.io-client
```

## Configuration Globale

Le backend expose deux namespaces distincts :

1. `/tripMessage` : Pour les messages de chat (conversations).
2. `/notifications` : Pour les notifications globales.

### Authentification

Bien que le backend n'applique pas encore strictement la validation du token sur la connexion WebSocket, il est recommandé de le passer pour les évolutions futures.

```javascript
import { io } from 'socket.io-client';

const token = 'votre_token_jwt_ici';
const API_URL = 'http://localhost:3000'; // ou votre URL de prod

// Options communes
const socketOptions = {
  auth: {
    token: token,
  },
  transports: ['websocket'], // Recommandé pour éviter le fallback polling
  autoConnect: false, // Pour contrôler manuellement la connexion
};
```

---

## 1. Messagerie (Chat)

Ce socket gère les messages dans les conversations.

### Connexion (Namespace `/tripMessage`)

**Attention** : Le namespace est `/tripMessage`.

```javascript
const chatSocket = io(`${API_URL}/tripMessage`, socketOptions);
chatSocket.connect();
```

### Rejoindre une Conversation

Pour recevoir les messages d'une conversation spécifique, le client **DOIT** émettre l'événement `joinRoom` avec l'ID de la conversation.

```javascript
// Rejoindre la room de la conversation
const conversationId = 'uuid-de-la-conversation';
chatSocket.emit('joinRoom', conversationId);

// Écouter les nouveaux messages
chatSocket.on('newMessage', (message) => {
  console.log('Nouveau message reçu:', message);
  // message est de type MessageResponseDto
  // structure : { id, content, senderId, conversationId, createdAt, ... }

  // Mettre à jour l'UI
});

// Quitter la room quand on change de page
chatSocket.emit('leaveRoom', conversationId);
```

### Envoyer un Message (via HTTP)

**Important**: L'envoi de messages se fait toujours via l'API REST (`POST /conversations/:id/messages`), pas via WebSocket. Le WebSocket sert uniquement à la **réception** temps réel.

---

## 2. Notifications

Ce socket gère l'affichage en temps réel des notifications (ex: "Nouvelle candidature", "Rappel de voyage").

### Connexion (Namespace `/notifications`)

```javascript
const notificationSocket = io(`${API_URL}/notifications`, socketOptions);
notificationSocket.connect();
```

### Initialisation

Dès la connexion, le client doit demander à rejoindre sa room personnelle via l'événement `joinNotifications`.
**Payload**: Une simple chaîne de caractères (string) contenant l'ID utilisateur.

```javascript
notificationSocket.on('connect', () => {
  // Remplacer USER_ID par l'ID de l'utilisateur connecté (string)
  notificationSocket.emit('joinNotifications', currentUser.id);
});
```

### Écouter les Notifications

```javascript
notificationSocket.on('notification', (notification) => {
  console.log('Notification reçue:', notification);
  /*
  Structure de notification :
  {
    id: string,
    title: string,
    description: string,
    type: 'trip' | 'message' | 'reminder',
    priority: 'high' | 'normal' | 'low',
    isRead: boolean,
    action: { targetRoute: string, params: object },
    createdAt: string,
    meta: object
  }
  */

  // Action : Afficher un toast / mettre à jour le compteur de notifs / play sound
});

// Quitter la room (ex: logout)
notificationSocket.emit('leaveNotifications', currentUser.id);
```

---

## Exemple d'Implémentation (React Hook)

Voici un exemple corrigé de hook personnalisé :

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSockets = (token: string, userId: string) => {
  const [chatSocket, setChatSocket] = useState<Socket | null>(null);
  const [notifSocket, setNotifSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token || !userId) return;

    // 1. Setup Chat Socket (Namespace /tripMessage)
    const chat = io('http://localhost:3000/tripMessage', {
      auth: { token },
      transports: ['websocket'],
    });

    // 2. Setup Notification Socket (Namespace /notifications)
    const notif = io('http://localhost:3000/notifications', {
      auth: { token },
      transports: ['websocket'],
    });

    notif.on('connect', () => {
      console.log('Connected to notifications');
      // Envoi de l'ID utilisateur en string (pas d'objet)
      notif.emit('joinNotifications', userId);
    });

    chat.on('connect', () => {
      console.log('Connected to chat');
    });

    setChatSocket(chat);
    setNotifSocket(notif);

    // Cleanup
    return () => {
      if (chat) chat.disconnect();
      if (notif) notif.disconnect();
    };
  }, [token, userId]);

  // Helper pour rejoindre une conversation
  const joinConversation = (conversationId: string) => {
    if (chatSocket) {
      chatSocket.emit('joinRoom', conversationId);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (chatSocket) {
      chatSocket.emit('leaveRoom', conversationId);
    }
  };

  return { chatSocket, notifSocket, joinConversation, leaveConversation };
};
```
