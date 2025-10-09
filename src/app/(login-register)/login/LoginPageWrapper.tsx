"use client";

import { z } from "zod";
import { useEffect, useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { Eye, EyeOff, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import LiquidEither from "@/src/components/global/LiquidEither";

// ✅ Validation du formulaire
const loginSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string({
    message: "Veuillez entrer votre mot de passe",
    required_error: "Votre mot de passe est requis",
  }),
});

export default function LoginPageWrapper() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [generalError, setGeneralError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  // ✅ Fonction de connexion Laravel
  const handleClick = async () => {
    setLoading(true);

    // Validation client avec Zod
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      setLoading(false);
      return;
    }

    setErrors({});
    setGeneralError(undefined);

    try {
      // ⚙️ Appel à ton API Laravel
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: result.data.email,
          password: result.data.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Les identifiants sont incorrects ou le serveur est injoignable."
        );
      }

      // ✅ Sauvegarde du token pour les prochaines requêtes
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      const user = data.data.user;

      console.log("Utilisateur connecté :", user);

      if (user.profileType === "adminUser") {
        router.push("/sprayhive/admin");
      } else if (user.profileType === "basicUser") {
        router.push("/sprayhive/domiciliation");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error("Erreur pendant la connexion :", error);
      setGeneralError(error.message || "Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  // // Optionnel : vérifie si un utilisateur est déjà connecté
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     router.push("/domiciliation");
  //   }
  // }, [router]);

  return (
    <div className="py-4 h-screen overflow-y-auto w-full bg-[url('/images/bg.webp')] bg-cover bg-left-top relative">
      <LiquidEither
        colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
        mouseForce={20}
        cursorSize={100}
        isViscous={false}
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        resolution={0.5}
        isBounce={false}
        autoDemo={true}
        autoSpeed={0.5}
        autoIntensity={2.2}
        takeoverDuration={0.25}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
      />
      <div className="flex items-center justify-center h-full absolute inset-0">
        <div className="relative bg-white/40 border-white border border-opacity-40 backdrop-blur-sm w-fit mx-auto p-5 xl:p-10 rounded-xl space-y-4">
          <div className="space-y-10">
            <Link
              href={"/"}
              className="block text-center font-black text-indigo-900 text-2xl"
            >
              SprayHive
            </Link>
            <div className="space-y-1">
              <h1 className="font-bold text-center text-xl">Se connecter</h1>
              <p className="text-black/60 text-sm">
                Veuillez entrer vos informations pour accéder à votre compte.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              {/* Champ Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  value={email}
                  onChange={(e) => {
                    setErrors({ email: "" });
                    setEmail(e.target.value);
                  }}
                  className={`border ${
                    errors.email ? "border-red-600" : "border-white/60"
                  }`}
                  type="email"
                  id="email"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Champ Mot de passe */}
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative w-full">
                  <Input
                    value={password}
                    onChange={(e) => {
                      setErrors({ password: "" });
                      setPassword(e.target.value);
                    }}
                    className={`border ${
                      errors.password ? "border-red-600" : "border-white/60"
                    }`}
                    type={isPasswordVisible ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsPasswordVisible((prev) => !prev);
                    }}
                    className="absolute right-0 top-0 bottom-0 aspect-square flex items-center justify-center hover:bg-white/20"
                    aria-label={
                      isPasswordVisible
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    type="button"
                  >
                    {isPasswordVisible ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Bouton connexion */}
              <div className="pt-3">
                <Button
                  onClick={handleClick}
                  variant="ghost"
                  className="w-full bg-indigo-900 text-white hover:bg-indigo-800 hover:text-white"
                >
                  {loading ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <span>Se connecter</span>
                  )}
                </Button>
              </div>
            </div>

            <div className="text-sm lg:text-base">
              Vous n’avez pas encore de compte ?{" "}
              <Link href="/register" className="underline text-blue-800">
                S’inscrire
              </Link>
            </div>
          </div>

          <div className="h-[25px] absolute bottom-1">
            {generalError && (
              <p className="text-red-600 text-sm mt-1">{generalError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
