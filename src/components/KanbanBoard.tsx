import React from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";

import { Column, Id, Task } from "../types";
import PlusIcon from "../icons/PlusIcon";
import ColumnContainer from "./ColumnContainer";
import TaskCard from "./TaskCard";

function KanbanBoard() {
  const [columns, setColumns] = React.useState<Column[]>([]);
  const columnIds = React.useMemo(
    () => columns.map((col) => col.id),
    [columns]
  );

  const [tasks, setTasks] = React.useState<Task[]>([]);

  const [activeColumn, setActiveColumn] = React.useState<Column | null>(null);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px
      },
    })
  );

  const generateId = () => {
    /* Generate a random number */
    return Math.floor(Math.random() * 10001);
  };

  const createNewColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
  };

  const deleteColumn = (id: Id) => {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);
  };

  const updateColumn = (id: Id, title: string) => {
    const newColumns = columns.map((col) => {
      if (col.id === id) {
        return { ...col, title };
      }

      return col;
    });
    setColumns(newColumns);

    // delete task in the deleted column
    const filteredTasks = tasks.filter((task) => task.columnId !== id);
    setTasks(filteredTasks);
  };

  const createNewTask = (columnId: Id) => {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };

    setTasks([...tasks, newTask]);
  };

  const deleteTask = (taskId: Id) => {
    const filteredTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(filteredTasks);
  };

  const updateTask = (taskId: Id, content: string) => {
    const newTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, content };
      }

      return task;
    });

    setTasks(newTasks);
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;

    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;

    setColumns((prevColumns) => {
      const activeColumnIndex = prevColumns.findIndex(
        (col) => col.id === activeColumnId
      );
      const overColumnIndex = prevColumns.findIndex(
        (col) => col.id === overColumnId
      );

      return arrayMove(prevColumns, activeColumnIndex, overColumnIndex);
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id; // can be column id or task id
    const overId = over.id; // can be column id or task id

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    const isOverAColumn = over.data.current?.type === "Column";

    if (!isActiveATask) return;

    // Dropping a Task over another Task (in the same/another Column)
    if (isActiveATask && isOverATask) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
        const overIndex = prevTasks.findIndex((t) => t.id === overId);

        // Move task to another column, if the columnId is different
        prevTasks[activeIndex].columnId = prevTasks[overIndex].columnId;

        return arrayMove(prevTasks, activeIndex, overIndex);
      });
    }

    // Dropping a Task over another Column
    if (isActiveATask && isOverAColumn) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((t) => t.id === activeId);

        // Move task to another column, if the columnId is different
        prevTasks[activeIndex].columnId = overId;

        return arrayMove(prevTasks, activeIndex, activeIndex);
      });
    }
  };

  return (
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnIds}>
              {columns.map((col) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                  onUpdateColumn={updateColumn}
                  onDelete={deleteColumn}
                  onCreateTask={createNewTask}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={createNewColumn}
            className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex gap-2"
          >
            <PlusIcon />
            Add Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
                onUpdateColumn={updateColumn}
                onDelete={deleteColumn}
                onCreateTask={createNewTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                onUpdateTask={updateTask}
                onDetele={deleteTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}

export default KanbanBoard;
