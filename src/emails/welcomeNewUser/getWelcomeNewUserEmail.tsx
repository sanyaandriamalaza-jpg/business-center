import { CompanyInfoForEmail } from "@/src/lib/type";
import { render } from "@react-email/render";
import WelcomeNewUser from "./WelcomeNewUser";


export function getWelcomeNewUserEmail({
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
}) {
  return render(
    WelcomeNewUser({
      logoUrl,
      firstName,
      companyInfoSummary,
      email,
      password,
    })
  );
}