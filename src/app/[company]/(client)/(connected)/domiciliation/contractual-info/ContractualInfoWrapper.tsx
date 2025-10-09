// "use client";

// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/src/components/ui/card";
// import { Button } from "@/src/components/ui/button";
// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "@/src/components/ui/table";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/src/components/ui/dropdown-menu";
// import {
//   FileText,
//   Download,
//   FileSearch,
//   FileDigit,
//   FileSignature,
//   FileArchive,
//   FileSpreadsheet,
//   ClipboardX,
//   FileBadge,
//   Folders,
//   X,
//   MoreVertical,
// } from "lucide-react";
// import { useToast } from "@/src/hooks/use-toast";
// import { Documents } from "@/src/lib/type";

// const allDocuments: Documents[] = [
//   {
//     id: "DOC-001",
//     type: "contract",
//     name: "Contrat de domiciliation",
//     created_at: "15/01/2024",
//     signed_at: "16/01/2024",
//     size: "2.4 MB",
//     status: "available",
//     url: "/documents/contrat.pdf",
//   },
//   {
//     id_doc: "DOC-002",
//     type: "invoice",
//     name: "Facture janvier 2024",
//     created_at: "05/01/2024",
//     size: "1.1 MB",
//     status: "available",
//     url: "/documents/contrat.pdf",
//   },
//   {
//     id_doc: "DOC-003",
//     type: "certificate",
//     name: "Attestation de domiciliation",
//     created_at: "20/01/2024",
//     size: "0.8 MB",
//     status: "available",
//     url: "/documents/contrat.pdf",
//   },
//   {
//     id_doc: "DOC-004",
//     type: "rib",
//     name: "RIB Entreprise",
//     created_at: "10/01/2024",
//     updated_at: "10/02/2024",
//     size: "1.5 MB",
//     status: "available",
//     url: "/documents/contrat.pdf",
//   },
//   {
//     id_doc: "DOC-005",
//     type: "kbis",
//     name: "Extrait Kbis",
//     created_at: "18/01/2024",
//     size: "3.2 MB",
//     status: "pending",
//   },
//   {
//     id_doc: "DOC-006",
//     type: "statutes",
//     name: "Statuts de la société",
//     created_at: "05/12/2023",
//     updated_at: "05/02/2024",
//     size: "5.7 MB",
//     status: "available",
//     url: "/documents/contrat.pdf",
//   },
//   {
//     id_doc: "DOC-007",
//     type: "invoice",
//     name: "Facture décembre 2023",
//     created_at: "05/12/2023",
//     size: "1.0 MB",
//     status: "expired",
//   },
// ];

// const mainDocuments = allDocuments.filter((doc) =>
//   ["contract", "certificate", "rib", "kbis"].includes(doc.type)
// );

// export default function ContractualInfoWrapper() {
//   const toast = useToast();

//   const getDocumentIcon = (type: string) => {
//     switch (type) {
//       case "contract":
//         return <FileSignature className="h-5 w-5 mr-2" />;
//       case "invoice":
//         return <FileDigit className="h-5 w-5 mr-2" />;
//       case "certificate":
//         return <FileText className="h-5 w-5 mr-2" />;
//       case "rib":
//         return <FileSpreadsheet className="h-5 w-5 mr-2" />;
//       case "kbis":
//         return <FileSearch className="h-5 w-5 mr-2" />;
//       case "statutes":
//         return <FileArchive className="h-5 w-5 mr-2" />;
//       default:
//         return <FileText className="h-5 w-5 mr-2" />;
//     }
//   };

//   const getDocumentColor = (type: string) => {
//     switch (type) {
//       case "contract":
//         return "bg-blue-50 text-blue-800 border-blue-200";
//       case "invoice":
//         return "bg-green-50 text-green-800 border-green-200";
//       case "certificate":
//         return "bg-purple-50 text-purple-800 border-purple-200";
//       case "rib":
//         return "bg-emerald-50 text-emerald-800 border-emerald-200";
//       case "kbis":
//         return "bg-amber-50 text-amber-800 border-amber-200";
//       case "statutes":
//         return "bg-indigo-50 text-indigo-800 border-indigo-200";
//       default:
//         return "bg-gray-50 text-gray-800 border-gray-200";
//     }
//   };

//   const getDocumentTypeLabel = (type: string) => {
//     const labels = {
//       contract: "Contrat",
//       invoice: "Facture",
//       certificate: "Attestation",
//       rib: "RIB",
//       kbis: "Kbis",
//       statutes: "Statuts",
//     };
//     return labels[type as keyof typeof labels] || type;
//   };

