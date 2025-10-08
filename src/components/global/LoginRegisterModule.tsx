import {
  AppWindowIcon,
  CodeIcon,
  Eye,
  EyeOff,
  User,
  UserRound,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signIn, SignInResponse, signOut, useSession } from "next-auth/react";
import { useGlobalStore } from "@/src/store/useGlobalStore";
import CreateUserForm from "@/src/app/[company]/(connected)/admin/components/forms/CreateUserForm";

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
});

export default function LoginRegisterModule({
  isAdmin = false,
}: {
  isAdmin?: boolean;
}) {
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginErrorMessage, setLoginErrorMessage] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<string>("login");
  const [togglePasswordVisible, setTogglePasswordVisible] = useState(false);

  const form = useForm<z.infer<typeof subscriptionFormSchema>>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: "",
      firstName: "",
      subscriptionEmail: "",
      phone: "",
      subscriptionPassword: "",
    },
  });

  const { reset } = form;

  useEffect(() => {
    isAdmin === true ? setActiveTab("createContent") : setActiveTab("login");
  }, [isAdmin]);

  const setIsGeneralLoadingVisible = useGlobalStore(
    (state) => state.setIsGeneralLoadingVisible
  );

  useEffect(() => {
    if (activeTab === "createAccount") {
      setLoginErrorMessage("");
      setLoginEmail("");
      setLoginPassword("");
    } else if (activeTab === "login") {
      reset({});
    }
  }, [activeTab]);

  const isLoginFieldValidated = (): Boolean => {
    const isValidEmail = (email: string) => {
      const emailSchema = z.string().email("Adresse email invalide");
      try {
        emailSchema.parse(email);
        return true;
      } catch (err) {
        if (err instanceof z.ZodError) {
          console.log(err.errors);
        }
        return false;
      }
    };

    if (!isValidEmail(loginEmail)) {
      setLoginErrorMessage("Veuillez entrer une adresse email valide.");
      return false;
    }

    if (loginPassword.trim().length <= 0) {
      setLoginErrorMessage("Veuillez renseigner votre mot de passe.");
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (loginEmail || loginPassword) {
      setLoginErrorMessage("");
    }
  }, [loginEmail, loginPassword]);

  const login = async () => {
    const isValidated = isLoginFieldValidated();
    if (!isValidated) {
      return;
    }
    setLoginErrorMessage("");
    setLoginLoading(true);
    setIsGeneralLoadingVisible(true);
    try {
      const signInResult: SignInResponse | undefined = await signIn(
        "credentials",
        {
          redirect: false,
          email: loginEmail,
          password: loginPassword,
        }
      );

      if (signInResult?.error) {
        setLoginErrorMessage(signInResult.error);
      } else {
        setLoginErrorMessage("");
      }
    } catch (error) {
      console.error("Erreur pendant la connexion :", error);
      setLoginErrorMessage(
        "Une erreur inattendue est survenue. Veuillez réessayer."
      );
    } finally {
      setLoginLoading(false);
      setIsGeneralLoadingVisible(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      if (
        session &&
        session.user.profileType !== "basicUser" &&
        session.user.profileType !== "adminUser"
      ) {
        signOut();
      }
    }
  }, [status, session]);

  return (
    <div className="my-2">
      {status === "authenticated" &&
      session?.user.profileType === "basicUser" ? (
        <div className="text-cStandard bg-cBackground border border-cForeground/10 px-4 py-2 rounded-md flex gap-2 items-center">
          <div>
            <UserRound size={32} className="text-cStandard" />
          </div>
          <div>
            <p className="font-medium">Session active</p>
            <div className="text-sm flex gap-2">
              <p>
                {session.user.name} {session.user.firstName}
              </p>
              <p>|</p>
              <p> {session.user.email} </p>
            </div>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            style={{
              backgroundColor: "rgb(var(--custom-background-color))",
              borderColor: "rgb(var(--custom-foreground-color)/0.1)",
            }}
          >
            <TabsTrigger
              value="createAccount"
              style={{
                backgroundColor:
                  activeTab === "createAccount"
                    ? "rgb(var(--custom-primary-color))"
                    : "transparent",
                fontWeight: activeTab === "createAccount" ? "bold" : "normal",
                color:
                  activeTab === "createAccount"
                    ? "rgb(var(--custom-foreground-color))"
                    : "rgb(var(--custom-standard-color)/70)",
              }}
            >
              S'inscrire
            </TabsTrigger>
            <TabsTrigger
              value="login"
              style={{
                backgroundColor:
                  activeTab === "login"
                    ? "rgb(var(--custom-primary-color))"
                    : "transparent",
                fontWeight: activeTab === "login" ? "bold" : "normal",
                color:
                  activeTab === "login"
                    ? "rgb(var(--custom-foreground-color))"
                    : "rgb(var(--custom-standard-color)/70)",
              }}
            >
              Se connecter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="createAccount">
            <Card
              className="pt-4"
              style={{
                backgroundColor: "rgb(var(--custom-background-color))",
                borderColor: "rgb(var(--custom-foreground-color)/0.1)",
              }}
            >
              <CardContent>
                <CreateUserForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="login">
            <Card
              className="pt-4"
              style={{
                backgroundColor: "rgb(var(--custom-background-color))",
                borderColor: "rgb(var(--custom-foreground-color)/0.1)",
              }}
            >
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="emailAddress" className="text-cStandard">
                    Adresse email
                  </Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    autoComplete="email"
                    className="text-cStandard"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="password" className="text-cStandard">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={togglePasswordVisible ? "text" : "password"}
                      autoComplete="current-password"
                      className="text-cStandard z-20 bg-transparent"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <div className="absolute right-0 top-0 z-10">
                      <Button
                        size="icon"
                        className="scale-95"
                        type="button"
                        onClick={() =>
                          setTogglePasswordVisible((prev) => !prev)
                        }
                      >
                        {togglePasswordVisible ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                  </div>
                </div>
                {loginErrorMessage && (
                  <p className="text-red-500 text-sm">{loginErrorMessage}</p>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={login}
                  variant="ghost"
                  disabled={loginLoading}
                  className="disabled:opacity-70 disabled:hover:bg-cPrimary/80 disabled:cursor-not-allowed bg-cPrimary/80 text-cForeground hover:bg-cPrimary hover:text-cForeground"
                >
                  {loginLoading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
