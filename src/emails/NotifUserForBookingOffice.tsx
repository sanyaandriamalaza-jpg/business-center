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
import { capitalizeFirstLetter } from "../lib/customfunction";
import {
  CompanyInfoForEmail,
  Office,
  ReservationResumeType,
} from "../lib/type";

export const NotifUserForBookingOffice = ({
  logoUrl,
  reservationRef,
  firstName,
  reservationResume,
  officeInfo,
  accessCode,
  companyInfoSummary,
}: {
  logoUrl?: string | null;
  reservationRef: string;
  firstName: string;
  reservationResume: ReservationResumeType;
  officeInfo: Office;
  accessCode?: string | null;
  companyInfoSummary: CompanyInfoForEmail;
}) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Votre réservation a bien été enregistrée</Preview>
      <Container style={container}>
        <Section style={box}>
          {logoUrl ? (
            <Img
              src={logoUrl}
              width="49"
              height="21"
              alt="Logo"
              className="object-contain object-center"
            />
          ) : (
            <p style={logoText}>{companyInfoSummary.name}</p>
          )}
          <Text style={paragraph}>
            Bonjour {`${capitalizeFirstLetter(firstName)}`},
          </Text>
          <Text style={paragraph}>
            Votre réservation a bien été enregistrée. Voici les détails :
          </Text>

          <p style={li}>- Référence de la réservation : {reservationRef}</p>
          <p style={li}>- Nom du bureau : {officeInfo.name}</p>
          <p style={li}>
            - Adresse :{" "}
            {officeInfo.specificAddress
              ? `${officeInfo.specificAddress?.addressLine}${officeInfo.specificAddress?.addressLine ? `, ${officeInfo.specificAddress.addressLine}` : ""}${officeInfo.specificAddress?.city ? `, ${officeInfo.specificAddress.city}` : ""}${officeInfo.specificAddress?.postalCode ? `, ${officeInfo.specificAddress.postalCode}` : ""}${officeInfo.specificAddress?.state ? `, ${officeInfo.specificAddress.state}` : ""}${officeInfo.specificAddress?.country ? `, ${officeInfo.specificAddress.country}` : ""}`
              : `${officeInfo.companyAddress?.addressLine}${officeInfo.companyAddress?.addressLine ? `, ${officeInfo.companyAddress.addressLine}` : ""}${officeInfo.companyAddress?.city ? `, ${officeInfo.companyAddress.city}` : ""}${officeInfo.companyAddress?.postalCode ? `, ${officeInfo.companyAddress.postalCode}` : ""}${officeInfo.companyAddress?.state ? `, ${officeInfo.companyAddress.state}` : ""}${officeInfo.companyAddress?.country ? `, ${officeInfo.companyAddress.country}` : ""}`}
          </p>

          {reservationResume.locationType === "hourly" ? (
            <>
              {reservationResume.dateStart && (
                <p style={li}>
                  - Date :{" "}
                  {new Date(reservationResume.dateStart).toLocaleDateString()}
                </p>
              )}
              <p style={li}>- Heure de début : {reservationResume.timeStart}</p>
              <p style={li}>- Heure de fin : {reservationResume.timeEnd}</p>
            </>
          ) : (
            <>
              {reservationResume.dailyDateRange?.from && (
                <p style={li}>
                  - Date de début :{" "}
                  {new Date(
                    reservationResume.dailyDateRange?.from
                  ).toLocaleDateString()}
                </p>
              )}
              {reservationResume.dailyDateRange?.to && (
                <p style={li}>
                  - Date de fin :{" "}
                  {new Date(
                    reservationResume.dailyDateRange?.to
                  ).toLocaleDateString()}
                </p>
              )}
            </>
          )}
          {accessCode && <p style={li}>- Code d‘accès : {accessCode}</p>}
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

export default NotifUserForBookingOffice;

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
