"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  ChevronDown,
  Bell,
  LogOut,
  ChevronLeft,
  Calendar,
  Layers,
  PhoneCall,
  Activity,
  Award,
  Settings,
  AudioLines,
  User2
} from "lucide-react";

// Netra AI Star Custom Icon
const NetraStarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#a855f7] text-[#a855f7]">
    <path d="M12 2l2.4 7.2h7.6l-6.2 4.5 2.4 7.3-6.2-4.5-6.2 4.5 2.4-7.3-6.2-4.5h7.6z" />
  </svg>
);

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [reservationTab, setReservationTab] = useState("Reservation");
  const [dateRange, setDateRange] = useState("Last 7 days");

  const fetchActionHotels = () => {
    void fetch("/api/actions/hotels", { cache: "no-store" }).catch(() => {
      // ignore network errors here; action page can still open
    });
  };

  const handleNavClick = (item: { name: string; href: string }) => {
    setActiveTab(item.name);
    if (item.name === "Actions") {
      fetchActionHotels();
    }
    router.push(item.href);
  };

  const handleSignOut = () => {
    router.push("/login");
  };

  return (
    <div 
      className="flex h-screen text-white font-sans overflow-hidden select-none"
      style={{ backgroundColor: "#050505" }}
    >
      
      {/* ================= LEFT SIDEBAR ================= */}
      <aside 
        className="w-[230px] border-r border-[#1e1e24] flex flex-col justify-between p-4 flex-shrink-0"
        style={{ backgroundColor: "#0c0c0e" }}
      >
        <div className="space-y-6">
          
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 py-1">
            <span className="text-[17px] font-bold tracking-tight text-white select-none">
              HuemanAI
            </span>
          </div>

          {/* Navigation Options */}
          <nav className="space-y-[3px]">
            {[
              { name: "Dashboard", href: "/dashboard", icon: <Layers size={15} /> },
              { name: "Calls", href: "/calls", icon: <PhoneCall size={15} /> },
              { name: "Actions", href: "/actions", icon: <Calendar size={15} /> },
              { name: "Insights", href: "/insights", icon: <Activity size={15} /> },
              { name: "Outbound", href: "/outbound_campaign", icon: <PhoneCall size={15} /> },
              { name: "Reports", href: "/reports", icon: <Award size={15} /> },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  handleNavClick(item);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all text-left ${
                  activeTab === item.name
                    ? "text-white font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                }`}
                style={activeTab === item.name ? { backgroundColor: "#1d1d22" } : undefined}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}

            {/* Special Netra AI item */}
            <div className="px-3 py-2 flex flex-col gap-0.5">
              <div className="flex items-center gap-3 text-zinc-400">
                <NetraStarIcon />
                <span className="text-xs font-semibold tracking-wide">Netra AI</span>
              </div>
              <span className="text-[9px] text-purple-400 font-semibold tracking-wider uppercase ml-7">
                Coming Soon
              </span>
            </div>

            {/* Admin item */}
            <button
              onClick={() => setActiveTab("Admin")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all text-left ${
                activeTab === "Admin"
                  ? "text-white font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              }`}
              style={activeTab === "Admin" ? { backgroundColor: "#1d1d22" } : undefined}
            >
              <Settings size={15} />
              <span>Admin</span>
            </button>
          </nav>
        </div>

        {/* Profile and Logout */}
        <div className="space-y-4 pt-4 border-t border-[#18181b]/60">
          
          {/* User Details */}
          <div className="flex items-center gap-2.5 px-1.5">
            <div className="w-[32px] h-[32px] rounded-full bg-[#18181b] border border-zinc-800 flex items-center justify-center text-xs font-extrabold text-zinc-300">
              F
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-white truncate">Fredrick</p>
              <p className="text-[9px] text-zinc-500 truncate">fredrick@huemanai.co.uk</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/40 transition-all text-left cursor-pointer"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>

          {/* Sidebar Collapse */}
          <div className="flex justify-start px-2 cursor-pointer text-zinc-600 hover:text-zinc-400 transition-colors">
            <ChevronLeft size={16} />
          </div>

        </div>
      </aside>

      {/* ================= RIGHT WORKSPACE ================= */}
      <div 
        className="flex-grow flex flex-col overflow-hidden"
        style={{ backgroundColor: "#050505" }}
      >
        
        {/* Header Bar */}
        <header 
          className="h-[52px] border-b border-[#121216] px-6 flex justify-between items-center bg-[#070709] flex-shrink-0"
          style={{ backgroundColor: "#070709" }}
        >
          
          {/* Dashboard and Sub-tabs */}
          <div className="flex items-center gap-5">
            <h1 className="text-sm font-bold tracking-wider text-white uppercase">Dashboard</h1>
            
            {/* Reservation / Feedback Pill Switcher */}
            <div 
              className="border border-zinc-900 p-0.5 rounded-full flex gap-0.5"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <button
                onClick={() => setReservationTab("Reservation")}
                className={`text-[10px] font-bold px-4 py-1 rounded-full transition-all ${
                  reservationTab === "Reservation"
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white bg-transparent"
                }`}
              >
                Reservation
              </button>
              <button
                onClick={() => setReservationTab("Feedback")}
                className={`text-[10px] font-bold px-4 py-1 rounded-full transition-all ${
                  reservationTab === "Feedback"
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white bg-transparent"
                }`}
              >
                Feedback
              </button>
            </div>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-2">
            
            {/* Date range Selector */}
            <button 
              className="border border-zinc-900 rounded-lg px-3 py-1.5 flex items-center gap-2 text-[10px] font-bold text-zinc-300 hover:text-white hover:border-zinc-800 transition-colors"
              style={{ backgroundColor: "#0a0a0c" }}
            >
              <span>{dateRange}</span>
              <ChevronDown size={12} className="text-zinc-500" />
            </button>
            
            {/* Export Action */}
            <button 
              className="border border-zinc-900 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold text-zinc-300 hover:text-white hover:border-zinc-800 transition-colors"
              style={{ backgroundColor: "#0a0a0c" }}
            >
              <Download size={12} />
              <span>Export</span>
            </button>
            
            {/* Alerts Bell */}
            <div className="relative cursor-pointer p-1.5 rounded-lg hover:bg-zinc-900 transition-colors">
              <Bell size={15} className="text-zinc-300 hover:text-white" />
              <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full text-[8px] font-extrabold text-black flex items-center justify-center">
                2
              </span>
            </div>
            
          </div>
        </header>

        {/* Dashboard Main Content (Long Scroll View) */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">

          {/* ================= SECTION 1: CALL OUTCOMES (Image 1) ================= */}
          <div 
            className="border border-zinc-900 rounded-xl p-5 space-y-4"
            style={{ backgroundColor: "#0b0b0d" }}
          >
            
            {/* Call Outcomes Header */}
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Call Outcomes</p>
              <h2 className="text-xl font-extrabold text-white mt-1 flex items-baseline gap-1.5">
                <span>104</span>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide normal-case">total calls</span>
              </h2>
            </div>

            {/* Segmented outcomes bar */}
            <div className="w-full h-2.5 rounded-full overflow-hidden flex">
              <div className="bg-[#10b981] h-full" style={{ width: "20.2%" }} />
              <div className="bg-[#3b82f6] h-full" style={{ width: "28.8%" }} />
              <div className="bg-[#06b6d4] h-full" style={{ width: "1.9%" }} />
              <div className="bg-[#eab308] h-full" style={{ width: "1.9%" }} />
              <div className="bg-[#f97316] h-full" style={{ width: "16.3%" }} />
              <div className="bg-[#f43f5e] h-full" style={{ width: "1.0%" }} />
              <div className="bg-[#14b8a6] h-full" style={{ width: "31.7%" }} />
            </div>

            {/* Color Dot Legend underneath */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 pt-1 text-[10px] font-semibold">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-[#10b981] block" />
                <span>Booking Secured <strong className="text-white">21</strong> <span className="text-zinc-500">(20.2%)</span></span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6] block" />
                <span>Enquiry Handled <strong className="text-white">30</strong> <span className="text-zinc-500">(28.8%)</span></span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-[#06b6d4] block" />
                <span>Large Party Bookings <strong className="text-white">2</strong> <span className="text-zinc-500">(1.9%)</span></span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-[#eab308] block" />
                <span>Promotional / Offer <strong className="text-white">2</strong> <span className="text-zinc-500">(1.9%)</span></span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-[#f97316] block" />
                <span>Transferred to Staff <strong className="text-white">17</strong> <span className="text-zinc-500">(16.3%)</span></span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-[#f43f5e] block" />
                <span>Booking Cancelled <strong className="text-white">1</strong> <span className="text-zinc-500">(1.0%)</span></span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-[#14b8a6] block" />
                <span>General Assistance <strong className="text-white">33</strong> <span className="text-zinc-500">(31.7%)</span></span>
              </div>
            </div>

          </div>

          {/* ================= STATS GRID (Image 1) ================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Stat 1 */}
            <div 
              className="border border-zinc-900 rounded-xl p-5 space-y-1.5"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Bookings Captured</p>
              <h3 className="text-2xl font-extrabold text-white">25</h3>
              <div className="inline-flex items-center gap-1 bg-[#10b981]/10 text-[#10b981] text-[9px] font-bold px-2 py-0.5 rounded-full">
                <span>↗</span>
                <span>100.0%</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div 
              className="border border-zinc-900 rounded-xl p-5 space-y-1.5"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Covers</p>
              <h3 className="text-2xl font-extrabold text-white">215</h3>
            </div>

            {/* Stat 3 */}
            <div 
              className="border border-zinc-900 rounded-xl p-5 space-y-1.5"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Reservations %</p>
              <h3 className="text-2xl font-extrabold text-white">24.0%</h3>
            </div>

            {/* Stat 4 */}
            <div 
              className="border border-zinc-900 rounded-xl p-5 space-y-1.5 relative"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Avg Time</p>
              <h3 className="text-2xl font-extrabold text-white">1:47</h3>
              <div className="inline-flex items-center gap-1 bg-[#10b981]/10 text-[#10b981] text-[9px] font-bold px-2 py-0.5 rounded-full">
                <span>↗</span>
                <span>84.5%</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-4 right-4" />
            </div>

          </div>

          {/* ================= WORK Breakdown: Non-Working Hours & Reservation breakdown (Image 1) ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Non-working Hours Card */}
            <div 
              className="border border-zinc-900 rounded-xl p-6 flex flex-col justify-between min-h-[220px]"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Non-Working Hours Breakdown</h4>
                    <p className="text-[9px] text-zinc-500">Activity recorded outside your typical opening times</p>
                  </div>
                  <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold select-none">
                    ◆ AFTER HOURS
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-3xl font-extrabold">4</span>
                  <span className="text-zinc-500 text-[10px] font-bold">calls</span>
                  <span className="text-zinc-700 text-xs">•</span>
                  <span className="text-3xl font-extrabold text-[#10b981]">1</span>
                  <span className="text-zinc-500 text-[10px] font-bold">bookings</span>
                  <span className="text-zinc-700 text-xs">•</span>
                  <span className="text-3xl font-extrabold text-[#3b82f6]">2</span>
                  <span className="text-zinc-500 text-[10px] font-bold">covers</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-900/60 text-[9px] font-bold">
                
                {/* Secured Bookings Line */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      Secured Bookings
                    </span>
                    <span>100.0%  <strong className="text-white">1 | 2</strong></span>
                  </div>
                  <div className="w-full h-1 bg-[#18181c] rounded-full overflow-hidden">
                    <div className="bg-[#10b981] h-full w-[100%]" />
                  </div>
                </div>

                {/* Conversion Rate Line */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>After-Hours Conversion Rate</span>
                    <span className="text-white">25.0%</span>
                  </div>
                  <div className="w-full h-1 bg-[#18181c] rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full w-[25%]" />
                  </div>
                </div>

              </div>
            </div>

            {/* Reservation Breakdown Card */}
            <div 
              className="border border-zinc-900 rounded-xl p-6 flex flex-col justify-between min-h-[220px]"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Reservation Breakdown</h4>
                  <p className="text-[9px] text-zinc-500">Distribution of reservation types with covers</p>
                </div>
                
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-3xl font-extrabold">25</span>
                  <span className="text-zinc-500 text-[10px] font-bold">bookings</span>
                  <span className="text-zinc-700 text-xs">•</span>
                  <span className="text-3xl font-extrabold text-[#3b82f6]">215</span>
                  <span className="text-zinc-500 text-[10px] font-bold">covers</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-900/60 text-[9px] font-bold">
                
                {/* Secured */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      Secured Bookings
                    </span>
                    <span>84.0%  <strong className="text-white">21 | 71</strong></span>
                  </div>
                  <div className="w-full h-1 bg-[#18181c] rounded-full overflow-hidden">
                    <div className="bg-[#10b981] h-full w-[84%]" />
                  </div>
                </div>

                {/* Large Party */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                      Large Party Bookings
                    </span>
                    <span>8.0%  <strong className="text-white">2 | 120</strong></span>
                  </div>
                  <div className="w-full h-1 bg-[#18181c] rounded-full overflow-hidden">
                    <div className="bg-[#3b82f6] h-full w-[8%]" />
                  </div>
                </div>

                {/* Promotional */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]" />
                      Promotional / Offer
                    </span>
                    <span>8.0%  <strong className="text-white">2 | 24</strong></span>
                  </div>
                  <div className="w-full h-1 bg-[#18181c] rounded-full overflow-hidden">
                    <div className="bg-[#eab308] h-full w-[8%]" />
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ================= SECTION 2: BOOKINGS BREAKDOWN BAR CHART (Image 2) ================= */}
          <div 
            className="border border-zinc-900 rounded-xl p-6 space-y-4"
            style={{ backgroundColor: "#0b0b0d" }}
          >
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Bookings Breakdown</h4>
                <p className="text-[9px] text-zinc-500">When bookings were created</p>
              </div>
              
              {/* Date Booked / Visit Date pills */}
              <div 
                className="border border-zinc-900 p-0.5 rounded-lg flex gap-0.5 text-[9px] font-bold"
                style={{ backgroundColor: "#050507" }}
              >
                <button className="bg-[#10b981] text-white px-3 py-1 rounded-md">Date Booked</button>
                <button className="text-zinc-500 px-3 py-1 bg-transparent">Visit Date</button>
              </div>
            </div>

            {/* Total Bookings label & thin top strip */}
            <div className="space-y-3">
              <h3 className="text-2xl font-extrabold text-white flex items-baseline gap-1">
                <span>21</span>
                <span className="text-zinc-500 text-[10px] font-bold normal-case">total bookings</span>
              </h3>
              
              <div className="w-full h-[3px] rounded-full overflow-hidden flex">
                <div className="bg-[#10b981] h-full" style={{ width: "45%" }} />
                <div className="bg-[#8b5cf6] h-full" style={{ width: "12%" }} />
                <div className="bg-[#eab308] h-full" style={{ width: "10%" }} />
                <div className="bg-[#f43f5e] h-full" style={{ width: "15%" }} />
                <div className="bg-[#ec4899] h-full" style={{ width: "10%" }} />
                <div className="bg-[#06b6d4] h-full" style={{ width: "8%" }} />
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 font-semibold pt-1">
              Max Value: <strong className="text-white">6</strong> bookings on Tue
            </p>

            {/* Bar Chart Graphics */}
            <div className="pt-6 grid grid-cols-7 items-end gap-3 h-[200px] border-b border-zinc-900/60 pb-2">
              
              {/* MON */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full bg-[#10b981] rounded-t-xl transition-all duration-300 group-hover:brightness-110" style={{ height: "70px" }} />
                <div className="text-center pt-1.5 space-y-0.5">
                  <p className="text-[10px] font-bold text-[#10b981]">MON</p>
                  <p className="text-[9px] text-zinc-500 font-medium">18 May</p>
                </div>
              </div>

              {/* TUE - Peak */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer relative">
                {/* Cyan dot highlight */}
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute -top-5" />
                <div className="w-full bg-[#3b82f6] rounded-t-xl transition-all duration-300 group-hover:brightness-110" style={{ height: "140px" }} />
                <div className="text-center pt-1.5 space-y-1 flex flex-col items-center">
                  <p className="text-[10px] font-bold text-[#3b82f6]">TUE</p>
                  <p className="text-[9px] text-zinc-500 font-medium">19 May</p>
                  <span className="text-[8px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-md font-extrabold uppercase scale-90 tracking-wide mt-1">
                    PEAK
                  </span>
                </div>
              </div>

              {/* WED */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full bg-[#8b5cf6] rounded-t-xl transition-all duration-300 group-hover:brightness-110" style={{ height: "92px" }} />
                <div className="text-center pt-1.5 space-y-0.5">
                  <p className="text-[10px] font-bold text-[#8b5cf6]">WED</p>
                  <p className="text-[9px] text-zinc-500 font-medium">20 May</p>
                </div>
              </div>

              {/* THU */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full bg-[#eab308] rounded-t-xl transition-all duration-300 group-hover:brightness-110" style={{ height: "30px" }} />
                <div className="text-center pt-1.5 space-y-0.5">
                  <p className="text-[10px] font-bold text-[#eab308]">THU</p>
                  <p className="text-[9px] text-zinc-500 font-medium">21 May</p>
                </div>
              </div>

              {/* FRI */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full bg-[#f43f5e] rounded-t-xl transition-all duration-300 group-hover:brightness-110" style={{ height: "115px" }} />
                <div className="text-center pt-1.5 space-y-0.5">
                  <p className="text-[10px] font-bold text-[#f43f5e]">FRI</p>
                  <p className="text-[9px] text-zinc-500 font-medium">22 May</p>
                </div>
              </div>

              {/* SAT */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full bg-[#ec4899] rounded-t-xl transition-all duration-300 group-hover:brightness-110" style={{ height: "92px" }} />
                <div className="text-center pt-1.5 space-y-0.5">
                  <p className="text-[10px] font-bold text-[#ec4899]">SAT</p>
                  <p className="text-[9px] text-zinc-500 font-medium">23 May</p>
                </div>
              </div>

              {/* SUN */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full bg-[#06b6d4] rounded-t-xl transition-all duration-300 group-hover:brightness-110" style={{ height: "70px" }} />
                <div className="text-center pt-1.5 space-y-0.5">
                  <p className="text-[10px] font-bold text-[#06b6d4]">SUN</p>
                  <p className="text-[9px] text-zinc-500 font-medium">24 May</p>
                </div>
              </div>

            </div>

          </div>

          {/* ================= SECTION 3: CALLS PER DAY & UPSELL (Image 3) ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Calls Per Day - Area Line Chart (Width 2 cols) */}
            <div 
              className="border border-zinc-900 rounded-xl p-6 md:col-span-2 space-y-4"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div>
                <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Calls Per Day</h4>
                <p className="text-[9px] text-zinc-500">Calls trend for Last 7 Days (Current Period)</p>
              </div>

              {/* High-Fidelity SVG Area Line Chart */}
              <div className="w-full h-[180px] relative mt-4">
                <svg viewBox="0 0 500 150" className="w-full h-full">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#1f1f23" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#1f1f23" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#1f1f23" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="110" x2="500" y2="110" stroke="#1f1f23" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="#1f1f23" strokeWidth="0.5" />

                  {/* Grid Labels (Left) */}
                  <text x="0" y="24" fill="#64748b" fontSize="8" fontWeight="bold">24</text>
                  <text x="0" y="54" fill="#64748b" fontSize="8" fontWeight="bold">18</text>
                  <text x="0" y="84" fill="#64748b" fontSize="8" fontWeight="bold">12</text>
                  <text x="0" y="114" fill="#64748b" fontSize="8" fontWeight="bold">6</text>
                  <text x="0" y="144" fill="#64748b" fontSize="8" fontWeight="bold">0</text>

                  {/* Area Fill */}
                  <path
                    d="M 30 110 Q 90 20 160 50 T 300 90 T 420 120 T 480 140 L 480 140 L 30 140 Z"
                    fill="url(#greenGrad)"
                    opacity="0.15"
                  />

                  {/* Smooth Line */}
                  <path
                    d="M 30 110 Q 90 20 160 50 T 300 90 T 420 120 T 480 140"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Gradient Definitions */}
                  <defs>
                    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* X Axis Dates bottom */}
                <div className="flex justify-between pl-6 text-[8px] text-zinc-500 font-bold select-none mt-2">
                  <span>2026-05-18</span>
                  <span>2026-05-19</span>
                  <span>2026-05-20</span>
                  <span>2026-05-21</span>
                  <span>2026-05-22</span>
                  <span>2026-05-23</span>
                  <span>2026-05-24</span>
                  <span>2026-05-25</span>
                </div>
              </div>
            </div>

            {/* Upsell Performance (Width 1 col) */}
            <div 
              className="border border-zinc-900 rounded-xl p-6 flex flex-col justify-between min-h-[260px]"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div>
                <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Upsell Performance</h4>
                <p className="text-[9px] text-zinc-500">Extra revenue generated from calls</p>
              </div>

              <div className="py-8 text-center">
                <h2 className="text-4xl font-black text-cyan-400 tracking-tight">£0.00</h2>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-zinc-900/60 text-[9px] font-bold text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block" />
                <span>Total Successful Upsells</span>
                <span className="ml-auto text-white">0</span>
              </div>
            </div>

          </div>

          {/* ================= SECTION 4: CONVERSION FUNNEL & TRENDING (Image 4) ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Conversion Funnel */}
            <div 
              className="border border-zinc-900 rounded-xl p-6 flex flex-col justify-between min-h-[350px]"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Conversion Funnel</h4>
                  <p className="text-[9px] text-zinc-500">Guest journey from initial call to confirmed booking</p>
                </div>

                {/* Funnel Step Horizontal Bars */}
                <div className="space-y-4 pt-4">
                  {/* Step 1 */}
                  <div className="space-y-1">
                    <div className="w-full h-11 bg-[#10b981]/15 rounded-lg flex items-center justify-between px-4 border border-[#10b981]/10">
                      <span className="text-[10px] font-bold text-white">Total Calls</span>
                      <span className="text-xs font-black text-white">104</span>
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="space-y-1 pl-4">
                    <div className="w-full h-11 bg-[#3b82f6]/15 rounded-lg flex items-center justify-between px-4 border border-[#3b82f6]/10">
                      <span className="text-[10px] font-bold text-white">Details Collected</span>
                      <span className="text-xs font-black text-white">51</span>
                    </div>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="space-y-1 pl-8">
                    <div className="w-full h-11 bg-purple-500/15 rounded-lg flex items-center justify-between px-4 border border-purple-500/10">
                      <span className="text-[10px] font-bold text-white">Booking Captured</span>
                      <span className="text-xs font-black text-white">25</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Funnel Table Breakdown */}
              <div className="space-y-2.5 pt-6 border-t border-zinc-900/60 text-[9px] font-bold text-zinc-400">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    Total Calls
                  </span>
                  <span className="flex items-center gap-6">
                    <span className="text-white">104</span>
                    <span className="text-emerald-400 w-8 text-right">100%</span>
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                    Details Collected
                  </span>
                  <span className="flex items-center gap-6">
                    <span className="text-white">51</span>
                    <span className="text-yellow-500 w-8 text-right">49%</span>
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Booking Captured
                  </span>
                  <span className="flex items-center gap-6">
                    <span className="text-white">25</span>
                    <span className="text-yellow-500 w-8 text-right">49%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Trending Topics */}
            <div 
              className="border border-zinc-900 rounded-xl p-6 space-y-4 min-h-[350px]"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div>
                <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Trending Topics</h4>
                <p className="text-[9px] text-zinc-500">Top reservation themes and their WoW change</p>
              </div>

              {/* Topics Sorted List */}
              <div className="space-y-2.5">
                
                {/* Topic 1 */}
                <div 
                  className="border border-zinc-900 rounded-xl p-3.5 flex items-center justify-between"
                  style={{ backgroundColor: "rgba(12, 12, 14, 0.8)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold flex items-center justify-center border border-emerald-500/20">
                      1
                    </div>
                    <span className="text-xs font-bold text-white">Table Booking</span>
                  </div>
                  <span className="text-[9px] font-bold text-zinc-500 tracking-wider">38 MENTIONS</span>
                </div>

                {/* Topic 2 */}
                <div 
                  className="border border-zinc-900 rounded-xl p-3.5 flex items-center justify-between"
                  style={{ backgroundColor: "rgba(12, 12, 14, 0.8)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-extrabold flex items-center justify-center border border-blue-500/20">
                      2
                    </div>
                    <span className="text-xs font-bold text-white">General Enquiry</span>
                  </div>
                  <span className="text-[9px] font-bold text-zinc-500 tracking-wider">20 MENTIONS</span>
                </div>

                {/* Topic 3 */}
                <div 
                  className="border border-zinc-900 rounded-xl p-3.5 flex items-center justify-between"
                  style={{ backgroundColor: "rgba(12, 12, 14, 0.8)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-extrabold flex items-center justify-center border border-purple-500/20">
                      3
                    </div>
                    <span className="text-xs font-bold text-white">Cancellation / Reschedule</span>
                  </div>
                  <span className="text-[9px] font-bold text-zinc-500 tracking-wider">12 MENTIONS</span>
                </div>

                {/* Topic 4 */}
                <div 
                  className="border border-zinc-900 rounded-xl p-3.5 flex items-center justify-between"
                  style={{ backgroundColor: "rgba(12, 12, 14, 0.8)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-extrabold flex items-center justify-center border border-yellow-500/20">
                      4
                    </div>
                    <span className="text-xs font-bold text-white">Special Occasions</span>
                  </div>
                  <span className="text-[9px] font-bold text-zinc-500 tracking-wider">10 MENTIONS</span>
                </div>

                {/* Topic 5 */}
                <div 
                  className="border border-zinc-900 rounded-xl p-3.5 flex items-center justify-between"
                  style={{ backgroundColor: "rgba(12, 12, 14, 0.8)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-extrabold flex items-center justify-center border border-rose-500/20">
                      5
                    </div>
                    <span className="text-xs font-bold text-white">Opening Hours</span>
                  </div>
                  <span className="text-[9px] font-bold text-zinc-500 tracking-wider">9 MENTIONS</span>
                </div>

              </div>
            </div>

          </div>

          {/* ================= SECTION 5: TOP QUERIES & TOP SPECIAL REQUESTS (Image 5) ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Top Queries list card */}
            <div 
              className="border border-zinc-900 rounded-xl p-6 space-y-4"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Top Queries</h4>
                  <p className="text-[9px] text-zinc-500">Most frequently asked questions for last 7 days</p>
                </div>
                <Award size={14} className="text-zinc-500" />
              </div>

              {/* Sorted Queries items */}
              <div className="space-y-3">
                {[
                  { rank: 1, title: "Availability Check", count: 31, sub: '"Can I book a table for tomorrow evening?"' },
                  { rank: 2, title: "Other", count: 17, sub: '"Can I change my reservation?"' },
                  { rank: 3, title: "Opening Hours", count: 9, sub: '"Do you do breakfasts in the area you open for breakfast in the morning?"' },
                  { rank: 4, title: "Menu Query", count: 9, sub: '"Can we pick from another menu?"' },
                  { rank: 5, title: "Cancellation Policy", count: 1, sub: '"What is your cancellation window?"' },
                ].map((item) => (
                  <div 
                    key={item.rank} 
                    className="border border-zinc-900 rounded-xl p-3 flex flex-col gap-1"
                    style={{ backgroundColor: "rgba(12, 12, 14, 0.8)" }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#10b981]/10 text-[#10b981] text-[9.5px] font-bold flex items-center justify-center border border-[#10b981]/20">
                          {item.rank}
                        </div>
                        <span className="text-[11px] font-bold text-white">{item.title}</span>
                      </div>
                      <span className="text-[8.5px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                        Asked {item.count} times
                      </span>
                    </div>
                    {item.sub && (
                      <p className="text-[10px] italic text-zinc-500 pl-7 leading-snug">
                        {item.sub}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Top Special Requests */}
            <div 
              className="border border-zinc-900 rounded-xl p-6 space-y-4"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Top Special Requests</h4>
                  <p className="text-[9px] text-zinc-500">Common requests for last 7 days</p>
                </div>
                <Activity size={14} className="text-zinc-500" />
              </div>

              {/* Categorized Requests */}
              <div className="space-y-5">
                
                {/* Category 1: Dietary */}
                <div className="space-y-2">
                  <p className="text-[8px] font-extrabold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Dietary & Allergens
                  </p>
                  
                  <div 
                    className="border border-zinc-900 rounded-xl p-3 flex flex-col gap-1"
                    style={{ backgroundColor: "rgba(12, 12, 14, 0.8)" }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 text-[9.5px] font-bold flex items-center justify-center border border-blue-500/20">
                          1
                        </div>
                        <span className="text-[11px] font-bold text-white">Vegetarian</span>
                      </div>
                      <span className="text-[8.5px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                        Requested 1 times
                      </span>
                    </div>
                    <p className="text-[10px] italic text-zinc-500 pl-7">"Vegetarian"</p>
                  </div>
                </div>

                {/* Category 2: Special Occasions */}
                <div className="space-y-2">
                  <p className="text-[8px] font-extrabold text-purple-500 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Special Occasions
                  </p>
                  
                  <div 
                    className="border border-zinc-900 rounded-xl p-3 flex flex-col gap-1"
                    style={{ backgroundColor: "rgba(12, 12, 14, 0.8)" }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 text-[9.5px] font-bold flex items-center justify-center border border-blue-500/20">
                          1
                        </div>
                        <span className="text-[11px] font-bold text-white">Birthday</span>
                      </div>
                      <span className="text-[8.5px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                        Requested 4 times
                      </span>
                    </div>
                    <p className="text-[10px] italic text-zinc-500 pl-7">"As a birthday"</p>
                  </div>
                </div>

                {/* Category 3: Seating */}
                <div className="space-y-2">
                  <p className="text-[8px] font-extrabold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    Seating
                  </p>
                  
                  <div 
                    className="border border-zinc-900 rounded-xl p-3 flex flex-col gap-1"
                    style={{ backgroundColor: "rgba(12, 12, 14, 0.8)" }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 text-[9.5px] font-bold flex items-center justify-center border border-blue-500/20">
                          1
                        </div>
                        <span className="text-[11px] font-bold text-white">Window Table</span>
                      </div>
                      <span className="text-[8.5px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                        Requested 3 times
                      </span>
                    </div>
                    <p className="text-[10px] italic text-zinc-500 pl-7 leading-snug">
                      "Could we have all new windows by we do windows"
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ================= RESERVATION TIMING DISTRIBUTION (Image 5 bottom) ================= */}
          <div 
            className="border border-zinc-900 rounded-xl p-6 space-y-4"
            style={{ backgroundColor: "#0b0b0d" }}
          >
            
            <div>
              <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Reservation Timing Distribution</h4>
              <p className="text-[9px] text-zinc-500">Booking patterns by hour of day</p>
            </div>

            {/* Weekly slots section heading */}
            <div className="pt-2">
              <p className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider mb-3">Calls for Last 7 Days</p>
              
              {/* Mon-Sun cards wrap */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => (
                  <div 
                    key={day} 
                    className="border border-zinc-900 rounded-lg p-3 text-center space-y-2"
                    style={{ backgroundColor: "rgba(12, 12, 14, 0.8)" }}
                  >
                    <span className="text-[9px] font-bold text-zinc-400">{day}</span>
                    <div className="w-full h-8 bg-zinc-900/60 rounded border border-zinc-900 flex items-center justify-center text-[10px] font-semibold text-zinc-600">
                      No Data
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}