import { useState, useEffect } from 'react';
import { Factory, Shield, BarChart3 } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { FaceRecognition } from './components/FaceRecognition';
import { ProductionDashboard } from './components/ProductionDashboard';
import { AccessLogTable } from './components/AccessLogTable';
import { Acceso } from './types';
import { getAccesos } from './services/api';

type TabType = 'access' | 'dashboard';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('access');
  const [accesos, setAccesos] = useState<Acceso[]>([]);

  useEffect(() => {
    const fetchAccesos = async () => {
      try {
        const response = await getAccesos();
        // Ensure we're working with an array
        const accessData = Array.isArray(response) ? response : [];
        setAccesos(accessData);
      } catch (error) {
        console.error('Error fetching access logs:', error);
        // Set an empty array to prevent the map error
        setAccesos([]);
      }
    };

    fetchAccesos();
  }, []);

  const handleAccessLog = (acceso: Acceso) => {
    setAccesos(prev => [acceso, ...prev]);
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
                  PyME Pastas Artesanales
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
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Sistema de Reconocimiento Facial
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Sistema de control de acceso basado en OpenCV para reconocimiento facial. 
                Capture una imagen desde la webcam para verificar el acceso del empleado.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <AccessLogTable accesos={accesos} />
              </div>
              
              <div className="space-y-6">
                <FaceRecognition onAccessLog={handleAccessLog} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Dashboard de Producción y Analytics
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Visualización de datos de producción, eficiencia, desperdicios y control de calidad 
                basado en el modelo de datos de la PyME de pastas artesanales.
              </p>
            </div>

            <ProductionDashboard />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              <strong>PyME Pastas Artesanales</strong> - Sistema de Control de Acceso y Analytics
            </p>
            <p className="text-sm">
              OpenCV • React + TypeScript • Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;