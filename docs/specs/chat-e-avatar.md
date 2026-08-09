# Spec: Chat e Avatar — Formas de Uso

## O que é

O plugin oferece duas formas de exibir o avatar VLibras e o chat assimétrico, com níveis
diferentes de controle pelo app consumidor.

---

## Spec 1 — Avatar com posição livre (`useLibrasTranslator`)

### O que resolve

O avatar VLibras precisa ser renderizado em um `<div>` que o app controla — posição, tamanho
e z-index são 100% CSS do app. O plugin não impõe nenhum layout.

### Como funciona

O hook retorna `containerRef` — um callback ref que você attacha em qualquer `<div>`:

```typescript
const libras = useLibrasTranslator({
  audio: { kind: 'stream', stream: remoteStream },
  asr:   { provider: 'custom', factory: meuASRFactory },
});
```

```tsx
// O avatar aparece aqui — posicione com CSS como quiser
<div ref={libras.containerRef} className="meu-avatar" />
```

### API completa do hook

| Campo | Tipo | Uso |
|---|---|---|
| `containerRef` | `RefCallback<HTMLDivElement>` | Attachar em qualquer `<div>` |
| `status` | `'loading' \| 'ready' \| 'listening' \| 'error'` | Feedback visual |
| `error` | `string \| null` | Mensagem de erro |
| `interim` | `string` | Transcrição parcial ao vivo |
| `translate(text)` | `(text: string) => void` | Alimentar texto sem ASR |
| `start() / stop()` | `() => void` | Controle manual do ASR |
| `speed / setSpeed` | `number / (n) => void` | Velocidade da sinalização |

### Variantes de uso

**Avatar-only, sem ASR (texto manual):**
```tsx
const avatar = useLibrasAvatar();  // sem captura de áudio

// Alimenta o avatar com texto de qualquer fonte
avatar.translate('Bom dia');

<div ref={avatar.containerRef} />
```

**Com ASR, autoStart:**
```tsx
const libras = useLibrasTranslator({
  audio: { kind: 'microphone' },
  autoStart: true,  // começa a ouvir assim que o avatar carrega
});
```

**Com legenda ao vivo sobre o avatar:**
```tsx
<div className="avatar-wrapper">
  <div ref={libras.containerRef} />
  {libras.interim && <p className="legenda">{libras.interim}</p>}
</div>
```

### Critérios de aceite

- `containerRef` em qualquer `<div>` renderiza o avatar corretamente
- Desmontar e remontar o `<div>` não reinicializa o player VLibras (singleton)
- `status` percorre `loading → ready → listening → ready` na ordem correta
- O plugin não adiciona `position`, `width` ou `height` ao container

---

## Spec 2 — Chat assimétrico controlado (`<LibrasChat>`)

### O que resolve

Chat entre dois lados assimétricos: um lado fala/digita (speaker) e o outro é surdo e vê
o avatar sinalizar. O app controla o histórico de mensagens e o transporte.

### Quando usar

Quando o app já tem sua própria camada de transporte (WebSocket, Firebase, etc.) e quer
controle total sobre o estado de mensagens — sincronização com banco de dados, persistência,
timestamps customizados.

### Como funciona

`<LibrasChat>` é um componente **controlado**: o pai gerencia `messages[]` e conecta `onSend`
ao transporte.

```typescript
// Lado sender (quem fala/digita)
<LibrasChat
  role="sender"
  messages={messages}
  onSend={(text) => {
    setMessages(m => [...m, { id: crypto.randomUUID(), from: 'sender', text }]);
    meuTransporte.enviar(text);
  }}
  audio={{ kind: 'microphone' }}
/>

// Lado receiver (surdo — ve o avatar sinalizar)
<LibrasChat
  role="receiver"
  messages={messages}
  onSend={(text) => {
    setMessages(m => [...m, { id: crypto.randomUUID(), from: 'receiver', text }]);
    meuTransporte.enviar(text);
  }}
/>
```

### Props principais

| Prop | Tipo | Obrigatória | Descrição |
|---|---|---|---|
| `role` | `'sender' \| 'receiver'` | Sim | `sender` = participante que fala/digita; `receiver` = participante surdo (ve em Libras). |
| `messages` | `LibrasChatMessage[]` | Sim | Histórico completo — gerenciado pelo pai |
| `onSend` | `(text: string) => void` | Sim | Chamado ao enviar; ligue ao transporte |
| `audio` | `AudioSource` | Não | Fonte de áudio (lado sender). Default: microfone |
| `asr` | `ASROptions` | Não | Motor de ASR. Default: Web Speech |
| `speed` | `number` | Não | Velocidade do avatar. Default: 1.3 |
| `labels` | `{ sender?: string; receiver?: string }` | Não | Labels das bolhas |
| `className` / `style` | — | Não | Posicionamento — controlado pelo app |

### Chat opcional (sem chat)

