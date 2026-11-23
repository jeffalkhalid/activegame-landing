import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { APP_STORE_PUB, PLAY_PUB } from './telecharger';
import { LEGAL } from './legal';

/*
 * L'aiguillage de /telecharger vit dans vercel.json (le site est statique).
 * Ces tests lisent le VRAI vercel.json et appliquent ses règles comme Vercel :
 * première règle qui passe ; `has` et `missing` sont des expressions ancrées
 * (^…$) ; les groupes nommés d'une condition remplissent les :nom de la
 * destination. Aucune règle → la page de repli (null). La vérification finale
 * reste un curl sur l'aperçu Vercel.
 */
type Cond = { type: 'header' | 'query'; key: string; value?: string };
type Regle = { source: string; destination: string; statusCode?: number; has?: Cond[]; missing?: Cond[] };

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')) as { redirects: Regle[] };
const regles = config.redirects.filter((r) => r.source.startsWith('/telecharger'));

function lire(c: Cond, ua: string, q: URLSearchParams): string | null {
  return c.type === 'header' ? (c.key === 'user-agent' ? ua : null) : q.get(c.key);
}
function correspond(c: Cond, ua: string, q: URLSearchParams): Record<string, string> | null {
  const v = lire(c, ua, q);
  if (v == null) return null;
  if (!c.value) return {};
  const m = v.match(new RegExp(`^${c.value}$`));
  return m ? { ...(m.groups ?? {}) } : null;
}

function aiguiller(ua: string, query = ''): { statut: number; vers: string } | null {
  const q = new URLSearchParams(query);
  for (const r of regles) {
    const groupes: Record<string, string> = {};
    const ok = (r.has ?? []).every((c) => {
      const g = correspond(c, ua, q);
      if (g) Object.assign(groupes, g);
      return g !== null;
    });
    if (!ok || (r.missing ?? []).some((c) => correspond(c, ua, q) !== null)) continue;
    return { statut: r.statusCode ?? 307, vers: r.destination.replace(/:(\w+)/g, (t, n) => groupes[n] ?? t) };
  }
  return null;
}

const UA = {
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.153 Mobile/15E148 Safari/604.1',
  iphoneYoutube: 'com.google.ios.youtube/19.29.1 (iPhone14,5; U; CPU iOS 17_5_1 like Mac OS X; fr_FR)',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  androidChrome: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  samsung: 'Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36',
  cubot: 'Mozilla/5.0 (Linux; Android 10; CUBOT_X30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  chromeWindows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  safariMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  googlebotMobile: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.126 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  adsbotMobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1 (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)',
  inspection: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 (compatible; Google-InspectionTool/1.0;)',
  facebook: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
};

test('iPhone et iPad → App Store en 302', () => {
  for (const ua of [UA.iphoneSafari, UA.iphoneChrome, UA.iphoneYoutube, UA.ipad]) {
    assert.deepEqual(aiguiller(ua), { statut: 302, vers: APP_STORE_PUB }, ua);
  }
});

test('Android (Chrome, Samsung Internet, marque Cubot) → Google Play en 302', () => {
  for (const ua of [UA.androidChrome, UA.samsung, UA.cubot]) {
    assert.deepEqual(aiguiller(ua), { statut: 302, vers: PLAY_PUB }, ua);
  }
});

test('ordinateurs, robots (même déguisés en mobile), user-agent vide → page de repli', () => {
  for (const ua of [UA.chromeWindows, UA.safariMac, UA.googlebot, UA.googlebotMobile, UA.adsbotMobile, UA.inspection, UA.facebook, '']) {
    assert.equal(aiguiller(ua), null, ua || '(vide)');
  }
});

test('utm_campaign : ct= pour l’App Store, dans le referrer pour Google Play', () => {
  const q = 'utm_source=google&utm_medium=cpc&utm_campaign=21987654321&gclid=EAIaIQ';
  assert.equal(aiguiller(UA.iphoneSafari, q)?.vers, `${APP_STORE_PUB}?ct=21987654321`);
  assert.equal(aiguiller(UA.androidChrome, q)?.vers, `${PLAY_PUB}%26utm_campaign%3D21987654321`);
});

test('campagne au format inattendu (espace, trop longue) → lien sans campagne, jamais cassé', () => {
  for (const c of ['Padel%20Maroc', 'x'.repeat(41), '']) {
    assert.equal(aiguiller(UA.iphoneSafari, `utm_campaign=${c}`)?.vers, APP_STORE_PUB, c);
    assert.equal(aiguiller(UA.samsung, `utm_campaign=${c}`)?.vers, PLAY_PUB, c);
  }
});

test('vercel.json et la page de repli pointent vers la même app que le reste du site', () => {
  const id = LEGAL.appStoreUrl.match(/id(\d+)/)?.[1];
  assert.ok(id && APP_STORE_PUB.endsWith(`/id${id}`));
  assert.ok(PLAY_PUB.startsWith(LEGAL.playStoreUrl));
  for (const r of regles) assert.ok(r.destination.startsWith(APP_STORE_PUB) || r.destination.startsWith(PLAY_PUB), r.destination);
});

test('les liens universels de l’app ne prennent pas /telecharger', () => {
  const aasa = JSON.parse(readFileSync(new URL('../public/.well-known/apple-app-site-association', import.meta.url), 'utf8'));
  const motifs: string[] = aasa.applinks.details.flatMap((d: { components: { '/': string }[] }) => d.components.map((c) => c['/']));
  for (const m of motifs) {
    const re = new RegExp(`^${m.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`);
    assert.ok(!re.test('/telecharger') && !re.test('/telecharger/'), m);
  }
});
