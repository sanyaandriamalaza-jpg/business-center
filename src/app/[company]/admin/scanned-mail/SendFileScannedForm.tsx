"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  AnalyzedFileResponse,
  ApiResponse,
  ReceivedFile,
} from "@/src/lib/type";
import { Textarea } from "@/src/components/ui/textarea";
import { useAdminStore } from "@/src/store/useAdminStore";
import { useToast } from "@/src/hooks/use-toast";

const formSchema = z.object({
  received_from_name: z.string().refine((value) => value.trim().length > 0, {
    message: "Veuillez entrer le nom de l‘expéditeur.",
  }),
  recipient_name: z.string().refine((value) => value.trim().length > 0, {
    message: "Veuillez entrer le nom du destinataire.",
  }),
  recipient_email: z.string().refine((value) => value.trim().length > 0, {
    message: "Veuillez entrer l‘adresse email du destinataire",
  }),
  courriel_object: z.string().refine((value) => value.trim().length > 0, {
    message: "Veuillez entrer l‘objet.",
  }),
  resume: z.string().refine((value) => value.trim().length > 0, {
    message: "Veuillez entrer le résumé du courrier.",
  }),
});

export default function SendFileScannedForm({
  initialData,
  receivedFile,
  onComplete,
  companyName,
  companyEmail,
}: {
  initialData?: AnalyzedFileResponse | null;
  receivedFile: ReceivedFile;
  onComplete: () => void;
  companyName: string;
  companyEmail?: string | null;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      received_from_name:
        initialData && initialData.expediteur ? initialData.expediteur : "",
      recipient_name:
        initialData && initialData.destinataire ? initialData.destinataire : "",
      recipient_email:
        initialData && initialData.email ? initialData.email : "",
      courriel_object:
        initialData && initialData.objet ? initialData.objet : "",
      resume: initialData && initialData.resume ? initialData.resume : "",
    },
  });

  const setIsGeneralLoadingVisible = useAdminStore(
    (state) => state.setIsGeneralLoadingVisible
  );

  const { toast } = useToast();

  const saveValueInDatabase = async (
    payload: Partial<ReceivedFile>
  ): Promise<ApiResponse<ReceivedFile | null>> => {
    try {
      const res = await fetch(
        `/api/received-file/${receivedFile.id_received_file}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data: ApiResponse<ReceivedFile | null> = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      const data: ApiResponse<ReceivedFile | null> = {
        success: false,
        message: "Une erreur est survenue",
        data: null,
      };
      return data;
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsGeneralLoadingVisible(true);
      const payload: Partial<ReceivedFile> = {
        received_from_name: values.received_from_name,
        recipient_name: values.recipient_name,
        courriel_object: values.courriel_object,
        resume: values.resume,
        recipient_email: values.recipient_email,
        status: "scanned",
      };
      const data = await saveValueInDatabase(payload);
      toast({
        title: data.success ? "Succès" : "Erreur",
        description: data.message,
        variant: data.success ? "success" : "destructive",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsGeneralLoadingVisible(false);
      onComplete();
    }
  }

  const saveAndSend = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsGeneralLoadingVisible(true);
      const payload: Partial<ReceivedFile> = {
        received_from_name: values.received_from_name,
        recipient_name: values.recipient_name,
        courriel_object: values.courriel_object,
        resume: values.resume,
        recipient_email: values.recipient_email,
        status: "scanned",
      };
      const sendRes = await fetch(`/api/send-analyzed-file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          object: `Vous avez reçu un courrier - `,
          file_url: receivedFile.file_url,
          companyName,
          companyEmail,
        }),
      });

      const dataSendRes: ApiResponse<any> = await sendRes.json();
      if (dataSendRes.success) {
        payload.is_sent = true;
        payload.send_at = new Date();
      } else {
        toast({
          title: "Erreur",
          description: "Erreur lors de l‘envoi du courrier",
          variant: "destructive",
        });
      }

      const data = await saveValueInDatabase(payload);
      toast({
        title: data.success ? "Succès" : "Erreur",
        description: data.message,
        variant: data.success ? "success" : "destructive",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsGeneralLoadingVisible(false);
      onComplete();
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="received_from_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l‘expéditeur</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="recipient_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du destinataire </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="recipient_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="courriel_object"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objet du courrier</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="resume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Résumé du courrier</FormLabel>
                <FormControl>
                  <Textarea className="resize-none" rows={8} {...field} />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              variant={"outline"}
              className="text-cDefaultSecondary-100 border border-cDefaultSecondary-100"
            >
              Envoyer plus tard
            </Button>
            <Button
              type="button"
              onClick={() => saveAndSend(form.getValues())}
              variant={"ghost"}
              className="bg-cDefaultSecondary-100 text-white hover:bg-cDefaultSecondary-200 hover:text-white "
            >
              Envoyer immédiatement
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
