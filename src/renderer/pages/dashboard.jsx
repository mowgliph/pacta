import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { toast } from 'sonner';
import { useNavigate } from 'wouter';
import AnimatedButton from '../components/animatedButton';

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
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <h1 className="text-title mb-4">Dashboard</h1>
      <div className="mb-8">
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
          <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="amt" stroke="#82ca9d" />
        </LineChart>
      </div>
      <div className="flex space-x-4">
        <AnimatedButton onClick={() => navigate('/contracts')}>Crear Contrato</AnimatedButton>
        <AnimatedButton onClick={() => navigate('/contracts')}>Ver Contratos</AnimatedButton>
        <AnimatedButton onClick={() => navigate('/statistics')}>Ver Estadísticas</AnimatedButton>
        <AnimatedButton onClick={() => navigate('/profile')}>Perfil</AnimatedButton>
      </div>
      <div className="mt-8">
        <p className="text-error-red">Alerta: Contrato XYZ vence en 3 días.</p>
      </div>
    </div>
  );
};

export default Dashboard;