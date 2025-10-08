import { getServerSession } from "next-auth/next";
import { UsersWrapper } from "./UsersWrapper";
import { authOptions } from "@/src/lib/auth";
import { notFound } from "next/navigation";

export default async function UtilisateurPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    notFound();
  }
  return (
    <div className="py-8 px-4">
      <UsersWrapper session={session} />
    </div>
  );
}
