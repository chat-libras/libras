# Customização

## Avatar

### Seleção de avatar

O VLibras oferece mais de um avatar. O padrão é Ícaro (masculino). Para usar Hozana (feminino):

```tsx
import { LibrasTranslator } from 'libras-translator';

<LibrasTranslator
  vlibras={{ avatar: 'hozana' }}
  audio={{ kind: 'microphone' }}
/>
```

Ou via provider global:

```tsx
import { LibrasProvider } from 'libras-translator';

<LibrasProvider config={{ vlibras: { avatar: 'hozana' } }}>
  <App />
</LibrasProvider>
```

O `avatar` é uma string passada diretamente para o player VLibras. Os valores confirmados são `'icaro'` e `'hozana'`; outros avatares do VLibras podem funcionar se o bundle os suportar.

## Velocidade de sinalização

### Via prop

```tsx
<LibrasTranslator speed={1.5} audio={{ kind: 'microphone' }} />
<LibrasChat speed={1.3} role="receiver" messages={[]} onSend={() => {}} />
```

O `speed` padrão nos componentes de chat é `1.3`. Em `<LibrasTranslator>` o padrão é `1`.

### Via hook

```tsx
import { useLibrasAvatar } from 'libras-translator';

function MeuAvatar() {
  const { containerRef, speed, setSpeed } = useLibrasAvatar({ speed: 1 });

  return (
    <div>
      <div ref={containerRef} style={{ width: 320, height: 240 }} />
      <input
        type="range"
        min={0.5}
        max={2}
        step={0.1}
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
      />
    </div>
  );
}
```

## Tematização com CSS (headless)

A lib não embarca nenhum CSS. Você estiliza os componentes usando as classes BEM e os atributos `data-*` que eles expõem.

### Seletores públicos

| Seletor | Elemento |
|---------|---------|
| `.libras-chat` | raiz do `<LibrasChat>` |
| `.libras-chat[data-role="sender"]` | lado do participante ouvinte |
| `.libras-chat[data-role="receiver"]` | lado do participante surdo |
| `.libras-chat__log` | área de histórico de mensagens |
| `.libras-chat__bubble` | cada bolha de mensagem |
| `.libras-chat__bubble[data-mine="true"]` | bolha própria (alinha à direita) |
| `.libras-chat__bubble[data-from="sender"]` | bolha enviada pelo sender |
| `.libras-chat__status[data-status="interim"]` | transcrição parcial ao vivo |
| `.libras-chat__status[data-status="error"]` | mensagem de erro |
| `.libras-chat__mic` | botão de microfone |
| `.libras-chat__mic[data-active="true"]` | microfone ativo |
| `.libras-chat__mic[aria-pressed="true"]` | alias acessível para microfone ativo |
| `.libras-chat__stage` | canvas do avatar |
| `.libras-translator` | raiz do `<LibrasTranslator>` |
| `.libras-translator__stage` | canvas do avatar (standalone) |
| `.libras-translator__overlay[data-status="loading"]` | overlay de carregamento |
| `.libras-translator__overlay[data-status="error"]` | overlay de erro |
| `.libras-translator__caption` | texto de legenda/interim |

### CSS custom properties (tokens)

Defina tokens em qualquer ancestral (`:root` ou no container do componente):

```css
:root {
  --libras-font:              system-ui, sans-serif;
  --libras-color-interim:     #a60;
  --libras-color-error:       crimson;
  --libras-color-bg-log:      #fff;
  --libras-color-border:      #eee;
  --libras-color-bubble-bg:   #eef1f4;
  --libras-color-bubble-mine-bg: #d7ebff;
  --libras-color-mic-on-bg:   #ffd7d7;
  --libras-color-stage-bg:    #111;
  --libras-radius-stage:      10px;
  --libras-radius-bubble:     10px;
}
```

### Arquivo de tema de referência

O repositório inclui `examples/demo/src/libras-default-theme.css` — um tema completo pronto para copiar. Copie para o seu projeto e customize os tokens e seletores.

```css
/* exemplo mínimo */
.libras-chat__bubble[data-mine="true"] {
  align-self: flex-end;
  background: var(--libras-color-bubble-mine-bg);
}

.libras-chat__mic[data-active="true"] {
  background: var(--libras-color-mic-on-bg);
}

.libras-chat__status[data-status="error"] {
  color: var(--libras-color-error);
  font-size: 13px;
}
```

### Via `className` e `style`

Todos os componentes aceitam `className` e `style` que são aplicados ao elemento raiz:

```tsx
<LibrasTranslator
  audio={{ kind: 'microphone' }}
  className="meu-avatar"
  style={{ borderRadius: 8, overflow: 'hidden' }}
/>
```

## Strings e i18n