//   const handleDownload = async (documentId: string) => {
//     const docs = allDocuments.find((doc) => doc.id_doc === documentId);
//     if (!docs) {
//       toast.toast({
//         title: "Document introuvable",
//         description: "Le document demandé n'a pas été trouvé.",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       console.log(`Début du téléchargement: ${docs.url}`);
//       const response = await fetch(docs.url as string, {
//         method: "GET",
//         headers: {
//           Accept: "application/pdf",
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Erreur HTTP: ${response.status}`);
//       }

//       const contentType = response.headers.get("content-type");
//       if (contentType && !contentType.includes("application/pdf")) {
//         console.warn("Le fichier ne semble pas être un PDF");
//       }

//       const blob = await response.blob();

//       const downloadUrl = window.URL.createObjectURL(blob);

//       toast.toast({
//         title: "Téléchargement commencé",
//         description: `${docs.name} est en cours de téléchargement.`,
//       });

//       const fileName = docs.name
//         .replace(/\s+/g, "_")
//         .replace(/[^\w\-_.]/g, "")
//         .toLowerCase();
//       const finalFileName = fileName.endsWith(".pdf")
//         ? fileName
//         : `${fileName}.pdf`;

//       // Créer un lien et déclencher le téléchargement
//       const link = document.createElement("a");
//       link.href = downloadUrl;
//       link.download = finalFileName;
//       link.style.display = "none";

//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       setTimeout(() => {
//         window.URL.revokeObjectURL(downloadUrl);
//       }, 1000);

//       toast.toast({
//         title: "Téléchargement terminé",
//         description: `${docs.name} a été téléchargé avec succès.`,
//         variant: "default",
//       });
//     } catch (error) {
//       console.error("Erreur lors du téléchargement:", error);

//       toast.toast({
//         title: "Erreur de téléchargement",
//         description:
//           error instanceof Error
//             ? `Erreur: ${error.message}`
//             : "Une erreur est survenue lors du téléchargement.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handlePreview = async (documentId: string) => {
//     const doc = allDocuments.find((d) => d.id_doc === documentId);
//     if (!doc) {
//       toast.toast({
//         title: "Document introuvable",
//         description: "Le document demandé n'a pas été trouvé.",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       const response = await fetch(doc.url as string, {
//         method: "GET",
//         headers: {
//           Accept: "application/pdf",
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Erreur HTTP: ${response.status}`);
//       }

//       const contentType = response.headers.get("content-type");
//       if (contentType && !contentType.includes("application/pdf")) {
//         console.warn("Le fichier ne semble pas être un PDF");
//       }

//       const blob = await response.blob();
//       const pdfUrl = window.URL.createObjectURL(blob);

//       // Ouvrir dans un nouvel onglet
//       const newWindow = window.open(pdfUrl, "_blank");

//       if (!newWindow) {
//         throw new Error("Popup bloqué par le navigateur");
//       }

//       setTimeout(() => {
//         window.URL.revokeObjectURL(pdfUrl);
//       }, 10000);
//     } catch (error) {
//       console.error("Erreur lors de la prévisualisation:", error);

//       // ouvrir directement l'URL
//       try {
//         window.open(doc.url as string, "_blank");
//         toast.toast({
//           title: "Redirection vers le document",
//           description: `Ouverture de ${doc.name} depuis sa source.`,
//         });
//       } catch (fallbackError) {
//         toast.toast({
//           title: "Erreur de prévisualisation",
//           description:
//             error instanceof Error
//               ? `Erreur: ${error.message}`
//               : "Impossible d'ouvrir le document.",
//           variant: "destructive",
//         });
//       }
//     }
//   };

