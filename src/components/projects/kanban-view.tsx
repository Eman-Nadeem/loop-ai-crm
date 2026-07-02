"use client";

import React from "react";
import Link from "next/link";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import { useCRM } from "@/lib/context/crm-context";
import { Project } from "@/lib/mock-data/projects";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import ProgressBar from "@/components/ui/progress-bar";

interface KanbanViewProps {
  projects: Project[];
}

export default function KanbanView({ projects }: KanbanViewProps) {
  const { updateProject, addToast } = useCRM();

  // Configure activation constraints so clicks on link navigate, but dragging moves the card
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px drag movement to activate drag and drop
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const projectId = active.id as string;
    const targetStatus = over.id as "active" | "completed" | "on_hold";

    // Find the project and update its status if it changed
    const project = projects.find((p) => p.id === projectId);
    if (project && project.status !== targetStatus) {
      if (targetStatus === "completed") {
        updateProject(projectId, { status: "completed", progress: 100 });
        addToast(`"${project.name}" marked as completed! Progress set to 100%.`, "success");
      } else {
        updateProject(projectId, { status: targetStatus });
      }
    }
  };

  // Group projects by status
  const activeProjects = projects.filter((p) => p.status === "active");
  const completedProjects = projects.filter((p) => p.status === "completed");
  const onHoldProjects = projects.filter((p) => p.status === "on_hold");

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-row gap-6 overflow-x-auto pb-4 scrollbar-none w-full">
        <KanbanColumn
          id="on_hold"
          title="On Hold"
          projects={onHoldProjects}
          bgClass="bg-amber-50 border-amber-100"
          textClass="text-amber-700"
        />
        <KanbanColumn
          id="active"
          title="Active"
          projects={activeProjects}
          bgClass="bg-emerald-50 border-emerald-100"
          textClass="text-emerald-700"
        />
        <KanbanColumn
          id="completed"
          title="Completed"
          projects={completedProjects}
          bgClass="bg-slate-100 border-slate-200"
          textClass="text-slate-700"
        />
      </div>
    </DndContext>
  );
}

// Kanban Column Component
interface KanbanColumnProps {
  id: string;
  title: string;
  projects: Project[];
  bgClass: string;
  textClass: string;
}

function KanbanColumn({ id, title, projects, bgClass, textClass }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col flex-1 min-w-[290px] sm:min-w-[320px] shrink-0 rounded-4xl p-5 border transition-all duration-200 ${
        isOver
          ? "bg-white/70 border-slate-300 shadow-xs"
          : "bg-white/80 border-slate-200/80"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full border ${bgClass} ${textClass}`}>
            {title}
          </span>
          <span className="text-xs font-semibold text-slate-400">{projects.length}</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            Total Budget
          </span>
          <p className="text-xs font-bold text-slate-800">${totalBudget}k</p>
        </div>
      </div>

      {/* Cards List - Hidden scrollbars */}
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-270px)] px-2 py-2 -mx-2 -my-2 scrollbar-none no-scrollbar">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center border border-dashed border-slate-200 rounded-3xl bg-white/40">
            <span className="text-xs font-medium">No projects here</span>
            <span className="text-[9px] text-slate-400 mt-0.5">Drag projects here to update status</span>
          </div>
        ) : (
          projects.map((project) => (
            <DraggableProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </div>
  );
}

// Draggable Compact Project Card Wrapper
function DraggableProjectCard({ project }: { project: Project }) {
  const isCompleted = project.status === "completed";

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
    disabled: isCompleted, // Once completed, the card cannot be dragged anymore
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  const progressColors = {
    active: "bg-linear-to-r from-indigo-500 to-purple-500",
    completed: "bg-linear-to-r from-emerald-400 to-teal-500",
    on_hold: "bg-linear-to-r from-amber-400 to-orange-400",
  }[project.status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`touch-none ${isCompleted ? "cursor-default" : isDragging ? "cursor-grabbing shadow-lg" : "cursor-grab"}`}
      onDragStart={(e) => e.preventDefault()}
    >
      <Link href={`/dashboard/projects/${project.id}`} className={`block select-none ${isCompleted ? "cursor-default" : "cursor-grab"}`}>
        <div className={`bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 hover:scale-[1.02] hover:shadow-md transition-all duration-200 flex flex-col gap-3 ${isCompleted ? "cursor-default" : "cursor-grab"}`}>
          <h4 className="font-bold text-slate-800 text-xs tracking-tight leading-snug line-clamp-2 text-left">
            {project.name}
          </h4>
          
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400">
              <span>Progress</span>
              <span className="text-slate-700 font-bold">{project.progress}%</span>
            </div>
            <ProgressBar value={project.progress} colorClass={progressColors} heightClass="h-1" />
          </div>
        </div>
      </Link>
    </div>
  );
}
