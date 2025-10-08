import React from 'react';
import { Mail, Download, Trash2, MoreVertical, Send } from 'lucide-react';
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
import { ReceivedFile } from '@/src/lib/type';

interface MailTableProps {
  mails: ReceivedFile[];
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
    <div className="bg-cBackground rounded-lg border border-cStandard/20">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className=" font-semibold">Date de réception</TableHead>
            {/* <TableHead className=" font-semibold">Type</TableHead> */}
            <TableHead>Expéditeur</TableHead>
            <TableHead className="hidden md:block">Objet</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="md:flex items-center justify-center font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mails.length > 0 ? mails.map((mail) => (
            <TableRow key={mail.id_received_file}>
              <TableCell className="font-medium text-xs md:text-base text-cStandard/60">{new Date(mail.send_at!).toISOString().split("T")[0]}</TableCell>
              {/* <TableCell className="font-semibold text-xs md:text-base text-cStandard/60">{mail.}</TableCell> */}
              <TableCell className="font-semibold text-xs md:text-base text-cStandard/60">{mail.received_from_name}</TableCell>
              <TableCell className="hidden md:block max-w-md truncate text-cStandard/60">{mail.courriel_object}</TableCell>
              <TableCell>
                <Badge 
                  variant={mail.status === 'not-scanned' ? 'destructive' : null}
                  className={mail.status === 'not-scanned' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 px-6 border-none'}
                >
                  {mail.status === 'not-scanned' ? 'Non lu' : 'Lu'}
                </Badge>
              </TableCell>
              <TableCell>
            <div className="block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEmailClick(String(mail.id_received_file))}>
                    <Mail className="mr-2 h-4 w-4 text-emerald-600" />
                    <span>Voir le courrier</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEmailClick(String(mail.id_received_file))}>
                    <Send className="mr-2 h-4 w-4 text-amber-600" />
                    <span>Demander un envoi postal</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownloadClick(String(mail.id_received_file))}>
                    <Download className="mr-2 h-4 w-4 text-cDefaultPrimary-100" />
                    <span>Télécharger</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeleteClick(String(mail.id_received_file))}
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
          )) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-cStandard/60">
                Aucun courrier scanné disponible.
              </TableCell>
            </TableRow>
          )}
          
        </TableBody>
      </Table>
    </div>
  );
};

export default MailTable;