//   return (
//     <div className="py-4 px-3 md:px-2 ">
//       <div className="flex flex-col md:flex-row justify-between items-start">
//         <div className="py-3 space-y-2 mb-8">
//           <h1 className="text-xl md:text-3xl font-bold text-gray-800">
//             Informations contractuelles
//           </h1>
//           <p className="text-gray-600 text-sm md:text-base">
//             Accedez aux documents officiels concernant votre domiciliation.
//           </p>
//         </div>
//       </div>
//       <div className="bg-white px-8 py-4 rounded-lg shadow-md mb-8">
//         <div className="mb-4 flex items-center font-semibold text-indigo-700">
//           <FileBadge className="h-5 w-5 mr-2" />
//           <h3 className="text-md md:text-xl ">Documents principaux</h3>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           {mainDocuments.map((document) => (
//             <Card
//               key={document.id_doc}
//               className="hover:shadow-lg transition-shadow"
//             >
//               <CardHeader>
//                 <div className="flex items-center">
//                   {getDocumentIcon(document.type)}
//                   <div className="text-[#341a6f]">
//                     <CardTitle className="text-lg">
//                       {getDocumentTypeLabel(document.type)}
//                     </CardTitle>
//                     <CardDescription>{document.name}</CardDescription>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-sm mb-2">
//                   Créé le {document.created_at} • {document.size}
//                 </p>
//                 {document.signed_at && (
//                   <p className="text-sm mb-2">Signé le {document.signed_at}</p>
//                 )}
//                 {document.updated_at && (
//                   <p className="text-sm mb-2">
//                     Mis à jour le {document.updated_at}
//                   </p>
//                 )}
//                 {document.status === "available" ? (
//                   <div className="grid grid-cols-1 gap-2">
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => handlePreview(document.id_doc)}
//                       className=" bg-gray-500 text-white hover:bg-gray-400 hover:text-white"
//                     >
//                       <FileSearch className="h-4 w-4 mr-1" />
//                       Voir
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => handleDownload(document.id_doc)}
//                       className=" bg-indigo-700 text-white hover:bg-indigo-600 hover:text-white"
//                     >
//                       <Download className="h-4 w-4 mr-1" />
//                       Télécharger
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="lg:px-4 py-1.5 border border-gray-200 rounded bg-gray-100  text-gray-600 text-sm flex">
//                     <ClipboardX className="h-4 w-4 mr-2 mt-1" />
//                     <span>Document pas encore disponible</span>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//       {/* Tableau de tous les documents */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center font-semibold text-indigo-700">
//             <Folders className="h-5 w-5 mr-2" />
//             <h3 className="text-md md:text-xl ">Historiques des documents</h3>
//           </CardTitle>
//           <CardDescription className="hidden md:block">
//             Liste complète de tous vos documents contractuels et administratifs
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="text-sm md:text-base">Type</TableHead>
//                 <TableHead className="text-sm md:text-base">Nom</TableHead>
//                 <TableHead className="text-sm md:text-base">Création</TableHead>
//                 <TableHead className="text-sm md:text-base">
//                   Signature
//                 </TableHead>
//                 <TableHead className="text-sm md:text-base">
//                   Mise à jour
//                 </TableHead>
//                 <TableHead className="text-sm md:text-base">Taille</TableHead>
//                 <TableHead className="text-sm md:text-base">Statut</TableHead>
//                 <TableHead className="lg:text-center text-sm md:text-base">
//                   Actions
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {allDocuments.map((document) => (
//                 <TableRow key={document.id_doc}>
//                   <TableCell className="flex items-center">
//                     <div
//                       className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getDocumentColor(document.type)}`}
//                     >
//                       {getDocumentIcon(document.type)}
//                       {getDocumentTypeLabel(document.type)}
//                     </div>
//                   </TableCell>
//                   <TableCell className="font-medium text-xs md:text-sm">
//                     {document.name}
//                   </TableCell>
//                   <TableCell className="text-xs md:text-sm">
//                     {document.created_at}
//                   </TableCell>
//                   <TableCell className="text-xs md:text-sm">
//                     {document.signed_at ? (
//                       document.signed_at
//                     ) : (
//                       <X className="w-4 h-4 text-red-500 ml-6" />
//                     )}
//                   </TableCell>
//                   <TableCell className="text-xs md:text-sm">
//                     {document.updated_at ? (
//                       document.updated_at
//                     ) : (
//                       <X className="w-4 h-4 text-red-500 ml-6" />
//                     )}
//                   </TableCell>
//                   <TableCell className="text-xs md:text-sm">
//                     {document.size}
//                   </TableCell>
//                   <TableCell>
//                     {document.status === "available" && (
//                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                         Disponible
//                       </span>
//                     )}
//                     {document.status === "pending" && (
//                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
//                         En attente
//                       </span>
//                     )}
//                     {document.status === "expired" && (
//                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//                         Expiré
//                       </span>
//                     )}
//                   </TableCell>
//                   <TableCell className=" lg:text-right">
//                     {document.status === "available" ? (
//                       <>
//                         <div className="hidden lg:flex justify-end space-x-2">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handlePreview(document.id_doc)}
//                             className=" bg-gray-500 text-white hover:bg-gray-400 hover:text-white"
//                           >
//                             <FileSearch className="h-4 w-4 mr-2" />
//                             Voir
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleDownload(document.id_doc)}
//                             className="bg-indigo-700 text-white hover:bg-indigo-600 hover:text-white"
//                             title="Télécharger"
//                           >
//                             <Download className="h-4 w-4 mr-2" />
//                             PDF
//                           </Button>
//                         </div>
//                         {/* Version mobile/tablette  */}
//                         <div className="lg:hidden flex justify-center">
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <Button variant="ghost" size="sm">
//                                 <MoreVertical className="h-4 w-4" />
//                               </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end" className="space-y-2 bg-gray-200 border-none">
//                               <DropdownMenuItem
//                                 onClick={() => handlePreview(document.id_doc)}
//                                 className="bg-gray-500 text-white hover:bg-gray-400 hover:text-white"
//                               >
//                                 <FileSearch className="h-4 w-4 mr-2" />
//                                 Voir
//                               </DropdownMenuItem>
//                               <DropdownMenuItem
//                                 onClick={() => handleDownload(document.id_doc)}
//                                 className="bg-indigo-700 text-white hover:bg-indigo-600 hover:text-white"
//                               >
//                                 <Download className="h-4 w-4 mr-2" />
//                                 Télécharger
//                               </DropdownMenuItem>
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         </div>
//                       </>
//                     ) : (
//                       <div className="flex justify-end">
//                         <div className="w-40 px-4 py-1.5 border border-gray-200 rounded bg-gray-100  text-gray-600 text-sm flex justify-end">
//                           <ClipboardX className="h-4 w-4 mr-2 mt-1" />
//                           <span>non disponible</span>
//                         </div>
//                       </div>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
