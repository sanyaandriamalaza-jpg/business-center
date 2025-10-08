import { create } from 'zustand'
import { Company } from '../lib/type'

interface StoreState {
    adminCompany?: Company | null,
    setAdminCompany: (data: Company) => void,
    isGeneralLoadingVisible: boolean,
    setIsGeneralLoadingVisible: (data: boolean) => void
}


export const useAdminStore = create<StoreState>((set) => ({
    adminCompany: null,
    setAdminCompany: (data: Company) => set({ adminCompany: data }),
    isGeneralLoadingVisible: false,
    setIsGeneralLoadingVisible: (data: boolean) => set({ isGeneralLoadingVisible: data }),
}))