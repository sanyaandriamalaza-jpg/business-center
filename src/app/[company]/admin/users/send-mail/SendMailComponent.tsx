"use client";

import { AdminUser, ApiResponse, BasicUser } from "@/src/lib/type";
import { useSession } from "next-auth/react";

import SendMailForm from "./SendMailForm";

export default function SendMailComponent({
  user,
}: {
  user?: Partial<BasicUser> | Partial<AdminUser> | null;
}) {
  const { data: session } = useSession();
  return (
    <div className="max-w-[600px]  xl:max-w-[900px] bg-white rounded-md shadow-sm p-4 xl:p-10 xl:mt-10 mx-auto">
      <div className="space-y-2">
        <div>
          <h1 className="font-bold text-xl">Envoyer un message</h1>
          <p className="text-sm">
            Votre message sera envoyé par e-mail au destinataire.
          </p>
        </div>
        <div className="text-sm space-y-1">
          <p className="bg-neutral-50  p-2 rounded-md">
            De : {session?.user.firstName} {session?.user.name}{" "}
          </p>
          <p className="bg-neutral-50 p-2 rounded-md">
            A : {user?.firstName} {user?.name}{" "}
            {user?.email ? `<${user?.email}>` : ""}
          </p>
        </div>
        {user && user.email && <SendMailForm user={user.email} />}
      </div>
    </div>
  );
}
