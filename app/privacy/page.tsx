import { LegalPage } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated={SITE.updated}>
      <p>
        {SITE.name} is a free, non-commercial hobby project run by {SITE.operator} ({SITE.location}). This page explains
        what personal data the site handles and what you can do about it. Questions: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>

      <h2>You can play without an account</h2>
      <p>All games work without signing in. Nothing is stored about you unless you choose to sign in.</p>

      <h2>What we collect when you sign in with Google</h2>
      <ul>
        <li>Your Google account name, email address and profile picture (received from Google when you sign in).</li>
        <li>A display name (defaults to your first name; you can change it) and your leaderboard preference.</li>
        <li>Your game activity: rounds played, scores, accuracy, XP, levels, day streak, the words you miss most, and your time zone (used to count streaks by your local day).</li>
      </ul>
      <p>We do not collect your Google password, contacts, or any other Google data.</p>

      <h2>Why we use it</h2>
      <ul>
        <li>To keep your progress, streak and stats across visits and devices.</li>
        <li>To show the public leaderboard, only if you opt in.</li>
        <li>To keep the service secure and prevent abuse (for example, limiting rounds saved per hour).</li>
      </ul>

      <h2>The leaderboard</h2>
      <p>
        You are off the leaderboard by default. If you switch it on in your profile, your display name and best scores become public.
        Your Google name, email and picture are never shown publicly.
      </p>

      <h2>Cookies</h2>
      <p>
        We use a single, strictly necessary, signed session cookie to keep you signed in. We run no advertising or tracking cookies and
        no third-party analytics.
      </p>

      <h2>Who processes your data</h2>
      <ul>
        <li>Google, for sign-in (<a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google Privacy Policy</a>).</li>
        <li>MongoDB Atlas, where account and game data are stored.</li>
        <li>
          AI providers (Google Gemini, Groq and Cerebras), used for the optional &ldquo;Why?&rdquo; explanations. Only the quiz item (a word, verb form or sentence) and the answer
          you picked are sent; never your name, email or account details. Explanations are cached so the same question is not sent twice.
        </li>
        <li>
          A speech-to-text service provider, which turns your voice into text when a signed-in player answers by voice in the Time game. Only that short
          recording is sent. We do not store the audio; we keep only a count of voice answers to enforce a daily limit. Players who are not signed in use
          their browser&apos;s own speech recognition instead, which may send audio to the browser maker (for example Google in Chrome).
        </li>
        <li>Vercel, which hosts the site and may keep standard server logs (such as IP address) for security and operations.</li>
      </ul>
      <p>These providers may process data on servers outside India. We do not sell your data or share it for advertising.</p>

      <h2>Retention and deletion</h2>
      <p>
        We keep your data until you delete your account. You can delete your account and all associated data at any time from your
        profile page; this is immediate and permanent. Server logs kept by Vercel follow Vercel&apos;s own retention.
      </p>

      <h2>Your rights</h2>
      <p>
        Under India&apos;s Digital Personal Data Protection Act, 2023 and, where it applies to you, the GDPR, you may ask to access,
        correct or erase your data, or withdraw consent. You can edit your display name and leaderboard setting and delete your
        account yourself on the profile page, or email us for anything else. We will respond within a reasonable time.
      </p>

      <h2>Children</h2>
      <p>Accounts are meant for people aged 18 or over, or younger users with a parent or guardian&apos;s consent. We do not knowingly collect data from children without it. If you think a child has signed up, contact us and we will delete the account.</p>

      <h2>Security</h2>
      <p>We use HTTPS, restricted database access and Google&apos;s sign-in so we never see your password. No system is perfectly secure, so we cannot guarantee absolute security.</p>

      <h2>Changes</h2>
      <p>If this policy changes, we will update the date above. Continued use after a change means you accept the updated policy.</p>

      <h2>Grievance contact</h2>
      <p>{SITE.operator}, {SITE.location}. Email: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.</p>
    </LegalPage>
  );
}
