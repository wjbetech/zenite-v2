import React from 'react';
import DataLoading from '../ui/DataLoading';

export default function DailiesLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center w-full">
      <DataLoading label="Fetching tasks…" variant="success" />
    </div>
  );
}
