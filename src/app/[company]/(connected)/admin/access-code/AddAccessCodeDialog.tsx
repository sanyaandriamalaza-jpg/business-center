"use client"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select"
import { Loader2, Plus, Calendar, Clock, User, Building } from "lucide-react"
import { useState, useEffect } from "react"
import { BasicUser, Office } from "@/src/lib/type"


interface AddAccessCodeDialogProps {
  onSuccess?: () => void
}

export function AddAccessCodeDialog({ onSuccess }: AddAccessCodeDialogProps) {
  const [open, setOpen] = useState(false)
  const [customCode, setCustomCode] = useState("")
  const [startValidity, setStartValidity] = useState("")
  const [endValidity, setEndValidity] = useState("")
  const [idBasicUser, setIdBasicUser] = useState<string>("")
  const [idOffice, setIdOffice] = useState<string>("")
  const [status, setStatus] = useState("active")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [offices, setOffices] = useState<Office[]>([])
  const [users, setUsers] = useState<BasicUser[]>([])

  // Récupérer les offices et users
  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    setIsLoadingData(true)
    try {
      // Récupérer les offices
      const officesResponse = await fetch('/api/office')
      if (officesResponse.ok) {
        const officesData = await officesResponse.json()
        setOffices(officesData.data || [])
      }

      // Récupérer les utilisateurs
      const usersResponse = await fetch('/api/user/basic-user')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.data || [])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validation du code
    if (customCode && (customCode.length < 4 || customCode.length > 50)) {
      newErrors.code = "Le code doit contenir entre 4 et 50 caractères"
    }

    // Validation des dates
    if (startValidity && isNaN(new Date(startValidity).getTime())) {
      newErrors.startValidity = "Date de début invalide"
    }

    if (endValidity && isNaN(new Date(endValidity).getTime())) {
      newErrors.endValidity = "Date de fin invalide"
    }


    // Validation de la cohérence des dates
    if (startValidity && endValidity) {
      const start = new Date(startValidity)
      const end = new Date(endValidity)

      if (end <= start) {
        newErrors.dateConsistency = "La fin doit être après le début"
      }

    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const requestBody: any = {
        status
      }

      if (customCode) requestBody.code = customCode
      if (startValidity) requestBody.startValidity = startValidity
      if (endValidity) requestBody.endValidity = endValidity
      if (idBasicUser) requestBody.idBasicUser = idBasicUser
      if (idOffice) requestBody.idOffice = idOffice

      const response = await fetch('/api/access-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erreur lors de la création du code')
      }

      setOpen(false)
      resetForm()
      onSuccess?.()
      
      alert(`Code créé avec succès ! Code: ${result.data.code}`)

    } catch (error) {
      console.error("Erreur lors de la création:", error)
      alert("Erreur lors de la création: " + (error instanceof Error ? error.message : 'Erreur inconnue'))
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setCustomCode("")
    setStartValidity("")
    setEndValidity("")
    setIdBasicUser("")
    setIdOffice("")
    setStatus("active")
    setErrors({})
  }

  const calculateAutoDates = () => {
    const now = new Date()
    const start = startValidity ? new Date(startValidity) : now
    const end = endValidity 
      ? new Date(endValidity)
      : new Date(start.getTime() + 2 * 60 * 60 * 1000) // +2 heures

    return { start, end }
  }

  const { start, end } = calculateAutoDates()

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        resetForm()
      }
    }}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau code d'accès</DialogTitle>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {/* Code personnalisé */}
            <div className="space-y-2">
              <Label htmlFor="customCode">Code personnalisé (optionnel)</Label>
              <Input
                id="customCode"
                placeholder="Laissez vide pour un code généré automatiquement"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
              />
              {errors.code && (
                <p className="text-xs text-red-500">{errors.code}</p>
              )}
            </div>

            {/* Assignation utilisateur et espace */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Utilisateur (optionnel)
                </Label>
                <Select value={idBasicUser} onValueChange={setIdBasicUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun utilisateur</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.firstName} {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="office" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Espace (optionnel)
                </Label>
                <Select value={idOffice} onValueChange={setIdOffice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un espace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun espace</SelectItem>
                    {offices.map(office => (
                      <SelectItem key={office.id} value={String(office.id)}>
                        {office.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates personnalisées */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dates personnalisées
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="startValidity">Début validité</Label>
                  <Input
                    id="startValidity"
                    type="datetime-local"
                    value={startValidity}
                    onChange={(e) => setStartValidity(e.target.value)}
                  />
                  {errors.startValidity && (
                    <p className="text-xs text-red-500">{errors.startValidity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endValidity">Fin validité</Label>
                  <Input
                    id="endValidity"
                    type="datetime-local"
                    value={endValidity}
                    onChange={(e) => setEndValidity(e.target.value)}
                  />
                  {errors.endValidity && (
                    <p className="text-xs text-red-500">{errors.endValidity}</p>
                  )}
                </div>

              </div>

              {errors.dateConsistency && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.dateConsistency}</p>
                </div>
              )}
            </div>

            {/* Aperçu des dates */}
            <div className="p-4 bg-blue-50 rounded-md">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Aperçu des dates
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Début validité:</span>
                  <span className="font-medium">{start.toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Fin validité:</span>
                  <span className="font-medium">{end.toLocaleString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || isLoadingData}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Créer le code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}