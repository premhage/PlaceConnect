import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-3">
      <div className="small text-muted">
        Page <span className="fw-bold text-dark">{currentPage}</span> of{' '}
        <span className="fw-bold text-dark">{totalPages}</span>
      </div>
      <div className="d-flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
