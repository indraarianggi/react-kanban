import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Id, Task } from "../types";
import TrashIcon from "../icons/TrashIcon";

interface Props {
  task: Task;
  onUpdateTask: (id: Id, content: string) => void;
  onDetele: (id: Id) => void;
}

function TaskCard({ task, onUpdateTask, onDetele }: Props) {
  const [mouseIsOver, setMouseIsOver] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
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
        className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative opacity-40 border-2 border-rose-500"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      {...(!editMode && {
        onClick: toggleEditMode,
        onMouseEnter: () => setMouseIsOver(true),
        onMouseLeave: () => setMouseIsOver(false),
      })}
      className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task"
    >
      {editMode ? (
        <textarea
          value={task.content}
          onChange={(e) => onUpdateTask(task.id, e.target.value)}
          autoFocus
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) toggleEditMode();
          }}
          className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none"
        ></textarea>
      ) : (
        <>
          <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
            {task.content}
          </p>
          {mouseIsOver && (
            <button
              onClick={() => onDetele(task.id)}
              className="stroke-white absolute right-4 top-1/2 -translate-y-1/2 bg-columnBackgroundColor p-2 rounded opacity-60 hover:opacity-100"
            >
              <TrashIcon />
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default TaskCard;
