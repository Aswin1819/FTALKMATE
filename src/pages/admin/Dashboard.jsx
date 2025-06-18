import React from 'react';
import { 
  Users, 
  MessageSquare, 
  Crown, 
  Flag, 
  Clock, 
  TrendingUp, 
  Search,
  Filter
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const LineChart = () => (
  <div className="w-full h-64 flex items-center justify-center bg-gradient-to-b from-transparent to-neon-purple/5 rounded-lg border border-white/10 mt-4">
    <div className="text-gray-500">
      User Growth Chart (Demo)
      <div className="h-32 mt-4 flex items-end justify-between gap-1 px-4">
        {[30, 50, 25, 45, 55, 70, 60, 75, 40, 80, 65, 90].map((height, i) => (
          <div 
            key={i} 
            className="w-4 bg-gradient-to-t from-neon-purple/30 to-neon-purple rounded-t-sm" 
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {


  const stats = [
    { title: "Total Users", value: "8,249", icon: Users, change: "+12%", trend: "up" },
    { title: "Active Rooms", value: "156", icon: MessageSquare, change: "+5%", trend: "up" },
    { title: "Premium Users", value: "1,204", icon: Crown, change: "+18%", trend: "up" },
    { title: "Flagged Content", value: "23", icon: Flag, change: "-8%", trend: "down" },
  ];

  const recentActivity = [
    { id: 1, user: "Sarah Johnson", action: "created a new room", target: "English Practice #42", time: "5 min ago" },
    { id: 2, user: "Admin", action: "banned", target: "user123", time: "1 hour ago" },
    { id: 3, user: "Mike Peterson", action: "reported", target: "message in Room #28", time: "2 hours ago" },
    { id: 4, user: "Emma Wilson", action: "upgraded to", target: "Premium Plan", time: "3 hours ago" },
    { id: 5, user: "System", action: "deleted", target: "flagged message", time: "4 hours ago" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select defaultValue="7days">
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
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
                <Badge variant={stat.trend === "up" ? "default" : "destructive"} className={`bg-${stat.trend === "up" ? "neon-purple/20" : "red-500/20"} text-${stat.trend === "up" ? "neon-purple" : "red-400"} hover:${stat.trend === "up" ? "bg-neon-purple/30" : "bg-red-500/30"}`}>
                  {stat.trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />}
                  {stat.change}
                </Badge>
                <span className="text-gray-500 text-xs ml-2">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>User Growth</CardTitle>
                <CardDescription className="text-gray-400">User signups over time</CardDescription>
              </div>
              <Select defaultValue="registrations">
                <SelectTrigger className="w-[180px] bg-black/30 border-white/10 text-white">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 text-white">
                  <SelectItem value="registrations" className="hover:bg-white/10 focus:bg-white/10">Registrations</SelectItem>
                  <SelectItem value="active" className="hover:bg-white/10 focus:bg-white/10">Active Users</SelectItem>
                  <SelectItem value="rooms" className="hover:bg-white/10 focus:bg-white/10">Room Creation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <LineChart />
          </CardContent>
        </Card>

        <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription className="text-gray-400">Latest actions and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-white/5">
                  <div className="h-8 w-8 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple flex-shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-200">{item.user}</span>
                      <span className="text-gray-400"> {item.action} </span>
                      <span className="font-medium text-gray-200">{item.target}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-neon-purple hover:bg-white/5">
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
