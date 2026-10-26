// Mot de passe oublié en — conversion de mot_de_passe_oublie.php (vague C).

import type { Metadata } from "next";
import PasswordReset from "@/components/mot-de-passe-oublie/PasswordReset";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("en").shared;

const title = 'Forgot password | FEDPAWA CORPORATE SOLUTIONS';
const description = 'Reset your FEDPAWA Client Portal password: verification code by email, new secure password.';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: true },
  alternates: {
    canonical: "/en/mot-de-passe-oublie",
    languages: {
      fr: SITE_URL + "/mot-de-passe-oublie",
      en: SITE_URL + "/en/mot-de-passe-oublie",
      "x-default": SITE_URL + "/mot-de-passe-oublie",
    },
  },
};

export default function EnForgotPasswordPage() {
  return <PasswordReset locale="en" />;
}
