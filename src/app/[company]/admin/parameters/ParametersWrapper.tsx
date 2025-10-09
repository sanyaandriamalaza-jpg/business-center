"use client";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/src/components/ui/form";
import { useAdminStore } from "@/src/store/useAdminStore";
import { Eye, Plus, Save, Sparkles, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/src/hooks/use-toast";
import { DocumentCategoryField } from "../components/DocumentParameterSection";
import ThemeSelector from "../components/ThemeSelector";
import Cookies from "js-cookie";
import { LogoWrapper } from "../components/LogoWrapper";
import { uploadFile } from "@/src/lib/customfunction";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Label } from "@/src/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { RgbaColorPicker } from "react-colorful";
import { RGBAColor } from "@/src/lib/type";

const documentSchema = z.object({
  label: z.string().min(1, "Le nom du document est requis"),
  description: z.string().optional(),
});

const parametresSchema = z.object({
  companyName: z.string().min(1).max(100),
  contactEmail: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  siret: z.string().optional(),
  siren: z.string().optional(),
  documents: z.record(z.array(documentSchema)),
  minBookingDelay: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 72
    ),
  cancellationDelay: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 168
    ),
  autoConfirmation: z.boolean(),
  emailNotifications: z.boolean(),
  themeId: z.number().nullable(),
  isTvaActive: z.boolean(),
  tva: z.number().nullable(),
  postMailmanagement: z.boolean(),
  backgroundColor: z.string().nullable(),
  foregroundColor: z.string().nullable(),
  standardColor: z.string().nullable(),
  primaryColor: z.string().nullable(),
  primaryColorHover: z.string().nullable(),
});

type ParametresFormData = z.infer<typeof parametresSchema>;
type DocumentField = z.infer<typeof documentSchema>;

// État initial des couleurs pour chaque champ
const initialColors: Record<string, RGBAColor> = {
  backgroundColor: { r: 255, g: 255, b: 255, a: 1 },
  foregroundColor: { r: 255, g: 255, b: 255, a: 1 },
  standardColor: { r: 51, g: 51, b: 51, a: 1 },
  primaryColor: { r: 59, g: 130, b: 246, a: 1 },
  primaryHoverColor: { r: 37, g: 99, b: 235, a: 1 },
};

// Fonction utilitaire pour convertir RGBA en string
const rgbaToString = (color: RGBAColor): string =>
  `${color.r} ${color.g} ${color.b} ${color.a}`;
