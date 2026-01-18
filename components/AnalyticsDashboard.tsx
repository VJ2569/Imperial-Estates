 <Area type="monotone" dataKey="calls" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorCalls)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
         </div>

         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm h-80">
            <h3 className="font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500"/>
                Inventory Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Portfolio composition over last 6 months</p>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={getInventoryTrends()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}} />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                    <Bar dataKey="apartment" stackId="a" fill={COLORS.primary} name="Apartments" />
                    <Bar dataKey="villa" stackId="a" fill={COLORS.purple} name="Villas" />
                    <Bar dataKey="commercial" stackId="a" fill={COLORS.tertiary} name="Commercial" />
                </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard icon={AlertTriangle} label="Vacancy Risk" value={vacancyRiskScore} subtext="/ 100" colorClass={getRiskColor(vacancyRiskScore).replace('text-', 'bg-')} />
          <StatCard icon={Clock} label="Avg Vacancy" value={`${avgVacancyDuration}d`} colorClass="bg-blue-500" />
          <StatCard icon={TrendingUp} label="Active" value={availableProps.length} colorClass="bg-emerald-500" />
          <StatCard icon={Phone} label="Calls" value={calls.length} colorClass="bg-purple-500" />
          <StatCard icon={DollarSign} label="Portfolio" value={`₹${(totalValue / 10000000).toFixed(1)}Cr`} colorClass="bg-amber-500" />
          <StatCard icon={Home} label="Properties" value={properties.length} colorClass="bg-slate-500" />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
