import React, { useState, useEffect } from 'react';
import { Progress } from "./ui/progress";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Task {
  name: string;
  duration: number;
}

interface TaskItemProps {
  name: string;
  status: 'not-started' | 'pending' | 'completed';
}

interface ScanSimulationProps {
  onComplete: () => void;
  tasks?: Task[];
}

const TaskItem: React.FC<TaskItemProps> = ({ name, status }) => {
  const statusIcons = {
    'pending': <Loader2 className="h-5 w-5 animate-spin text-blue-400" />,
    'completed': <CheckCircle2 className="h-5 w-5 text-green-400" />,
    'not-started': (
      <div className="rounded-full border-2 border-gray-600 p-1">
        <div className="h-2 w-2" />
      </div>
    ),
  };

  const statusClasses = {
    'pending': 'text-blue-400',
    'completed': 'text-green-400',
    'not-started': '',
  };

  return (
    <div className="flex items-center space-x-3 mb-2">
      {statusIcons[status]}
      <span className={`text-gray-300 ${statusClasses[status]}`}>{name}</span>
    </div>
  );
};

const ScanSimulation: React.FC<ScanSimulationProps> = ({ onComplete, tasks = [] }) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (tasks.length === 0) return;

    if (currentTaskIndex < tasks.length) {
      const timer = setTimeout(() => {
        setCurrentTaskIndex(prevIndex => prevIndex + 1);
        setProgress(prevProgress => ((currentTaskIndex + 1) / tasks.length) * 100);
      }, tasks[currentTaskIndex].duration);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentTaskIndex, tasks, onComplete]);

  if (tasks.length === 0) {
    return <div>No tasks to simulate.</div>;
  }

  return (
    <div className="p-8 rounded-lg shadow-xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Scanning Contract</h2>
      </div>
      <div className="space-y-2 text-sm">
        {tasks.map((task, index) => (
          <TaskItem
            key={index}
            name={task.name}
            status={
              index < currentTaskIndex
                ? 'completed'
                : index === currentTaskIndex
                ? 'pending'
                : 'not-started'
            }
          />
        ))}
      </div>
      <div className="mt-8">
        <Progress value={progress} className="h-2 bg-gray-700" />
        <p className="text-right text-sm text-gray-400 mt-2">
          {progress.toFixed(0)}% Complete
        </p>
      </div>
    </div>
  );
};

export default ScanSimulation;