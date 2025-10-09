'use client';

import { useState } from 'react';
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

interface PDFViewerProps {
  fileUrl: string;
  className?: string;
  fileType?: string;
  children?: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}


export function PDFViewer({ fileUrl, fileType, isOpen, setIsOpen, className, children }: PDFViewerProps) {
  
  console.log(fileUrl)
  return (
    <>
      {children && (<Button
        variant="ghost"
        className={`${className}`}
        onClick={() => setIsOpen(true)}
        title='Voir le rapport'
      >
        {children}
      </Button>)}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[90vw] h-[90vh] sm:max-w-6xl border-gray-400 bg-gray-400 text-white
          rounded-xl">
          <DialogHeader>
            <DialogTitle className='text-center'>
              Fichier PDF - {fileType}
            </DialogTitle>
          </DialogHeader>
          <div className="h-full w-full">
            <iframe 
              src={fileUrl} 
              width="100%" 
              height="100%"
              className="border rounded-md min-h-[70vh]"
              title={`PDF ${fileType}`}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}