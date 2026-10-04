import { LegalPage } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated={SITE.updated}>
      <p>By using {SITE.name} ({SITE.url}) you agree to these terms. If you do not agree, please do not use the site.</p>

      <h2>The service</h2>
      <p>{SITE.name} is a free, non-commercial project for practising German. It is provided by {SITE.operator}, {SITE.location}, as is and as available. Content may contain mistakes, so do not rely on it for exams or official purposes.</p>

      <h2>Accounts</h2>
      <ul>
        <li>Sign-in is through Google. You are responsible for activity on your account.</li>
        <li>You must be 18 or over, or have a parent or guardian&apos;s consent.</li>
        <li>You can delete your account at any time from your profile page.</li>
      </ul>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not cheat the leaderboard: no automation, scripts or submitting fake scores.</li>
        <li>Do not choose display names that are offensive, hateful, impersonate others or contain personal information.</li>
        <li>Do not attack, overload, scrape or try to break into the service.</li>
      </ul>
      <p>We may remove display names or scores, suspend accounts, or reset leaderboard entries that break these rules, without notice.</p>

      <h2>Intellectual property</h2>
      <p>The site design, code and game content belong to the operator unless noted otherwise. Third-party names and trademarks (such as Google) belong to their owners. Please do not copy the site&apos;s content for commercial use.</p>

      <h2>No warranty and limitation of liability</h2>
      <p>The service is provided without warranties of any kind. To the extent permitted by law, we are not liable for any loss arising from your use of, or inability to use, the site, including loss of scores, streaks or progress.</p>

      <h2>Changes and availability</h2>
      <p>We may change, pause or discontinue the service, or update these terms, at any time. The date above shows the latest version.</p>

      <h2>Privacy</h2>
      <p>How we handle personal data is described in the <a href="/privacy">Privacy Policy</a>.</p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India, and the courts at Bengaluru, Karnataka have jurisdiction, subject to any mandatory consumer rights you have.</p>

      <h2>Contact</h2>
      <p><a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a></p>
    </LegalPage>
  );
}
