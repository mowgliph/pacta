import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './button';

interface PaginationButtonProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PaginationButton: React.FC<PaginationButtonProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) {
    return null;
  }

  // Generar array de páginas a mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Mostrar todas las páginas si hay pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar un subconjunto de páginas con la actual en el centro
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onPageChange(1)} 
        disabled={currentPage === 1}
        aria-label="Primera página"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pageNumbers.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="icon"
          onClick={() => onPageChange(page)}
          aria-label={`Página ${page}`}
          aria-current={currentPage === page ? "page" : undefined}
        >
          {page}
        </Button>
      ))}
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onPageChange(totalPages)} 
        disabled={currentPage === totalPages}
        aria-label="Última página"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}; 