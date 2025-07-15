import React, { useEffect, useState } from 'react';
import adminInstance from '../../features/auth/adminInstance';
import { 
  Users, 
  MessageSquare, 
  Crown, 
  Flag
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../../components/ui/dropdown-menu";
import { Button } from '../../components/ui/button';

const LineChart = ({ data, labels }) => {
  const max = Math.max(...data, 1);
  // Each bar gets 40px, but min-w-full for small data
  const chartWidth = Math.max(data.length * 40, 320); // 320px = 8 bars as min
  return (
    <div className="w-full h-56 flex flex-col justify-end">
      <div
        className="overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div
          className="flex items-end gap-2 px-2"
          style={{ minWidth: chartWidth }}
        >
          {data.map((val, i) => (
            <div key={i} className="flex flex-col items-center w-8 relative">
              {/* Bar */}
              <div
                className="w-6 rounded-t bg-gradient-to-t from-neon-purple/30 to-neon-purple shadow-md transition-all duration-300"
                style={{ height: `${Math.max((val / max) * 120, 12)}px` }}
                title={`${labels[i]}: ${val}`}
              />
              {/* Month label and value aligned */}
              <div className="flex flex-col items-center mt-1 w-full">
                <span className="text-xs text-gray-400">{val}</span>
                <span className="text-xs text-gray-400 mt-0.5">{labels[i]}</span>
              </div>
            </div>
          ))}
        </div>
        <style>{`
          .overflow-x-auto::-webkit-scrollbar { display: none; }
        `}</style>
      </div>
    </div>
  );
};

const CHART_OPTIONS = [
  { label: 'This Month', value: 'month' },
  { label: 'Last 6 Weeks', value: '6weeks' },
  { label: 'Last 12 Months', value: 'year' },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    active_rooms: 0,
    premium_users: 0,
    flagged_content: 0,
    user_growth: [],
    months: [],
    weeks: [],
    week_growth: [],
    days: [],
    day_growth: [],
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartRange, setChartRange] = useState('month');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    adminInstance.get('/stats/').then(res => setStats(res.data));
    adminInstance.get('/recent-activity/').then(res => setRecentActivity(res.data.recent_activity));
  }, []);

  // Prepare chart data based on dropdown
  let chartData = [];
  let chartLabels = [];
  if (chartRange === "month" && stats.day_growth?.length && stats.days?.length) {
    chartData = stats.day_growth.slice(-31);
    chartLabels = stats.days.slice(-31).map((d) => {
      const [year, month, day] = d.split("-");
      return `${month}/${day}`;
    });
  } else if (chartRange === "6weeks" && stats.week_growth?.length && stats.weeks?.length) {
    chartData = stats.week_growth.slice(-6);
    chartLabels = stats.weeks.slice(-6).map((w) => `W${w}`);
  } else if (chartRange === "year" && stats.user_growth?.length && stats.months?.length) {
    chartData = stats.user_growth.slice(-12);
    chartLabels = stats.months.slice(-12).map((m) => m.split(" ")[0]);
  } else {
    // fallback to yearly if nothing else
    chartData = stats.user_growth?.slice(-12) || [];
    chartLabels = stats.months?.slice(-12).map((m) => m.split(" ")[0]) || [];
  }

  const statCards = [
    { title: "Total Users", value: stats.total_users, icon: Users },
    { title: "Active Rooms", value: stats.active_rooms, icon: MessageSquare },
    { title: "Premium Users", value: stats.premium_users, icon: Crown },
    { title: "Flagged Content", value: stats.flagged_content, icon: Flag },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <Card key={i} className="bg-black/30 border-white/10 text-white">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-neon-purple/20 p-3">
                <stat.icon className="h-7 w-7 text-neon-purple" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{stat.value}</h3>
                <p className="text-xs text-gray-400">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Chart and Recent Activity side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Card className="bg-black/30 border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Growth</CardTitle>
            <DropdownMenu onOpenChange={setDropdownOpen} open={dropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="bg-black/80 border border-white/10 text-white rounded px-2 py-1 text-sm outline-none min-w-[120px] flex justify-between items-center"
                >
                  {CHART_OPTIONS.find((opt) => opt.value === chartRange)?.label}
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/90 border-white/10 text-white min-w-[140px]">
                <DropdownMenuRadioGroup value={chartRange} onValueChange={setChartRange}>
                  {CHART_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem key={opt.value} value={opt.value} className="text-white focus:bg-neon-purple/20">
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <LineChart data={chartData} labels={chartLabels} />
          </CardContent>
        </Card>
        <Card className="bg-black/30 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 && <div className="text-gray-400">No recent activity.</div>}
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                <div>
                  <span className="font-bold text-neon-purple">{act.user}</span> {act.action} <span className="font-bold">{act.target}</span>
                </div>
                <div className="text-xs text-gray-400">{act.time}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
