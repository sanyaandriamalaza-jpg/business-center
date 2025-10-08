import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Section,
    Text,
    Preview,
  } from "@react-email/components";
  import { capitalizeFirstLetter } from "../lib/customfunction";
  import { CompanyInfoForEmail } from "../lib/type";
  
  export const NotifUserForVirtualOffice = ({
    logoUrl,
    firstName,
    contractId,
    companyName,
    startDate,
    endDate,
    companyInfoSummary,
  }: {
    logoUrl?: string | null;
    firstName: string;
    contractId?: string;
    companyName?: string;
    startDate?: string | null;
    endDate?: string | null;
    companyInfoSummary: CompanyInfoForEmail;
  }) => (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Votre contrat de domiciliation a été créé</Preview>
        <Container style={container}>
          <Section style={box}>
            {logoUrl ? (
              <Img src={logoUrl} width="49" height="21" alt="Logo" />
            ) : (
              <p style={logoText}>{companyInfoSummary.name}</p>
            )}
  
            <Text style={paragraph}>
              Bonjour {capitalizeFirstLetter(firstName)},
            </Text>
            <Text style={paragraph}>
              Votre contrat de domiciliation pour l'entreprise{" "}
              <strong>{companyName}</strong> a été créé avec succès.
            </Text>
  
            {contractId && <p style={li}>- ID du contrat : {contractId}</p>}
            {startDate && <p style={li}>- Date de début : {startDate}</p>}
            {endDate && <p style={li}>- Date de fin : {endDate}</p>}
  
            <Text style={paragraph}>Merci pour votre confiance.</Text>
            <Text style={paragraph}>— L’équipe de {companyInfoSummary.name}</Text>
  
            <Hr style={hr} />
            <Text style={footer}>
              {companyInfoSummary.name}
              {companyInfoSummary.addressLine ? `, ${companyInfoSummary.addressLine}` : ""}
              {companyInfoSummary.city ? `, ${companyInfoSummary.city}` : ""}
              {companyInfoSummary.postalCode ? `, ${companyInfoSummary.postalCode}` : ""}
              {companyInfoSummary.state ? ` ${companyInfoSummary.state}` : ""}
              {companyInfoSummary.country ? `, ${companyInfoSummary.country}` : ""}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
  
  export default NotifUserForVirtualOffice;
  
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
  
  const logoText = {
    color: "#2e3442",
    fontSize: "18px",
    lineHeight: "22px",
    marginTop: "3px",
    marginBottom: "8px",
    textAlign: "left" as const,
  };
  
  const li = {
    color: "#525f7f",
    fontSize: "14px",
    lineHeight: "16px",
    marginTop: "3px",
    marginBottom: "0px",
    marginLeft: "8px",
    textAlign: "left" as const,
  };
  
  const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
  };
  