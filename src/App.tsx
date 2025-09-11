import { useState, useEffect } from 'react';
import { Factory, Shield, BarChart3, Users, Clock } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { FaceRecognition } from './components/FaceRecognition';
import { ProductionDashboard } from './components/ProductionDashboard';
import { AccessLogTable } from './components/AccessLogTable';
import { EmployeesTable } from './components/EmployeesTable';
import { EmployeeForm } from './components/EmployeeForm';
import { Acceso, PaginatedResponse } from './types';
import { getAccesos } from './services/api';

type MainTabType = 'access' | 'dashboard';
type AccessTabType = 'logs' | 'employees';

function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>('access');
  const [activeAccessTab, setActiveAccessTab] = useState<AccessTabType>('logs');
  const [accessData, setAccessData] = useState<PaginatedResponse<Acceso>>({
    items: [],
    pagination: {
      total: 0,
      page: 1,
      page_size: 10,
      total_pages: 1,
      has_previous: false,
      has_next: false
    }
  });
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [refreshEmployees, setRefreshEmployees] = useState(0);
  
  const { items: accesos, pagination } = accessData;

  const fetchAccesos = async (page: number = 1, pageSize: number = 10) => {
    try {
      const response = await getAccesos({
        page,
        pageSize,
        // Add any additional filters here if needed
      });
      setAccessData(response);
    } catch (error) {
      console.error('Error fetching access logs:', error);
      setAccessData({
        items: [],
        pagination: {
          total: 0,
          page: 1,
          page_size: pageSize,
          total_pages: 1,
          has_previous: false,
          has_next: false
        }
      });
    }
  };
  
  const handlePageChange = (newPage: number) => {
    fetchAccesos(newPage, pagination.page_size);
  };
  
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    fetchAccesos(1, newSize);
  };

  useEffect(() => {
    if (activeTab === 'access') {
      if (activeAccessTab === 'logs') {
        fetchAccesos();
      }
    }
  }, [activeTab, activeAccessTab, refreshEmployees]);

  const handleAccessLog = () => {
    // Refresh the first page when a new access log is added
    fetchAccesos(1, pagination.page_size);
  };

  const handleEmployeeCreated = () => {
    setShowEmployeeForm(false);
    setRefreshEmployees(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Factory className="w-8 h-8 text-gray-900 dark:text-white" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  PyME Pastas
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Control de Acceso + Analytics de Producción
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('access')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === 'access'
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <Shield className="w-4 h-4" />
                  Control de Acceso
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === 'dashboard'
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </button>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'access' ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Content */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveAccessTab('logs')}
                      className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${
                        activeAccessTab === 'logs'
                          ? 'border-black txt-black dark:text-white dark:border-white'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      Registro de Accesos
                    </button>
                    <button
                      onClick={() => setActiveAccessTab('employees')}
                      className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${
                        activeAccessTab === 'employees'
                          ? 'border-black txt-black dark:text-white dark:border-white'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Gestión de Empleados
                    </button>
                  </nav>
                </div>

                {activeAccessTab === 'logs' ? (
                  <div className="p-6">
                    <div className="space-y-4">
                      <AccessLogTable 
                        accesos={accesos} 
                        pagination={pagination} 
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    {showEmployeeForm ? (
                      <div className="mb-6">
                        <EmployeeForm 
                          onSuccess={handleEmployeeCreated}
                          onCancel={() => setShowEmployeeForm(false)}
                        />
                      </div>
                    ) : (
                      <EmployeesTable 
                        key={refreshEmployees} 
                        onAddEmployee={() => setShowEmployeeForm(true)} 
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Face Recognition */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <FaceRecognition onAccessLog={handleAccessLog} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <ProductionDashboard />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              <strong>PyME Pastas</strong> - Sistema de Control de Acceso y Analytics
            </p>
            <p className="text-sm">
              React + TypeScript • Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;