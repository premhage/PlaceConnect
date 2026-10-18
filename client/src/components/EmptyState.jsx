import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data to display for this view.',
  action = null,
}) => {
  return (
    <div className="pc-card p-5 text-center my-3">
      <div className="d-inline-flex p-3 rounded-circle bg-light text-muted mb-3">
        <Icon size={36} />
      </div>
      <h5 className="fw-bold mb-1">{title}</h5>
      <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '420px' }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
