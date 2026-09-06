"use client";

import { useMemo, useState } from "react";

import {
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileCheck,
  Filter,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  User,
  Users,
  X,
  AlertTriangle,
  CircleDot,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* =========================================================
   TYPES
========================================================= */

type Status = "Pending" | "In Progress" | "Resolved" | "Rejected";

type Priority = "Low" | "Medium" | "High" | "Critical";

type Category = "Road" | "Garbage" | "Water" | "Streetlight";

type Complaint = {
  id: string;
  title: string;
  category: Category;
  location: string;
  description: string;
  citizen: string;
  phone: string;
  date: string;
  department: string;
  staff: string;
  priority: Priority;
  status: Status;
  photo: string;
  resolutionProof: string;
};

/* =========================================================
   DUMMY COMPLAINT DATA
========================================================= */

const initialComplaints: Complaint[] = [
  {
    id: "CMP-001",
    title: "Broken road near school",
    category: "Road",
    location: "New Baneshwor, Kathmandu",
    description:
      "Large potholes have appeared on the road near the school. It is causing problems for vehicles and pedestrians.",
    citizen: "Ram Sharma",
    phone: "98XXXXXXXX",
    date: "2026-09-01",
    department: "Road Department",
    staff: "Not Assigned",
    priority: "High",
    status: "Pending",
    photo:
      "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1000&q=80",
    resolutionProof: "",
  },
  {
    id: "CMP-002",
    title: "Garbage not collected",
    category: "Garbage",
    location: "Kalanki, Kathmandu",
    description:
      "Garbage has not been collected for several days and waste is accumulating around the residential area.",
    citizen: "Sita Thapa",
    phone: "97XXXXXXXX",
    date: "2026-09-02",
    department: "Waste Management",
    staff: "Hari KC",
    priority: "Medium",
    status: "In Progress",
    photo:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&q=80",
    resolutionProof: "",
  },
  {
    id: "CMP-003",
    title: "Streetlight not working",
    category: "Streetlight",
    location: "Koteshwor, Kathmandu",
    description:
      "The streetlight near the main junction is not working at night.",
    citizen: "Ramesh KC",
    phone: "98XXXXXXXX",
    date: "2026-09-02",
    department: "Electrical Department",
    staff: "Rajan KC",
    priority: "Low",
    status: "Resolved",
    photo:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1000&q=80",
    resolutionProof:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "CMP-004",
    title: "Water supply problem",
    category: "Water",
    location: "Chabahil, Kathmandu",
    description:
      "Residents are not receiving regular water supply for the last three days.",
    citizen: "Mina Gurung",
    phone: "96XXXXXXXX",
    date: "2026-09-03",
    department: "Water Supply Department",
    staff: "Suresh KC",
    priority: "Critical",
    status: "In Progress",
    photo:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1000&q=80",
    resolutionProof: "",
  },
  {
    id: "CMP-005",
    title: "Damaged footpath",
    category: "Road",
    location: "Maitidevi, Kathmandu",
    description:
      "The footpath has been damaged and pedestrians are having difficulty walking safely.",
    citizen: "Bikash Adhikari",
    phone: "98XXXXXXXX",
    date: "2026-09-03",
    department: "Road Department",
    staff: "Hari KC",
    priority: "Medium",
    status: "Pending",
    photo:
      "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1000&q=80",
    resolutionProof: "",
  },
  {
    id: "CMP-006",
    title: "Overflowing garbage bin",
    category: "Garbage",
    location: "Boudha, Kathmandu",
    description:
      "The public garbage bin is overflowing and creating an unpleasant environment.",
    citizen: "Anil Lama",
    phone: "97XXXXXXXX",
    date: "2026-09-04",
    department: "Waste Management",
    staff: "Ramesh Thapa",
    priority: "High",
    status: "Pending",
    photo:
      "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=1000&q=80",
    resolutionProof: "",
  },
];

/* =========================================================
   ANALYTICS DATA
========================================================= */

const monthlyData = [
  { month: "Jan", complaints: 85 },
  { month: "Feb", complaints: 110 },
  { month: "Mar", complaints: 95 },
  { month: "Apr", complaints: 130 },
  { month: "May", complaints: 145 },
  { month: "Jun", complaints: 120 },
  { month: "Jul", complaints: 160 },
  { month: "Aug", complaints: 175 },
  { month: "Sep", complaints: 90 },
];

const statusChartData = [
  { name: "Pending", value: 142 },
  { name: "In Progress", value: 238 },
  { name: "Resolved", value: 868 },
];

const categoryChartData = [
  { name: "Road", complaints: 320 },
  { name: "Garbage", complaints: 250 },
  { name: "Water", complaints: 190 },
  { name: "Streetlight", complaints: 150 },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginError, setLoginError] = useState("");

  const [complaints, setComplaints] =
    useState<Complaint[]>(initialComplaints);

  const [selectedComplaint, setSelectedComplaint] =
    useState<Complaint | null>(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [activePage, setActivePage] = useState("Dashboard");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* =========================================================
     LOGIN
  ========================================================= */

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (email === "admin@gmail.com" && password === "admin123") {
      setLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError(
        "Invalid email or password. Try admin@gmail.com / admin123"
      );
    }
  }

  /* =========================================================
     LOGOUT
  ========================================================= */

  function logout() {
    setLoggedIn(false);
    setEmail("");
    setPassword("");
  }

  /* =========================================================
     FILTER COMPLAINTS
  ========================================================= */

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesSearch =
        complaint.id.toLowerCase().includes(search.toLowerCase()) ||
        complaint.title.toLowerCase().includes(search.toLowerCase()) ||
        complaint.location.toLowerCase().includes(search.toLowerCase()) ||
        complaint.citizen.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || complaint.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        complaint.category === categoryFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        complaint.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesPriority
      );
    });
  }, [
    complaints,
    search,
    statusFilter,
    categoryFilter,
    priorityFilter,
  ]);

  /* =========================================================
     UPDATE COMPLAINT
  ========================================================= */

  function updateComplaint(updated: Complaint) {
    setComplaints((current) =>
      current.map((complaint) =>
        complaint.id === updated.id ? updated : complaint
      )
    );

    setSelectedComplaint(updated);
  }

  /* =========================================================
     LOGIN PAGE
  ========================================================= */

  if (!loggedIn) {
    return (
      <main className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <ShieldCheck size={42} />
          </div>

          <h1>SmartGov</h1>

          <p className="login-subtitle">
            Smart Complaint Management System
          </p>

          <div className="admin-label">
            <User size={18} />
            Administrator Login
          </div>

          <form onSubmit={handleLogin}>
            <label>Email Address</label>

            <div className="input-wrapper">
              <User size={18} />
              <input
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label>Password</label>

            <div className="input-wrapper">
              <ShieldCheck size={18} />

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {loginError && (
              <div className="login-error">
                <AlertTriangle size={16} />
                {loginError}
              </div>
            )}

            <button className="login-button" type="submit">
              Login to Dashboard
            </button>
          </form>

          <div className="demo-login">
            <strong>Demo Login</strong>
            <span>Email: admin@gmail.com</span>
            <span>Password: admin123</span>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     MAIN DASHBOARD
  ========================================================= */

  return (
    <div className="dashboard-layout">
      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <ShieldCheck size={27} />
          </div>

          <div>
            <h2>SmartGov</h2>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-title">MAIN MENU</p>

          <button
            className={`nav-item ${
              activePage === "Dashboard" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("Dashboard");
              setSidebarOpen(false);
            }}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            className={`nav-item ${
              activePage === "Complaints" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("Complaints");
              setSidebarOpen(false);
            }}
          >
            <FileCheck size={19} />
            Complaints
            <span className="nav-count">{complaints.length}</span>
          </button>

          <button
            className={`nav-item ${
              activePage === "Analytics" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("Analytics");
              setSidebarOpen(false);
            }}
          >
            <BarChart3 size={19} />
            Analytics
          </button>

          <p className="nav-title second-title">SYSTEM</p>

          <button className="nav-item">
            <Users size={19} />
            Staff
          </button>

          <button className="nav-item">
            <Bell size={19} />
            Notifications
            <span className="notification-dot" />
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="avatar">
              A
            </div>

            <div>
              <strong>Administrator</strong>
              <span>Super Admin</span>
            </div>
          </div>

          <button className="logout-button" onClick={logout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <main className="main-content">
        {/* TOP HEADER */}

        <header className="top-header">
          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div>
            <h1>{activePage}</h1>

            <p>
              Manage citizen complaints and government services.
            </p>
          </div>

          <div className="header-right">
            <button className="icon-button">
              <Bell size={20} />
              <span />
            </button>

            <div className="header-user">
              <div className="avatar">A</div>

              <div>
                <strong>Administrator</strong>
                <small>Online</small>
              </div>
            </div>
          </div>
        </header>

        {/* ===================================================
            DASHBOARD PAGE
        =================================================== */}

        {activePage === "Dashboard" && (
          <DashboardHome
            complaints={complaints}
            filteredComplaints={filteredComplaints}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            setSelectedComplaint={setSelectedComplaint}
            setActivePage={setActivePage}
          />
        )}

        {/* ===================================================
            COMPLAINTS PAGE
        =================================================== */}

        {activePage === "Complaints" && (
          <ComplaintsPage
            complaints={complaints}
            filteredComplaints={filteredComplaints}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            setSelectedComplaint={setSelectedComplaint}
          />
        )}

        {/* ===================================================
            ANALYTICS PAGE
        =================================================== */}

        {activePage === "Analytics" && <AnalyticsPage />}
      </main>

      {/* =====================================================
          COMPLAINT DETAILS MODAL
      ===================================================== */}

      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdate={updateComplaint}
        />
      )}
    </div>
  );
}

/* =========================================================
   DASHBOARD HOME
========================================================= */

function DashboardHome({
  complaints,
  filteredComplaints,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  setSelectedComplaint,
  setActivePage,
}: {
  complaints: Complaint[];
  filteredComplaints: Complaint[];
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  setSelectedComplaint: (complaint: Complaint) => void;
  setActivePage: (value: string) => void;
}) {
  const total = complaints.length;

  const pending = complaints.filter(
    (item) => item.status === "Pending"
  ).length;

  const inProgress = complaints.filter(
    (item) => item.status === "In Progress"
  ).length;

  const resolved = complaints.filter(
    (item) => item.status === "Resolved"
  ).length;

  return (
    <>
      <section className="stats-grid">
        <StatCard
          title="Total Complaints"
          value={total}
          icon={<FileCheck size={23} />}
          type="blue"
        />

        <StatCard
          title="Pending"
          value={pending}
          icon={<Clock3 size={23} />}
          type="orange"
        />

        <StatCard
          title="In Progress"
          value={inProgress}
          icon={<CircleDot size={23} />}
          type="purple"
        />

        <StatCard
          title="Resolved"
          value={resolved}
          icon={<CheckCircle2 size={23} />}
          type="green"
        />
      </section>

      <section className="dashboard-grid">
        <div className="chart-card">
          <div className="card-heading">
            <div>
              <h3>Complaints by Category</h3>
              <p>Distribution of reported problems</p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="complaints"
                  fill="#2563eb"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="card-heading">
            <div>
              <h3>Complaints by Status</h3>
              <p>Current complaint status</p>
            </div>
          </div>

          <div className="pie-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label
                >
                  {statusChartData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        ["#f59e0b", "#8b5cf6", "#22c55e"][index]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="complaints-card">
        <div className="section-heading">
          <div>
            <h2>All Complaints</h2>
            <p>Review and manage citizen complaints.</p>
          </div>

          <button
            className="view-all-button"
            onClick={() => setActivePage("Complaints")}
          >
            View All
          </button>
        </div>

        <ComplaintControls
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />

        <ComplaintTable
          complaints={filteredComplaints.slice(0, 5)}
          setSelectedComplaint={setSelectedComplaint}
        />
      </section>
    </>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
  type,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  type: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${type}`}>
        {icon}
      </div>

      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

/* =========================================================
   COMPLAINTS PAGE
========================================================= */

function ComplaintsPage({
  complaints,
  filteredComplaints,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  setSelectedComplaint,
}: {
  complaints: Complaint[];
  filteredComplaints: Complaint[];
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  setSelectedComplaint: (complaint: Complaint) => void;
}) {
  return (
    <section className="complaints-page">
      <div className="page-introduction">
        <div>
          <h2>Complaint Management</h2>
          <p>
            Search, filter and manage all citizen complaints.
          </p>
        </div>

        <div className="total-result">
          Showing {filteredComplaints.length} of {complaints.length}
        </div>
      </div>

      <div className="complaints-card">
        <ComplaintControls
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />

        <ComplaintTable
          complaints={filteredComplaints}
          setSelectedComplaint={setSelectedComplaint}
        />
      </div>
    </section>
  );
}

/* =========================================================
   SEARCH + FILTER CONTROLS
========================================================= */

function ComplaintControls({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
}: {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
}) {
  return (
    <div className="controls">
      <div className="search-box">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search complaint, citizen or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-box">
        <Filter size={17} />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="filter-box">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Road">Road</option>
          <option value="Garbage">Garbage</option>
          <option value="Water">Water</option>
          <option value="Streetlight">Streetlight</option>
        </select>

        <ChevronDown size={16} />
      </div>

      <div className="filter-box">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="All">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        <ChevronDown size={16} />
      </div>
    </div>
  );
}

/* =========================================================
   COMPLAINT TABLE
========================================================= */

function ComplaintTable({
  complaints,
  setSelectedComplaint,
}: {
  complaints: Complaint[];
  setSelectedComplaint: (complaint: Complaint) => void;
}) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Complaint</th>
            <th>Category</th>
            <th>Location</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Department</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {complaints.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <div className="empty-state">
                  <Search size={35} />
                  <h3>No complaints found</h3>
                  <p>Try changing your search or filters.</p>
                </div>
              </td>
            </tr>
          ) : (
            complaints.map((complaint) => (
              <tr key={complaint.id}>
                <td>
                  <div className="complaint-name">
                    <strong>{complaint.title}</strong>
                    <span>{complaint.id}</span>
                  </div>
                </td>

                <td>
                  <span className="category-badge">
                    {complaint.category}
                  </span>
                </td>

                <td>
                  <div className="location-cell">
                    <MapPin size={15} />
                    {complaint.location}
                  </div>
                </td>

                <td>
                  <PriorityBadge priority={complaint.priority} />
                </td>

                <td>
                  <StatusBadge status={complaint.status} />
                </td>

                <td>
                  <span className="department-text">
                    {complaint.department}
                  </span>
                </td>

                <td>
                  <button
                    className="details-button"
                    onClick={() => setSelectedComplaint(complaint)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`status-badge ${status.toLowerCase().replace(" ", "-")}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

/* =========================================================
   PRIORITY BADGE
========================================================= */

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`priority-badge ${priority.toLowerCase()}`}
    >
      {priority}
    </span>
  );
}

/* =========================================================
   COMPLAINT MODAL
========================================================= */

function ComplaintModal({
  complaint,
  onClose,
  onUpdate,
}: {
  complaint: Complaint;
  onClose: () => void;
  onUpdate: (complaint: Complaint) => void;
}) {
  const [department, setDepartment] = useState(
    complaint.department
  );

  const [staff, setStaff] = useState(complaint.staff);

  const [priority, setPriority] = useState(
    complaint.priority
  );

  const [status, setStatus] = useState(complaint.status);

  const [proof, setProof] = useState(
    complaint.resolutionProof
  );

  function saveChanges() {
    onUpdate({
      ...complaint,
      department,
      staff,
      priority: priority as Priority,
      status: status as Status,
      resolutionProof: proof,
    });
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <span className="modal-id">{complaint.id}</span>
            <h2>{complaint.title}</h2>
          </div>

          <button className="close-button" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          <div className="details-grid">
            {/* PHOTO */}

            <div className="detail-section photo-section">
              <div className="section-label">
                <ImageIcon size={17} />
                Complaint Photo
              </div>

              <img
                src={complaint.photo}
                alt="Complaint"
                className="complaint-photo"
              />
            </div>

            {/* BASIC INFORMATION */}

            <div className="detail-section">
              <div className="section-label">
                <FileCheck size={17} />
                Complaint Information
              </div>

              <div className="info-list">
                <div>
                  <span>Citizen</span>
                  <strong>{complaint.citizen}</strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>{complaint.phone}</strong>
                </div>

                <div>
                  <span>Date</span>
                  <strong>{complaint.date}</strong>
                </div>

                <div>
                  <span>Category</span>
                  <strong>{complaint.category}</strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>
                    <MapPin size={15} />
                    {complaint.location}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}

          <div className="detail-section full-width">
            <div className="section-label">
              <FileCheck size={17} />
              Description
            </div>

            <p className="description">
              {complaint.description}
            </p>
          </div>

          {/* ADMIN CONTROLS */}

          <div className="admin-controls">
            <div className="control-field">
              <label>Department</label>

              <select
                value={department}
                onChange={(e) =>
                  setDepartment(e.target.value)
                }
              >
                <option>Road Department</option>
                <option>Waste Management</option>
                <option>Water Supply Department</option>
                <option>Electrical Department</option>
                <option>Municipality Office</option>
              </select>
            </div>

            <div className="control-field">
              <label>Staff</label>

              <select
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
              >
                <option>Not Assigned</option>
                <option>Hari KC</option>
                <option>Ramesh Thapa</option>
                <option>Rajan KC</option>
                <option>Suresh KC</option>
              </select>
            </div>

            <div className="control-field">
              <label>Priority</label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as Priority)
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            <div className="control-field">
              <label>Status</label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as Status)
                }
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>

          {/* RESOLUTION PROOF */}

          <div className="detail-section full-width">
            <div className="section-label">
              <FileCheck size={17} />
              Resolution Proof
            </div>

            <div className="upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    setProof(URL.createObjectURL(file));
                  }
                }}
              />

              <p>
                Upload a photo showing that the complaint has
                been resolved.
              </p>
            </div>

            {proof && (
              <img
                src={proof}
                alt="Resolution proof"
                className="proof-image"
              />
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="save-button"
            onClick={saveChanges}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ANALYTICS PAGE
========================================================= */

function AnalyticsPage() {
  return (
    <section className="analytics-page">
      <div className="page-introduction">
        <div>
          <h2>Analytics & Reports</h2>
          <p>
            Analyze complaint trends and government performance.
          </p>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="chart-card large-chart">
          <div className="card-heading">
            <div>
              <h3>Monthly Complaints</h3>
              <p>Complaints received each month</p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="complaints"
                  fill="#2563eb"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="card-heading">
            <div>
              <h3>Complaint Status</h3>
              <p>Current distribution</p>
            </div>
          </div>

          <div className="pie-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {statusChartData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        ["#f59e0b", "#8b5cf6", "#22c55e"][index]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="card-heading">
            <div>
              <h3>Complaints by Category</h3>
              <p>Problem categories</p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="complaints"
                  fill="#8b5cf6"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}