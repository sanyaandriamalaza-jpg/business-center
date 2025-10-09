"use client";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Plus, X } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { Textarea } from "@/src/components/ui/textarea";

interface DocumentCategoryFieldProps {
  categoryId: string;
  categoryName: string;
  categoryLabels: string[];
  form: any;
}

export function DocumentCategoryField({ 
  categoryId, 
  categoryName, 
  categoryLabels,
  form 
}: DocumentCategoryFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `documents.${categoryId}`,
  });

  return (
    <div className="mb-6 border-b pb-4 last:border-b-0">
      <h4 className="font-bold text-gray-800 mb-2 uppercase">{categoryName === "new" ? "Création de nouvel entreprise" : "Transfert de siège"}</h4>
      
      {/* Affichage des labels de la catégorie */}
      {categoryLabels.length > 0 && (
        <div className="mb-4">
          <FormLabel className="text-sm text-gray-700">
            Labels de cette catégorie:
          </FormLabel>
          <div className="mt-1 flex flex-wrap gap-2">
            {categoryLabels.map((label, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="p-3 border rounded-md bg-gray-50">
            <FormField
              control={form.control}
              name={`documents.${categoryId}.${index}.label`}
              render={({ field: inputField }) => (
                <FormItem className="mb-3">
                  <FormLabel className="text-sm text-gray-700">
                    Nom du document
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input placeholder="Nom du document" {...inputField} />
                      <Button type="button" variant="outline" size="sm" onClick={() => remove(index)}>
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name={`documents.${categoryId}.${index}.description`}
              render={({ field: inputField }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description du document (optionnel)" 
                      {...inputField} 
                      value={inputField.value || ""}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => append({ label: "", description: "" })} 
        className="mt-2 text-neutral-500"
      >
        <Plus className="w-4 h-4 mr-2" /> Ajouter un document
      </Button>
    </div>
  );
}