import React, { useState, useMemo, useEffect } from 'react';
import { ChefHat, Plus, LogOut, User, BookOpen, Globe2, Settings, Shield, Heart } from 'lucide-react';

import { useRecipes } from './hooks/useRecipes';
import RecipeCard from './components/RecipeCard';
import RecipeForm from './components/RecipeForm';
import FilterBar from './components/FilterBar';
import DeleteModal from './components/DeleteModal';
import Toast from './components/Toast';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import CommunityDashboard from './components/CommunityDashboard';
import AdminDashboard from './components/AdminDashboard';
import MagneticButton from './components/MagneticButton';
import LandingPage from './components/LandingPage';
import UserSettings from './components/UserSettings';
import SavedRecipes from './components/SavedRecipes';
import GlobalToast, { EVENTS } from './components/GlobalToast';
import { eventBus } from './utils/eventBus';
import { usePolling } from './hooks/usePolling';
import { getPreferences, silentLogin, serverLogout } from './api/userApi';

export default function App() {
  // Authentication & View State
  const [view, setView] = useState('landing'); // 'landing', 'login', 'register', 'dashboard'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [userRole, setUserRole] = useState('usuario');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAuthenticated(true);
        setAuthenticatedUser(user.username);
        setUserRole(user.role || 'usuario');
        setView('dashboard');
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      // Intento de Single Sign-On (SSO): Inicia sesión silenciosamente desde otro puerto validando la Cookie común
      silentLogin().then(user => {
        setIsAuthenticated(true);
        setAuthenticatedUser(user.username);
        setUserRole(user.role || 'usuario');
        setView('dashboard');
        eventBus.publish(EVENTS.SHOW_TOAST, { message: `(SSO) Conectado automáticamente como ${user.username}`, type: 'success' });
      }).catch(() => {
        // No hay sesión en el sistema unificado, permanecer en landing
      });
    }
  }, []);

  // Tabs State
  const [currentTab, setCurrentTab] = useState('recetas'); // 'recetas', 'comunidad', 'admin', 'settings'
  const [recipesSubTab, setRecipesSubTab] = useState('mis-recetas'); // 'mis-recetas' | 'guardadas'

  const { recipes, isLoading: recipesLoading, error: recipesError, addRecipe, updateRecipe, deleteRecipe, refreshRecipes } = useRecipes(authenticatedUser);

  // Filters and Sorting State (for My Recipes)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('dateDesc');

  // UI Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  // Toast state is now managed globally by EventBus and GlobalToast
  const showToast = (message, type = 'success') => {
    eventBus.publish(EVENTS.SHOW_TOAST, { message, type });
  };

  // Auth Handlers
  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setAuthenticatedUser(userData.username);
    setUserRole(userData.role || 'usuario');
    setView('dashboard');
    showToast(`Bienvenido, ${userData.username}`);
  };

  const handleRegister = (userData) => {
    // Mock registration login automatically
    setIsAuthenticated(true);
    setAuthenticatedUser(userData.username);
    setUserRole(userData.role || 'usuario');
    setView('dashboard');
    showToast('Cuenta creada exitosamente. ¡Bienvenido!');
  };

  const handleLogout = async () => {
    try {
      await serverLogout();
    } catch (e) {
      console.error('Error clearing remote session:', e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setAuthenticatedUser(null);
    setUserRole('usuario');
    setCurrentTab('recetas');
    setView('login');
    eventBus.publish(EVENTS.SHOW_TOAST, { message: 'Sesión terminada exitosamente', type: 'info' });
  };

  const throwOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setAuthenticatedUser(null);
    setUserRole('usuario');
    setCurrentTab('recetas');
    setView('login');
    showToast('Tu sesión ha expirado o se cerró de forma remota', 'error');
  };

  usePolling(async () => {
    if (isAuthenticated) {
      try {
        await getPreferences();
      } catch (err) {
        if (err.message === 'UNAUTHORIZED') throwOut();
      }
    }
  }, 10000);

  // Derived state: Filtering & Sorting
  const filteredAndSortedRecipes = useMemo(() => {
    let result = [...recipes];

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        (r.titulo || '').toLowerCase().includes(q) ||
        (r.descripcion || '').toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (filterCategory !== 'All') {
      result = result.filter(r => r.categoria === filterCategory);
    }

    // Filter by status
    if (filterStatus !== 'All') {
      result = result.filter(r => (r.estado || '').toLowerCase() === filterStatus.toLowerCase());
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'dateDesc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'dateAsc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'titleAsc':
          return (a.titulo || '').localeCompare(b.titulo || '');
        case 'titleDesc':
          return (b.titulo || '').localeCompare(a.titulo || '');
        default:
          return 0;
      }
    });

    return result;
  }, [recipes, searchQuery, filterCategory, filterStatus, sortBy]);

  // Handlers
  const handleOpenCreateForm = () => {
    setEditingRecipe(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (recipe) => {
    setEditingRecipe(recipe);
    setIsFormOpen(true);
  };

  // onSave recibe la receta ya persistida desde el servidor (via RecipeForm → recipeApi)
  const handleSaveRecipe = (receta) => {
    if (editingRecipe) {
      updateRecipe(receta.id, receta);
      showToast('Receta actualizada correctamente');
    } else {
      addRecipe(receta);
      showToast('Receta creada exitosamente');
    }
    // No cerramos aquí: RecipeForm llama a onClose() por sí mismo
  };

  const handleOpenDeleteConfirm = (recipe) => {
    setRecipeToDelete(recipe);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (recipeToDelete) {
      try {
        await deleteRecipe(recipeToDelete.id);
        showToast('Receta eliminada correctamente');
      } catch {
        showToast('Error al eliminar la receta', 'error');
      } finally {
        setIsDeleteModalOpen(false);
        setRecipeToDelete(null);
      }
    }
  };

  // Render Authentication Views
  if (!isAuthenticated && view === 'landing') {
    return (
      <LandingPage
        onNavigateToLogin={() => setView('login')}
        onNavigateToRegister={() => setView('register')}
      />
    );
  }

  if (!isAuthenticated && (view === 'login' || view === 'register' || view === 'forgot')) {
    return (
      <div className="relative">
        <GlobalToast />
        {view === 'login' ? (
          <Login 
            onLogin={handleLogin} 
            onNavigateToRegister={() => setView('register')}
            onNavigateToForgot={() => setView('forgot')}
          />
        ) : view === 'forgot' ? (
          <ForgotPassword onNavigateToLogin={() => setView('login')} />
        ) : view === 'register' ? (
          <Register 
            onRegister={handleRegister} 
            onNavigateToLogin={() => setView('login')} 
          />
        ) : null}
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans selection:bg-orange-200">
      <GlobalToast />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center border border-orange-200 shadow-sm">
                <ChefHat className="w-6 h-6 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 hidden lg:block">
                Recetario
              </h1>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 border-l pl-6 border-gray-200">
              <button
                onClick={() => setCurrentTab('recetas')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${currentTab === 'recetas'
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <BookOpen className="w-4 h-4" />
                Mis Recetas
              </button>
              <button
                onClick={() => setCurrentTab('comunidad')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${currentTab === 'comunidad'
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Globe2 className="w-4 h-4" />
                Comunidad
              </button>
              {userRole === 'admin' && (
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${currentTab === 'admin'
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
              )}
              <button
                onClick={() => setCurrentTab('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${currentTab === 'settings'
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Settings className="w-4 h-4" />
                Ajustes
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{authenticatedUser}</span>
            </div>

            {currentTab === 'recetas' && (
              <MagneticButton magneticPull={0.2} className="hidden sm:block">
                <button
                  onClick={handleOpenCreateForm}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Nueva Receta</span>
                </button>
              </MagneticButton>
            )}

            <MagneticButton magneticPull={0.15}>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-4 sm:py-2 sm:gap-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-100"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden lg:inline text-sm font-medium">Salir</span>
              </button>
            </MagneticButton>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden border-t border-gray-200 flex text-sm">
          <button
            onClick={() => setCurrentTab('recetas')}
            className={`flex-1 flex justify-center py-3 font-medium border-b-2 ${currentTab === 'recetas'
                ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            Mis Recetas
          </button>
          <button
            onClick={() => setCurrentTab('comunidad')}
            className={`flex-1 flex justify-center py-3 font-medium border-b-2 ${currentTab === 'comunidad'
                ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            Comunidad Asíncrona
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`flex-1 flex justify-center py-3 font-medium border-b-2 ${currentTab === 'settings'
                ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            Ajustes
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'recetas' ? (
          <>
            {/* Intro/Hero Text */}
            <div className="mb-8 animate-fade-in">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Tus Recetas
              </h2>
              <p className="mt-2 text-lg text-gray-500">
                Gestiona, busca y organiza tus platos favoritos.
              </p>
            </div>

            {/* Sub-tabs: Mis Recetas / Guardadas */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setRecipesSubTab('mis-recetas')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                  recipesSubTab === 'mis-recetas'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Mis Recetas
              </button>
              <button
                onClick={() => setRecipesSubTab('guardadas')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                  recipesSubTab === 'guardadas'
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <Heart className="w-4 h-4" />
                Guardadas
              </button>
            </div>

            {recipesSubTab === 'guardadas' ? (
              <SavedRecipes />
            ) : (
              <>
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {/* Grid or Empty State */}
            {recipesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : recipesError ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-red-200">
                <p className="text-red-500 mb-4">{recipesError}</p>
                <button onClick={refreshRecipes} className="text-orange-600 font-semibold hover:underline">Reintentar</button>
              </div>
            ) : filteredAndSortedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
                {filteredAndSortedRecipes.map((recipe, index) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    index={index}
                    userRole={userRole}
                    onEdit={handleOpenEditForm}
                    onDelete={handleOpenDeleteConfirm}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No se encontraron recetas</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Intenta ajustar tus filtros de búsqueda o crea una nueva receta para comenzar.
                </p>
                <button
                  onClick={handleOpenCreateForm}
                  className="mt-6 inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Añadir la primera receta
                </button>
              </div>
            ) }
              </>
            )}
          </>
        ) : currentTab === 'comunidad' ? (
          <CommunityDashboard userRole={userRole} />
        ) : currentTab === 'admin' && userRole === 'admin' ? (
          <AdminDashboard currentUser={authenticatedUser} />
        ) : (
          <UserSettings />
        )}
      </main>

      {/* Modals & Toasts */}
      <RecipeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingRecipe}
        onSave={handleSaveRecipe}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        recipeTitle={recipeToDelete?.titulo}
      />

      {/* Removed local Toast component render */}
      {/* {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      )} */}
    </div>
  );
}