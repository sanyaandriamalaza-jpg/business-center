"use client";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  Address,
  BusinessHour,
  Company,
  CoworkingOffer,
  DayName,
  Equipment,
  Office,
  OfficeAdditionalImage,
} from "@/src/lib/type";
import { useRouter } from "next/navigation";
import PartialLoading from "@/src/components/global/PartialLoading";
import {
  formatBusinessHourFr,
  translateCoworkingOfferType,
  uploadImage,
} from "@/src/lib/customfunction";
import ImagePreview from "@/src/components/global/ImagePreview";
import { Plus, Check, AirVent, Info, Trash } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { useAdminStore } from "@/src/store/useAdminStore";
import { Suspense } from "react";
import SearchParamsWrapper, { ModeType } from "./SearchParamsWrapper";
import { allEquipments, dayNameFrMap } from "@/src/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import Image from "next/image";

// Constantes
const defaultBusinessHours: BusinessHour = {
  monday: { open: "09:00", close: "18:00", isClosed: false },
  tuesday: { open: "09:00", close: "18:00", isClosed: false },
  wednesday: { open: "09:00", close: "18:00", isClosed: false },
  thursday: { open: "09:00", close: "18:00", isClosed: false },
  friday: { open: "09:00", close: "18:00", isClosed: false },
  saturday: { open: null, close: null, isClosed: true },
  sunday: { open: null, close: null, isClosed: true },
};

