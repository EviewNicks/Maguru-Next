// features/module/components/ModulePage.tsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUserId } from '../../../store/features/userSlice';
import useModuleProgress from '../hooks/useModuleProgress';
import ModuleContent from './ModuleContent';
import ModuleNavigation from './ModuleNavigation';
import ModuleProgress from './ModuleProgress';
import { Card } from '@/components/ui/card';

interface ModulePageProps {
  moduleId: string;
}

const ModulePage: React.FC<ModulePageProps> = ({ moduleId }) => {
  const userId = useSelector(selectUserId);
  const {
    currentPage,
    progressPercentage,
    currentModule,
    currentPageData,
    goToNextPage,
    goToPrevPage,
    goToPage,
  } = useModuleProgress({ moduleId, userId });

  useEffect(() => {
    // Scroll to top when page changes
    window.scrollTo(0, 0);
  }, [currentPage]);

  if (!currentModule || !currentPageData) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p>Modul tidak ditemukan atau sedang dimuat...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">{currentModule.title}</h1>
      <p className="text-muted-foreground mb-6">{currentModule.description}</p>
      
      <ModuleProgress
        currentPage={currentPage}
        totalPages={currentModule.totalPages}
        progressPercentage={progressPercentage}
      />
      
      <div className="my-6">
        <ModuleContent
          title={currentPageData.title}
          content={currentPageData.content}
          media={currentPageData.media}
        />
      </div>
      
      <ModuleNavigation
        currentPage={currentPage}
        totalPages={currentModule.totalPages}
        onPrevPage={goToPrevPage}
        onNextPage={goToNextPage}
        isLastPage={currentPageData.isLastPage}
      />
      
      {currentModule.totalPages > 3 && (
        <Card className="mt-8 p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: currentModule.totalPages }).map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    pageNum === currentPage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted-foreground/20'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ModulePage;