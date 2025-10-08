'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Button } from '@/src/components/ui/button'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

export const editUserSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  firstname: z.string().min(1, 'Prénom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Téléphone requis'),
  role: z.string().min(1, 'Rôle requis'),
  company: z.string().optional(),
})

export type UserValues = z.infer<typeof editUserSchema>

type Props = {
  open: boolean
  setOpen: (val: boolean) => void
  initialData: UserValues
  onUpdate: (data: UserValues) => void
}

export function EditUserDialog({ open, setOpen, initialData, onUpdate }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: initialData,
  })

  const onSubmit = (data: UserValues) => {
    onUpdate(data)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-gray-900 font-medium">Modifier l'utilisateur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className='text-gray-600'>Nom</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <Label className='text-gray-600'>Prénom</Label>
            <Input {...register('firstname')} />
            {errors.firstname && <p className="text-sm text-red-500">{errors.firstname.message}</p>}
          </div>

          <div>
            <Label className='text-gray-600'>Email</Label>
            <Input type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <Label className='text-gray-600'>Téléphone</Label>
            <Input {...register('phone')} />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>

          <div>
            <Label className='text-gray-600'>Rôle</Label>
            <Input {...register('role')} readOnly/>
          </div>

          <div>
            <Label className='text-gray-600'>Entreprise</Label>
            <Input {...register('company')} />
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" className="bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white" type="submit">Mettre à jour</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
