import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFoodEntry, addBatchFoodEntries, setEditingItem, setLoading, FoodEntry } from '../redux/trackerSlice';
import { calculateBatchCalories, FoodItemRequest } from '../services/ai';
import { Loader2, Plus, Sparkles, Pencil, X, ListPlus } from 'lucide-react';
import { RootState } from '../redux/store';

const MEAL_TYPES = ['Breakfast', 'Brunch', 'Lunch', 'Snack', 'Dinner'];
const UNITS = ['g', 'kg', 'oz', 'lb', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'bowl'];

const FoodForm: React.FC = () => {
    const dispatch = useDispatch();
    const { loading, currentDate, editingItem } = useSelector((state: RootState) => state.tracker);

    // Form State
    const [mealType, setMealType] = useState('Breakfast');
    const [currentItem, setCurrentItem] = useState({
        foodItem: '',
        quantity: '',
        unit: 'g'
    });

    // Batch State
    const [pendingItems, setPendingItems] = useState<FoodItemRequest[]>([]);

    useEffect(() => {
        if (editingItem) {
            setMealType(editingItem.mealType);
            setCurrentItem({
                foodItem: editingItem.data.name,
                quantity: editingItem.data.quantity.toString(),
                unit: editingItem.data.unit
            });
            setPendingItems([]); // Clear pending on edit
        } else {
            // Reset defaults if leaving edit mode
            setCurrentItem({ foodItem: '', quantity: '', unit: 'g' });
        }
    }, [editingItem]);

    const handleAddToBatch = () => {
        if (!currentItem.foodItem || !currentItem.quantity) return;
        setPendingItems([...pendingItems, {
            name: currentItem.foodItem,
            quantity: currentItem.quantity,
            unit: currentItem.unit
        }]);
        setCurrentItem(prev => ({ ...prev, foodItem: '', quantity: '' })); // Keep unit
    };

    const handleRemovePending = (idx: number) => {
        setPendingItems(pendingItems.filter((_, i) => i !== idx));
    };

    const handleProcessBatch = async () => {
        if (pendingItems.length === 0) return;

        dispatch(setLoading(true));
        try {
            const results = await calculateBatchCalories(pendingItems);

            if (results.length === 0) {
                alert("No items calculated.");
                return;
            }

            const entries: FoodEntry[] = results.map(nut => ({
                id: Date.now().toString() + Math.random(),
                mealType, // Current selected meal type applies to all in batch
                name: nut.name,
                quantity: nut.quantity,
                unit: nut.unit,
                calories: nut.calories,
                protein: nut.protein,
                carbs: nut.carbs,
                fats: nut.fats,
                timestamp: new Date().toISOString()
            }));

            dispatch(addBatchFoodEntries({
                date: currentDate,
                mealType,
                foodItems: entries
            }));

            setPendingItems([]);
        } catch (err) {
            alert("Failed to calculate batch calories.");
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleUpdateSingle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem || !currentItem.foodItem || !currentItem.quantity) return;

        dispatch(setLoading(true));
        try {
            const [result] = await calculateBatchCalories([{
                name: currentItem.foodItem,
                quantity: currentItem.quantity,
                unit: currentItem.unit
            }]);

            const entry: FoodEntry = {
                id: editingItem.data.id,
                mealType,
                name: result.name,
                quantity: result.quantity,
                unit: result.unit,
                calories: result.calories,
                protein: result.protein,
                carbs: result.carbs,
                fats: result.fats,
                timestamp: editingItem.data.timestamp
            };

            dispatch(updateFoodEntry({
                date: currentDate,
                mealType: editingItem.mealType,
                index: editingItem.index,
                foodItem: entry
            }));
            dispatch(setEditingItem(null));
            setCurrentItem({ foodItem: '', quantity: '', unit: 'g' });

        } catch (err) {
            alert("Failed to update item.");
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleCancelEdit = () => {
        dispatch(setEditingItem(null));
        setCurrentItem({ foodItem: '', quantity: '', unit: 'g' });
    };

    return (
        <div className={`rounded-2xl shadow-sm border overflow-hidden sticky top-24 transition-colors ${editingItem ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-semibold flex items-center gap-2 ${editingItem ? 'text-indigo-700' : 'text-slate-900'}`}>
                        {editingItem ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5 text-indigo-600" />}
                        {editingItem ? 'Edit Food' : 'Meal Builder'}
                    </h2>
                    {editingItem && (
                        <button onClick={handleCancelEdit} className="p-1 hover:bg-indigo-200 rounded-full text-indigo-600 transition-colors">
                            <X size={18} />
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Meal</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {MEAL_TYPES.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    disabled={!!editingItem && editingItem.mealType !== type}
                                    onClick={() => setMealType(type)}
                                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${mealType === type
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        } ${editingItem && editingItem.mealType !== type ? 'opacity-40 cursor-not-allowed' : ''}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Add Item</label>
                        <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <input
                                    type="text"
                                    value={currentItem.foodItem}
                                    onChange={e => setCurrentItem({ ...currentItem, foodItem: e.target.value })}
                                    placeholder="Food Item (e.g. Avocado Toast)"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all bg-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    value={currentItem.quantity}
                                    onChange={e => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                                    placeholder="Qty"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all bg-white"
                                />
                                <select
                                    value={currentItem.unit}
                                    onChange={e => setCurrentItem({ ...currentItem, unit: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all bg-white"
                                >
                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>

                            {/* Action Button for ADDING to list */}
                            {!editingItem && (
                                <button
                                    onClick={handleAddToBatch}
                                    disabled={!currentItem.foodItem || !currentItem.quantity}
                                    className="w-full py-2 px-4 bg-white border border-indigo-200 text-indigo-700 rounded-lg font-medium hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                                >
                                    <ListPlus size={18} />
                                    Add to List
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Pending Items List */}
                    {!editingItem && pendingItems.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Items to Calculate</h3>
                            <div className="space-y-2">
                                {pendingItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
                                        <span className="text-sm text-slate-700 font-medium">
                                            {item.quantity} {item.unit} {item.name}
                                        </span>
                                        <button onClick={() => handleRemovePending(idx)} className="text-slate-400 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main Action Button */}
                    {editingItem ? (
                        <button
                            onClick={handleUpdateSingle}
                            disabled={loading || !currentItem.foodItem || !currentItem.quantity}
                            className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                            {loading ? 'Updating...' : 'Update Entry'}
                        </button>
                    ) : (
                        <button
                            onClick={handleProcessBatch}
                            disabled={loading || pendingItems.length === 0}
                            className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                            {loading ? 'Analyzing...' : `Calculate Meal (${pendingItems.length})`}
                        </button>
                    )}

                </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                Add all items for your meal, then calculate together.
            </div>
        </div>
    );
};

export default FoodForm;
