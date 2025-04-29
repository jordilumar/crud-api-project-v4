import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  const [animationClass, setPaginationAnimation] = useState("");

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      // Primero aplicamos una animación de salida
      setPaginationAnimation("animate-fade-out");

      // Después de un breve retraso, cambiamos la página
      setTimeout(() => {
        onPageChange(newPage);
        
        // Cambiamos a la animación de entrada
        setPaginationAnimation("animate-fade-in");

        // Reiniciamos la animación después de completarse para futuros cambios
        setTimeout(() => {
          setPaginationAnimation("");
        }, 500);
      }, 300);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let lastPageAdded = false;

    // Siempre mostrar el botón para la página 1
    buttons.push(
      <button
        key="page-1"
        className={`pagination-button ${page === 1 ? "active" : ""}`}
        onClick={() => handlePageChange(1)}
      >
        1
      </button>
    );

    if (totalPages > maxVisibleButtons) {
      if (page > 3) {
        buttons.push(
          <span key="dots-left" className="pagination-dots">
            ...
          </span>
        );
      }

      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(
          <button
            key={`page-${i}`}
            className={`pagination-button ${page === i ? "active" : ""}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      }

      if (endPage >= totalPages) {
        lastPageAdded = true;
      }

      if (page < totalPages - 2) {
        buttons.push(
          <span key="dots-right" className="pagination-dots">
            ...
          </span>
        );
      }
    } else {
      for (let i = 2; i <= totalPages; i++) {
        buttons.push(
          <button
            key={`page-${i}`}
            className={`pagination-button ${page === i ? "active" : ""}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
        
        if (i === totalPages) {
          lastPageAdded = true;
        }
      }
    }

    if (totalPages > 1 && !lastPageAdded) {
      buttons.push(
        <button
          key={`page-${totalPages}`}
          className={`pagination-button ${page === totalPages ? "active" : ""}`}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className={`pagination animate-slide-in-bottom ${animationClass}`}>
      <button
        className="pagination-arrow"
        onClick={() => handlePageChange(1)}
        disabled={page === 1}
      >
        <ChevronsLeft />
      </button>
      <button
        className="pagination-arrow"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft />
      </button>
      {renderPaginationButtons()}
      <button
        className="pagination-arrow"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight />
      </button>
      <button
        className="pagination-arrow"
        onClick={() => handlePageChange(totalPages)}
        disabled={page === totalPages}
      >
        <ChevronsRight />
      </button>
    </div>
  );
}