import type { Metadata } from 'next';
import Link from 'next/link';
import { LEGAL } from '@/lib/legal';
import { LegalHero, Section, Callout } from '../legal-ui';

export const metadata: Metadata = {
  title: 'Conditions d’utilisation — PAG MATCH',
  description: 'Conditions Générales d’Utilisation de l’application PAG MATCH (Padel Active Game).',
};

export default function Cgu() {
  return (
    <>
      <LegalHero
        kicker="Règles du jeu"
        title="Conditions d’utilisation"
        sub="Les règles qui rendent l’expérience juste et agréable pour toute la communauté padel."
      />

      <main className="container legal-body">
        <p style={{ color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
          Les présentes Conditions Générales d’Utilisation (« CGU ») régissent l’accès et l’utilisation
          de l’application <strong style={{ color: 'var(--text)' }}>{LEGAL.appName}</strong>{' '}
          (le « Service », marque <strong style={{ color: 'var(--text)' }}>{LEGAL.brand}</strong>),
          éditée par <strong style={{ color: 'var(--text)' }}>{LEGAL.editor}</strong>. En créant un
          compte, vous acceptez ces CGU.
        </p>

        <Section n={1} icon="🎾" title="Le Service">
          <p>
            {LEGAL.brand} met en relation les joueurs de padel : organisation de parties, matchmaking,
            classement ELO, défis, messagerie et communauté. Nous facilitons l’organisation entre
            joueurs, mais ne garantissons ni la disponibilité d’un terrain, ni la présence effective
            des participants.
          </p>
        </Section>

        <Section n={2} icon="🪪" title="Compte & éligibilité">
          <ul>
            <li>Vous devez avoir au moins <strong>{LEGAL.minAge} ans</strong> (accord d’un parent ou tuteur si mineur).</li>
            <li>Vos informations doivent être exactes et tenues à jour.</li>
            <li>Vous êtes responsable de vos identifiants et de l’activité sur votre compte.</li>
            <li>Un seul compte par personne ; l’usurpation d’identité est interdite.</li>
          </ul>
        </Section>

        <Section n={3} icon="🤝" title="Règles de conduite">
          <p>En utilisant le Service, vous vous engagez à ne pas :</p>
          <ul>
            <li>publier de contenus illégaux, haineux, violents, harcelants, diffamatoires ou sexuels ;</li>
            <li>usurper l’identité d’un tiers ou tromper les autres joueurs ;</li>
            <li>fausser les scores, le classement ELO ou manipuler le système ;</li>
            <li>collecter les données d’autres utilisateurs sans leur consentement ;</li>
            <li>perturber le service, contourner la sécurité ou en faire un usage automatisé non autorisé.</li>
          </ul>
        </Section>

        <Section n={4} icon="📸" title="Vos contenus">
          <p>
            Vous restez responsable de ce que vous publiez (Stories, photos/vidéos, messages,
            commentaires) et garantissez en détenir les droits. Vous nous accordez une licence limitée
            et non exclusive, aux seules fins de faire fonctionner le Service.
          </p>
        </Section>

        <Section n={5} icon="🚫" title="Tolérance zéro">
          <p>
            Aucun contenu répréhensible ni comportement abusif n’est toléré. Nous pouvons retirer tout
            contenu signalé et suspendre ou supprimer le compte d’un contrevenant.
          </p>
          <Callout icon="⏱️" warn>
            Les contenus signalés sont examinés et, le cas échéant, retirés dans un délai raisonnable
            (objectif : sous 24 h).
          </Callout>
        </Section>

        <Section n={6} icon="🛑" title="Signalement & blocage">
          <ul>
            <li>Signalez un contenu ou un utilisateur abusif directement depuis l’application.</li>
            <li>Bloquez un utilisateur pour ne plus interagir avec lui ni voir ses contenus.</li>
          </ul>
        </Section>

        <Section n={7} icon="🏆" title="Parties, scores & classement">
          <p>
            Les résultats et l’évolution du classement ELO sont calculés automatiquement à partir des
            scores saisis et validés par les participants. Un mécanisme de contestation est prévu en cas
            de litige. Toute fraude répétée peut entraîner des sanctions.
          </p>
        </Section>

        <Section n={8} icon="©️" title="Propriété intellectuelle">
          <p>
            Le Service, sa marque, son interface et ses contenus (hors contenus utilisateurs)
            appartiennent à l’éditeur et sont protégés. Toute reproduction sans accord préalable est
            interdite.
          </p>
        </Section>

        <Section n={9} icon="⚠️" title="Responsabilité">
          <p>
            Le Service est fourni « en l’état », sans garantie de disponibilité continue. Dans les
            limites permises par la loi, l’éditeur n’est pas responsable des interactions entre
            utilisateurs, des contenus de tiers, ni des dommages indirects liés à l’utilisation du
            Service.
          </p>
        </Section>

        <Section n={10} icon="🚪" title="Suspension & résiliation">
          <p>
            Vous pouvez supprimer votre compte à tout moment depuis les réglages. Nous pouvons suspendre
            ou résilier votre accès en cas de violation des présentes CGU.
          </p>
        </Section>

        <Section n={11} icon="🔐" title="Données personnelles">
          <p>
            Le traitement de vos données est détaillé dans notre{' '}
            <Link href="/confidentialite">Politique de confidentialité</Link>.
          </p>
        </Section>

        <Section n={12} icon="🔄" title="Modifications">
          <p>
            Nous pouvons modifier ces CGU. En cas de changement important, nous vous en informerons. La
            date en haut de page indique la dernière révision.
          </p>
        </Section>

        <Section n={13} icon="⚖️" title="Droit applicable">
          <p>
            Les présentes CGU sont régies par le droit marocain. Tout litige relève des juridictions
            compétentes, sous réserve des dispositions légales protectrices applicables.
          </p>
        </Section>

        <Section n={14} icon="✉️" title="Contact">
          <p>Une question sur ces CGU ? <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.</p>
        </Section>

        <div className="legal-foot">
          Découvrez aussi notre <Link href="/confidentialite">Politique de confidentialité</Link>.
        </div>
      </main>
    </>
  );
}
