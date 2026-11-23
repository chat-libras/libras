# Customização

## Avatar

### Seleção de avatar

O VLibras oferece mais de um avatar. O padrão é Ícaro (masculino). Para usar Hozana (feminino):

```tsx
import { LibrasAvatar } from 'libras-kit';

<LibrasAvatar vlibras={{ avatar: 'hozana' }} />
```

Ou via provider global:

```tsx
import { LibrasProvider } from 'libras-kit';

<LibrasProvider config={{ vlibras: { avatar: 'hozana' } }}>
  <App />
</LibrasProvider>
```

O `avatar` é uma string passada diretamente para o player VLibras. Os valores confirmados são `'icaro'` e `'hozana'`.

## Velocidade de sinalização

```tsx
// via prop
<LibrasAvatar speed={1.5} />

// via hook (controle em tempo real)
import { useLibrasAvatar } from 'libras-kit';

function MeuAvatar() {
  const { containerRef, speed, setSpeed } = useLibrasAvatar({ speed: 1 });

  return (
    <div>
      <div ref={containerRef} style={{ width: 320, height: 240 }} />
      <input
        type="range" min={0.5} max={2} step={0.1}
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
      />
    </div>
  );
}
```

## Tematização — headless via `classNames` e `styles`

A lib não embarca nenhum CSS. Você controla completamente a aparência passando nomes de classe ou objetos de estilo por parte do componente.

### Partes disponíveis

| Chave | Elemento | Notas |
|-------|----------|-------|
| `root` | container raiz | |
| `avatar` | `<div>` onde o Unity renderiza | |
| `chat` | container do chat | só presente com `showChat` |
| `messages` | `<ul>` com o histórico | |
| `message` | cada `<li>` | tem `data-source="speech\|typed"` |
| `input` | `<input>` de texto | |

### Exemplo com `classNames` (CSS Module ou Tailwind)

```tsx
<LibrasAvatar
  showChat
  classNames={{
    root: 'widget',
    avatar: 'avatar-stage',
    chat: 'chat-panel',
    messages: 'message-list',
    message: 'bubble',
    input: 'chat-input',
  }}
/>
```

```css
/* target por fonte da mensagem */
.bubble[data-source="speech"] { background: #e8f4ff; }
.bubble[data-source="typed"]  { background: #fff;    }
```

### Exemplo com `styles` (inline)

```tsx
<LibrasAvatar
  showChat
  styles={{
    root:    { borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px #0002' },
    avatar:  { background: '#111', aspectRatio: '4/3' },
    chat:    { borderTop: '1px solid #eee', padding: 8 },
    message: { padding: '4px 8px', borderRadius: 6, marginBottom: 4 },
  }}
/>
```

## Strings e i18n

Todas as strings visíveis ao usuário podem ser substituídas.

### Referência completa

| Chave | Default |
|-------|---------|
| `avatarLoading` | `'Carregando avatar…'` |
| `avatarAriaLabel` | `'Avatar de Libras'` |
| `inputPlaceholder` | `'Digite uma mensagem…'` |
| `inputSendButton` | `'Enviar'` |
| `micStart` | `'🎤 Ouvir'` |
| `micStop` | `'⏹ Parar'` |

### Via `<LibrasProvider>` (global)

```tsx
import { LibrasProvider } from 'libras-kit';

<LibrasProvider
  config={{
    strings: {
      micStart: 'Iniciar tradução',
      micStop: 'Parar tradução',
      inputPlaceholder: 'Escreva ou fale...',
      avatarLoading: 'Carregando intérprete...',
    },
  }}
>
  <App />
</LibrasProvider>
```

### Via prop (componente específico)

```tsx
<LibrasAvatar
  strings={{
    inputPlaceholder: 'Escreva sua mensagem...',
    inputSendButton: 'Enviar',
  }}
/>
```

## Acessibilidade

### `A11yOptions`

```ts
interface A11yOptions {
  avatarLabel?: string;            // aria-label do container do avatar
  respectReducedMotion?: boolean;  // pausar animações se prefers-reduced-motion
}
```

O valor padrão de `avatarLabel` é `"Avatar de Libras"`. O `respectReducedMotion` é `true` por padrão — se o usuário configurou o sistema para reduzir movimento, as animações do avatar são pausadas.

```tsx
<LibrasProvider
  config={{
    a11y: {
      avatarLabel: 'Intérprete de Libras — Hozana',
      respectReducedMotion: true,
    },
  }}
>
  <App />
</LibrasProvider>
```

## `<LibrasProvider>` como ponto único de configuração

```tsx
import { LibrasProvider } from 'libras-kit';

function App() {
  return (
    <LibrasProvider
      config={{
        vlibras: {
          avatar: 'hozana',
          translatorUrl: '/api/vlibras-translate', // proxy local (self-hosting)
        },
        asr: { provider: 'webspeech', lang: 'pt-BR' },
        a11y: { avatarLabel: 'Intérprete de Libras' },
        strings: {
          micStart: 'Iniciar',
          inputPlaceholder: 'Escreva ou fale...',
        },
      }}
    >
      {/* qualquer <LibrasAvatar> descendente herda essa config */}
      <MinhaApp />
    </LibrasProvider>
  );
}
```

Props passadas diretamente a um componente sempre têm prioridade sobre o provider.
