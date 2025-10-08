"use client";

import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Tiptap from "@/src/components/global/Tiptap";
import { useToast } from "@/src/hooks/use-toast";
import { useAdminStore } from "@/src/store/useAdminStore";
import { render } from "@react-email/render";
import SendGeneralMail from "@/src/emails/SendGeneralMail";
import { useState } from "react";
import { ApiResponse } from "@/src/lib/type";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  object: z
    .string()
    .trim()
    .min(1, { message: "Veuillez entrer un objet valide." }),
  message: z
    .string()
    .trim()
    .min(1, { message: "Veuillez entrer un message valide." }),
});

export default function SendMailForm({
  user,
  onComplete,
}: {
  user: string | string[];
  onComplete?: () => void;
}) {
  const [tiptapKey, setTiptapKey] = useState<number>(1);
  const { data: session } = useSession();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      object: "",
      message: "",
    },
  });

  const { toast } = useToast();
  const setIsGeneralLoadingVisible = useAdminStore(
    (state) => state.setIsGeneralLoadingVisible
  );

  const { reset } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsGeneralLoadingVisible(true);
      const html = render(
        SendGeneralMail({ object: values.object, content: values.message })
      );
      const htmlContent = await html;

      let data: ApiResponse<null> | null = null;

      if (Array.isArray(user)) {
        const results = await Promise.all(
          user.map((userItem) =>
            fetch("/api/send-general-email", {
              method: "POST",
              body: JSON.stringify({
                to: userItem,
                subject: values.object,
                html: htmlContent,
                replyTo: session?.user.email || process.env.MAIL_SENDER,
              }),
            }).then((res) => res.json())
          )
        );

        const allSuccess = results.every((r) => r.success);
        toast({
          title: allSuccess ? "Succès" : "Erreur",
          description: allSuccess
            ? "Tous les mails ont été envoyés."
            : "Certaines erreurs sont survenues lors de l'envoi.",
          variant: allSuccess ? "success" : "destructive",
        });
      } else {
        const res = await fetch("/api/send-general-email", {
          method: "POST",
          body: JSON.stringify({
            to: user,
            subject: values.object,
            html: htmlContent,
            replyTo: session?.user.email || process.env.MAIL_SENDER,
          }),
        });
        const data = await res.json();
        toast({
          title: data.success ? "Succès" : "Erreur",
          description: data.message,
          variant: data.success ? "success" : "destructive",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      });
    } finally {
      setIsGeneralLoadingVisible(false);
      reset();
      setTiptapKey((prev) => prev + 1);
      if (onComplete) {
        onComplete();
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="object"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objet</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Tiptap
                  key={tiptapKey}
                  description={field.value || ""}
                  onChange={(html) => field.onChange(html)}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant={"ghost"}
          className="bg-cDefaultPrimary-100 hover:bg-cDefaultPrimary-200 text-white hover:text-white"
        >
          Envoyer
        </Button>
      </form>
    </Form>
  );
}
