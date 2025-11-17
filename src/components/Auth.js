import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="bg-white p-4 rounded shadow-md w-72">
      {auth.currentUser ? (
        <div>
          <p className="mb-2 text-sm">Hola, {auth.currentUser.email}</p>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <h3 className="font-semibold text-gray-700">{isRegister ? 'Registro' : 'Iniciar sesión'}</h3>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-2 py-1 border rounded"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-2 py-1 border rounded"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1 bg-sky-600 text-white rounded hover:bg-sky-700 text-sm"
          >
            {loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Iniciar sesión'}
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-sky-600 hover:underline mt-1"
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </form>
      )}
    </div>
  );
}
