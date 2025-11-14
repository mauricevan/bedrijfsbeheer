import { useMemo } from "react";
import type { Task } from "../../../types";
import type { TaskFormData } from "./useCRMState";

/**
 * Props for useTasks hook
 */
interface UseTasksProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

/**
 * Task management hook
 * Handles task CRUD operations and statistics
 */
export const useTasks = ({ tasks, setTasks }: UseTasksProps) => {
  /**
   * Add a new task
   */
  const handleAddTask = (formData: TaskFormData) => {
    if (!formData.title || !formData.dueDate) {
      alert("Vul titel en deadline in!");
      return null;
    }

    const task: Task = {
      id: `task${Date.now()}`,
      title: formData.title,
      description: formData.description,
      customerId: formData.customerId || undefined,
      priority: formData.priority,
      status: "todo",
      dueDate: formData.dueDate,
      createdDate: new Date().toISOString().split("T")[0],
    };

    setTasks([...tasks, task]);
    return task;
  };

  /**
   * Update task status
   */
  const updateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  /**
   * Delete a task
   */
  const handleDeleteTask = (taskId: string) => {
    if (confirm("Weet je zeker dat je deze taak wilt verwijderen?")) {
      setTasks(tasks.filter((t) => t.id !== taskId));
      return true;
    }
    return false;
  };

  /**
   * Calculate task statistics
   */
  const taskStats = useMemo(() => {
    const activeTasks = tasks.filter((t) => t.status !== "done").length;
    const overdueTasks = tasks.filter((t) => {
      if (t.status === "done") return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return {
      activeTasks,
      overdueTasks,
    };
  }, [tasks]);

  return {
    handleAddTask,
    updateTaskStatus,
    handleDeleteTask,
    taskStats,
  };
};
