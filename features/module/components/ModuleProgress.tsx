// features/module/components/ModuleProgress.tsx
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ModuleProgressProps {
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
}

const ModuleProgress: React.FC<ModuleProgressProps> = ({
  currentPage,
  totalPages,
  progressPercentage,
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Halaman {currentPage} dari {totalPages}</span>
        <span>{progressPercentage}% selesai</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default ModuleProgress;
