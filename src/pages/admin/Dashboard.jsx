import React, { useEffect, useState } from 'react';
import adminInstance from '../../features/auth/adminInstance';
import { 
  Users, 
  MessageSquare, 
  Crown, 
  Flag,
  TrendingUp,
  Filter
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


const PlatformMetricsChart = ({ data, labels, subscriptionData, subscriptionLabels }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'User Growth',
        data: data,
        borderColor: 'rgba(168, 85, 247, 1)', // violet
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: 'rgba(168, 85, 247, 1)',
        pointBorderColor: 'rgba(255, 255, 255, 0.8)',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: 'rgba(168, 85, 247, 1)',
        pointHoverBorderColor: 'rgba(255, 255, 255, 1)',
        yAxisID: 'y',
      },
      {
        label: 'Premium Subscriptions',
        data: subscriptionData,
        backgroundColor: 'rgba(139, 92, 246, 0.6)', // semi-transparent purple
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
        type: 'line',
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12,
            weight: 500,
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(168, 85, 247, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `${context[0].label} 2024`;
          },
          label: function(context) {
            const label = context.dataset.label || '';
            if (label === 'User Growth') {
              return `${label}: ${context.parsed.y.toLocaleString()} users`;
            }
            return `${label}: ${context.parsed.y} subscriptions`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11,
          },
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11,
          },
          callback: function(value) {
            return `${(value / 1000).toFixed(1)}K`;
          },
        },
        title: {
          display: true,
          text: 'Total Users',
          color: 'rgba(168, 85, 247, 0.9)',
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: 'Premium Subscriptions',
          color: 'rgba(139, 92, 246, 0.9)',
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
    },
    elements: {
      point: {
        hoverBorderWidth: 3,
      },
      line: {
        borderJoinStyle: 'round',
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <div className="w-full h-80 p-4 bg-gradient-to-b from-transparent via-purple-500/5 to-violet-500/10 rounded-lg border border-white/10 backdrop-blur-sm">
      <Line data={chartData} options={options} />
    </div>
  );
};

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
    subscription_growth: [],
    subscription_months: [],
    week_subscription_growth: [],
    week_subscription_labels: [],
    day_subscription_growth: [],
    day_subscription_labels: [],
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartRange, setChartRange] = useState('month');
  // const [metricType, setMetricType] = useState('registrations');
  // const [timePeriod, setTimePeriod] = useState('7days');

  useEffect(() => {
    adminInstance.get('/stats/').then(res => setStats(res.data));
    adminInstance.get('/recent-activity/').then(res => setRecentActivity(res.data.recent_activity));
  }, []);

  // Calculate percentage changes for stats
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // Mock previous period data for demonstration
  const previousStats = {
    total_users: Math.floor(stats.total_users * 0.88),
    active_rooms: Math.floor(stats.active_rooms * 0.95),
    premium_users: Math.floor(stats.premium_users * 0.82),
    flagged_content: Math.floor(stats.flagged_content * 1.08),
  };

  const statCards = [
    { 
      title: "Total Users", 
      value: stats.total_users.toLocaleString(), 
      icon: Users, 
      change: calculateChange(stats.total_users, previousStats.total_users), 
      trend: stats.total_users >= previousStats.total_users ? "up" : "down" 
    },
    { 
      title: "Active Rooms", 
      value: stats.active_rooms.toLocaleString(), 
      icon: MessageSquare, 
      change: calculateChange(stats.active_rooms, previousStats.active_rooms), 
      trend: stats.active_rooms >= previousStats.active_rooms ? "up" : "down" 
    },
    { 
      title: "Premium Users", 
      value: stats.premium_users.toLocaleString(), 
      icon: Crown, 
      change: calculateChange(stats.premium_users, previousStats.premium_users), 
      trend: stats.premium_users >= previousStats.premium_users ? "up" : "down" 
    },
    { 
      title: "Flagged Content", 
      value: stats.flagged_content.toLocaleString(), 
      icon: Flag, 
      change: calculateChange(stats.flagged_content, previousStats.flagged_content), 
      trend: stats.flagged_content <= previousStats.flagged_content ? "up" : "down" 
    },
  ];

  // Prepare chart data based on dropdown
  let chartData = [];
  let chartLabels = [];
  let subscriptionData = [];
  let subscriptionLabels = [];

  if (chartRange === "month" && stats.day_growth?.length && stats.days?.length) {
    chartData = stats.day_growth.slice(-31);
    chartLabels = stats.days.slice(-31).map((d) => {
      const [year, month, day] = d.split("-");
      return `${month}/${day}`;
    });
    subscriptionData = stats.day_subscription_growth?.slice(-31) || [];
    subscriptionLabels = stats.day_subscription_labels?.slice(-31) || [];
  } else if (chartRange === "6weeks" && stats.week_growth?.length && stats.weeks?.length) {
    chartData = stats.week_growth.slice(-6);
    chartLabels = stats.weeks.slice(-6).map((w) => `W${w}`);
    subscriptionData = stats.week_subscription_growth?.slice(-6) || [];
    subscriptionLabels = stats.week_subscription_labels?.slice(-6) || [];
  } else if (chartRange === "year" && stats.user_growth?.length && stats.months?.length) {
    chartData = stats.user_growth.slice(-12);
    chartLabels = stats.months.slice(-12).map((m) => m.split(" ")[0]);
    subscriptionData = stats.subscription_growth?.slice(-12) || [];
    subscriptionLabels = stats.subscription_months?.slice(-12) || [];
  } else {
    // fallback to yearly if nothing else
    chartData = stats.user_growth?.slice(-12) || [];
    chartLabels = stats.months?.slice(-12).map((m) => m.split(" ")[0]) || [];
    subscriptionData = stats.subscription_growth?.slice(-12) || [];
    subscriptionLabels = stats.subscription_months?.slice(-12) || [];
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        
        {/* <div className="flex flex-col sm:flex-row gap-3">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-full sm:w-[180px] bg-black/20 border-white/10 text-white">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/10 text-white">
              <SelectItem value="today" className="hover:bg-white/10 focus:bg-white/10">Today</SelectItem>
              <SelectItem value="yesterday" className="hover:bg-white/10 focus:bg-white/10">Yesterday</SelectItem>
              <SelectItem value="7days" className="hover:bg-white/10 focus:bg-white/10">Last 7 days</SelectItem>
              <SelectItem value="30days" className="hover:bg-white/10 focus:bg-white/10">Last 30 days</SelectItem>
              <SelectItem value="90days" className="hover:bg-white/10 focus:bg-white/10">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div> */}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="bg-black/30 backdrop-blur-sm border-white/10 text-white overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium text-gray-300">
                  {stat.title}
                </CardTitle>
                <div className="p-2 rounded-full bg-white/5">
                  <stat.icon className="h-5 w-5 text-neon-purple" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="flex items-center">
                <Badge 
                  variant={stat.trend === "up" ? "default" : "destructive"} 
                  className={`${
                    stat.trend === "up" 
                      ? "bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30" 
                      : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  }`}
                >
                  <TrendingUp className={`h-3 w-3 mr-1 ${stat.trend === "down" ? "transform rotate-180" : ""}`} />
                  {stat.change}
                </Badge>
                <span className="text-gray-500 text-xs ml-2">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Chart Section - Full Width */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white">
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle>Platform Metrics</CardTitle>
              <CardDescription className="text-gray-400">User growth and subscription trends</CardDescription>
            </div>
            <div className="flex gap-3">
              {/* <Select value={metricType} onValueChange={setMetricType}>
                <SelectTrigger className="w-[180px] bg-black/30 border-white/10 text-white">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 text-white">
                  <SelectItem value="registrations" className="hover:bg-white/10 focus:bg-white/10">Registrations</SelectItem>
                  <SelectItem value="active" className="hover:bg-white/10 focus:bg-white/10">Active Users</SelectItem>
                  <SelectItem value="rooms" className="hover:bg-white/10 focus:bg-white/10">Room Creation</SelectItem>
                </SelectContent>
              </Select> */}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="bg-black/80 border border-white/10 text-white rounded px-2 py-1 text-sm outline-none min-w-[120px] flex justify-between items-center"
                  >
                    {chartRange === 'month' ? 'This Month' : chartRange === '6weeks' ? 'Last 6 Weeks' : 'Last 12 Months'}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/90 border-white/10 text-white min-w-[140px]">
                  <DropdownMenuRadioGroup value={chartRange} onValueChange={setChartRange}>
                    <DropdownMenuRadioItem value="month" className="text-white focus:bg-neon-purple/20">
                      This Month
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="6weeks" className="text-white focus:bg-neon-purple/20">
                      Last 6 Weeks
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="year" className="text-white focus:bg-neon-purple/20">
                      Last 12 Months
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PlatformMetricsChart 
            data={chartData} 
            labels={chartLabels} 
            subscriptionData={subscriptionData}
            subscriptionLabels={subscriptionLabels}
          />
        </CardContent>
      </Card>
      
      {/* Recent Activity Section - Below Chart */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white">
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
  );
};

export default AdminDashboard;