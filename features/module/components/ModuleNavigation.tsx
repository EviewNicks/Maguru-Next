// features/module/components/ModuleNavigation.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ModuleNavigationProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  isLastPage: boolean;
}

const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  isLastPage,
}) => {
  return (
    <div className="flex justify-between items-center w-full mt-8">
      <Button
        variant="outline"
        onClick={onPrevPage}
        disabled={currentPage <= 1}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Sebelumnya
      </Button>

      <Button
        onClick={onNextPage}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-2"
      >
        {isLastPage ? 'Selesai' : 'Selanjutnya'}
        {!isLastPage && <ChevronRight className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default ModuleNavigation;
