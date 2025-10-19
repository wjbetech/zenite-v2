import React from 'react';

export default function DailiesError({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-24 w-full">
      <div className="text-center text-base-content/50">
        <p>
          {message ?? (
            <>
              Unable to load tasks — the database may be unavailable. Check your local DB and try
              again, or contact the administrator (wjbetech@gmail.com)
            </>
          )}
        </p>
      </div>
    </div>
  );
}
