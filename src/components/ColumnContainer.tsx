import React from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Column, Id, Task } from "../types";
import TrashIcon from "../icons/TrashIcon";
import PlusIcon from "../icons/PlusIcon";
import TaskCard from "./TaskCard";

interface Props {
  column: Column;
  tasks?: Task[];
  onUpdateColumn: (id: Id, title: string) => void;
  onDelete: (id: Id) => void;
  onCreateTask: (columnId: Id) => void;
  onUpdateTask: (id: Id, content: string) => void;
  onDeleteTask: (taskId: Id) => void;
}

function ColumnContainer({
  column,
  tasks = [],
  onUpdateColumn,
  onDelete,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}: Props) {
  const [editMode, setEditMode] = React.useState(false);

  const taskIds = React.useMemo(() => tasks.map((task) => task.id), [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-columnBackgroundColor opacity-40 border-2 border-rose-500 w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-columnBackgroundColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => setEditMode(true)}
        className="bg-mainBackgroundColor text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-columnBackgroundColor border-4 flex items-center justify-between"
      >
        <div className="flex gap-2">
          <div className="flex justify-center items-center bg-columnBackgroundColor px-2 py-1 text-sm rounded-full">
            0
          </div>
          {editMode ? (
            <input
              value={column.title}
              onChange={(e) => onUpdateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => setEditMode(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditMode(false);
              }}
              className="bg-black focus:border-rose-500 border rounded outline-none px-2"
            />
          ) : (
            column.title
          )}
        </div>
        <button
          onClick={() => onDelete(column.id)}
          className="stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor px-1 py-2 rounded"
        >
          <TrashIcon />
        </button>
      </div>

      {/* Column task container */}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={taskIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateTask={onUpdateTask}
              onDetele={onDeleteTask}
            />
          ))}
        </SortableContext>
      </div>

      {/* Column footer */}
      <button
        onClick={() => onCreateTask(column.id)}
        className="flex gap-2 items-center border-columnBackgroundColor border-2 rounded-md p-4 border-x-columnBackgroundColor hover:bg-mainBackgroundColor hover:text-rose-500 active:bg-black"
      >
        <PlusIcon />
        Add Task
      </button>
    </div>
  );
}

export default ColumnContainer;