Quando o app não usa chat — só avatar — basta não montar `<LibrasChat>` e usar
`useLibrasTranslator` diretamente (Spec 1).

### Chat togglável

```tsx
const [showChat, setShowChat] = useState(false);

{showChat && (
  <LibrasChat role="receiver" messages={messages} onSend={handleSend} />
)}
```

Montar/desmontar `<LibrasChat>` não afeta o avatar (player VLibras é singleton).

### Critérios de aceite

- `role="sender"` renderiza campo de texto + botão de microfone + log de mensagens
- `role="receiver"` renderiza avatar VLibras + campo de texto para resposta + log
- `className` e `style` controlam todo o posicionamento sem override do plugin
- Remontar o componente com o mesmo `messages[]` restaura o histórico

---

## Spec 3 — Chat drop-in autogerenciado (`<LibrasChatPanel>`)

### O que resolve

Quando o app não quer gerenciar o array de mensagens — só quer colocar o componente na
página e conectar ao transporte com o mínimo de código.

### Quando usar

Integração rápida onde o transporte é simples (socket.io, WebSocket) e não há necessidade
de persistência ou controle fino do histórico.

### Como funciona

`<LibrasChatPanel>` é **autogerenciado**: gerencia `messages[]` internamente. O app só
passa `incomingMessage` (string do outro lado) e `onMessage` (callback para o transporte).

```typescript
// Lado speaker
<LibrasChatPanel
  role="speaker"
  incomingMessage={ultimaMensagemRecebida}
  onMessage={(text) => meuSocket.emit('msg', text)}
/>

// Lado listener (surdo)
<LibrasChatPanel
  role="listener"
  incomingMessage={ultimaMensagemRecebida}
  onMessage={(text) => meuSocket.emit('msg', text)}
/>
```

### Como conectar ao transporte

```tsx
const [incoming, setIncoming] = useState('');

useEffect(() => {
  meuSocket.on('msg', setIncoming);          // cada nova string → nova mensagem no log
  return () => meuSocket.off('msg', setIncoming);
}, []);

<LibrasChatPanel
  role="listener"
  incomingMessage={incoming}
  onMessage={(text) => meuSocket.emit('msg', text)}
/>
```

### Props principais

| Prop | Tipo | Obrigatória | Descrição |
|---|---|---|---|
| `role` | `'speaker' \| 'listener'` | Sim | `speaker` = capta áudio/digita; `listener` = vê avatar |
| `incomingMessage` | `string` | Não | Cada nova string vira uma mensagem no log |
| `onMessage` | `(text: string) => void` | Não | Chamado ao enviar; conecte ao transporte |
| `labels` | `{ speaker?: string; listener?: string }` | Não | Labels das bolhas. Default: `'Professor'` / `'Aluno'` |
| `audio` | `AudioSource` | Não | Fonte de áudio (lado speaker). Default: microfone |
| `asr` | `ASROptions` | Não | Motor de ASR. Default: Web Speech |
| `speed` | `number` | Não | Velocidade do avatar. Default: 1.3 |
| `className` / `style` | — | Não | Posicionamento |

### Diferença em relação ao `<LibrasChat>`

| | `<LibrasChat>` | `<LibrasChatPanel>` |
|---|---|---|
| Estado de mensagens | No pai | Interno |
| Props obrigatórias | `messages`, `onSend` | só `role` |
| Controle do histórico | Total | Nenhum |
| Persistência | Responsabilidade do pai | Não persiste (reinicia ao remontar) |
| Quando usar | Transporte complexo, persistência, timestamps | Integração rápida |

### Critérios de aceite

- `<LibrasChatPanel role="speaker" />` funciona com zero props além de `role`
- Cada mudança de valor em `incomingMessage` adiciona exatamente uma mensagem
- A mesma string repetida consecutivamente não duplica a mensagem
- `onMessage` é opcional — omitir cria chat local sem transporte
- Remontar reinicia o histórico interno

---

## Spec 4 — Configuração global (`<LibrasProvider>`)

### O que resolve

Evita repetir `vlibras`, `asr` e `audio` em cada componente quando o app usa o plugin em
múltiplas telas com a mesma configuração.

### Como funciona

```tsx
<LibrasProvider config={{
  vlibras: { avatar: 'hozana' },
  audio:   { kind: 'microphone' },
  asr:     { provider: 'webspeech', lang: 'pt-BR' },
}}>
  <App />
</LibrasProvider>
```

Props locais nos componentes sobrescrevem o provider. Componentes sem props usam o provider.
Sem `<LibrasProvider>`, todos os defaults do plugin se aplicam.

### Critérios de aceite

- Opt-in: funciona sem `<LibrasProvider>`
- Hierarquia: prop local > provider > default do plugin
- Múltiplos `<LibrasProvider>` aninhados se comportam como Context React padrão (mais próximo vence)
