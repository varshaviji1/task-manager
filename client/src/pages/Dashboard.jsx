import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters and Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("dueDate"); // "dueDate" or "createdAt" or "priority"

  const fetchData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        API.get("/tasks"),
        API.get("/dashboard/stats"),
      ]);
      console.log("tasksRes.data =", tasksRes.data);
      console.log("statsRes.data =", statsRes.data);

      // Extract tasks array safely
      let taskList = [];
      if (tasksRes.data) {
        if (Array.isArray(tasksRes.data.data)) {
          taskList = tasksRes.data.data;
        } else if (Array.isArray(tasksRes.data)) {
          taskList = tasksRes.data;
        }
      }
      setTasks(taskList);

      setStats(statsRes.data || {
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
      });
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      // Refresh statistics and task list
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  // Process filtering and sorting safely using Array.isArray checks
  const getDaysLeft = (dueDate) => {
  if (!dueDate) {
    return {
      text: "No Deadline",
      color: "text-gray-500",
    };
  }

  const today = new Date();
  const due = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (due - today) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return {
      text: `🔴 Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""}`,
      color: "text-red-600",
    };
  }

  if (diffDays === 0) {
    return {
      text: "🟡 Due Today",
      color: "text-yellow-600",
    };
  }

  if (diffDays <= 3) {
    return {
      text: `🟠 ${diffDays} day${diffDays > 1 ? "s" : ""} left`,
      color: "text-orange-600",
    };
  }

  return {
    text: `🟢 ${diffDays} day${diffDays > 1 ? "s" : ""} left`,
    color: "text-green-600",
  };
};

  const handleStatusToggle = async (task) => {
    const nextStatusMap = {
      "Pending": "In Progress",
      "In Progress": "Completed",
      "Completed": "Pending",
    };
    const nextStatus = nextStatusMap[task.status] || "Pending";

    try {
      await API.put(`/tasks/${task._id}`, { ...task, status: nextStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update task status");
    }
  };

  // Process filtering and sorting safely using Array.isArray checks
  const tasksArray = Array.isArray(tasks) ? tasks : [];
  const overdueTasks = tasksArray.filter((task) => {
  if (!task.dueDate || task.status === "Completed") return false;

  const today = new Date();
  const due = new Date(task.dueDate);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return due < today;
}).length;
  const filteredTasks = tasksArray
    .filter((task) => {
      if (!task) return false;
      const matchesSearch =
        (task.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === "createdAt") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "priority") {
        const priorityWeight = { High: 3, Medium: 2, Low: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-gray-500">Loading student dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Task Manager</h1>
          <p className="text-sm text-gray-500">Keep track of your study sessions, assignments, and tasks</p>
        </div>
        <Link
          to="/add-task"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
        >
          + Add New Task
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Card: Total */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Tasks</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTasks}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
        </div>

        {/* Card: Pending */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <h3 className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingTasks}</h3>
          </div>
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card: In Progress */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">In Progress</p>
            <h3 className="text-3xl font-bold text-blue-600 mt-1">{stats.inProgressTasks}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 12H19c0 .733-.099 1.44-.283 2.115" />
            </svg>
          </div>
        </div>

        {/* Card: Completed */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Completed</p>
            <h3 className="text-3xl font-bold text-green-600 mt-1">{stats.completedTasks}</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
  <div>
    <p className="text-sm font-medium text-gray-500">Overdue</p>
    <h3 className="text-3xl font-bold text-red-600 mt-1">
      {overdueTasks}
    </h3>
  </div>

  <div className="p-3 bg-red-50 text-red-600 rounded-xl">
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  </div>
</div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tasks by title, subject, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs shadow-sm focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs shadow-sm focus:ring-indigo-500"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs shadow-sm focus:ring-indigo-500"
            >
              <option value="dueDate">Due Date</option>
              <option value="createdAt">Date Created</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Task List</h3>
          <span className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full">
            Showing {filteredTasks.length} task(s)
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2M4 13H6m0 0v2m2-2h2" />
              </svg>
            </div>
            <h4 className="text-base font-semibold text-gray-900">No tasks found</h4>
            <p className="text-sm text-gray-500 mt-1">Try resetting filters or add your first task to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTasks.map((task) => {
              // Priority badge styling
              const priorityStyles = {
                High: "bg-red-50 text-red-700 border border-red-200",
                Medium: "bg-yellow-50 text-yellow-700 border border-yellow-200",
                Low: "bg-green-50 text-green-700 border border-green-200",
              };

              // Status badge styling
              const statusStyles = {
                Completed: "bg-green-100 text-green-800",
                "In Progress": "bg-blue-100 text-blue-800",
                Pending: "bg-gray-100 text-gray-800",
              };

              return (
                <div key={task._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition">
                  {/* Task details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className="text-base font-bold text-gray-900 truncate">
                        {task.title}
                      </h4>
                      {task.subject && (
                        <span className="px-2 py-0.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md">
                          {task.subject}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 pr-4">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-gray-500 font-medium">
                      {/* Priority */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityStyles[task.priority]}`}>
                        {task.priority} Priority
                      </span>

                      {/* Due date */}
                      {task.dueDate ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Due: {new Date(task.dueDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </span>
                      ) : (
                        <span>No due date</span>
                      )}
                      <span
  className={`font-semibold ${getDaysLeft(task.dueDate).color}`}
>
  {getDaysLeft(task.dueDate).text}
</span>


                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-none pt-4 md:pt-0">
                    <button
                      onClick={() => handleStatusToggle(task)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer hover:opacity-80 ${statusStyles[task.status]}`}
                      title="Click to cycle status"
                    >
                      {task.status}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/edit-task/${task._id}`)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleDelete(task._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
