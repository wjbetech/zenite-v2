import React from 'react';
import { Plus } from 'lucide-react';
import ActivityHeatmap from '../ActivityTracker/ActivityHeatmap';

type Props = {
  onNewTask: () => void;
  onNewProject: () => void;
  heatmapOpen: boolean;
  onHeatmapOpenChange: (v: boolean) => void;
  activityMap: Record<string, number>;
  activityDetails: Record<string, string[]>;
};

export default function DashboardHeader({
  onNewTask,
  onNewProject,
  heatmapOpen,
  onHeatmapOpenChange,
  activityMap,
  activityDetails,
}: Props) {
  return (
    <div
      className="mx-auto w-full px-0"
      style={{ maxWidth: 'calc(100vw - var(--sidebar-width) - 3rem)', boxSizing: 'border-box' }}
    >
      <div className="relative pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between items-center gap-3">
          <h1 className="display-font text-3xl font-semibold tracking-tight text-emerald-600 text-center md:text-left">
            Dashboard
          </h1>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto mb-8 md:mb-0">
            <button
              className="btn btn-md btn-primary border-2 border-primary-content text-primary-content shadow-lg hover:shadow-xl transition-all duration-200 flex items-center w-full md:w-auto"
              type="button"
              onClick={onNewTask}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </button>
            <button
              className="btn btn-md btn-accent border-2 border-accent-content text-accent-content shadow-lg hover:shadow-xl transition-all duration-200 flex items-center w-full md:w-auto"
              type="button"
              onClick={onNewProject}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          <ActivityHeatmap
            open={heatmapOpen}
            onOpenChange={onHeatmapOpenChange}
            activity={activityMap}
            activityDetails={activityDetails}
          />
        </div>
      </div>
    </div>
  );
}
