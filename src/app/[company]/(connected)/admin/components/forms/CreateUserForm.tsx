"use client";

import {
  AppWindowIcon,
  CodeIcon,
  Eye,
  EyeOff,
  User,
  UserRound,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useEffect, useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/src/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { isPhoneValid as validatePhone } from "@/src/lib/customfunction";
import { signIn, SignInResponse, signOut, useSession } from "next-auth/react";
import { useGlobalStore } from "@/src/store/useGlobalStore";
import { useAdminStore } from "@/src/store/useAdminStore";
import { cn } from "@/src/lib/utils";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

const subscriptionFormSchema = z.object({
  name: z
    .string({
      required_error: "Le nom est requis",
    })
    .refine((value) => value.trim().length > 0, {
      message: "Le nom est requis",
    }),
  firstName: z
    .string({
      required_error: "Le prénom est requis",
    })
    .refine((value) => value.trim().length > 0, {
      message: "Le prénom est requis",
    }),
  subscriptionEmail: z
    .string({
      required_error: "L‘adresse email est requis",
    })
    .email("Adresse email invalide"),
  phone: z.string(),
  subscriptionPassword: z
    .string({
      required_error: "Le mot de passe est requis",
    })
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  allowSendingEmail: z.boolean(),
  sendCredentialsViaMail: z.boolean(),
  typeOfUser: z.string().optional(),
});

export default function CreateUserForm({
  isAdmin,
  onComplete,
}: {
  isAdmin?: boolean;
  onComplete?: (success: boolean) => void;
}) {
  const [errMessage, setErrMessage] = useState<string>();

  const form = useForm<z.infer<typeof subscriptionFormSchema>>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: "",
      firstName: "",
      subscriptionEmail: "",
      phone: "",
      subscriptionPassword: "",
      allowSendingEmail: true,
      sendCredentialsViaMail: false,
      typeOfUser: "basic_user",
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (isAdmin) {
      form.setValue("allowSendingEmail", true);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!form.watch("allowSendingEmail")) {
      form.setValue("sendCredentialsViaMail", false);
    }
  }, [form.watch("allowSendingEmail")]);

  const isPhoneValid = validatePhone(form.watch("phone"));

  const currentBusinessCenter = useGlobalStore(
    (state) => state.currentBusinessCenter
  );
  const [togglePasswordVisible, setTogglePasswordVisible] = useState(false);

  const setIsGeneralLoadingAdminVisible = useAdminStore(
    (state) => state.setIsGeneralLoadingVisible
  );

  const setIsGeneralLoadingVisible = useGlobalStore(
    (state) => state.setIsGeneralLoadingVisible
  );

  const currentAdminCompany = useAdminStore((state) => state.adminCompany);

  async function onRegister(values: z.infer<typeof subscriptionFormSchema>) {
    if (!isAdmin) {
      if (!isPhoneValid) {
        return;
      }
    }

    if (currentBusinessCenter || currentAdminCompany) {
      if (isAdmin) {
        setIsGeneralLoadingAdminVisible(true);
      } else {
        setIsGeneralLoadingVisible(true);
      }
      const data = {
        name: values.name,
        first_name: values.firstName,
        email: values.subscriptionEmail,
        password: values.subscriptionPassword,
        typeOfUser: values.typeOfUser ?? "basic_user",
        tagOfAdmin: values.typeOfUser === "admin_user" ? "manager" : null,
        id_company: currentBusinessCenter?.id || currentAdminCompany?.id,
        phone: isPhoneValid ? values.phone : null,
        allowSendingEmail: values.allowSendingEmail,
        sendCredentialsViaMail: values.sendCredentialsViaMail,
      };

      try {
        const res = await fetch(`/api/auth/register`, {
          method: "POST",
          body: JSON.stringify(data),
        });
        const dataRes = await res.json();
        if (dataRes.success && !isAdmin) {
          const signInResult: SignInResponse | undefined = await signIn(
            "credentials",
            {
              redirect: false,
              email: values.subscriptionEmail,
              password: values.subscriptionPassword,
            }
          );
        } else {
          setErrMessage(dataRes.message);
          setTimeout(() => {
            setErrMessage(undefined);
          }, 6000);
        }

        if (onComplete) {
          onComplete(dataRes.success);
        }
      } catch (error) {
        if (onComplete) {
          onComplete(false);
        }
      } finally {
        if (isAdmin) {
          setIsGeneralLoadingAdminVisible(false);
        } else {
          setIsGeneralLoadingVisible(false);
        }
        reset();
      }
    }
  }

  return (
    <Form {...form}>
      <div className="grid gap-2">
        <div
          className={cn(
            "flex flex-col gap-3",
            isAdmin ? "flex-col" : "md:flex-row"
          )}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-cStandard">Nom</FormLabel>
                <FormControl>
                  <Input {...field} className="text-cStandard" />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-cStandard">Prénom</FormLabel>
                <FormControl>
                  <Input {...field} className="text-cStandard" />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />
        </div>

        <div
          className={cn(
            "flex flex-col gap-3 mt-3",
            isAdmin ? "md:flex-col" : "md:flex-row "
          )}
        >
          <FormField
            control={form.control}
            name="subscriptionEmail"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-cStandard">Adresse email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    className="text-cStandard"
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-cStandard">Téléphone</FormLabel>
                <FormControl>
                  <PhoneInput
                    className=""
                    defaultCountry="fr"
                    value={field.value}
                    onChange={(phone) => field.onChange(phone)}
                  />
                </FormControl>
                {!isAdmin && (
                  <div className="text-sm text-red-500">
                    {!isPhoneValid &&
                      "Veuillez entrer un numéro de téléphone valide"}
                  </div>
                )}
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subscriptionPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-cStandard">Mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={togglePasswordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    className="text-cStandard z-20 bg-transparent"
                  />
                  <div className="absolute right-0 top-0 z-10">
                    <Button
                      size="icon"
                      className="scale-95"
                      type="button"
                      variant={"ghost"}
                      onClick={() => setTogglePasswordVisible((prev) => !prev)}
                    >
                      {togglePasswordVisible ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </div>
              </FormControl>
              <FormMessage className="text-sm text-red-500" />
            </FormItem>
          )}
        />
        {isAdmin && (
          <FormField
            control={form.control}
            name="typeOfUser"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rôle de l‘utilisateur</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin_user" className="cursor-pointer">
                      Gestionnaire
                    </SelectItem>
                    <SelectItem value="basic_user" className="cursor-pointer">
                      Utilisateur
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />
        )}
        {isAdmin && (
          <>
            <FormField
              control={form.control}
              name="allowSendingEmail"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Envoyer un email automatique à cet utilisateur pour lui
                    notifier de sa création de compte
                  </FormLabel>
                </FormItem>
              )}
            />
            {form.watch("allowSendingEmail") && (
              <FormField
                control={form.control}
                name="sendCredentialsViaMail"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Envoyer les identifiants (adresse email & mot de passe via
                      ce mail)
                    </FormLabel>
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        {errMessage && <p className="text-sm text-red-500"> {errMessage} </p>}
        <Button
          type="button"
          variant="ghost"
          onClick={form.handleSubmit(onRegister)}
          className="bg-cPrimary/80 text-cForeground hover:bg-cPrimary hover:text-cForeground"
        >
          {isAdmin ? "Inscrire l‘utilisateur" : "S‘inscrire"}
        </Button>
      </div>
    </Form>
  );
}
