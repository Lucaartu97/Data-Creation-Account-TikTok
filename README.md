# Data-Creation-Account-TikTok

# TikTok Account Age — data di creazione da console

Snippet JavaScript da incollare nella console del browser per stimare la **data di registrazione di un account TikTok pubblico**, partendo dal suo ID utente.

Non serve installare niente, non serve un'API key e non c'è bisogno di essere loggati: basta la pagina pubblica del profilo.

---

## Come funziona

Gli account TikTok creati più o meno dal 2016 in poi hanno un ID numerico di 19 cifre generato in stile *Snowflake*. I **32 bit più alti** dell'ID contengono il timestamp Unix (in secondi) del momento in cui l'account è stato creato.

```
data_creazione = ID_utente >> 32   (secondi Unix)
```

Lo script:

1. legge l'ID utente dal JSON che TikTok inserisce nella pagina (`<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__">`);
2. se non lo trova lì, cerca un ID di 17–20 cifre direttamente nell'HTML;
3. sposta l'ID di 32 bit a destra con `BigInt` e converte il risultato in una data;
4. se TikTok espone anche il campo `createTime`, lo mostra accanto per confronto.

---

## Utilizzo

1. Apri il profilo: `https://www.tiktok.com/@nomeutente`
2. Premi **F5** per caricare la pagina da zero (vedi *Limiti*).
3. Apri gli strumenti per sviluppatori (**F12**, oppure `Ctrl+Shift+J` / `Cmd+Option+J`) e vai su **Console**.
4. Incolla lo snippet qui sotto e premi **Invio**.

> Chrome potrebbe chiederti di scrivere `allow pasting` prima di accettare il codice incollato. È un avviso di sicurezza standard.

### Snippet

```js
(() => {
  let user = null;
  try {
    const raw = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__')?.textContent;
    user = JSON.parse(raw).__DEFAULT_SCOPE__['webapp.user-detail'].userInfo.user;
  } catch (e) {}

  let id = user?.id;
  if (!id) {
    const m = document.documentElement.innerHTML.match(/"id":"(\d{17,20})"/);
    id = m?.[1];
  }
  if (!id) return console.error('ID utente non trovato: ricarica la pagina del profilo (F5) e riprova.');

  const ts = Number(BigInt(id) >> 32n);
  const fromId = new Date(ts * 1000);
  const fromApi = user?.createTime ? new Date(user.createTime * 1000) : null;

  console.table({
    username: user?.uniqueId ?? '(n/d)',
    userId: id,
    'creazione (da ID)': fromId.toLocaleString('it-IT', { timeZone: 'Europe/Rome' }),
    'createTime (API)': fromApi ? fromApi.toLocaleString('it-IT', { timeZone: 'Europe/Rome' }) : '(non esposto)'
  });
})();
```

### Output di esempio

| (index)           | Value                  |
|-------------------|------------------------|
| username          | nomeutente             |
| userId            | 6812345678901234567    |
| creazione (da ID) | 12/4/2020, 18:22:05    |
| createTime (API)  | (non esposto)          |

---

## Calcolo manuale

Se hai già l'ID utente, per esempio preso da un URL o dal codice sorgente della pagina, ti basta una riga:

```js
new Date(Number(BigInt('6812345678901234567') >> 32n) * 1000).toLocaleString('it-IT')
```

---

## Limiti

- **Account molto vecchi:** gli account creati prima del 2016 circa, molti dei quali ereditati da Musical.ly, hanno ID corti che non contengono il timestamp. In quel caso la data risulterà assurda, per esempio nel 1970.
- **Navigazione interna (SPA):** se sei arrivato al profilo cliccando dentro TikTok, senza ricaricare la pagina, il JSON può ancora riferirsi alla pagina precedente. Premi sempre **F5** sul profilo prima di lanciare lo script.
- **`createTime`:** di solito vale `0` o non è presente. La data affidabile è quella ricavata dall'ID.
- **Struttura della pagina:** TikTok cambia periodicamente il nome e la forma del JSON incorporato. Se il percorso `__DEFAULT_SCOPE__['webapp.user-detail']` smette di funzionare, il fallback con la regex di solito trova comunque l'ID.
- **Precisione:** la data corrisponde al momento in cui è stato generato l'ID, cioè la creazione dell'account. Non indica quando è stato pubblicato il primo video.

---

## Note

Lo script legge soltanto dati già visibili pubblicamente nella pagina del profilo: non invia richieste, non usa autenticazione e non modifica niente. Usalo nel rispetto dei Termini di servizio di TikTok e della privacy altrui.
