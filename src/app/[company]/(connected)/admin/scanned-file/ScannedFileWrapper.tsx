'use client'

import { uploadImage } from '@/src/lib/customfunction'
import { baseUrl } from '@/src/lib/utils'
import { useAdminStore } from '@/src/store/useAdminStore'
import { useState, useRef } from 'react'

interface AnalysisResult {
  destinataire: string
  expediteur: string
  objet: string
  confidence: number
}

interface SaveResult {
  success: boolean
  message: string
  insertedId?: number
}

export default function ScannedFileWrapper() {
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const adminCompany = useAdminStore((state) => state.adminCompany);

  const validateFile = (selectedFile: File) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf'
    ]
    
    if (allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile)
      setError(null)
      return true
    } else {
      setError('Veuillez sélectionner un fichier image (JPEG, PNG, GIF, WebP) ou PDF')
      setFile(null)
      return false
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateFile(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      validateFile(droppedFiles[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const analyzeFile = async () => {
    if (!file) return

    setLoading(true)
    setError(null)
    setResult(null)
    setSaveResult(null)

    try {
      // Étape 1: Upload du fichier
      const uploadData = await uploadImage(file, { customFolder: "Scanned-file" })

      setFileUrl(uploadData.path as string)

      // Étape 2: Analyse du fichier
      const analyzeFormData = new FormData()
      analyzeFormData.append('file', file)

      const analyzeResponse = await fetch(`/api/scanned-file-analyzer`, {
        method: 'POST',
        body: analyzeFormData,
      })

      if (!analyzeResponse.ok) {
        throw new Error(`Erreur analyse: ${analyzeResponse.status}`)
      }

      const analysisData = await analyzeResponse.json()
      setResult(analysisData)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const saveToDatabase = async () => {
    setCompanyId(adminCompany?.id.toString() || '');
    
    if (!fileUrl || !result || !companyId.trim()) {
      setError('Informations manquantes pour l\'enregistrement (URL du fichier, résultats d\'analyse ou ID de l\'entreprise)')
      return
    }

    setSaving(true)
    setError(null)
    setSaveResult(null)

    try {
      const response = await fetch('/api/received-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_url: fileUrl,
          id_company: parseInt(companyId),
          analysis_result: result
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || `Erreur: ${response.status}`)
      }

      setSaveResult(data)
      
      if (data.success) {
        setFile(null)
        setFileUrl(null)
        setResult(null)
        setCompanyId('')
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className=" mx-auto">
        <div className="mb-4">
          <h1 className="text-xl xl:text-2xl font-bold text-cDefaultSecondary-100">
            Courriers scannés
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Téléchargez une image de courrier scanné pour extraire automatiquement 
            le destinataire, l'expéditeur et l'objet
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-4">
              Télécharger un fichier (Image ou PDF)
            </label>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFileDialog}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragOver 
                  ? 'border-cPrimary bg-blue-50' 
                  : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="flex flex-col items-center">
                <svg 
                  className={`w-12 h-12 mb-4 ${isDragOver ? 'text-cPrimary' : 'text-gray-400'}`}
                  stroke="currentColor" 
                  fill="none" 
                  viewBox="0 0 48 48"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                  />
                </svg>
                
                <p className={`text-lg font-medium mb-2 ${isDragOver ? 'text-cPrimary' : 'text-gray-600'}`}>
                  {isDragOver ? 'Déposez votre fichier ici' : 'Glissez-déposez votre fichier ici'}
                </p>
                
                <p className="text-sm text-gray-500 mb-4">
                  ou cliquez pour sélectionner
                </p>
                
                <p className="text-xs text-gray-400">
                  Formats supportés: JPEG, PNG, GIF, WebP, PDF
                </p>
                
                <p className="text-xs text-gray-400 mt-1">
                  Taille maximale: 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Prévisualisation du fichier */}
          {file && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Fichier sélectionné:</p>
              <div className="bg-gray-50 p-4 rounded-lg border flex items-center">
                <div className="flex-shrink-0 mr-3">
                  {file.type === 'application/pdf' ? (
                    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-cPrimary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-cDefaultSecondary-100">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {file.type === 'application/pdf' ? 'Document PDF' : 'Image'} • {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="flex-shrink-0 text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="space-y-3">
            <button
              onClick={analyzeFile}
              disabled={!file || loading}
              className="w-full bg-cPrimary text-cForeground py-3 px-4 rounded-lg font-medium hover:bg-cPrimaryHover disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyse en cours...' : 'Analyser le courrier'}
            </button>

            {result && fileUrl && companyId && (
              <button
                onClick={saveToDatabase}
                disabled={saving}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Enregistrement...' : 'Envoyer le fichier'}
              </button>
            )}
          </div>

          {saveResult && saveResult.success && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-cPrimary mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-cDefaultPrimary-200 font-medium">{saveResult.message}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Résultats de l'analyse
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expéditeur:
                  </label>
                  <p className="text-gray-900 bg-white p-2 rounded border">
                    {result.expediteur || 'Non détecté'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Destinataire:
                  </label>
                  <p className="text-gray-900 bg-white p-2 rounded border">
                    {result.destinataire || 'Non détecté'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Objet:
                  </label>
                  <p className="text-gray-900 bg-white p-2 rounded border">
                    {result.objet || 'Non détecté'}
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <span className="text-xs text-gray-500">
                    Niveau de confiance: {Math.round(result.confidence * 100)}%
                  </span>
                </div>
                
                {!saveResult?.success && fileUrl && companyId && (
                  <div className="pt-4">
                    <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                      ⚠️ Cliquez sur "Envoyer le fichier" pour l'envoyer à sa destinataire
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}