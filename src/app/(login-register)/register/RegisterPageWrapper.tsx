"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/src/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Eye, EyeOff, Loader2Icon } from "lucide-react"
import { signIn, SignInResponse, useSession } from "next-auth/react";



const formSchema = z.object({
    name: z.string().refine(value => value.trim().length > 0, {
        message: "Veuillez entrer votre nom"
    }),
    firstName: z.string().refine(value => value.trim().length > 0, {
        message: "Veuillez entrer votre prénom"
    }),
    email: z.string().email({
        message: "Veuillez entrer une adresse email valide"
    }),
    password: z.string()
})

export default function RegisterPageWrapper() {
    const [generalError, setGeneralError] = useState<string>()
    const [loading, setLoading] = useState<boolean>(false)

    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false)

    const { data: session, status } = useSession();


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            firstName: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const res = await fetch(`/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: values.name,
                    first_name: values.firstName,
                    email: values.email,
                    password: values.password
                })
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || "Une erreur est survenue lors de l'inscription.");
            }
            if (data.success) {
                const signInResult: SignInResponse | undefined = await signIn("credentials", {
                    redirect: false,
                    email: values.email,
                    password: values.password,
                });

                if (signInResult?.error) {
                    setGeneralError(signInResult.error);
                } else {
                    setGeneralError(undefined);
                }
            }
        } catch (error) {
            console.error("Erreur pendant la connexion :", error);
            if (error instanceof Error) {
                setGeneralError(error.message);
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (status === "authenticated") {
            console.log("Utilisateur connecté :", session);
            // TODO : redirection de l'utilisateur
        }
    }, [status, session]);

    return (
        <div className="py-4 h-screen overflow-y-auto w-full bg-[url('/images/bg.webp')] bg-cover bg-left-top " >
            <div className="flex items-center justify-center h-full">
                <div className="relative bg-white/40 border-white border border-opacity-40 backdrop-blur-sm w-fit mx-auto p-5 xl:p-10 rounded-xl space-y-4">
                    <div className="space-y-10 ">
                        <div className="text-center font-black text-indigo-900 text-2xl">
                            SprayHive
                        </div>
                        <div className="space-y-1">
                            <h1 className="font-bold text-center text-xl">Créer un compte</h1>
                            <p className="text-black/60 text-sm">Rejoignez-nous pour bénéficier des services de notre plateforme.</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom</FormLabel>
                                            <FormControl>
                                                <Input className="border border-white/60" autoComplete="family-name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prénom</FormLabel>
                                            <FormControl>
                                                <Input className="border border-white/60" autoComplete="given-name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Adresse email</FormLabel>
                                            <FormControl>
                                                <Input className="border border-white/60" type="email" autoComplete="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mot de passe</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input className="border border-white/60" type={isPasswordVisible ? "text" : "password"} autoComplete="new-password"  {...field} />
                                                    <button onClick={(e) => {
                                                        e.preventDefault()
                                                        setIsPasswordVisible((prev) => !prev)
                                                    }} className="absolute right-0 top-0 bottom-0 aspect-square flex items-center justify-center hover:bg-white/20">
                                                        {
                                                            isPasswordVisible ? <EyeOff /> : <Eye />
                                                        }
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="pt-3">
                                    <Button type="submit" variant="ghost" className="w-full bg-indigo-900 text-white hover:bg-indigo-800 hover:text-white">
                                        {
                                            loading ? <Loader2Icon className="animate-spin" /> : <span>
                                                Se connecter
                                            </span>
                                        }
                                    </Button>
                                </div>
                            </form>
                        </Form>
                        <div className="text-sm lg:text-base">
                            Vous avez déjà un compte? <Link href={"/login"} className="underline text-blue-800">Se connecter</Link>
                        </div>
                    </div>
                    <div className="h-[25px] absolute bottom-1">
                        {generalError && <p className="text-red-600 text-sm mt-1">{generalError}</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}