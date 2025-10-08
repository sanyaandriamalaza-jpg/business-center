import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";
import { Loader2, User, Building, MapPin, Mail, BadgePlus } from "lucide-react";
import { useState, useEffect } from "react";
import { Office } from "@/src/lib/type";
import { useToast } from "@/src/hooks/use-toast";

interface UserProps {
  id: number;
  name: string;
  firstName: string;
  email: string;
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface AssignAccessCodeDialogProps {
  code: {
    id: number;
    code: string;
    status: string;
  };
}

export function AssignAccessCodeDialog({ code }: AssignAccessCodeDialogProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserProps[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
  const [officeId, setOfficeId] = useState<string>();
  const [duration, setDuration] = useState(1);
  const [durationType, setDurationType] = useState<
    "hourly" | "daily" | "monthly" | "annualy"
  >("daily");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      // Récupérer les utilisateurs avec leurs adresses
      const usersResponse = await fetch(
        "/api/user/basic-user?withAddress=true"
      );
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data || []);
      }

      // Récupérer les offices
      const officesResponse = await fetch("/api/office");
      if (officesResponse.ok) {
        const officesData = await officesResponse.json();
        setOffices(officesData.data || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      alert("Veuillez sélectionner un utilisateur");
      return;
    }

    setIsLoading(true);
    try {
      const accessCodeResponse = await fetch(`/api/access-code/${code.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "active",
        }),
      });

      const accessCodeResult = await accessCodeResponse.json();

      if (!accessCodeResponse.ok || !accessCodeResult.success) {
        throw new Error(
          accessCodeResult.message ||
            "Erreur lors de l'activation du code d'accès"
        );
      }

      setOpen(false);
      resetForm();

      toast.toast({
        title: "Succès",
        description: "Code d'accès assigné et activé avec succès.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erreur lors de l'assignation:", error);
      alert(
        "Erreur lors de l'assignation: " +
          (error instanceof Error ? error.message : "Erreur inconnue")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setOfficeId(undefined);
    setDuration(1);
    setDurationType("daily");
    setPaymentMethod("card");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Assigner à un espace ou un utilisateur"
        >
          <BadgePlus className="w-5 h-5 text-emerald-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assigner le code {code.code}</DialogTitle>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="user"
                className="text-right flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Utilisateur *
              </Label>
              <Select
                onValueChange={(userId: string) => {
                  if (userId === "null") {
                    setSelectedUser(null);
                  } else {
                    const user = users.find((u) => String(u.id) === userId);
                    setSelectedUser(user || null);
                  }
                }}
                value={selectedUser ? String(selectedUser.id) : "null"}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Aucun utilisateur</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.firstName} {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Informations de l'utilisateur sélectionné */}
            {selectedUser && (
              <div className="grid grid-cols-4 items-center gap-4 p-4 bg-gray-50 rounded-md">
                <div className="col-span-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Informations client
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Email: </span>
                      <span>{selectedUser.email}</span>
                    </div>
                    {selectedUser.addressLine && (
                      <div className="col-span-2 flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <div>{selectedUser.addressLine}</div>
                          <div>
                            {selectedUser.postalCode} {selectedUser.city}
                            {selectedUser.state && `, ${selectedUser.state}`}
                            {selectedUser.country &&
                              `, ${selectedUser.country}`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sélection de l'espace */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="office"
                className="text-right flex items-center gap-2"
              >
                <Building className="h-4 w-4" />
                Espace
              </Label>
              <Select onValueChange={setOfficeId} value={officeId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un espace (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aucun">Aucun espace</SelectItem>
                  {offices?.map((office) => (
                    <SelectItem key={office.id} value={String(office.id)}>
                      {office.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Durée et type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Durée *</Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-20"
                />
                <Select
                  onValueChange={(value: any) => setDurationType(value)}
                  value={durationType}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Heure(s)</SelectItem>
                    <SelectItem value="daily">Jour(s)</SelectItem>
                    <SelectItem value="monthly">Mois</SelectItem>
                    <SelectItem value="annualy">An</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={handleSubmit}
            disabled={isLoading || isLoadingData || !selectedUser}
            className="bg-cPrimary text-white hover:bg-cPrimaryHover hover:text-white"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
