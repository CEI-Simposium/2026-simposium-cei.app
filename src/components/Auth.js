import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

// Mapeo de errores para que el usuario los entienda en español
const translateError = (code) => {
  switch (code) {
    case 'auth/invalid-credential': return 'Correo o contraseña incorrectos.';
    case 'auth/email-already-in-use': return 'Este correo ya está registrado.';
    case 'auth/weak-password': return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/invalid-email': return 'El formato del correo no es válido.';
    default: return 'Ha ocurrido un error. Inténtalo de nuevo.';
  }
};

export default function Auth({ user }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(translateError(err.code));
    }
    setLoading(false);
  };

  const handleLogout = () => signOut(auth);

  if (user) {
    return (
      <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold">
            {user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider">Sesión activa</p>
            <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="text-xs bg-white border border-red-200 text-red-500 px-3 py-2 rounded-xl font-bold hover:bg-red-50 transition-colors"
        >
          Salir
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        {isRegister ? 'Crear cuenta' : 'Acceso para Favoritos'}
      </h3>
      
      {/* Se ha eliminado el botón de Google y la línea divisoria "o" */}

      <form onSubmit={handleEmailAuth} className="space-y-3">
        <input 
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
        />
        <input 
          type="password" placeholder="Contraseña" value={password}
          onChange={(e) => setPassword(e.target.value)} required
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
        />
        
        {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

        <button 
          type="submit" disabled={loading}
          className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-[0.98]"
        >
          {loading ? 'Cargando...' : isRegister ? 'Registrarse' : 'Entrar'}
        </button>
      </form>

      <button 
        onClick={() => setIsRegister(!isRegister)}
        className="w-full text-center text-xs text-slate-400 mt-4 hover:text-sky-600 transition-colors"
      >
        {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
      </button>
    </div>
  );
}