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
