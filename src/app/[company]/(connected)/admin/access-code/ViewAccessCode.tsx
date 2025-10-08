import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/src/components/ui/dialog"
  import { Button } from "@/src/components/ui/button"
  import { Eye, Loader2 } from "lucide-react"
  import { useState } from "react"
import { AccessCode } from "@/src/lib/type"
  
  interface AccessCodeDetailsDialogProps {
    codeId: number
  }
  
  export function ViewAccessCode({ codeId }: AccessCodeDetailsDialogProps) {
    const [code, setCode] = useState<AccessCode | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
  
    const fetchCodeDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/access-code/${codeId}`)
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des détails")
        }
        const data = await response.json()
        if (data.success) {
          setCode(data.data)
        } else {
          setError(data.message || "Erreur inconnue")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
      } finally {
        setLoading(false)
      }
    }
  
    const formatDate = (dateInput: string | Date | null | undefined) => {
      if (!dateInput) return "N/A"
      
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
      
      if (isNaN(date.getTime())) return "Date invalide"
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  
    const calculateEndDate = (
      startDate: string | Date, 
      duration: number, 
      durationType: string
    ): Date => {
      const date = new Date(startDate)
      
      if (isNaN(date.getTime())) {
        throw new Error("Date de début invalide")
      }
    
      if (durationType === 'hourly') {
        return new Date(date.getTime() + duration * 60 * 60 * 1000)
      } else {
        return new Date(date.getTime() + duration * 24 * 60 * 60 * 1000)
      }
    }
  
    return (
      <Dialog open={open} onOpenChange={(isOpen : boolean) => {
        setOpen(isOpen)
        if (isOpen && !code) {
          fetchCodeDetails()
        }
      }}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title="Voir les détails">
            <Eye className="h-5 w-5 text-indigo-600" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails du code d'accès</DialogTitle>
          </DialogHeader>
  
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          )}
  
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
  
          {code && !loading && (
            <div className="grid gap-4 py-4 ">
              {/* Section Informations de base */}
              <div className="space-y-2  pb-4 border-b border-b-gray-200">
                <h3 className="font-medium text-gray-900">Informations du code</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">ID</p>
                    <p className="text-sm font-medium">{code.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Code</p>
                    <p className="text-sm font-medium">{code.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <p className="text-sm font-medium">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        code.status === 'active' ? 'bg-green-100 text-green-800' :
                        code.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {code.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
  
              {/* Section Espace */}
              {code.invoice?.office && (
                <div className="space-y-2 pb-4 border-b border-b-gray-200">
                  <h3 className="font-medium text-gray-900">Espace réservé</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nom de l'espace</p>
                      <p className="text-sm font-medium">{code.invoice.office.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Capacité</p>
                      <p className="text-sm font-medium">{code.invoice.office.maxSeatCapacity} places</p>
                    </div>
                  </div>
                </div>
              )}
  
              {/* Section Utilisateur */}
              {code.invoice?.user && (
                <div className="space-y-2 pb-4 border-b border-b-gray-200">
                  <h3 className="font-medium text-gray-900">Utilisateur</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nom complet</p>
                      <p className="text-sm font-medium">
                        {code.invoice.user.firstName} {code.invoice.user.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium">{code.invoice.user.email}</p>
                    </div>
                  </div>
                </div>
              )}
  
              {/* Section Validité */}
              {code.invoice && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Validité</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date de début</p>
                      <p className="text-sm font-medium">
                        {formatDate(code.invoice.startSubscription)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date de fin</p>
                      <p className="text-sm font-medium">
                        {formatDate(calculateEndDate(
                          code.invoice.startSubscription,
                          code.invoice.duration,
                          code.invoice.durationType
                        ).toString())}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Durée</p>
                      <p className="text-sm font-medium">
                        {code.invoice.duration} {code.invoice.durationType === 'hourly' ? 'heures' : 'jours'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }