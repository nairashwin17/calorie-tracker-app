import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteFoodEntry, setEditingItem } from '../redux/trackerSlice';
import { RootState } from '../redux/store';
import { Trash2, Flame, Wheat, Drumstick, Droplets, Pencil } from 'lucide-react';

const DailyLog: React.FC = () => {
    const { dailyLogs, currentDate } = useSelector((state: RootState) => state.tracker);
    const dispatch = useDispatch();

    const dayLogs = dailyLogs[currentDate] || {};
    const mealTypes = ['Breakfast', 'Brunch', 'Lunch', 'Snack', 'Dinner'];

    const calculateTotal = (nutrient: 'calories' | 'protein' | 'carbs' | 'fats', meals = dayLogs) => {
        let total = 0;
        Object.values(meals).forEach(mealArray => {
            mealArray.forEach(item => {
                total += item[nutrient] || 0;
            });
        });
        return Math.round(total);
    };

    const calculateMealTotal = (items: any[], nutrient: string) => {
        return Math.round(items.reduce((acc, curr) => acc + (curr[nutrient] || 0), 0));
    };

    const totals = {
        calories: calculateTotal('calories'),
        protein: calculateTotal('protein'),
        carbs: calculateTotal('carbs'),
        fats: calculateTotal('fats'),
    };

    return (
        <div className="space-y-6">
            {/* Stats Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Calories', value: totals.calories, unit: 'kcal', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Protein', value: totals.protein, unit: 'g', icon: Drumstick, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Carbs', value: totals.carbs, unit: 'g', icon: Wheat, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Fats', value: totals.fats, unit: 'g', icon: Droplets, color: 'text-purple-500', bg: 'bg-purple-50' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                        <div className={`p-2 rounded-full ${stat.bg} mb-2`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Meals List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Today's Meals</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {mealTypes.map(type => {
                        const meals = dayLogs[type] || [];
                        if (meals.length === 0) return null;

                        return (
                            <div key={type} className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{type}</h3>
                                    <div className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">
                                        {calculateMealTotal(meals, 'calories')} kcal
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {meals.map((item, idx) => (
                                        <div key={item.id} className="flex items-start justify-between group pl-4 border-l-2 border-slate-100 hover:border-indigo-200 transition-colors">
                                            <div>
                                                <div className="font-medium text-slate-900">{item.name}</div>
                                                <div className="text-sm text-slate-500">
                                                    {item.quantity} {item.unit} • {Math.round(item.calories)} kcal
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1 flex gap-2">
                                                    <span>P: {item.protein}g</span>
                                                    <span>C: {item.carbs}g</span>
                                                    <span>F: {item.fats}g</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => dispatch(setEditingItem({ date: currentDate, mealType: type, index: idx, data: item }))}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Edit entry"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => dispatch(deleteFoodEntry({ date: currentDate, mealType: type, index: idx }))}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete entry"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {!Object.keys(dayLogs).some(k => dayLogs[k]?.length > 0) && (
                        <div className="p-12 text-center text-slate-400">
                            No meals added yet today. Start tracking!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyLog;