Todas as strings visíveis ao usuário podem ser substituidas. Use `LibrasStrings` para adaptar o idioma ou o vocabulário de cada contexto.

### Via `<LibrasProvider>` (global)

```tsx
import { LibrasProvider, DEFAULT_STRINGS } from 'libras-translator';

<LibrasProvider
  config={{
    strings: {
      ...DEFAULT_STRINGS,
      buttonTranslate: 'Iniciar traducao',
      buttonStop: 'Parar',
      chatSenderPlaceholder: 'Digite ou fale...',
      chatMicStart: 'Ativar microfone',
      chatMicStop: 'Desativar microfone',
      avatarLoading: 'Carregando interprete...',
    },
  }}
>
  <App />
</LibrasProvider>
```

### Via prop (componente específico)

```tsx
<LibrasChat
  role="sender"
  messages={messages}
  onSend={handleSend}
  strings={{
    chatSenderPlaceholder: 'Escreva sua mensagem...',
    chatSendButton: 'Enviar',
  }}
/>
```

### Referência de todas as strings

| Chave | Descrição | Default |
|-------|-----------|---------|
| `avatarLoading` | Texto exibido enquanto o avatar carrega | `'Carregando avatar...'` |
| `captionPlaceholder` | Placeholder na área de legenda | `'Aguardando fala...'` |
| `buttonTranslate` | Botão de iniciar ASR | `'Traduzir'` |
| `buttonStop` | Botão de parar ASR | `'Parar'` |
| `buttonSubmitText` | Botão de enviar texto manual | `'Sinalizar'` |
| `buttonSpeedLabel` | Label do controle de velocidade | `'Velocidade'` |
| `chatSendButton` | Botão de enviar no chat | `'Enviar'` |
| `chatSenderPlaceholder` | Placeholder no campo do participante ouvinte (role='sender') | `'Digite ou fale...'` |
| `chatReceiverPlaceholder` | Placeholder no campo do participante surdo (role='receiver') | `'Digite sua resposta...'` |
| `chatMicStart` | Tooltip/label do botão de microfone (inativo) | `'Microfone'` |
| `chatMicStop` | Tooltip/label do botão de microfone (ativo) | `'Parar microfone'` |

Os defaults estão em `DEFAULT_STRINGS` (exportado de `'libras-translator'`).

## Acessibilidade

### `A11yOptions`

```ts
interface A11yOptions {
  avatarLabel?: string;            // aria-label do container do avatar
  respectReducedMotion?: boolean;  // pausar animacoes se prefers-reduced-motion
}
```

O valor padrão de `avatarLabel` é `"Avatar de Libras"`. O `respectReducedMotion` é `true` por padrão — se o usuário configurou o sistema para reduzir movimento, as animações do avatar são pausadas.

```tsx
<LibrasProvider
  config={{
    a11y: {
      avatarLabel: 'Interprete de Libras — Hozana',
      respectReducedMotion: true,
    },
  }}
>
  <App />
</LibrasProvider>
```

Ou diretamente no componente:

```tsx
<LibrasChat
  role="receiver"
  messages={messages}
  onSend={() => {}}
  a11y={{ avatarLabel: 'Interprete de Libras' }}
/>
```

## Visibilidade dos controles

`<LibrasTranslator>` exibe por padrão três controles: botão de iniciar/parar ASR, slider de velocidade e campo de texto para envio manual.

### Esconder todos

```tsx
<LibrasTranslator
  audio={{ kind: 'microphone' }}
  controls={false}
/>
```

### Esconder controles individuais

```tsx
<LibrasTranslator
  audio={{ kind: 'microphone' }}
  controls={{ start: true, speed: false, text: false }}
/>
```

| Chave | O que controla |
|-------|---------------|
| `start` | Botão de iniciar/parar a escuta |
| `speed` | Slider de velocidade de sinalização |
| `text` | Campo de texto para envio manual (sem ASR) |

## `<LibrasProvider>` como ponto único de configuração

Se você usa múltiplos componentes do plugin no mesmo app, `<LibrasProvider>` evita repetir as mesmas props em cada instância:

```tsx
import { LibrasProvider } from 'libras-translator';

function App() {
  return (
    <LibrasProvider
      config={{
        vlibras: {
          avatar: 'hozana',
          translatorUrl: '/api/vlibras-translate', // proxy local (self-hosting)
        },
        asr: { provider: 'webspeech', lang: 'pt-BR' },
        a11y: { avatarLabel: 'Interprete de Libras' },
        strings: {
          chatSenderPlaceholder: 'Escreva ou fale...',
        },
      }}
    >
      {/* qualquer <LibrasChat>, <LibrasTranslator>, etc. herda essa config */}
      <App />
    </LibrasProvider>
  );
}
```

Props passadas diretamente a um componente sempre têm prioridade sobre o provider.
