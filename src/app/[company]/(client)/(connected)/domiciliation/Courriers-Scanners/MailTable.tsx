import React from 'react';
import { Mail, Download, Trash2, Phone, FileDown, MailCheck, EyeOff, MoreVertical } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/src/components/ui/dropdown-menu';

export interface MailItem {
  id: string;
  date: string;
  sender: string;
  subject: string;
  type: string;
  status: 'non-lu' | 'lu';
}

interface MailTableProps {
  mails: MailItem[];
  onEmailClick: (id: string) => void;
  onDownloadClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
}

const MailTable: React.FC<MailTableProps> = ({
  mails,
  onEmailClick,
  onDownloadClick,
  onDeleteClick
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-gray-900 font-semibold">Date de réception</TableHead>
            <TableHead>Expéditeur</TableHead>
            <TableHead className="hidden md:block">Objet</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="md:flex items-center justify-center font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mails.map((mail) => (
            <TableRow key={mail.id}>
              <TableCell className="font-medium text-xs md:text-base">{mail.date}</TableCell>
              <TableCell className="font-semibold text-xs md:text-base">{mail.sender}</TableCell>
              <TableCell className="hidden md:block max-w-md truncate">{mail.subject}</TableCell>
              <TableCell>
                <Badge 
                  variant={mail.status === 'non-lu' ? 'destructive' : null}
                  className={mail.status === 'non-lu' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 px-6 border-none'}
                >
                  {mail.status === 'non-lu' ? 'Non lu' : 'Lu'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className=" hidden md:flex items-center md:justify-center md:space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => onEmailClick(mail.id)}
                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                  >
                    {mail.status === 'non-lu' ? <MailCheck className="w-8 h-8" /> : <EyeOff className="w-8 h-8"/>}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onDownloadClick(mail.id)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <FileDown className="w-8 h-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onDeleteClick(mail.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-8 h-8" />
                  </Button>
                </div>
                {/* Version mobile/tablette */}
            <div className="md:hidden block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEmailClick(mail.id)}>
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Voir le courrier</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownloadClick(mail.id)}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Télécharger</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeleteClick(mail.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Supprimer</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
              </TableCell>
            </TableRow>
          ))}
          
        </TableBody>
      </Table>
    </div>
  );
};

export default MailTable;