const days: DayName[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

// Schéma de validation
const timeSlotSchema = z.object({
  open: z.string().nullable(),
  close: z.string().nullable(),
  isClosed: z.boolean().nullable().optional(),
});

const businessHourShape: Record<DayName, typeof timeSlotSchema> = days.reduce(
  (acc, day) => {
    acc[day] = timeSlotSchema;
    return acc;
  },
  {} as Record<DayName, typeof timeSlotSchema>
);

const businessHourSchema = z.object(businessHourShape);

// Fonction pour créer le schéma dynamiquement
const createFormSchema = (isEditMode = false, companyAddress?: boolean) => {
  return z.object({
    cover: isEditMode
      ? z.instanceof(File).optional()
      : z
          .instanceof(File, {
            message: "Veuillez ajouter un fichier",
          })
          .refine((file) => file.size <= 5 * 1024 * 1024, {
            message: "Le fichier doit être inférieur à 5 Mo.",
          }),
    name: z.string().min(2, "Le nom est requis"),
    description: z.string().min(1, "La description est obligatoire"),
    capacity: z.coerce.number().min(1, "Capacité requise"),
    schedules: businessHourSchema.nullable(),
    useCompanyHour: z.boolean(),
    useCompanyAddress: z.boolean(),
    addressLine: companyAddress
      ? z.string().optional()
      : z.string().refine((value) => value.trim().length > 0, {
          message: "Veuillez entrer l‘adresse",
        }),
    postalCode: companyAddress
      ? z.string().optional()
      : z.string().refine((value) => value.trim().length > 0, {
          message: "Veuillez entrer le code postal",
        }),
    state: companyAddress
      ? z.string().optional()
      : z.string().refine((value) => value.trim().length > 0, {
          message: "Veuillez entrer la région",
        }),
    city: companyAddress
      ? z.string().optional()
      : z.string().refine((value) => value.trim().length > 0, {
          message: "Veuillez entrer l‘Etat",
        }),
    country: companyAddress
      ? z.string().optional()
      : z.string().refine((value) => value.trim().length > 0, {
          message: "Veuillez entrer le pays",
        }),
    equipments: z
      .array(z.string(), {
        required_error: "Veuillez sélectionner au moins un matériel",
        invalid_type_error: "Format invalide pour les matériels",
      })
      .min(1, "Veuillez sélectionner au moins un matériel"),
  });
};

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface OfficeFormState {
  officeMode: ModeType | null;
  coworkingOfferId: number | null;
  officeToEditId: number | null;
  officeToEditInfo?: Office;
  isEditMode: boolean;
  loadingParameter: boolean;
  currentCoworkingOffer?: CoworkingOffer;
  initialCompanyParameter?: Company;
  coverPreview?: string;
  officeAdditionalImages?: OfficeAdditionalImage[] | null;
}

export default function AdminCreateOfficePageWrapper() {
  const [imageListIdToDeleteOnEditMode, setImageListIdToDeleteOnEditMode] =
    useState<number[]>([]);
  const [additionalImages, setAdditionalImages] = useState<
    { preview?: string; file?: File }[]
  >([]);
  const [additionalImagesToEdit, setAdditionalImagesToEdit] = useState<
    OfficeAdditionalImage[]
  >([]);

  const [state, setState] = useState<OfficeFormState>({
    officeMode: null,
    coworkingOfferId: null,
    officeToEditId: null,
    isEditMode: false,
    loadingParameter: false,
  });

  const adminCompany = useAdminStore((state) => state.adminCompany);

  const router = useRouter();
  const { toast } = useToast();
  const setIsGeneralLoadingVisible = useAdminStore(
    (state) => state.setIsGeneralLoadingVisible
  );

  const companyHasAddress = [
    state.initialCompanyParameter?.addressLine,
    state.initialCompanyParameter?.city,
    state.initialCompanyParameter?.postalCode,
    state.initialCompanyParameter?.state,
    state.initialCompanyParameter?.country,
  ].every((val) => val != null && val !== "");

  const formSchema = useMemo(
    () => createFormSchema(state.isEditMode, companyHasAddress),
    [state.isEditMode, companyHasAddress]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      capacity: 1,
      schedules: defaultBusinessHours,
      useCompanyHour: state.initialCompanyParameter?.businessHour != null,
      useCompanyAddress: companyHasAddress,
      addressLine: "",
      postalCode: "",
      state: "",
      city: "",
      country: "",
      equipments: [],
    },
  });

  const { reset } = form;

  useEffect(() => {
    const isEditMode =
      state.officeMode === "edit" &&
      !!state.officeToEditId &&
      !!state.officeToEditInfo;
    if (isEditMode !== state.isEditMode) {
      setState((prev) => ({ ...prev, isEditMode }));
    }
  }, [
    state.officeMode,
    state.officeToEditId,
    state.officeToEditInfo,
    state.isEditMode,
  ]);

  const fetchOfficeInfo = useCallback(async () => {
    if (state.officeMode === "edit" && state.officeToEditId) {
      try {
        const res = await fetch(`/api/office/${state.officeToEditId}`);
        const data = await res.json();

        if (data.success) {
          const office: Office = data.data;

          setState((prev) => ({
            ...prev,
            officeToEditInfo: office,
            coworkingOfferId: office.idCoworkingOffer,
          }));
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de charger les informations du bureau",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement du bureau:", error);
        toast({
          title: "Erreur",
          description: "Erreur de connexion",
          variant: "destructive",
        });
      }
    }
  }, [state.officeMode, state.officeToEditId, toast]);

  useEffect(() => {
    fetchOfficeInfo();
  }, [fetchOfficeInfo]);

  // Mise à jour du formulaire avec les données existantes
  useEffect(() => {
    if (state.officeMode === "edit" && state.officeToEditInfo) {
      const featuresFormatted = state.officeToEditInfo.features.map(
        (item: any) => item.value
      );

      const specificAddress: Address | null | undefined =
        state.officeToEditInfo.specificAddress;

      reset({
        name: state.officeToEditInfo.name,
        description: state.officeToEditInfo.description,
        capacity: state.officeToEditInfo.maxSeatCapacity,
        useCompanyHour: !state.officeToEditInfo.specificBusinessHour,
        useCompanyAddress: !(specificAddress !== null && specificAddress),
        addressLine: specificAddress
          ? `${specificAddress.addressLine}`
          : undefined,
        city: specificAddress ? `${specificAddress.city}` : undefined,
        postalCode: specificAddress
          ? `${specificAddress.postalCode}`
          : undefined,
        state: specificAddress ? `${specificAddress.state}` : undefined,
        country: specificAddress ? `${specificAddress.country}` : undefined,
        equipments: featuresFormatted,
        schedules:
          state.officeToEditInfo.specificBusinessHour || defaultBusinessHours,
      });

      setState((prev) => ({
        ...prev,
        coverPreview: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${state.officeToEditInfo?.imageUrl}`,
      }));

      if (state.officeToEditInfo.officeAdditionalImages) {
        setAdditionalImagesToEdit(
          state.officeToEditInfo.officeAdditionalImages
        );
      }
    }
  }, [state.officeMode, state.officeToEditInfo, reset]);

  const fetchCompanyParameter = useCallback(async () => {
    if (!state.coworkingOfferId) return;

    try {
      setState((prev) => ({ ...prev, loadingParameter: true }));
      const offerRes = await fetch(
        `/api/coworking-offer/${state.coworkingOfferId}`
      );
      const offerData = await offerRes.json();

      if (!offerData.success) {
        throw new Error("Impossible de charger l'offre");
      }

      const customData: CoworkingOffer = offerData.data;
      setState((prev) => ({ ...prev, currentCoworkingOffer: customData }));

      // Récupération de l‘entreprise associé
      if (customData.idCompany) {
        const companyRes = await fetch(`/api/company/${customData.idCompany}`);
        const companyData = await companyRes.json();

        if (companyData.success) {
          setState((prev) => ({
            ...prev,
            initialCompanyParameter: companyData.data,
          }));
        } else {
          console.warn("Le centre n'a pas pu être chargé.");
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres de l‘entreprise",
        variant: "destructive",
      });
    } finally {
      setState((prev) => ({ ...prev, loadingParameter: false }));
    }
  }, [state.coworkingOfferId, toast]);

  useEffect(() => {
    if (state.coworkingOfferId !== null) {
      fetchCompanyParameter();
    }
  }, [fetchCompanyParameter]);

  // Gestion des horaires
  const useCompanySchedule = form.watch("useCompanyHour");
  const useCompanyAddress = form.watch("useCompanyAddress");

  useEffect(() => {
    if (useCompanySchedule) {
      form.setValue("schedules", null);
    } else {
      form.setValue("schedules", defaultBusinessHours);
    }
  }, [useCompanySchedule, defaultBusinessHours, form]);

  useEffect(() => {
    if (useCompanyAddress) {
      form.setValue("addressLine", undefined);
      form.setValue("city", undefined);
      form.setValue("postalCode", undefined);
      form.setValue("state", undefined);
      form.setValue("country", undefined);
    }
  }, [useCompanyAddress, form]);

  const onSubmit = async (values: FormValues) => {
    if (adminCompany) {
      setIsGeneralLoadingVisible(true);

      try {
        const selectedEquipments = values.equipments
          .map((value) => allEquipments.find((e) => e.value === value))
          .filter((e) => e !== undefined)
          .map((e) => ({
            value: e.value,
            label: e.label,
          }));

        let imageUrl = state.isEditMode ? state.officeToEditInfo?.imageUrl : "";

        // Gestion de l'upload d'image
        if (values.cover instanceof File) {
          const result = await uploadImage(values.cover);
          if (result.success) {
            imageUrl = result.path ?? "";
          } else {
            toast({
              title: "Erreur",
              description: "Erreur lors de l'upload de l'image",
              variant: "destructive",
            });
            return;
          }
        }

        let oai: string[] = [];

        if (additionalImages && additionalImages.length > 0) {
          const filesToUpload = additionalImages.filter((img) => img.file);
          const uploadResults = await Promise.all(
            filesToUpload.map((img) => uploadImage(img.file!))
          );
          const uploadedUrls = uploadResults
            .filter((res) => res.success)
            .map((res) => res.path ?? "");
          oai = [...uploadedUrls];
        }

        if (!state.currentCoworkingOffer) {
          toast({
            title: "Erreur",
            description:
              "Aucune offre disponible pour être associée à ce bureau.",
            variant: "destructive",
          });
          return;
        }

        const specificAddress: Address = {
          addressLine: values.addressLine,
          city: values.city,
          postalCode: values.postalCode,
          state: values.state,
          country: values.country,
        };

        const dataToSend = {
          name: values.name,
          description: values.description,
          features: selectedEquipments,
          specificBusinessHour: values.useCompanyHour ? null : values.schedules,
          specificAddress: values.useCompanyAddress ? null : specificAddress,
          maxSeatCapacity: values.capacity,
          imageUrl,
          idCoworkingOffer: state.currentCoworkingOffer.id,
          officeAdditionalImages: oai,
          officeAdditionalImageIdToDelete: [] as number[]
        };

        if (state.isEditMode) {
          dataToSend.officeAdditionalImageIdToDelete =
            imageListIdToDeleteOnEditMode;
        }

        const url = state.isEditMode
          ? `/api/office/${state.officeToEditInfo?.id}`
          : `/api/office`;
        const method = state.isEditMode ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        });

        const data = await res.json();

        toast({
          title: data.success ? "Succès" : "Erreur",
          description: data.message,
          variant: data.success ? "success" : "destructive",
        });

        if (data.success) {
          router.push(`/${adminCompany.slug}/admin/spaces`);
        }
      } catch (error) {
        console.error("Erreur lors de la soumission:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue",
          variant: "destructive",
        });
      } finally {
        setIsGeneralLoadingVisible(false);
      }
    }
  };

  // Gestionnaire de paramètres de recherche
  const handleParamsReady = useCallback((mode: ModeType, id: number) => {
    setState((prev) => ({
      ...prev,
      officeMode: mode,
      ...(mode === "create"
        ? { coworkingOfferId: id }
        : { officeToEditId: id }),
    }));
  }, []);

  // Gestionnaire de sélection d'image
  const handleImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        form.setValue("cover", file);
        const imageUrl = URL.createObjectURL(file);
        setState((prev) => ({ ...prev, coverPreview: imageUrl }));
      }
    },
    [form]
  );

  // Gestionnaire de suppression d'image
  const handleDeleteImage = useCallback(() => {
    form.setValue("cover", undefined);
    setState((prev) => ({ ...prev, coverPreview: undefined }));
  }, [form]);

  // Rendu conditionnel
  if (state.loadingParameter) {
    return (
      <div className="py-6 xl:px-4 space-y-6">
        <PartialLoading />
      </div>
    );
  }

  if (!state.currentCoworkingOffer || !state.initialCompanyParameter) {
    return (
      <div className="py-6 xl:px-4 space-y-6">
        <Suspense fallback={null}>
          <SearchParamsWrapper onParamsReady={handleParamsReady} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="py-6 xl:px-4 space-y-6">
      <Suspense fallback={null}>
        <SearchParamsWrapper onParamsReady={handleParamsReady} />
      </Suspense>

      <div>
        <h2 className="text-xl xl:text-2xl font-bold text-indigo-900 mb-6">
          {state.officeMode === "create" ? "Ajouter" : "Éditer"} un bureau
        </h2>

        <div className="rounded-md bg-white p-4 space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  {/* Informations du coworking */}
                  <div className="flex flex-col sm:flex-row gap-4 divide-x divide-gray-100">
                    <div>
                      <p className="font-medium text-indigo-600">
                        Type de bureau :{" "}
                        {translateCoworkingOfferType(
                          state.currentCoworkingOffer.type
                        )}
                      </p>
                      {state.currentCoworkingOffer.dailyRate && (
                        <p className="text-sm">
                          Tarif journalier :{" "}
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          }).format(state.currentCoworkingOffer.dailyRate)}
                        </p>
                      )}
                      {state.currentCoworkingOffer.hourlyRate && (
                        <p className="text-sm">
                          Tarif horaire :{" "}
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          }).format(state.currentCoworkingOffer.hourlyRate)}
                        </p>
                      )}
                    </div>
                    {useCompanySchedule &&
                      state.initialCompanyParameter.businessHour && (
                        <div className="pl-3">
                          <p>Horaires généraux</p>
                          <ul className="text-sm ml-2">
                            {formatBusinessHourFr(
                              state.initialCompanyParameter.businessHour
                            ).map((item, i) => (
                              <li key={i}>
                                {item.jour} : {item.horaire}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                  {useCompanyAddress && (
                    <div className="flex gap-2 items-start">
                      <div className="flex items-center gap-2">
                        <p>Adresse générale</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-indigo-600 cursor-pointer">
                                <Info className="w-4 " />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Récupéré depuis les paramètres de votre espace
                                coworking.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span>:</span>
                      </div>
                      <div className="flex-1">
                        <p className="flex flex-col text-sm font-medium">
                          <span>
                            {state.initialCompanyParameter.addressLine}
                            {state.initialCompanyParameter.state
                              ? `, ${state.initialCompanyParameter.state}`
                              : ""}
                          </span>
                          <span>
                            {state.initialCompanyParameter.postalCode
                              ? `${state.initialCompanyParameter.postalCode} `
                              : ""}
                            {` ${state.initialCompanyParameter.city} `}
                          </span>
                          <span className="uppercase">
                            {state.initialCompanyParameter.country
                              ? `${state.initialCompanyParameter.country}`
                              : ""}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Image du bureau */}
                  <FormField
                    control={form.control}
                    name="cover"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="cover">
                          Image de couverture du bureau
                        </FormLabel>
                        <FormControl>
                          {state.coverPreview ? (
                            <div className="w-[150px]">
                              <ImagePreview
                                imageUrl={state.coverPreview}
                                deleteImage={handleDeleteImage}
                              />
                            </div>
                          ) : (
                            <Input
                              type="file"
                              accept="image/jpg, image/png, image/jpeg, image/webp"
                              onChange={handleImageChange}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel htmlFor="cover">
                      D'autres images du bureau
                    </FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {additionalImagesToEdit.map((image, i) => (
                        <div
                          className="w-[150px] aspect-video  relative"
                          key={i}
                        >
                          <Image
                            alt=""
                            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${image.urlImage}`}
                            width={150}
                            height={150}
                          />
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              setImageListIdToDeleteOnEditMode((prev) => [
                                ...prev,
                                image.id,
                              ]);
                              setAdditionalImagesToEdit((prev) =>
                                prev.filter((_, index) => index !== i)
                              );
                            }}
                            variant="ghost"
                            size="icon"
                            className="size-8 absolute top-1 right-1 text-red-500 bg-red-100/40 hover:bg-red-500 hover:text-white"
                          >
                            <Trash />
                          </Button>
                        </div>
                      ))}
                      {additionalImages.map((image, i) => (
                        <div
                          className="w-[150px] aspect-video  relative"
                          key={i}
                        >
                          <Image
                            alt=""
                            src={`${image.preview}`}
                            width={150}
                            height={150}
                          />
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              setAdditionalImages((prev) =>
                                prev.filter((_, index) => index !== i)
                              );
                            }}
                            variant="ghost"
                            size="icon"
                            className="size-8 absolute top-1 right-1 text-red-500 bg-red-100/40 hover:bg-red-500 hover:text-white"
                          >
                            <Trash />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Input
                      type="file"
                      accept="image/jpg, image/png, image/jpeg, image/webp"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (!files) return;

                        for (let i = 0; i < files.length; i++) {
                          const file = files[i];
                          const imageUrl = URL.createObjectURL(file);
                          setAdditionalImages((prev) => [
                            ...prev,
                            {
                              preview: imageUrl,
                              file: file,
                            },
                          ]);
                        }
                      }}
                    />
                  </div>

                  {/* Nom */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du bureau</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex : Bureau A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Capacité */}
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacité</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="ex: 10"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Utilisation des horaires généraux */}
                  {state.initialCompanyParameter.businessHour && (
                    <FormField
                      control={form.control}
                      name="useCompanyHour"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              id="officeHour"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="officeHour"
                            className="text-sm font-normal -translate-y-[3px]"
                          >
                            Utiliser les horaires généraux de l'espace coworking
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  )}
                  {state.initialCompanyParameter.addressLine &&
                    state.initialCompanyParameter.city &&
                    state.initialCompanyParameter.postalCode &&
                    state.initialCompanyParameter.state &&
                    state.initialCompanyParameter.country && (
                      <FormField
                        control={form.control}
                        name="useCompanyAddress"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                id="officeAddress"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor="officeAddress"
                              className="text-sm font-normal -translate-y-[3px]"
                            >
                              Utiliser l‘adresse générale de votre espace
                              coworking
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    )}
                  {!useCompanyAddress && (
                    <div className="space-y-1">
                      <FormLabel>Adresse spécifique pour le bureau</FormLabel>
                      <div className="space-y-2 ml-3">
                        <FormField
                          control={form.control}
                          name="addressLine"
                          render={({ field }) => (
                            <FormItem className="">
                              <FormLabel>Adresse</FormLabel>
                              <FormControl>
                                <Input
                                  autoComplete="address-line1"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Ville</FormLabel>
                                <FormControl>
                                  <Input
                                    autoComplete="address-level2"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem className="">
                                <FormLabel>Code postal</FormLabel>
                                <FormControl>
                                  <Input
                                    autoComplete="postal-code"
                                    type="number"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem className="">
                                <FormLabel>Région</FormLabel>
                                <FormControl>
                                  <Input
                                    autoComplete="address-level1"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem className="">
                                <FormLabel>Pays</FormLabel>
                                <FormControl>
                                  <Input autoComplete="country" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Horaires spécifiques */}
                  {!useCompanySchedule && !!form.watch("schedules") && (
                    <FormField
                      control={form.control}
                      name="schedules"
                      render={({ field }) => {
                        const schedules = field.value as BusinessHour;

                        return (
                          <FormItem>
                            <FormLabel>
                              Horaires d'ouverture spécifiques pour le bureau
                            </FormLabel>
                            <div className="space-y-2">
                              {Object.entries(schedules).map(([day, value]) => {
                                const dayKey = day as DayName;

                                return (
                                  <div
                                    key={day}
                                    className="flex flex-wrap items-center gap-3"
                                  >
                                    <div className="w-24 capitalize">
                                      {dayNameFrMap[dayKey]}
                                    </div>
                                    <div className="flex items-center gap-2 ml-3">
                                      <Input
                                        type="time"
                                        className="w-24"
                                        disabled={value.isClosed ?? false}
                                        value={value.open ?? ""}
                                        onChange={(e) => {
                                          const updated = { ...schedules };
                                          updated[dayKey].open = e.target.value;
                                          field.onChange(updated);
                                        }}
                                      />
                                      <span>-</span>
                                      <Input
                                        type="time"
                                        className="w-24"
                                        disabled={value.isClosed ?? false}
                                        value={value.close ?? ""}
                                        onChange={(e) => {
                                          const updated = { ...schedules };
                                          updated[dayKey].close =
                                            e.target.value;
                                          field.onChange(updated);
                                        }}
                                      />
                                      <div className="flex items-center gap-1">
                                        <Checkbox
                                          id={`closed-${day}`}
                                          checked={value.isClosed ?? false}
                                          onCheckedChange={(checked) => {
                                            const updated = {
                                              ...schedules,
                                            };
                                            updated[dayKey].isClosed =
                                              !!checked;
                                            if (checked) {
                                              updated[dayKey].open = null;
                                              updated[dayKey].close = null;
                                            }
                                            field.onChange(updated);
                                          }}
                                        />
                                        <Label
                                          htmlFor={`closed-${day}`}
                                          className="text-xs"
                                        >
                                          Fermé
                                        </Label>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  )}

                  {/* Équipements */}
                  <FormField
                    control={form.control}
                    name="equipments"
                    render={() => {
                      const selectedEquipments = form.watch("equipments") || [];

                      return (
                        <FormItem>
                          <FormLabel>Matériels disponibles</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            {allEquipments.map((equip) => {
                              const Icon = equip.icon;
                              const isSelected = selectedEquipments.includes(
                                equip.value
                              );

                              return (
                                <div
                                  key={equip.value}
                                  onClick={() => {
                                    const updated = isSelected
                                      ? selectedEquipments.filter(
                                          (e) => e !== equip.value
                                        )
                                      : [...selectedEquipments, equip.value];
                                    form.setValue("equipments", updated);
                                    form.clearErrors("equipments");
                                  }}
                                  className={`flex items-center gap-2 cursor-pointer border rounded px-3 py-2 transition ${
                                    isSelected
                                      ? "bg-indigo-100 border-indigo-400"
                                      : "bg-white border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  <Icon className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{equip.label}</span>
                                  <span className="ml-auto text-xs">
                                    {isSelected ? (
                                      <Check className="w-4 text-indigo-500" />
                                    ) : (
                                      <Plus className="w-4" />
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

              <div className="flex pt-4">
                <Button
                  type="submit"
                  variant="ghost"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? "Enregistrement..."
                    : "Enregistrer l'espace"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
