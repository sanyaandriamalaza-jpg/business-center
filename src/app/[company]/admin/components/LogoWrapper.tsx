import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

interface CompanyLogoEditorProps {
  currentLogo?: string;
  companyName?: string;
  onLogoChange: (file: File) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const LogoWrapper: React.FC<CompanyLogoEditorProps> = ({
  currentLogo,
  companyName = "",
  onLogoChange,
  size = 'lg',
}) => {
  const [logoUrl, setLogoUrl] = useState<string>(currentLogo || '');
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = { sm: 'w-16 h-16', md: 'w-24 h-24', lg: 'w-64 h-64' };
  const iconSizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    event.preventDefault();
    event.stopPropagation();

    const reader = new FileReader();
    reader.onload = (e) => {
      const newUrl = e.target?.result as string;
      setLogoUrl(newUrl);
    };
    reader.readAsDataURL(file);

    onLogoChange(file);
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Avatar className={`${sizeClasses[size]} border-2 border-gray-200 shadow-lg transition-all duration-200 ${isHovered ? 'scale-105' : ''}`}>
          <AvatarImage 
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${logoUrl}`} 
            alt={`Logo ${companyName}`}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-cPrimary to-cPrimary/50 text-cPrimary font-semibold text-lg">
            {companyName.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <Button
          onClick={handleEditClick}
          type="button"
          size="sm"
          className={`absolute -bottom-1 right-6 rounded-full p-1.5 bg-white border-2 border-gray-200 shadow-md hover:bg-gray-50 transition-all duration-200 ${
            isHovered ? 'scale-110' : ''
          }`}
          variant="outline"
        >
          <Camera className={`${iconSizes[size]} text-neutral-400`} />
        </Button>

        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="text-center">
        <p className="text-xl font-semibold text-cStandard/80">{companyName}</p>
        <p className="text-xs text-gray-500 mt-1">
          Cliquez sur l'icône pour modifier le logo
        </p>
      </div>
    </div>
  );
};
