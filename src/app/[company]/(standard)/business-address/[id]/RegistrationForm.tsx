"use client";

import { UserCircle2 } from "lucide-react";
import LoginRegisterModule from "@/src/components/global/LoginRegisterModule";

export const RegistrationForm = ({isAdmin} : {isAdmin : boolean}) => {

  return (
    <div className="md:px-6 mb-16">
      <div className=" flex items-center gap-6 text-cPrimary/90 mb-4">
        <UserCircle2 className="w-6 h-6 " />
        <h2 className="md:text-xl font-bold ">Création de votre compte</h2>
      </div>

      <div>
        <LoginRegisterModule isAdmin={isAdmin}/>
      </div>
    </div>
  );
};
