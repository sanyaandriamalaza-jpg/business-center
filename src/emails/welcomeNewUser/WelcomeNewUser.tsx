import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { CompanyInfoForEmail } from "../../lib/type";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const WelcomeNewUser = ({
  logoUrl,
  firstName,
  companyInfoSummary,
  email,
  password,
}: {
  logoUrl?: string | null;
  firstName: string;
  companyInfoSummary: CompanyInfoForEmail;
  email?: string | null;
  password?: string | null;
}) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Bienvenue, la création de votre compte est un succès!</Preview>
      <Container style={container}>
        <Section style={box}>
          {logoUrl ? (
            <Img
              src={logoUrl}
              width="49"
              height="49"
              alt="Logo"
              className="object-contain object-center"
            />
          ) : (
            <p style={logoText}>{companyInfoSummary.name}</p>
          )}
          <Hr style={hr} />
          <Text style={paragraph}>
            Bonjour {firstName}, <br />
            Nous sommes ravis de vous compter parmi nos utilisateurs ! <br />{" "}
            Votre compte a bien été créé et vous pouvez dès maintenant vous
            connecter et profiter de nos services.
          </Text>
          {email && password && (
            <>
              <Text style={paragraph}>
                Voici vos informations de connexion : <br />- Email : {email}
                <br /> - Mot de passe : {password}
              </Text>
              <Text style={paragraph}>
                Pour des raisons de sécurité, nous vous conseillons de modifier
                votre mot de passe dès votre première connexion.
              </Text>
            </>
          )}
          <Text style={paragraph}>Merci pour votre confiance.</Text>
          <Text style={paragraph}>— L‘équipe de {companyInfoSummary.name}</Text>
          <Hr style={hr} />
          <Text style={footer}>
            {companyInfoSummary.name}, {companyInfoSummary.addressLine ?? ""}
            {companyInfoSummary.city ? `, ${companyInfoSummary.city}` : ""}
            {companyInfoSummary.postalCode
              ? `, ${companyInfoSummary.postalCode}`
              : ""}
            {companyInfoSummary.state ? ` ${companyInfoSummary.state}` : ""}
            {companyInfoSummary.country
              ? `, ${companyInfoSummary.country}`
              : ""}
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeNewUser;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const paragraph = {
  color: "#525f7f",

  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const anchor = {
  color: "#556cd6",
};

const button = {
  backgroundColor: "#656ee8",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "10px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};
const logoText = {
  color: "#2e3442",
  fontSize: "18px",
  lineHeight: "22px",
  marginTop: "3px",
  marginBottom: "8px",
  textAlign: "left" as const,
};
