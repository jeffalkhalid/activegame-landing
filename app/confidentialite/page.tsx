import type { Metadata } from 'next';
import Link from 'next/link';
import { LEGAL } from '@/lib/legal';
import { LegalHero, Section, Sub, Callout } from '../legal-ui';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — PAG MATCH',
  description: 'Comment PAG MATCH (Padel Active Game) collecte, utilise et protège vos données personnelles.',
};

export default function Confidentialite() {
  return (
    <>
      <LegalHero
        kicker="Vie privée"
        title="Politique de confidentialité"
        sub="Vos données vous appartiennent. Voici, en clair, ce que nous collectons, pourquoi, et comment vous gardez le contrôle."
      />

      <main className="container legal-body">
        <p style={{ color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
          La présente politique décrit comment l’application <strong style={{ color: 'var(--text)' }}>{LEGAL.appName}</strong>{' '}
          (marque <strong style={{ color: 'var(--text)' }}>{LEGAL.brand}</strong>) traite vos données
          personnelles, conformément à la loi marocaine n° 09-08 relative à la protection des
          personnes physiques à l’égard du traitement des données à caractère personnel.
        </p>

        <Section n={1} icon="👤" title="Qui est responsable ?">
          <p>
            Le responsable du traitement est <strong>{LEGAL.responsable}</strong>. Une question, une
            demande sur vos données ? Écrivez-nous à <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
          </p>
        </Section>

        <Section n={2} icon="🗂️" title="Ce que nous collectons">
          <p>Uniquement ce qui sert à faire fonctionner le jeu et la communauté :</p>
          <div className="tags">
            <span className="tag">E-mail</span>
            <span className="tag">Pseudo / nom</span>
            <span className="tag">Niveau &amp; ELO</span>
            <span className="tag">Historique de matchs</span>
            <span className="tag">Messages &amp; réactions</span>
            <span className="tag">Activités communautaires</span>
            <span className="tag">Jeton de notification</span>
            <span className="tag">Données techniques</span>
          </div>
          <p style={{ marginTop: 16 }}>
            Les <strong>Stories</strong> sont générées sur votre appareil et partagées par vos soins :
            nous ne collectons ni ne stockons aucune photo ou vidéo sur nos serveurs.
          </p>
        </Section>

        <Section n={3} icon="🎯" title="Pourquoi nous l’utilisons">
          <ul>
            <li>Créer et gérer votre compte et votre profil.</li>
            <li>Organiser les parties, le matchmaking, le classement ELO et les défis.</li>
            <li>Faire vivre la messagerie et la communauté.</li>
            <li>Vous envoyer les notifications liées à vos parties.</li>
            <li>Sécuriser le service et prévenir la fraude et les abus.</li>
            <li>Respecter nos obligations légales.</li>
          </ul>
        </Section>

        <Section n={4} icon="⚖️" title="Sur quelle base">
          <p>
            Nous traitons vos données pour <strong>exécuter le service</strong> que vous demandez, avec
            votre <strong>consentement</strong> (notamment notifications et contenus publiés) et au
            titre de notre <strong>intérêt légitime</strong> à sécuriser la plateforme. Vous pouvez
            retirer votre consentement à tout moment.
          </p>
        </Section>

        <Section n={5} icon="🤝" title="Avec qui nous les partageons">
          <p>Nous ne vendons pas vos données. Pour faire tourner le service, nous faisons appel à des prestataires de confiance :</p>
          <div className="subs">
            <Sub logo="S"  color="#3ecf8e" name="Supabase" role="Base de données & comptes" />
            <Sub logo="E"  color="#ffffff" name="Expo" role="Relais des notifications push" />
            <Sub logo="🤖" color="#ff7a00" name="Google FCM" role="Notifications Android" />
            <Sub logo="" color="#a1a1aa" name="Apple APNs" role="Notifications iOS" />
            <Sub logo="☁︎" color="#38bdf8" name="Cloudflare" role="Protection anti-robot (Turnstile)" />
          </div>
        </Section>

        <Section n={6} icon="🌍" title="Hébergement hors du Maroc">
          <p>
            Ces prestataires hébergent et traitent les données <strong>en dehors du Maroc</strong>.
            Nos données applicatives sont hébergées par Supabase dans la région{' '}
            <strong>{LEGAL.supabaseRegion}</strong>.
          </p>
          <Callout icon="🌍">
            Ces transferts sont nécessaires au fonctionnement du service. Nos prestataires appliquent
            des garanties contractuelles et techniques reconnues pour protéger vos données.
          </Callout>
        </Section>

        <Section n={7} icon="⏳" title="Combien de temps">
          <p>
            Vos données sont conservées tant que votre compte est actif. À sa suppression, vos données
            personnelles sont effacées ou anonymisées dans un délai raisonnable, sous réserve des
            durées imposées par la loi.
          </p>
        </Section>

        <Section n={8} icon="🛡️" title="Vos droits">
          <p>Conformément à la loi 09-08, vous disposez des droits d’accès, de rectification, d’opposition et de suppression :</p>
          <ul>
            <li>Modifiez vos informations directement dans l’application.</li>
            <li>Supprimez votre compte depuis les réglages — vos données associées sont effacées ou anonymisées.</li>
            <li>Exercez vos autres droits en écrivant à <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.</li>
          </ul>
        </Section>

        <Section n={9} icon="🔒" title="Sécurité">
          <p>
            Les échanges sont chiffrés en transit (HTTPS). L’accès aux données est cloisonné par des
            règles de sécurité au niveau de la base (Row Level Security) : chacun n’accède qu’à ce qui
            le concerne, et les messages d’une partie ne sont visibles que par ses participants.
          </p>
        </Section>

        <Section n={10} icon="🔞" title="Mineurs">
          <p>
            Le service est destiné aux personnes d’au moins <strong>{LEGAL.minAge} ans</strong>. En
            dessous, l’accord d’un parent ou tuteur légal est requis.
          </p>
        </Section>

        <Section n={11} icon="📢" title="Réclamation (CNDP)">
          <p>
            Vous pouvez saisir la Commission Nationale de contrôle de la protection des Données à
            caractère Personnel (CNDP) au Maroc : <a href="https://www.cndp.ma">www.cndp.ma</a>.
          </p>
        </Section>

        <Section n={12} icon="🔄" title="Mises à jour">
          <p>
            Nous pouvons faire évoluer cette politique. En cas de changement important, nous vous en
            informerons. La date en haut de page indique la dernière révision.
          </p>
        </Section>

        <div className="legal-foot">
          Besoin des règles d’utilisation ? Consultez nos{' '}
          <Link href="/cgu">Conditions d’utilisation</Link>.
        </div>
      </main>
    </>
  );
}
