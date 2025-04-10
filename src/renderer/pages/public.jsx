import React from 'react';
import { useNavigate } from 'wouter';

const Public = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <h1 className="text-title mb-4">Bienvenido a PACTA</h1>
      <p className="text-secondary-gray mb-4">Esta es la área pública. Puedes ver estadísticas anónimas e información general.</p>
      <div className="mt-8">
        <button className="bg-primary-blue text-white p-2 rounded" onClick={() => navigate('/auth')}>Ir a Login</button>
      </div>
    </div>
  );
};

export default Public;