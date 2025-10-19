import React from 'react';

export default function DbUnavailable({
  message = 'Unable to load tasks — the database may be unavailable. Check your local DB and try again, or contact the administrator (wjbetech@gmail.com)',
}: {
  message?: string;
}) {
  return (
    <div className="col-span-full min-h-[60vh] flex items-center justify-center">
      <div className="text-center text-base-content/50">
        <p>{message}</p>
      </div>
    </div>
  );
}
