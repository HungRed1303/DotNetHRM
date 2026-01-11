import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Save, X, Users, Calendar, TrendingUp, Award, Loader2, AlertCircle, ArrowLeftRight, CheckCircle, Clock, Check, Ban, Filter, RefreshCcw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllEmployeePoints } from '../../store/pointSlice';
import { fetchAllConversionRules } from '../../store/conversionRuleSlice';
import { pointService } from '../../services/pointService';
import type { MonthlyPointRuleDto, PointTransactionDto, PointToMoneyHistoryDto } from '../../services/pointService';
import CreateExchangePointRule from '../../components/rewards/CreateExchangePointRule';

interface RoleUI extends MonthlyPointRuleDto {
    color: string;
    description: string;
    employeeCount: number;
}

export default function PointsAdmin() {
    const [activeTab, setActiveTab] = useState<'roles' | 'employees' | 'history' | 'conversion' | 'requests'>('roles');
    
    // --- STATES ROLES ---
    const [roles, setRoles] = useState<RoleUI[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [editingRole, setEditingRole] = useState<number | null>(null);
    const [editPointsValue, setEditPointsValue] = useState<number>(0);

    // --- STATES HISTORY (Filter & Pagination) ---
    const [history, setHistory] = useState<PointTransactionDto[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotalCount, setHistoryTotalCount] = useState(0);
    const [historyFilter, setHistoryFilter] = useState<string>(''); 
    const historyItemsPerPage = 5;

    // --- STATES PENDING REQUESTS ---
    const [pendingRequests, setPendingRequests] = useState<PointToMoneyHistoryDto[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);
    
    // --- STATES CONVERSION ---
    const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
    const [editRuleData, setEditRuleData] = useState<{point: number, money: number, active: boolean}>({ point: 0, money: 0, active: true });
    const [isAddingRule, setIsAddingRule] = useState(false);

    // --- COMMON ---
    const [searchTerm, setSearchTerm] = useState('');
    const [showToast, setShowToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({ show: false, message: '', type: 'success' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 

    const dispatch = useAppDispatch();
    const { employees, totalCount, loading: loadingEmployees } = useAppSelector((state) => state.point);
    const { rules } = useAppSelector((state) => state.conversionRule);

    // Initial Load
    useEffect(() => {
        dispatch(fetchAllEmployeePoints({ pageNumber: 1, pageSize: 1000 }));
        dispatch(fetchAllConversionRules());
        fetchRoles();
    }, [dispatch]);

    // Fetch data khi chuyển tab
    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
        if (activeTab === 'requests') {
            fetchPendingRequests();
        }
    }, [activeTab, historyPage, historyFilter]);

    const fetchRoles = async () => {
        try {
            setLoadingRoles(true);
            const rulesData = await pointService.getMonthlyPointRules();
            const mappedRoles = rulesData.map(r => ({
                ...r,
                color: getRoleColor(r.roleName),
                description: getRoleDescription(r.roleName),
                employeeCount: 0 
            }));
            setRoles(mappedRoles);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingRoles(false);
        }
    };

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const response = await pointService.getPointTransactions(
                historyPage, 
                historyItemsPerPage, 
                undefined, 
                historyFilter || undefined
            ); 
            setHistory(response.items);
            setHistoryTotalCount(response.totalCount);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            setLoadingRequests(true);
            const response = await pointService.getPointToMoneyHistory(1, 100, undefined, 'pending');
            setPendingRequests(response.items);
        } catch (error) {
            console.error("Lỗi lấy danh sách yêu cầu:", error);
        } finally {
            setLoadingRequests(false);
        }
    };

    useEffect(() => {
        if (employees.length > 0 && roles.length > 0) {
            setRoles(prev => prev.map(r => {
                let count = 0;
                if (r.roleName.toLowerCase().includes('employee') || r.roleName.toLowerCase() === 'user') {
                    count = totalCount > 0 ? totalCount : 0;
                }
                return { ...r, employeeCount: count };
            }));
        }
    }, [employees.length, roles.length, totalCount]);

    const totalMonthlyBudget = roles.reduce((sum, role) => sum + (role.pointValue * (role.employeeCount || 0)), 0);

    // --- HANDLERS ---

    const handleProcessRequest = async (requestId: number, status: 'approved' | 'rejected') => {
        if (!window.confirm(`Bạn có chắc chắn muốn ${status === 'approved' ? 'DUYỆT' : 'TỪ CHỐI'} yêu cầu này?`)) return;

        try {
            setProcessingId(requestId);
            await pointService.processConversionRequest(requestId, status);
            showNotification(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} yêu cầu thành công`, 'success');
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
            dispatch(fetchAllEmployeePoints({ pageNumber: 1, pageSize: 1000 }));
        } catch (error: any) {
            showNotification(error.message || "Lỗi xử lý", 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleUpdateRolePoints = async (roleId: number, roleDbId: number) => {
        try {
            await pointService.upsertMonthlyPointRule({ roleId: roleDbId, pointValue: editPointsValue });
            setRoles(roles.map(r => r.id === roleId ? { ...r, pointValue: editPointsValue } : r));
            setEditingRole(null);
            showNotification("Cập nhật thành công", 'success');
        } catch (error) {
            showNotification("Lỗi cập nhật", 'error');
        }
    };

    const handleUpdateConversionRule = async () => {
        if (!editingRuleId) return;
        try {
            await pointService.updateConversionRule(editingRuleId, {
                pointValue: editRuleData.point,
                moneyValue: editRuleData.money,
                isActive: editRuleData.active
            });
            dispatch(fetchAllConversionRules());
            setEditingRuleId(null);
            showNotification("Cập nhật thành công", 'success');
        } catch (error: any) {
            showNotification(error.message, 'error');
        }
    };

    const handleDistributePoints = async () => {
        try {
            const result = await pointService.allocateMonthlyPoints();
            showNotification(`Đã phân phối ${result.totalPoints} điểm`, 'success');
            setHistoryPage(1);
            if (activeTab === 'history') fetchHistory();
        } catch (error: any) {
            showNotification(error.message, 'error');
        }
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setShowToast({ show: true, message, type });
        setTimeout(() => setShowToast(prev => ({ ...prev, show: false })), 3000);
    };

    // --- HELPERS DISPLAY ---
    const getRoleColor = (name: string) => { 
        const n = name?.toLowerCase() || '';
        if (n.includes('admin')) return 'blue';
        if (n.includes('manager')) return 'green';
        if (n.includes('hr')) return 'yellow';
        return 'purple';
    };
    const getRoleDescription = (name: string) => { 
        const n = name?.toLowerCase() || '';
        if (n.includes('admin')) return 'Quản trị hệ thống';
        if (n.includes('manager')) return 'Quản lý bộ phận';
        if (n.includes('hr')) return 'Nhân sự & Hành chính';
        return 'Nhân viên chính thức';
    };
    const getColorClasses = (color: string) => {
        const map: any = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
            green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
            yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
        };
        return map[color] || map.purple;
    };

    // [CẬP NHẬT] Helper xử lý màu và nhãn
    const getTransactionStyle = (type: string) => {
        switch(type) {
            case 'earn':
                return { color: 'text-green-600', bg: 'bg-green-100', sign: '+', label: 'Cộng điểm' };
            case 'redeem':
                // [CẬP NHẬT] Đổi nhãn thành Đổi thưởng/Bị phạt
                return { color: 'text-orange-600', bg: 'bg-orange-100', sign: '-', label: 'Đổi thưởng/Bị phạt' };
            case 'adjustment':
                return { color: 'text-blue-600', bg: 'bg-blue-100', sign: '~', label: 'Điều chỉnh' };
            case 'transfer':
                return { color: 'text-purple-600', bg: 'bg-purple-100', sign: '->', label: 'Chuyển điểm' };
            default:
                return { color: 'text-gray-600', bg: 'bg-gray-100', sign: '', label: type };
        }
    };

    // Filter Logic
    const filteredEmployees = employees.filter(emp =>
        emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const currentEmployees = filteredEmployees.slice(startIdx, startIdx + itemsPerPage);
    
    // Pagination History
    const totalHistoryPages = Math.ceil(historyTotalCount / historyItemsPerPage);
    const startHistoryIdx = (historyPage - 1) * historyItemsPerPage;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header & Stats (Giữ nguyên) */}
                <div className="bg-blue-600 rounded-lg p-6 mb-6 text-white shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Award className="w-6 h-6" /> Quản lý điểm thưởng
                            </h1>
                            <p className="text-blue-100 mt-1">Hệ thống quản lý và phân phối điểm thưởng</p>
                        </div>
                        <button onClick={handleDistributePoints} className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow hover:bg-blue-50 active:scale-95 transition-transform">
                            <Calendar className="w-5 h-5" /> Phân phối ngay
                        </button>
                    </div>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                            <div className="text-xs text-blue-100 uppercase">Ngân sách/tháng</div>
                            <div className="text-2xl font-bold">{totalMonthlyBudget.toLocaleString()}</div>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                            <div className="text-xs text-blue-100 uppercase">Tổng nhân viên</div>
                            <div className="text-2xl font-bold">{totalCount}</div>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                            <div className="text-xs text-blue-100 uppercase">Trung bình/người</div>
                            <div className="text-2xl font-bold">{totalCount > 0 ? Math.round(totalMonthlyBudget / totalCount).toLocaleString() : 0}</div>
                        </div>
                        <div className="bg-orange-500/20 p-4 rounded-xl border border-orange-200/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10"><Clock size={48} color="white"/></div>
                            <div className="text-xs text-orange-100 uppercase font-semibold">Yêu cầu chờ duyệt</div>
                            <div className="text-2xl font-bold text-white">{pendingRequests.length}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex mb-6 border-b bg-white rounded-t-xl px-2 shadow-sm overflow-x-auto">
                    {[
                        { id: 'roles', label: 'Vai trò & Định mức', icon: Users },
                        { id: 'employees', label: 'DS Nhân viên', icon: TrendingUp },
                        { id: 'conversion', label: 'Bảng quy đổi', icon: ArrowLeftRight },
                        { id: 'requests', label: `Duyệt yêu cầu`, icon: CheckCircle, badge: pendingRequests.length > 0 ? pendingRequests.length : 0 },
                        { id: 'history', label: 'Lịch sử phân phối', icon: Calendar }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 py-4 px-4 font-medium flex justify-center items-center gap-2 whitespace-nowrap relative ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <tab.icon className="w-5 h-5" /> 
                            {tab.label}
                            {tab.badge && tab.badge > 0 ? (
                                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                    {tab.badge}
                                </span>
                            ) : null}
                        </button>
                    ))}
                </div>

                {/* --- TAB CONTENT --- */}

                {/* TAB 1: ROLES */}
                {activeTab === 'roles' && (
                    <div className="bg-white rounded-b-xl shadow-sm p-6 border border-gray-100">
                        {loadingRoles ? <div className="text-center py-10"><Loader2 className="animate-spin inline text-blue-600"/></div> : 
                        <div className="grid md:grid-cols-2 gap-4">
                            {roles.map((role) => {
                                const colors = getColorClasses(role.color);
                                const isEditing = editingRole === role.id;
                                return (
                                    <div key={role.id} className={`border-2 ${colors.border} rounded-xl p-5 ${colors.bg}`}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border-2 ${colors.border} ${colors.text} bg-white`}>
                                                    {role.roleName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{role.roleName}</h3>
                                                    <p className="text-sm text-gray-600">Định mức hiện tại: <span className="font-bold">{role.pointValue}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <input type="number" value={editPointsValue} onChange={(e) => setEditPointsValue(Number(e.target.value))} className="w-20 px-2 py-1 border rounded font-bold" autoFocus />
                                                        <button onClick={() => handleUpdateRolePoints(role.id, role.roleId)} className="p-2 bg-green-500 text-white rounded"><Save className="w-4 h-4" /></button>
                                                        <button onClick={() => setEditingRole(null)} className="p-2 bg-gray-400 text-white rounded"><X className="w-4 h-4" /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className={`text-2xl font-bold ${colors.text}`}>{role.pointValue}</div>
                                                        <button onClick={() => { setEditingRole(role.id); setEditPointsValue(role.pointValue); }} className="p-2 bg-white border rounded hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>}
                    </div>
                )}

                {/* TAB 2: EMPLOYEES */}
                {activeTab === 'employees' && (
                    <div className="bg-white rounded-b-xl shadow-sm p-6 border border-gray-100">
                        <div className="mb-4 relative max-w-sm">
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                            <input type="text" placeholder="Tìm nhân viên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nhân viên</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Điểm</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Cập nhật</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {currentEmployees.map(emp => (
                                        <tr key={emp.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{emp.employeeName.charAt(0)}</div>
                                                {emp.employeeName}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{emp.email}</td>
                                            <td className="px-6 py-4 text-center"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">{emp.pointTotal}</span></td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-500">{new Date(emp.lastUpdate).toLocaleDateString('vi-VN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm text-gray-500">Hiển thị {startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredEmployees.length)} trên {filteredEmployees.length}</span>
                            <div className="flex gap-2">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50">Trước</button>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50">Sau</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: CONVERSION */}
                {activeTab === 'conversion' && (
                    <div className="bg-white rounded-b-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between mb-4">
                            <h2 className="font-bold text-lg">Quy tắc đổi điểm</h2>
                            <button onClick={() => setIsAddingRule(true)} className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-blue-700"><Plus className="w-4 h-4"/> Thêm</button>
                        </div>
                        <div className="space-y-3">
                            {rules.map(rule => {
                                const isEditing = editingRuleId === rule.id;
                                return (
                                    <div key={rule.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><ArrowLeftRight className="w-6 h-6"/></div>
                                            {isEditing ? (
                                                <div className="flex gap-2 items-center">
                                                    <input type="number" value={editRuleData.point} onChange={e => setEditRuleData({...editRuleData, point: +e.target.value})} className="border rounded px-2 py-1 w-20" />
                                                    <span>=</span>
                                                    <input type="number" value={editRuleData.money} onChange={e => setEditRuleData({...editRuleData, money: +e.target.value})} className="border rounded px-2 py-1 w-28" />
                                                    <select value={String(editRuleData.active)} onChange={e => setEditRuleData({...editRuleData, active: e.target.value === 'true'})} className="border rounded p-1">
                                                        <option value="true">Active</option>
                                                        <option value="false">Inactive</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="font-bold">{rule.pointValue} điểm = {rule.moneyValue.toLocaleString()} VNĐ</div>
                                                    <div className={`text-xs ${rule.isActive ? 'text-green-600' : 'text-red-500'}`}>{rule.isActive ? 'Đang hoạt động' : 'Đã khóa'}</div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {isEditing ? (
                                                <>
                                                    <button onClick={handleUpdateConversionRule} className="p-2 bg-blue-600 text-white rounded"><Save className="w-4 h-4"/></button>
                                                    <button onClick={() => setEditingRuleId(null)} className="p-2 bg-gray-200 rounded"><X className="w-4 h-4"/></button>
                                                </>
                                            ) : (
                                                <button onClick={() => { setEditingRuleId(rule.id); setEditRuleData({ point: rule.pointValue, money: rule.moneyValue, active: rule.isActive }) }} className="p-2 border rounded hover:bg-gray-100"><Edit2 className="w-4 h-4 text-gray-500"/></button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB 4: REQUESTS */}
                {activeTab === 'requests' && (
                    <div className="bg-white rounded-b-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Yêu cầu đổi điểm chờ duyệt</h2>
                                <p className="text-sm text-gray-500">Danh sách nhân viên yêu cầu đổi điểm sang tiền mặt</p>
                            </div>
                            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                Tổng: {pendingRequests.length} yêu cầu
                            </div>
                        </div>

                        {loadingRequests ? (
                            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600 w-8 h-8"/></div>
                        ) : pendingRequests.length === 0 ? (
                            <div className="text-center py-16 flex flex-col items-center">
                                <div className="bg-gray-100 p-4 rounded-full mb-3"><CheckCircle className="w-8 h-8 text-green-500"/></div>
                                <p className="text-gray-500 font-medium">Hiện tại không có yêu cầu nào cần duyệt.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {pendingRequests.map(req => (
                                    <div key={req.id} className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                                                {req.employeeName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{req.employeeName}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Clock className="w-4 h-4"/>
                                                    {new Date(req.createdAt).toLocaleString('vi-VN')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center md:items-end w-full md:w-auto bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0">
                                            <div className="text-sm text-gray-500 uppercase font-semibold">Yêu cầu đổi</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-bold text-blue-600">{req.pointRequested} điểm</span>
                                                <ArrowLeftRight className="w-4 h-4 text-gray-400"/>
                                                <span className="text-xl font-bold text-green-600">{req.moneyReceived.toLocaleString('vi-VN')} đ</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 w-full md:w-auto justify-end">
                                            {processingId === req.id ? (
                                                <button disabled className="px-6 py-2 bg-gray-100 text-gray-400 rounded-lg flex items-center gap-2">
                                                    <Loader2 className="w-5 h-5 animate-spin"/> Đang xử lý...
                                                </button>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleProcessRequest(req.id, 'rejected')} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2 font-medium">
                                                        <Ban className="w-4 h-4"/> Từ chối
                                                    </button>
                                                    <button onClick={() => handleProcessRequest(req.id, 'approved')} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-bold">
                                                        <Check className="w-5 h-5"/> Duyệt
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 5: HISTORY (Với Filter & Logic dấu +/-) */}
                {activeTab === 'history' && (
                    <div className="bg-white rounded-b-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Nhật ký giao dịch điểm</h2>
                                <p className="text-sm text-gray-500">Lịch sử biến động điểm thưởng trong hệ thống</p>
                            </div>
                            
                            {/* Bộ lọc loại giao dịch */}
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select 
                                        value={historyFilter} 
                                        onChange={(e) => { setHistoryFilter(e.target.value); setHistoryPage(1); }}
                                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-white transition-colors"
                                    >
                                        <option value="">Tất cả giao dịch</option>
                                        <option value="earn">Cộng điểm (Earn)</option>
                                        <option value="redeem">Đổi thưởng/Bị phạt (Redeem)</option>
                                        <option value="adjustment">Điều chỉnh (Adjustment)</option>
                                        <option value="transfer">Chuyển điểm (Transfer)</option>
                                    </select>
                                </div>
                                <button onClick={() => fetchHistory()} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-500" title="Làm mới">
                                    <RefreshCcw className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>

                        {loadingHistory ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600"/></div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                                <Clock className="w-10 h-10 mb-2 text-gray-300"/>
                                Không tìm thấy lịch sử giao dịch nào.
                            </div>
                        ) : (
                            <>
                                <div className="space-y-0 divide-y divide-gray-100 border rounded-lg overflow-hidden">
                                    {history.map(item => {
                                        const style = getTransactionStyle(item.type);
                                        return (
                                            <div key={item.id} className="p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 ${style.bg} ${style.color} rounded-full flex items-center justify-center font-bold text-lg`}>
                                                        {style.sign === '->' ? <ArrowLeftRight className="w-5 h-5"/> : style.sign}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800">{item.employeeName}</div>
                                                        <div className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${style.bg} ${style.color} border-current opacity-80`}>
                                                                {style.label}
                                                            </span>
                                                            <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                                                            <span className="hidden sm:inline w-1 h-1 bg-gray-300 rounded-full"></span>
                                                            <span className="text-gray-400 italic truncate max-w-[200px] sm:max-w-md">{item.description}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* [CẬP NHẬT] Logic hiển thị dấu thông minh */}
                                                <div className={`font-bold ${style.color} text-lg whitespace-nowrap`}>
                                                    {['earn', 'redeem'].includes(item.type) 
                                                        ? `${style.sign}${Math.abs(item.value)}` 
                                                        : `${style.sign} ${item.value}`}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Pagination Controls */}
                                {totalHistoryPages > 1 && (
                                    <div className="mt-4 flex justify-between items-center">
                                        <span className="text-sm text-gray-500">
                                            Hiển thị {startHistoryIdx + 1}-{Math.min(startHistoryIdx + historyItemsPerPage, historyTotalCount)} trên {historyTotalCount}
                                        </span>
                                        <div className="flex gap-2">
                                            <button 
                                                disabled={historyPage === 1} 
                                                onClick={() => setHistoryPage(p => p - 1)} 
                                                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                                            >
                                                Trước
                                            </button>
                                            <span className="px-2 py-1 text-gray-600 font-medium">Trang {historyPage} / {totalHistoryPages}</span>
                                            <button 
                                                disabled={historyPage === totalHistoryPages} 
                                                onClick={() => setHistoryPage(p => p + 1)} 
                                                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                                            >
                                                Sau
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Notification */}
            {showToast.show && (
                <div className={`fixed bottom-5 right-5 px-4 py-3 rounded shadow-lg text-white flex items-center gap-2 ${showToast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {showToast.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                    {showToast.message}
                </div>
            )}

            {isAddingRule && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[500px]">
                        <CreateExchangePointRule onClose={() => setIsAddingRule(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}