const rgbaToCss = (color: RGBAColor) =>
  `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;

// Fonction pour parser une string RGBA vers objet
const parseRgbaString = (rgbaString: any) => {
  const values = rgbaString.split(" ").map((v: any) => parseFloat(v));
  if (values.length === 4) {
    return { r: values[0], g: values[1], b: values[2], a: values[3] };
  }
  return { r: 255, g: 255, b: 255, a: 1 };
};

const colorFields = [
  {
    name: "backgroundColor",
    label: "Couleur de fond",
    icon: "🎨",
    description: "Arrière-plan principal",
  },
  {
    name: "foregroundColor",
    label: "Couleur de texte sur les boutons",
    icon: "✍️",
    description: "Texte des boutons",
  },
  {
    name: "standardColor",
    label: "Couleur de texte standard",
    icon: "📝",
    description: "Texte général",
  },
  {
    name: "primaryColor",
    label: "Couleur principale des boutons",
    icon: "🔘",
    description: "Boutons principaux",
  },
  {
    name: "primaryHoverColor",
    label: "Couleur principale des boutons (au survol)",
    icon: "✨",
    description: "Effet de survol",
  },
];

export default function ParametersWrapper() {
  const adminCompany = useAdminStore((state) => state.adminCompany);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>(
    {}
  );
  const [categoryLabels, setCategoryLabels] = useState<
    Record<string, string[]>
  >({});
  const [selectedTheme, setSelectedTheme] = useState<number | null>(
    adminCompany?.theme.id ?? null
  );
  const [currentLogo, setCurrentLogo] = useState<string | null>(
    adminCompany?.logoUrl ?? null
  );
  const [isCustom, setIsCustom] = useState(false);
  const [colors, setColors] =
    useState<Record<string, RGBAColor>>(initialColors);
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const handleColorChange = (fieldName: string, newColor: RGBAColor): void => {
    setColors((prev) => ({
      ...prev,
      [fieldName]: newColor,
    }));

    const rgbaString = rgbaToString(newColor);
    form.setValue(fieldName as any, rgbaString);
  };

  // Gestionnaire de changement d'input
  const handleInputChange = (fieldName: string, value: string): void => {
    try {
      const parsedColor = parseRgbaString(value);
      setColors((prev) => ({
        ...prev,
        [fieldName]: parsedColor,
      }));
    } catch (error) {
      console.log("Invalid color format");
    }
  };

  const form = useForm<ParametresFormData>({
    resolver: zodResolver(parametresSchema),
    defaultValues: {
      companyName: "",
      contactEmail: "",
      phone: "",
      siret: "",
      siren: "",
      postMailmanagement: false,
      isTvaActive: false,
      tva: 0,
      documents: {},
      minBookingDelay: "1",
      cancellationDelay: "24",
      autoConfirmation: false,
      emailNotifications: true,
      themeId: selectedTheme,
      backgroundColor: "",
      foregroundColor: "",
      standardColor: "",
      primaryColor: "",
      primaryColorHover: "",
    },
  });

  const handleLogoChange = async (file: File) => {
    try {
      if (!file) return;

      const res = await uploadFile(file, { customFolder: "Logo" });

      const uploadedUrl = res.success ? res.path : null;

      setCurrentLogo(uploadedUrl as string);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'upload du logo.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (adminCompany) {
      const groupedDocs: Record<string, DocumentField[]> = {};
      const names: Record<string, string> = {};
      const labels: Record<string, string[]> = {};

      if (adminCompany.documents) {
        adminCompany.documents.forEach((doc) => {
          const categoryId = doc.categoryType?.idCategory?.toString() || "1";
          const categoryName =
            doc.categoryType?.categoryName || `Catégorie ${categoryId}`;
          names[categoryId] = categoryName;

          // const categoryLabelsList = doc.categoryType?.labels?.map((label) => label.labelDescription) || [];
          // if (categoryLabelsList.length > 0) {
          //   labels[categoryId] = categoryLabelsList ?? [];
          // }

          if (!groupedDocs[categoryId]) groupedDocs[categoryId] = [];
          groupedDocs[categoryId].push({
            label: doc?.file_type_label ?? "",
            description: doc?.file_description ?? "",
          });
        });
      }

      setCategoryNames(names);
      setCategoryLabels(labels);

      form.reset({
        companyName: adminCompany.name || "",
        contactEmail: adminCompany.email || "",
        phone: adminCompany.phone || "",
        siret: adminCompany.siret || "",
        siren: adminCompany.siren || "",
        postMailmanagement: adminCompany.postMailManagementIsActive || false,
        isTvaActive: adminCompany.tvaIsActive || false,
        tva: adminCompany.tva || 0,
        documents: groupedDocs,
        minBookingDelay: "1",
        cancellationDelay: "24",
        autoConfirmation: false,
        emailNotifications: true,
        themeId: 1,
        backgroundColor: adminCompany.theme.backgroundColor || "",
        foregroundColor: adminCompany.theme.foregroundColor || "",
        standardColor: adminCompany.theme.standardColor || "",
        primaryColor: adminCompany.theme.primaryColor || "",
        primaryColorHover: adminCompany.theme.primaryColorHover || "",
      });
    }
  }, [adminCompany, form]);

  const handleApplicate = async () => {
    if (!adminCompany) return;

    try {
      const themeData = {
        name: `${adminCompany.name} Theme`,
        background_color: form.getValues("backgroundColor"),
        primary_color: form.getValues("primaryColor"),
        primary_color_hover: form.getValues("primaryColorHover"),
        foreground_color: form.getValues("foregroundColor"),
        standard_color: form.getValues("standardColor"),
        id_company: adminCompany.id,
      };

      const response = await fetch("/api/color-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(themeData),
      });

      const result = await response.json();

      if (!result.success || !result.data) {
        toast({
          title: "Erreur",
          description: "Impossible de créer ou mettre à jour le thème.",
          variant: "destructive",
        });
        return;
      }

      const themeId = result.data.id;
      form.setValue("themeId", themeId);

      toast({
        title: "Succès",
        description: "Thème appliqué avec succès.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erreur lors de l'application du thème :", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'application du thème.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: ParametresFormData) => {
    try {
      const existingDocs =
        adminCompany?.documents?.map((doc) => ({
          id: doc.id,
          label: doc.file_type_label,
          description: doc.file_description,
          id_category_file: doc.categoryType?.idCategory,
        })) || [];

      const newDocs = Object.entries(data.documents).flatMap(
        ([categoryId, documents]) =>
          documents.map((doc) => ({
            label: doc.label,
            description: doc.description || null,
            id_category_file: parseInt(categoryId),
          }))
      );

      const existingLabels = existingDocs.map((doc) => doc.label);
      const toAdd = newDocs.filter(
        (doc) => !existingLabels.includes(doc.label)
      );
      const toUpdate = newDocs.filter((doc) => {
        const existingDoc = existingDocs.find((d) => d.label === doc.label);
        return existingDoc && existingDoc.description !== doc.description;
      });
      const toDelete = existingDocs.filter(
        (doc) => !newDocs.some((nd) => nd.label === doc.label)
      );

      for (const doc of toAdd) {
        await fetch("/api/domiciliation-file-type", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: doc.label,
            description: doc.description,
            id_category_file: doc.id_category_file,
            id_company: adminCompany?.id,
          }),
        });
      }

      for (const doc of toUpdate) {
        const existingDoc = existingDocs.find((d) => d.label === doc.label);
        if (existingDoc) {
          await fetch(`/api/domiciliation-file-type/${existingDoc.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              description: doc.description,
            }),
          });
        }
      }

      for (const doc of toDelete) {
        await fetch(`/api/domiciliation-file-type/${doc.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_archived: true }),
        });
      }

      await fetch(`/api/company/${adminCompany?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.companyName,
          email: data.contactEmail,
          phone: data.phone,
          siret: data.siret,
          siren: data.siren,
          postMailManagementIsActive: data.postMailmanagement,
          tvaIsActive: data.isTvaActive,
          tva: data.tva,
          logo_url: currentLogo,
          id_color_theme: data.themeId,
        }),
      });

      const res = await fetch(`/api/color-theme/${selectedTheme}`);
      const result = await res.json();

      const theme = result.success ? result.data : null;

      // Enregistre les cookies
      Cookies.set("backgroundColor", theme.backgroundColor);
      Cookies.set("primaryColor", theme.primaryColor);
      Cookies.set("primaryColorHover", theme.primaryColorHover);
      Cookies.set("foregroundColor", theme.foregroundColor);
      Cookies.set("standardColor", theme.standardColor);

      toast({
        title: "Succès",
        description: "Paramètres mis à jour avec succès.",
        variant: "success",
      });

      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Erreur de mise à jour.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="py-8 px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
            <Button
              type="submit"
              variant="ghost"
              className="bg-indigo-600 hover:bg-indigo-700 hover:text-white text-white font-medium px-6"
            >
              <Save className="w-5 h-5" /> Enregistrer
            </Button>
          </div>

          {/* Paramètres Généraux */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-md font-bold text-gray-900 mb-4">
              Paramètres Généraux
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3">
              <LogoWrapper
                currentLogo={currentLogo as string}
                companyName={adminCompany?.name}
                onLogoChange={handleLogoChange}
              />
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-sm text-gray-800">
                        Nom du centre d'affaire
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="FlexSpace" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-sm text-gray-800">
                        Email de contact
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="contact@flexispace.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-sm text-gray-800">
                        Téléphone
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Non fourni" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="siret"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="text-sm text-gray-800">
                          Numéro de SIRET
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Non fourni" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="siren"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="text-sm text-gray-800">
                          SIREN
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Non fourni" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Choix du thème de couleur */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-md font-bold text-gray-900 mb-4">
              Thème de couleur
            </h3>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              <div className="xl:col-span-1">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-md border border-white/30">
                  <ThemeSelector
                    selectedTheme={selectedTheme}
                    onSelectTheme={(id) => {
                      setSelectedTheme(id);
                      form.setValue("themeId", id);
                    }}
                  />

                  <div className="mt-6">
                    <RadioGroup
                      value={isCustom?.toString() ?? ""}
                      onValueChange={() => setIsCustom(true)}
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem
                          value="custom"
                          id="custom-theme"
                          className="border-2"
                        />
                        <Label
                          htmlFor="custom-theme"
                          className="flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/30 flex-1"
                        >
                          <Sparkles className="w-5 h-5 text-blue-500" />
                          <span className="font-semibold text-gray-700">
                            Personnaliser
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
              {/* Section des couleurs personnalisées */}
              <div className="xl:col-span-3">
                {isCustom && (
                  <div className="flex justify-between">
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-md border border-white/30">
                      <div className="flex items-center gap-2 mb-6">
                        <Eye className="w-5 h-5 text-blue-600" />
                        <h4 className="text-lg font-semibold text-gray-800">
                          Couleurs personnalisées
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {colorFields.map((color) => (
                          <div key={color.name} className="group">
                            <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200/60 bg-white/40 transition-all duration-300 hover:shadow-md hover:border-blue-300/50 hover:bg-white/60">
                              {/* Color Picker Button */}
                              <Popover
                                open={openPopover === color.name}
                                onOpenChange={(open) =>
                                  setOpenPopover(open ? color.name : null)
                                }
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="lg"
                                    className="w-14 h-14 p-0 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 relative overflow-hidden"
                                    style={{
                                      backgroundColor: rgbaToCss(
                                        colors[color.name]
                                      ),
                                    }}
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-4 bg-white/95 backdrop-blur-sm border border-white/30 shadow-2xl rounded-xl">
                                  <div className="space-y-3">
                                    <h5 className="font-medium text-gray-800">
                                      {color.label}
                                    </h5>
                                    <RgbaColorPicker
                                      color={colors[color.name]}
                                      onChange={(newColor: RGBAColor) =>
                                        handleColorChange(color.name, newColor)
                                      }
                                    />
                                  </div>
                                </PopoverContent>
                              </Popover>

                              {/* Form Field */}
                              <div>
                                <FormField
                                  control={form.control}
                                  name={color.name as keyof ParametresFormData}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        {color.label}
                                        <span className="text-xs text-gray-500 font-normal">
                                          ({color.description})
                                        </span>
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="255 255 255 1"
                                          {...field}
                                          value={
                                            typeof field.value === "string"
                                              ? field.value
                                              : (rgbaToString(
                                                  colors[color.name]
                                                ) ?? "")
                                          }
                                          onChange={(e) => {
                                            field.onChange(e.target.value);
                                            handleInputChange(
                                              color.name,
                                              e.target.value
                                            );
                                          }}
                                          className="mt-2 bg-white/70 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all duration-300"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        {isCustom && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="bg-cPrimary w-full text-cForeground hover:bg-cPrimaryHover hover:text-cForeground"
                            onClick={handleApplicate}
                          >
                            Appliquer
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* Aperçu */}
                    <div className="xl:col-span-1">
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-md border border-white/30 h-fit">
                        <div className="flex items-center gap-2 mb-4">
                          <Eye className="w-5 h-5 text-green-600" />
                          <h4 className="text-lg font-semibold text-gray-800">
                            Aperçu
                          </h4>
                        </div>

                        <div
                          className="border-2 border-gray-200 rounded-xl p-6 space-y-4 transition-all duration-300 shadow-inner mb-4"
                          style={{
                            backgroundColor: rgbaToCss(colors.backgroundColor),
                            borderColor: rgbaToCss(colors.standardColor) + "40",
                          }}
                        >
                          <p
                            className="text-sm leading-relaxed"
                            style={{ color: rgbaToCss(colors.standardColor) }}
                          >
                            Lorem ipsum dolor sit amet, consectetur adipisicing
                            elit. Nemo, quod.
                          </p>

                          <Button
                            variant="ghost"
                            className="w-full rounded-lg font-medium transition-all duration-300 shadow-sm"
                            style={{
                              backgroundColor: rgbaToCss(colors.primaryColor),
                              color: rgbaToCss(colors.foregroundColor),
                            }}
                            onMouseEnter={(
                              e: React.MouseEvent<HTMLButtonElement>
                            ) => {
                              (
                                e.target as HTMLButtonElement
                              ).style.backgroundColor = rgbaToCss(
                                colors.primaryHoverColor
                              );
                            }}
                            onMouseLeave={(
                              e: React.MouseEvent<HTMLButtonElement>
                            ) => {
                              (
                                e.target as HTMLButtonElement
                              ).style.backgroundColor = rgbaToCss(
                                colors.primaryColor
                              );
                            }}
                          >
                            Survole-moi ✨
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Facturation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-md font-bold text-gray-900 mb-4">
              Facturation et TVA
            </h3>
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="postMailmanagement"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm text-gray-800">
                        Envoie des factures par email
                      </FormLabel>
                      <FormDescription className="text-xs text-gray-600">
                        Envoyer les factures du client directement par email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div
                          onClick={() => field.onChange(!field.value)}
                          className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer cursor-pointer transition-all duration-200"
                          style={{
                            backgroundColor: field.value
                              ? "#4f46e5"
                              : "#e5e7eb",
                          }}
                        >
                          <div
                            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white border border-gray-200 rounded-full shadow transition-all duration-200"
                            style={{
                              transform: field.value
                                ? "translateX(20px)"
                                : "translateX(0px)",
                            }}
                          />
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isTvaActive"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm text-gray-800">
                          Activer le TVA
                        </FormLabel>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div
                            onClick={() => field.onChange(!field.value)}
                            className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer cursor-pointer transition-all duration-200"
                            style={{
                              backgroundColor: field.value
                                ? "#4f46e5"
                                : "#e5e7eb",
                            }}
                          >
                            <div
                              className="absolute top-0.5 left-0.5 w-5 h-5 bg-white border border-gray-200 rounded-full shadow transition-all duration-200"
                              style={{
                                transform: field.value
                                  ? "translateX(20px)"
                                  : "translateX(0px)",
                              }}
                            />
                          </div>
                        </div>
                      </FormControl>
                    </div>

                    {/* Champ TVA conditionnel */}
                    {field.value && (
                      <FormField
                        control={form.control}
                        name="tva"
                        render={({ field: tvaField }) => (
                          <FormItem className="mt-2">
                            <FormLabel className="text-sm text-gray-800">
                              TVA (%)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="20.00"
                                {...tvaField}
                                value={tvaField.value ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  tvaField.onChange(
                                    value === "" ? null : parseFloat(value)
                                  );
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Documents justificatifs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-md font-bold text-gray-900 mb-4">
              Documents justificatif pour la domiciliation
            </h3>

            {Object.entries(categoryNames).map(([categoryId, categoryName]) => (
              <DocumentCategoryField
                key={categoryId}
                categoryId={categoryId}
                categoryName={categoryName}
                categoryLabels={categoryLabels[categoryId] || []}
                form={form}
              />
            ))}
          </div>

          {/* Réservations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-md font-bold text-gray-900 mb-4">
              Réservations
            </h1>

            <FormField
              control={form.control}
              name="minBookingDelay"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm text-gray-800">
                    Délai minimum de réservation (heures)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cancellationDelay"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm text-gray-800">
                    Délai d'annulation gratuite (heures)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="24" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoConfirmation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-xs text-gray-800">
                      Confirmation automatique des réservations
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-md font-bold text-gray-900 mb-4">
              Notifications
            </h1>

            <FormField
              control={form.control}
              name="emailNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm text-gray-800">
                      Notifications par email
                    </FormLabel>
                    <FormDescription className="text-xs text-gray-600">
                      Recevoir les notifications de nouvelles réservations par
                      email
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div
                        onClick={() => field.onChange(!field.value)}
                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer cursor-pointer transition-all duration-200"
                        style={{
                          backgroundColor: field.value ? "#4f46e5" : "#e5e7eb",
                        }}
                      >
                        <div
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white border border-gray-200 rounded-full shadow transition-all duration-200"
                          style={{
                            transform: field.value
                              ? "translateX(20px)"
                              : "translateX(0px)",
                          }}
                        />
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
