"use client";

import React from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/src/components/ui/button";
import { Download } from "lucide-react";
import { InvoiceDataFormat } from "@/src/lib/type";
import {
  translatePayment,
  translateStatus,
  translateDuration,
} from "@/src/lib/utils";

interface Props {
  invoiceData: InvoiceDataFormat;
  onGenerate?: () => void;
}

export default function GeneratePdfInvoice({ invoiceData, onGenerate }: Props) {
  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
      compress: true,
    });

    // Couleurs & styles
    const primaryColor: [number, number, number] = [94, 41, 154]; // Violet
    const secondaryColor: [number, number, number] = [241, 243, 245]; // Gris clair pour les fonds
    const accentColor = [74, 222, 128]; // Vert pour les totaux
    const darkText: [number, number, number] = [30, 30, 30]; // Texte foncé
    const lightText = [100, 100, 100]; // Texte secondaire

    // Dimensions de la page
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15; // Margin uniforme

    // HEADER AMÉLIORÉ -----------------------------------------
    let currentY = margin;

    // Logo à GAUCHE avec meilleure qualité
    const logoWidth = 20;
    const logoHeight = 20;

    try {
      if (invoiceData.company.logoUrl) {
        doc.addImage(
          invoiceData.company.logoUrl,
          "PNG",
          margin,
          currentY,
          logoWidth,
          logoHeight,
          undefined,
          "FAST"
        );

        // Nom sous le logo si tu veux
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(invoiceData.company.name, margin, currentY + logoHeight + 8);
      } else {
        // Affiche juste le nom à la place du logo
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(invoiceData.company.name, margin, currentY + logoHeight / 2, {
          align: "left",
        });
      }
    } catch (error) {
      console.error("Erreur de chargement du logo:", error);
      // Placeholder en cas d'erreur
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin, currentY, logoWidth, logoHeight, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("LOGO", margin + logoWidth / 2, currentY + logoHeight / 2, {
        align: "center",
      });
    }

    // Titre FACTURE à droite - ALIGNEMENT PARFAIT AVEC MARGIN
    const rightStartX = pageWidth - margin - 50;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("FACTURE", rightStartX, currentY + 12);

    // Référence de facture sous le titre
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(
      `Référence: ${invoiceData.invoice.reference}${invoiceData.invoice.referenceNum}`,
      rightStartX,
      currentY + 19
    );

    // Date sous la référence
    doc.setFontSize(9);
    doc.setTextColor(lightText[0], lightText[1], lightText[2]);
    doc.text(
      `Date: ${new Date(invoiceData.invoice.issueDate).toLocaleDateString("fr-FR")}`,
      rightStartX,
      currentY + 24
    );

    // Espacement après header plus cohérent
    currentY += 45;

    // ENTREPRISE (Émetteur) - Colonne gauche
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("ÉMETTEUR", margin, currentY);

    // Passage au contenu
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    const company = invoiceData.company;

    // Espacement réduit entre les lignes
    const lineSpacing = 5; // au lieu de 6
    let emitterY = currentY + 6; // espace réduit après le titre

    // Nom et forme légale
    doc.text(company.name, margin, emitterY);
    if (company.legalForm) {
      emitterY += lineSpacing;
      doc.text(company.legalForm, margin, emitterY);
    }

    // Adresse
    emitterY += lineSpacing;
    doc.text(company.address.addressLine, margin, emitterY);
    emitterY += lineSpacing;
    doc.text(company.address.country, margin, emitterY);

    // Email et téléphone
    if (company.email) {
      emitterY += lineSpacing;
      doc.text(`Email: ${company.email}`, margin, emitterY);
    }
    if (company.phone) {
      emitterY += lineSpacing;
      doc.text(`Tel: ${company.phone}`, margin, emitterY);
    }

    // CLIENT (Destinataire) - Colonne droite - ALIGNEMENT SYMÉTRIQUE
    const customerStartX = pageWidth / 2 + 44; // Ajusté pour meilleure symétrie

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("CLIENT", customerStartX, currentY);

    const customer = invoiceData.customer;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    let clientY = currentY + 6; // espace réduit après le titre
    const clientLineSpacing = 5;

    doc.text(`${customer.firstName} ${customer.name}`, customerStartX, clientY);
    if (customer.email) clientY += clientLineSpacing;
    doc.text(`Email: ${customer.email}`, customerStartX, clientY);
    if (customer.phone) clientY += clientLineSpacing;
    doc.text(`Tel: ${customer.phone}`, customerStartX, clientY);
    clientY += clientLineSpacing;
    doc.text(
      `${customer.address.addressLine}, ${customer.address.postalCode} ${customer.address.city}`,
      customerStartX,
      clientY
    );
    clientY += clientLineSpacing;
    doc.text(
      `${customer.address.state}, ${customer.address.country}`,
      customerStartX,
      clientY
    );

    // Espacement plus cohérent avant le tableau
    currentY += 55;

    // SERVICE -------------------------------------------------
    const serviceName = invoiceData.service?.name
      ? `Offre de Domiciliation: ${invoiceData.service.name}`
      : invoiceData.service?.office.name
        ? invoiceData.service.office.name
        : "Service facturé";

    const serviceDescription =
      invoiceData.service?.description ||
      invoiceData.service?.office.description ||
      "Prestations fournies";

    autoTable(doc, {
      startY: currentY,
      head: [["Description", "Quantité", "Prix unitaire HT", "Total HT"]],
      body: [
        [
          {
            content: `${serviceName}\n${serviceDescription}`,
            styles: { cellWidth: 100, fontSize: 8 },
          },
          "1",
          `${invoiceData.invoice.amount} ${invoiceData.invoice.currency.toLowerCase()}`,
          `${invoiceData.invoice.amount} ${invoiceData.invoice.currency.toLowerCase()}`,
        ],
      ],
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: darkText,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: secondaryColor,
      },
      margin: { left: margin, right: margin }, // SYMETRIE PARFAITE
    });

    // MONTANTS -------------------------------------------------
    const subtotal = invoiceData.invoice.amount;
    const tvaRate = 0.2; // TVA à 20%
    const tva = subtotal * tvaRate;
    const total = subtotal + tva;

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 8, // Espacement plus cohérent
      body: [
        [
          "Sous-total HT",
          {
            content: `${subtotal.toFixed(2)} ${invoiceData.invoice.currency.toLowerCase()}`,
            styles: { halign: "right", fontStyle: "bold" },
          },
        ],
        [
          `TVA (${tvaRate * 100}%)`,
          {
            content: `${tva.toFixed(2)} ${invoiceData.invoice.currency.toLowerCase()}`,
            styles: { halign: "right", fontStyle: "bold" },
          },
        ],
        [
          {
            content: "Total TTC",
            styles: {
              fontStyle: "bold",
              fillColor: primaryColor as [number, number, number], // fond coloré
              textColor: [255, 255, 255], // texte blanc
            },
          },

          {
            content: `${total.toFixed(2)} ${invoiceData.invoice.currency.toLowerCase()}`,
            styles: {
              halign: "right",
              fontStyle: "bold",
              fillColor: primaryColor as [number, number, number], // couleur du fond
              textColor: [255, 255, 255], // texte blanc
            },
          },
        ],
      ],
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 40, halign: "right" },
        1: { cellWidth: 20, halign: "right" },
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
      },
      margin: { left: pageWidth - 75, right: margin }, // ALIGNEMENT SYMÉTRIQUE
    });

    // NOTE -----------------------------------------------------
    if (invoiceData.invoice.note) {
      doc.setFontSize(10);
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.text("Notes:", margin, (doc as any).lastAutoTable.finalY + 18); // Espacement cohérent
      doc.setFontSize(9);
      doc.text(
        invoiceData.invoice.note,
        margin,
        (doc as any).lastAutoTable.finalY + 25, // Espacement cohérent
        { maxWidth: pageWidth - margin * 2 }
      );
    }

    // FOOTER AVEC INFORMATIONS FACTURE ------------------------
    const footerY = 205; // Position ajustée

    // Bandeau footer coloré - SYMÉTRIE PARFAITE
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(margin, footerY, pageWidth - margin * 2, 40, "F");

    // Titre
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("INFORMATIONS FACTURE", margin + 2, footerY + 8);

    // Texte normal
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    const footerInfoY = footerY + 15;

    // Colonne gauche
    doc.text(
      `Date émission: ${new Date(invoiceData.invoice.issueDate).toLocaleDateString("fr-FR")}`,
      margin + 5,
      footerInfoY
    );
    doc.text(
      `Début de service: ${new Date(invoiceData.invoice.serviceStartDate).toLocaleDateString("fr-FR")}`,
      margin + 5,
      footerInfoY + 6
    );
    doc.text(
      `Durée: ${invoiceData.invoice.duration} mois`,
      margin + 5,
      footerInfoY + 12
    );
    doc.text(
      `Modalité de paiement: ${translateDuration(invoiceData.invoice.durationType)}`,
      margin + 5,
      footerInfoY + 18 // on espace un peu plus pour éviter que ça se chevauche
    );

    // Colonne droite - POSITION SYMÉTRIQUE
    const footerRightX = pageWidth / 2 + 15; // Ajusté pour symétrie
    doc.text(
      `Méthode de paiement: ${translatePayment(invoiceData.invoice.paymentMethod)}`,
      footerRightX,
      footerInfoY
    );
    doc.text(
      `Statut: ${translateStatus(invoiceData.invoice.status)}`,
      footerRightX,
      footerInfoY + 6
    );
    doc.text(
      `Devise: ${invoiceData.invoice.currency.toLowerCase()}`,
      footerRightX,
      footerInfoY + 12
    );

    // Ligne de séparation finale
    const finalFooterY = 275;
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(margin, finalFooterY, pageWidth - margin, finalFooterY); // SYMÉTRIQUE

    doc.setFontSize(7);
    doc.text(
      `${company.name} - ${company.address.addressLine} - ${company.address.country} - Email: ${company.email}`,
      pageWidth / 2,
      finalFooterY + 10,
      { align: "center", maxWidth: pageWidth - margin * 2 }
    );

    // Sauvegarde
    doc.save(
      `facture-${invoiceData.invoice.reference}${invoiceData.invoice.referenceNum}.pdf`
    );

    if (onGenerate) onGenerate();
  };

  return (
    <Button
      onClick={generatePDF}
      variant="ghost"
      className="flex items-center gap-2 bg-cPrimary hover:bg-cPrimaryHover text-cForeground"
    >
      <Download className="h-4 w-4" />
      Télécharger la facture
    </Button>
  );
}
