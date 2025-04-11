import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useLocation } from 'wouter';
import useStore from '@/renderer/store/useStore';
import { Button } from "@/renderer/components/ui/button";

const data = [
  { name: 'Jan', pv: 2400, amt: 2400 },
  { name: 'Feb', pv: 1398, amt: 2210 },
  { name: 'Mar', pv: 9800, amt: 2290 },
  { name: 'Apr', pv: 3908, amt: 2000 },
  { name: 'May', pv: 4800, amt: 2181 },
  { name: 'Jun', pv: 3800, amt: 2500 },
  { name: 'Jul', pv: 4300, amt: 2100 },
];

const Dashboard = () => {
  const [, navigate] = useLocation();
  const logout = useStore((state) => state.logout);
  const user = useStore((state) => state.user);

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          {user && <span className="text-gray-600">Hola, {user.username || 'Usuario'}!</span>}
          <Button variant="outline" onClick={handleLogout}>Cerrar Sesión</Button>
        </div>
      </div>

      <div className="mb-8 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Actividad Reciente (Ejemplo)</h2>
        <LineChart
          width={730}
          height={250}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pv" name="Visitas" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="amt" name="Contratos" stroke="#82ca9d" />
        </LineChart>
      </div>

      <div className="flex space-x-4 mb-8">
        <Button onClick={() => navigate('/contracts')}>Gestionar Contratos</Button>
        <Button onClick={() => navigate('/statistics')}>Ver Estadísticas</Button>
        <Button onClick={() => navigate('/profile')}>Mi Perfil</Button>
      </div>

      <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p><span className="font-bold">Alerta:</span> Contrato XYZ vence en 3 días.</p>
      </div>
    </div>
  );
};

export default Dashboard;