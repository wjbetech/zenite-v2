import React from 'react';

export default function DailiesEmpty() {
  return (
    <div className="flex items-center justify-center py-24 w-full">
      <div className="text-center text-base-content/50">
        <p>No daily tasks found. Add a daily task to get started.</p>
      </div>
    </div>
  );
}
