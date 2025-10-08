import CourrierScannerWrapper from "./CourrierScannerWrapper";
import { baseUrl } from "@/src/lib/utils";
import { notFound } from "next/navigation";
import { authOptions } from "@/src/lib/auth";
import { getServerSession } from "next-auth";
import { ReceivedFile } from "@/src/lib/type";

const fetchMailList = async (userId : string): Promise<ReceivedFile[] | null> => {
  try {
    const res = await fetch(`${baseUrl}/api/received-file?id_basic_user=${userId}`, {
      cache : "no-store",
    });
    const data = await res.json();
    return (data.data as ReceivedFile[]).filter((mail) => mail.is_archived === false);
  } catch (error) {
    return null;
  }
};

export default async function CourrierScanner() {
  const session = await getServerSession(authOptions);
  const userId = session?.user.profileType === "basicUser" ? session.user.id : null;
  
  const mailList = await fetchMailList(userId as string);
  
  if (!mailList) {
    notFound();
  }
  return <CourrierScannerWrapper mails={mailList}/>;
}
